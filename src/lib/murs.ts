/**
 * Les murs d'un plan, et le trait du doigt qui les pose ou les efface.
 * Vocabulaire : GLOSSARY.md (Mur, Trait) ; comportement : .scratch/plans/spec.md
 * (Interaction).
 *
 * Un mur est posé sur un bord de case. Un bord se repère par son sens et par
 * le point de grille où il commence, en haut ou à gauche : le bord
 * `horizontal` (3, 2) va du point (3, 2) au point (4, 2), c'est le haut de la
 * case (3, 2) ; le bord `vertical` (3, 2) va du point (3, 2) au point (3, 3),
 * c'est la gauche de cette case. Le point (c, l) est le coin en haut à gauche
 * de la case (c, l). Ces coordonnées sont celles du plan, pas de l'écran : elles
 * peuvent être négatives, et elles ne changent pas quand la grille grandit.
 *
 * Toutes les positions sont en cases, dans ces mêmes coordonnées : le
 * composant convertit les pixels avant d'appeler ce module.
 */

import type { Grille } from "./plans";

export type Sens = "horizontal" | "vertical";

export interface Bord {
  sens: Sens;
  colonne: number;
  ligne: number;
}

/** Une position du doigt, en cases, dans les coordonnées du plan. */
export interface Position {
  x: number;
  y: number;
}

/** Un trait fini : ce qu'il a fait, et les seuls bords qu'il a changés. */
export interface Changement {
  mode: "pose" | "efface";
  bords: Bord[];
}

/**
 * Tolérance d'un appui autour d'un bord : 0,35 case (15 px). Au centre d'une
 * case, à plus de 0,35 case de chaque bord, un appui ne touche rien.
 */
const TOLERANCE_D_UN_BORD = 0.35;
/** Le doigt « passe » par un point de grille à moins de 0,4 case (18 px) de lui. */
const RAYON_D_UN_POINT = 0.4;
/** Entre deux positions du doigt, on regarde tous les 0,2 case : aucun bord sauté. */
const PAS = 0.2;

interface Point {
  colonne: number;
  ligne: number;
}

/** Un trait en cours, du moment où le doigt se pose jusqu'à ce qu'il se lève. */
export interface Trait {
  /** Les murs du plan quand le doigt s'est posé. */
  readonly murs: readonly Bord[];
  readonly grille: Grille;
  /** Le bord sous le doigt au départ : c'est lui qu'un simple appui change. */
  readonly depart: Bord | null;
  /** Le dernier point de grille par lequel le doigt est passé. */
  readonly courant: Point | null;
  /** Le doigt a atteint un autre point que celui du départ : ce n'est plus un appui. */
  readonly aBouge: boolean;
  readonly derniere: Position;
  /** Décidé par le premier bord parcouru : vide → pose, mur → efface. */
  readonly mode: Changement["mode"] | null;
  /** Les bords changés jusqu'ici, dans l'ordre du trait. */
  readonly bords: readonly Bord[];
}

export function memeBord(a: Bord, b: Bord): boolean {
  return a.sens === b.sens && a.colonne === b.colonne && a.ligne === b.ligne;
}

const contient = (bords: readonly Bord[], bord: Bord) =>
  bords.some((autre) => memeBord(autre, bord));

const borne = (valeur: number, min: number, max: number) =>
  Math.min(max, Math.max(min, valeur));

/**
 * Le bord le plus proche d'une position, s'il est à moins de 0,35 case, sur la
 * grille ou sur son pourtour. Au milieu d'une case ou hors de la grille : aucun.
 */
export function bordLePlusProche(
  { x, y }: Position,
  grille: Grille,
): Bord | null {
  const finColonne = grille.colonne + grille.colonnes;
  const finLigne = grille.ligne + grille.lignes;
  // Bord horizontal : la ligne de points la plus proche, la case au-dessous.
  const horizontal: Bord = {
    sens: "horizontal",
    colonne: borne(Math.floor(x), grille.colonne, finColonne - 1),
    ligne: borne(Math.round(y), grille.ligne, finLigne),
  };
  // Bord vertical : la colonne de points la plus proche, la case à côté.
  const vertical: Bord = {
    sens: "vertical",
    colonne: borne(Math.round(x), grille.colonne, finColonne),
    ligne: borne(Math.floor(y), grille.ligne, finLigne - 1),
  };
  const dh = distanceAuBord({ x, y }, horizontal);
  const dv = distanceAuBord({ x, y }, vertical);
  const [bord, distance] = dh <= dv ? [horizontal, dh] : [vertical, dv];
  return distance <= TOLERANCE_D_UN_BORD ? bord : null;
}

