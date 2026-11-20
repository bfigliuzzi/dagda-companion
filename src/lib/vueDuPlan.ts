/**
 * La vue d'un plan : quel morceau de la grille l'écran montre, et comment les
 * doigts la déplacent. Pas de défilement du navigateur : la grille est posée
 * dans un cadre fixe et décalée (transform) par GrilleDuPlan.
 *
 * La vue se repère par le point du plan qui est au coin en haut à gauche du
 * cadre, en px, dans les coordonnées du plan : le point de grille (c, l) est à
 * (c × 44, l × 44) px, même quand la grille a grandi vers le haut ou la gauche
 * (c et l négatifs). Ces coordonnées ne bougent pas quand la grille grandit,
 * ni quand le cadre change de hauteur (l'indice du plan vide s'en va, la
 * barre d'adresse se replie) : rien ne saute sous le doigt.
 */

import type { Position } from "./murs";
import { COTE_D_UNE_CASE, type Grille } from "./plans";

/** Le point du plan au coin en haut à gauche du cadre, en px du plan. */
export interface Vue {
  x: number;
  y: number;
}

/** La taille du cadre, en px. */
export interface Taille {
  largeur: number;
  hauteur: number;
}

/**
 * On peut faire défiler jusqu'à une case au-delà du bord de la grille : assez
 * pour voir le bord, où un mur fait grandir la grille.
 */
const MARGE = COTE_D_UNE_CASE;

/** La vue centrée sur une position du plan, en cases (le milieu d'une case : + 0,5). */
export function vueCentreeSur({ x, y }: Position, taille: Taille): Vue {
  return {
    x: x * COTE_D_UNE_CASE - taille.largeur / 2,
    y: y * COTE_D_UNE_CASE - taille.hauteur / 2,
  };
}

/**
 * La vue à l'ouverture d'un plan qui n'a pas d'autre point où se centrer : la
 * grille est centrée, sauf en hauteur quand elle y tient avec ses marges ;
 * elle est alors en haut du cadre, à une case du bord, sous l'en-tête comme
 * le reste de l'écran.
 */
export function vueDOuverture(grille: Grille, taille: Taille): Vue {
  const vue = vueCentreeSur(
    {
      x: grille.colonne + grille.colonnes / 2,
      y: grille.ligne + grille.lignes / 2,
    },
    taille,
  );
  const haut = grille.ligne * COTE_D_UNE_CASE - MARGE;
  const bas = (grille.ligne + grille.lignes) * COTE_D_UNE_CASE + MARGE;
  return bas - haut <= taille.hauteur ? { x: vue.x, y: haut } : vue;
}

/**
 * La vue à l'ouverture d'un plan qui a un repère (`repere`, le milieu de sa
 * case, en cases). Chaque axe a sa règle : là où la grille tient dans le cadre
 * avec ses marges d'une case, elle s'ouvre comme sans repère (`vueDOuverture`),
 * et le repère y est forcément visible ; là où elle ne tient pas, la vue se
 * centre sur le repère, puis s'arrête une case au-delà du bord de la grille,
 * aux mêmes limites que quand on la fait défiler (`deplacerLaVue`).
 */
export function vueDOuvertureSur(
  repere: Position,
  grille: Grille,
  taille: Taille,
): Vue {
  const sansRepere = vueDOuverture(grille, taille);
  const centree = vueCentreeSur(repere, taille);
  return {
    x: aLOuverture(
      sansRepere.x,
      centree.x,
      grille.colonne,
      grille.colonnes,
      taille.largeur,
    ),
    y: aLOuverture(
      sansRepere.y,
      centree.y,
      grille.ligne,
      grille.lignes,
      taille.hauteur,
    ),
  };
}

function aLOuverture(
  sansRepere: number,
  centree: number,
  debut: number,
  nombre: number,
  cadre: number,
): number {
  const [a, b] = limites(debut, nombre);
  if (b - a <= cadre) return sansRepere;
  return Math.min(b - cadre, Math.max(a, centree));
}

/** Le début et la fin de la grille sur un axe, marges comprises, en px du plan. */
function limites(debut: number, nombre: number): [number, number] {
  return [
    debut * COTE_D_UNE_CASE - MARGE,
    (debut + nombre) * COTE_D_UNE_CASE + MARGE,
  ];
}

/** Écart minimal, en px, entre le bas d'une case ouverte et le haut du panneau. */
const ECART_AU_PANNEAU = 12;

/**
 * Le panneau d'une case s'ouvre et couvre le bas du cadre. `bande` est ce qui
 * reste visible du cadre au-dessus de lui, en px depuis le haut du cadre. Si
 * le bas de la case de la ligne `ligne` est à moins de 12 px du haut du
 * panneau, la vue se déplace d'un coup pour mettre la case au milieu de la
 * bande ; sinon elle ne bouge pas. La vue peut alors sortir de ses limites,
 * comme quand la grille grandit : le lecteur doit voir la case qu'il note.
 */
export function vueQuiDegageLaCase(
  vue: Vue,
  ligne: number,
  bande: { haut: number; bas: number },
): Vue {
  if (bande.bas <= bande.haut) return vue;
  const basDeLaCase = (ligne + 1) * COTE_D_UNE_CASE - vue.y;
  if (basDeLaCase <= bande.bas - ECART_AU_PANNEAU) return vue;
  return {
    x: vue.x,
    y: (ligne + 0.5) * COTE_D_UNE_CASE - (bande.haut + bande.bas) / 2,
  };
}

/**
 * Les doigts ont glissé de `glisse` px : le plan les suit. La vue reste dans
 * ses limites : une grille plus petite que le cadre y reste en entier ; une
 * plus grande défile jusqu'à une case au-delà de son bord. Une vue déjà hors
 * de ses limites (la grille a grandi) n'y est pas ramenée d'un coup : elle
 * revient du seul chemin des doigts, et ne s'en éloigne pas.
 */
export function deplacerLaVue(
  vue: Vue,
  glisse: { x: number; y: number },
  grille: Grille,
  taille: Taille,
): Vue {
  return {
    x: surUnAxe(
      vue.x - glisse.x,
      vue.x,
      grille.colonne,
      grille.colonnes,
      taille.largeur,
    ),
    y: surUnAxe(
      vue.y - glisse.y,
      vue.y,
      grille.ligne,
      grille.lignes,
      taille.hauteur,
    ),
  };
}

function surUnAxe(
  voulu: number,
  actuel: number,
  debut: number,
  nombre: number,
  cadre: number,
): number {
  const [a, b] = limites(debut, nombre);
  // Plus petite que le cadre : elle y reste en entier ; plus grande : le
  // cadre reste sur elle.
  const [min, max] = b - a <= cadre ? [b - cadre, a] : [a, b - cadre];
  // Une vue hors des limites peut y revenir, pas s'en éloigner.
  const bas = Math.min(min, actuel);
  const haut = Math.max(max, actuel);
  return Math.min(haut, Math.max(bas, voulu));
}