/** Distance d'une position au segment qui porte le bord. */
function distanceAuBord({ x, y }: Position, bord: Bord): number {
  const [debut, fin] = extremites(bord);
  const px = borne(x, debut.colonne, fin.colonne);
  const py = borne(y, debut.ligne, fin.ligne);
  return Math.hypot(x - px, y - py);
}

function extremites(bord: Bord): [Point, Point] {
  const debut = { colonne: bord.colonne, ligne: bord.ligne };
  return bord.sens === "horizontal"
    ? [debut, { colonne: bord.colonne + 1, ligne: bord.ligne }]
    : [debut, { colonne: bord.colonne, ligne: bord.ligne + 1 }];
}

const memePoint = (a: Point, b: Point) =>
  a.colonne === b.colonne && a.ligne === b.ligne;

const touche = (bord: Bord, point: Point) =>
  extremites(bord).some((bout) => memePoint(bout, point));

/** Le point de grille sous le doigt, s'il est à moins de 0,4 case. */
function pointCapte({ x, y }: Position, grille: Grille): Point | null {
  const point = { colonne: Math.round(x), ligne: Math.round(y) };
  const dedans =
    point.colonne >= grille.colonne &&
    point.colonne <= grille.colonne + grille.colonnes &&
    point.ligne >= grille.ligne &&
    point.ligne <= grille.ligne + grille.lignes;
  const proche =
    Math.hypot(x - point.colonne, y - point.ligne) <= RAYON_D_UN_POINT;
  return dedans && proche ? point : null;
}

/** Le bord entre deux points voisins, ou rien s'ils ne le sont pas. */
function bordEntre(a: Point, b: Point): Bord | null {
  const dc = b.colonne - a.colonne;
  const dl = b.ligne - a.ligne;
  if (Math.abs(dc) + Math.abs(dl) !== 1) return null;
  return dl === 0
    ? {
        sens: "horizontal",
        colonne: Math.min(a.colonne, b.colonne),
        ligne: a.ligne,
      }
    : {
        sens: "vertical",
        colonne: a.colonne,
        ligne: Math.min(a.ligne, b.ligne),
      };
}

/** Le doigt se pose. */
export function commencerUnTrait(
  murs: readonly Bord[],
  grille: Grille,
  position: Position,
): Trait {
  return {
    murs,
    grille,
    depart: bordLePlusProche(position, grille),
    courant: pointCapte(position, grille),
    aBouge: false,
    derniere: position,
    mode: null,
    bords: [],
  };
}

/**
 * Le doigt glisse jusqu'à `position`. Le trait avance de point en point le
 * long des lignes de la grille ; chaque bord entre deux points voisins est
 * parcouru. Un passage en travers d'une case (d'un coin au coin opposé) ne
 * parcourt aucun bord.
 */
export function prolongerLeTrait(trait: Trait, position: Position): Trait {
  const { x: x0, y: y0 } = trait.derniere;
  const etapes = Math.max(
    1,
    Math.ceil(Math.hypot(position.x - x0, position.y - y0) / PAS),
  );
  let suite: Trait = { ...trait, derniere: position };
  for (let n = 1; n <= etapes; n++) {
    const point = pointCapte(
      {
        x: x0 + ((position.x - x0) * n) / etapes,
        y: y0 + ((position.y - y0) * n) / etapes,
      },
      trait.grille,
    );
    if (point) suite = passerPar(suite, point);
  }
  return suite;
}

function passerPar(trait: Trait, point: Point): Trait {
  const { courant, depart } = trait;
  if (courant && memePoint(courant, point)) return trait;
  // Parti du milieu d'un bord : arrivé à l'un de ses bouts, il l'a parcouru.
  const bord = courant
    ? bordEntre(courant, point)
    : depart && touche(depart, point)
      ? depart
      : null;
  const suite = { ...trait, courant: point, aBouge: true };
  return bord ? parcourir(suite, bord) : suite;
}

/** Le premier bord parcouru décide du mode ; seuls les bords changés comptent. */
function parcourir(trait: Trait, bord: Bord): Trait {
  const mode = trait.mode ?? (contient(trait.murs, bord) ? "efface" : "pose");
  const change = contient(trait.murs, bord) === (mode === "efface");
  if (!change || contient(trait.bords, bord)) return { ...trait, mode };
  return { ...trait, mode, bords: [...trait.bords, bord] };
}

/** Ce que le trait a déjà fait, pour l'afficher pendant que le doigt glisse. */
export function changementEnCours(trait: Trait): Changement | null {
  return trait.mode ? { mode: trait.mode, bords: [...trait.bords] } : null;
}

/**
 * Le doigt se lève. Un simple appui (le doigt n'a atteint aucun autre point)
 * change le bord du départ. Un glissé garde ses bords, plus le dernier s'il
 * est parcouru au-delà de sa moitié. Renvoie `null` si rien n'a changé.
 */
export function finirLeTrait(trait: Trait): Changement | null {
  let fin = trait;
  if (!trait.aBouge) {
    if (trait.depart) fin = parcourir(trait, trait.depart);
  } else if (trait.courant) {
    const dernier = bordLePlusProche(trait.derniere, trait.grille);
    const { x, y } = trait.derniere;
    const loin =
      Math.hypot(x - trait.courant.colonne, y - trait.courant.ligne) > 0.5;
    if (dernier && loin && touche(dernier, trait.courant)) {
      fin = parcourir(trait, dernier);
    }
  }
  const changement = changementEnCours(fin);
  return changement && changement.bords.length > 0 ? changement : null;
}

/** Les murs après le trait. */
export function appliquerLeTrait(
  murs: readonly Bord[],
  { mode, bords }: Changement,
): Bord[] {
  return mode === "pose" ? ajouter(murs, bords) : retirer(murs, bords);
}

/** Les murs d'avant le trait : « Annuler ». */
export function defaireLeTrait(
  murs: readonly Bord[],
  { mode, bords }: Changement,
): Bord[] {
  return mode === "pose" ? retirer(murs, bords) : ajouter(murs, bords);
}

const ajouter = (murs: readonly Bord[], bords: readonly Bord[]) => [
  ...murs,
  ...bords.filter((bord) => !contient(murs, bord)),
];

const retirer = (murs: readonly Bord[], bords: readonly Bord[]) =>
  murs.filter((mur) => !contient(bords, mur));

/**
 * Au-delà de 30 colonnes ou de 30 lignes, la grille ne grandit plus de ce
 * côté-là : le mur tracé sur le bord se pose quand même. 30 × 30 cases, c'est
 * déjà 1 320 px de côté, trois écrans de téléphone dans chaque sens.
 */
export const TAILLE_MAXIMALE = 30;

/**
 * La grille après un trait. Un mur posé sur le bord extérieur de la grille
 * ajoute une rangée ou une colonne de ce côté : en haut, la grille commence
 * une ligne plus haut (`ligne` − 1) ; à gauche, une colonne plus à gauche.
 * Les coordonnées des murs ne changent pas.
 *
 * « Sur le bord extérieur » : le bord est sur le pourtour et dans son sens,
 * un bord horizontal sur la ligne de points du haut ou du bas, un bord
 * vertical sur la colonne de points de gauche ou de droite. Un bord qui ne
 * fait que toucher le pourtour par un bout ne compte pas. Un trait ajoute au
 * plus une rangée ou une colonne par côté, même s'il longe tout le bord ; un
 * trait qui tourne au coin en ajoute une de chaque côté touché. Un trait qui
 * efface ne fait jamais grandir la grille, et la grille ne rétrécit jamais
 * (« Annuler » remet les murs, pas la taille).
 *
 * Renvoie la même grille si rien ne change.
 */
export function agrandirLaGrille(
  grille: Grille,
  { mode, bords }: Changement,
): Grille {
  if (mode !== "pose") return grille;
  const finColonne = grille.colonne + grille.colonnes;
  const finLigne = grille.ligne + grille.lignes;
  const sur = (sens: Sens, test: (bord: Bord) => boolean) =>
    bords.some((bord) => bord.sens === sens && test(bord));
  const haut = sur("horizontal", (bord) => bord.ligne === grille.ligne);
  const bas = sur("horizontal", (bord) => bord.ligne === finLigne);
  const gauche = sur("vertical", (bord) => bord.colonne === grille.colonne);
  const droite = sur("vertical", (bord) => bord.colonne === finColonne);

  const enHauteur = Number(haut) + Number(bas);
  const enLargeur = Number(gauche) + Number(droite);
  // À 30, on ne grandit plus. S'il ne reste qu'une rangée de place et que le
  // trait touche le haut et le bas, elle va en haut (de même, à gauche).
  const lignes = Math.min(TAILLE_MAXIMALE, grille.lignes + enHauteur);
  const colonnes = Math.min(TAILLE_MAXIMALE, grille.colonnes + enLargeur);
  if (lignes === grille.lignes && colonnes === grille.colonnes) return grille;
  return {
    colonne:
      gauche && colonnes > grille.colonnes
        ? grille.colonne - 1
        : grille.colonne,
    ligne: haut && lignes > grille.lignes ? grille.ligne - 1 : grille.ligne,
    colonnes,
    lignes,
  };
}

/** Vérifie un bord relu depuis l'appareil. */
export function estUnBord(valeur: unknown): valeur is Bord {
  if (typeof valeur !== "object" || valeur === null) return false;
  const { sens, colonne, ligne } = valeur as Bord;
  return (
    (sens === "horizontal" || sens === "vertical") &&
    Number.isInteger(colonne) &&
    Number.isInteger(ligne)
  );
}
