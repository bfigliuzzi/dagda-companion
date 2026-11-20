/**
 * L'aventure telle que l'app la tient : le personnage, le mode de jeu et le
 * dernier chapitre lu. Règles : docs/regles-livre-1.md.
 */
import {
  estUnCombat,
  estUnCombatDeLHistorique,
  type Combat,
  type CombatDeLHistorique,
} from "./combat";
import { estUnPlan, type Plan } from "./plans";
import { estUnEffet, type Effet } from "./valeursEffectives";

export const TALENTS = [
  "Instinct",
  "Herbologie",
  "Discrétion",
  "Persuasion",
  "Observation",
  "Doigts agiles",
  "Empratique",
] as const;

export type Talent = (typeof TALENTS)[number];

/**
 * Un mode de jeu (docs/regles-livre-1.md, « Modes de jeu ») : son nom, sa
 * description sur l'écran « Nouvel apprenti », et ce qu'il permet. Toute
 * l'app lit ici ce qu'un mode permet, au lieu de tester son nom.
 */
interface ModeDeJeu {
  nom: string;
  description: string;
  /** Le lecteur indique l'issue des combats, jusqu'à 5 adversaires. */
  issueAuChoix: boolean;
  /** Le lecteur dispose de 3 sauvegardes pour tout le livre. */
  sauvegardes: boolean;
  /** À 0 PV, l'app propose de recommencer au chapitre 1. */
  recommencerALaMort: boolean;
}

export const MODES = {
  narratif: {
    nom: "Narratif",
    description:
      "Vous décidez de l'issue des combats, sauf au-delà de 5 adversaires.",
    issueAuChoix: true,
    sauvegardes: false,
    recommencerALaMort: false,
  },
  simplifie: {
    nom: "Simplifié",
    description: "Toutes les règles, avec 3 sauvegardes pour tout le livre.",
    issueAuChoix: false,
    sauvegardes: true,
    recommencerALaMort: false,
  },
  mortel: {
    nom: "Mortel",
    description: "Toutes les règles. Mourir, c'est recommencer au chapitre 1.",
    issueAuChoix: false,
    sauvegardes: false,
    recommencerALaMort: true,
  },
} as const satisfies Record<string, ModeDeJeu>;

export type Mode = keyof typeof MODES;

/** DEXTÉRITÉ de tout apprenti en début d'aventure. */
export const DEXTERITE_DE_DEPART = 7;

export interface Personnage {
  talent: Talent;
  pointsDeVieMax: number;
  pointsDeVie: number;
  chance: number;
  dexterite: number;
}

/** Nombre de sauvegardes dont dispose le lecteur en mode simplifié, pour tout le livre. */
export const SAUVEGARDES_DU_LIVRE = 3;

/** Une arme : un nom et un bonus de dommage (épée courte +1). Elle ne prend pas de place dans la besace. */
export interface Arme {
  nom: string;
  bonus: number;
}

/** Nombre d'armes que les règles permettent de porter en même temps. */
export const ARMES_MAX = 2;

/** Nombre d'emplacements de la besace. */
export const EMPLACEMENTS_MAX = 24;

/**
 * La besace : des objets nommés, une bourse (qui est elle-même un objet) et
 * le compteur de boulons rattaché à la bourse. Tout ce que le mode mortel
 * fait perdre se remet à zéro avec `besaceVide()`.
 */
export interface Besace {
  /** Les objets, hors bourse, dans l'ordre où le lecteur les a ajoutés. */
  objets: string[];
  /** Le lecteur porte une bourse : elle occupe un emplacement. */
  bourse: boolean;
  /** Boulons (la monnaie). Ils n'occupent aucun emplacement. */
  boulons: number;
  /** Le lecteur a forcé le compteur de boulons alors qu'il n'a pas de bourse. */
  boulonsForces: boolean;
}

export function besaceVide(): Besace {
  return { objets: [], bourse: false, boulons: 0, boulonsForces: false };
}

/** Emplacements pris : un par objet, plus un pour la bourse ; les boulons n'en prennent pas. */
export function emplacementsOccupes(besace: Besace): number {
  return besace.objets.length + (besace.bourse ? 1 : 0);
}

/** Objets au-delà des 24 emplacements, montrés en traits rouges. */
export function objetsEnTrop(besace: Besace): number {
  return Math.max(0, emplacementsOccupes(besace) - EMPLACEMENTS_MAX);
}

/** Plus d'objets que d'emplacements : la feuille le signale, sans bloquer. */
export function portePlusDObjetsQueLaBesace(besace: Besace): boolean {
  return objetsEnTrop(besace) > 0;
}

/** Le compteur de boulons est actif avec une bourse, ou si le lecteur l'a forcé. */
export function peutCompterLesBoulons(besace: Besace): boolean {
  return besace.bourse || besace.boulonsForces;
}

/** Un nombre de boulons : entier à partir de 0. */
export function estUnNombreDeBoulons(valeur: unknown): valeur is number {
  return estUnEntierAuMoins(0, valeur);
}

export function ajouterUnBoulon(boulons: number): number {
  return boulons + 1;
}

export function retirerUnBoulon(boulons: number): number {
  return Math.max(0, boulons - 1);
}

/** « 0 boulon », « 1 boulon », « 12 boulons ». */
export function formaterLesBoulons(boulons: number): string {
  return `${boulons} ${boulons > 1 ? "boulons" : "boulon"}`;
}

/**
 * Une sauvegarde du livre (mode simplifié) : le chapitre en cours et l'état
 * complet du personnage, c'est-à-dire ses caractéristiques (bases, sans les
 * effets), ses armes, sa besace avec la bourse et les boulons, et ses effets.
 * Ni les notes ni l'historique des combats n'en font partie : ce sont des
 * traces de ce que le lecteur a lu et vécu, pas l'état du personnage (voir
 * docs/regles-livre-1.md, « Modes de jeu »). Voir sauvegardes.ts.
 */
export interface Sauvegarde {
  chapitre: number;
  personnage: Personnage;
  armes: Arme[];
  besace: Besace;
  effets: Effet[];
}

export interface Aventure {
  /** Dernier chapitre lu, noté par le lecteur avant une pause. */
  chapitre: number;
  mode: Mode;
  /**
   * Sauvegardes déjà consommées, de 0 à 3. Ne compte qu'en mode simplifié ;
   * 0 dans les autres modes.
   */
  sauvegardesUtilisees: number;
  /**
   * La sauvegarde la plus récente, `null` tant que le lecteur n'en a posé
   * aucune (et toujours `null` hors du mode simplifié). Il n'en reste qu'une :
   * poser la suivante remplace celle-ci.
   */
  sauvegarde: Sauvegarde | null;
  /** Notes libres du lecteur (texte brut, sauts de ligne compris). */
  notes: string;
  /** Les plans des lieux, dans l'ordre où le lecteur les a créés (voir plans.ts). */
  plans: Plan[];
  /** Les armes du lecteur, dans l'ordre où il les a ajoutées. */
  armes: Arme[];
  /** La besace, la bourse et les boulons. */
  besace: Besace;
  /** Effets temporaires et rappels, dans l'ordre où le lecteur les a ajoutés (voir valeursEffectives.ts). */
  effets: Effet[];
  /** Le combat en cours (voir combat.ts), `null` hors combat : il se retrouve après rechargement. */
  combat: Combat | null;
  /**
   * Les combats terminés, quittés ou indiqués en mode narratif, du plus
   * ancien au plus récent.
   */
  combats: CombatDeLHistorique[];
  /**
   * Les valeurs de BASE du personnage, sans les effets. La feuille, le combat
   * et la CHANCE emploient les valeurs effectives (valeursEffectives.ts).
   */
  personnage: Personnage;
}

/** Ce que le lecteur a choisi et tiré sur l'écran « Nouvel apprenti ». */
export interface Brouillon {
  talent: Talent | null;
  mode: Mode | null;
  pointsDeVieMax: number | null;
  chance: number | null;
}

function estUnEntierAuMoins(minimum: number, valeur: unknown): boolean {
  return Number.isInteger(valeur) && (valeur as number) >= minimum;
}

/** Un chapitre du livre : entier à partir de 1. */
export function estUnChapitre(valeur: unknown): valeur is number {
  return estUnEntierAuMoins(1, valeur);
}

/** Un maximum de POINTS DE VIE : entier à partir de 1. */
export function estUnMaximumDePointsDeVie(valeur: unknown): valeur is number {
  return estUnEntierAuMoins(1, valeur);
}

/** Une réserve de CHANCE : entier à partir de 0. */
export function estUneChance(valeur: unknown): valeur is number {
  return estUnEntierAuMoins(0, valeur);
}

/**
 * Ce qui manque encore pour commencer, dit comme le libellé du bouton de
 * validation ; `null` quand tout est rempli. Une valeur saisie à la main mais
 * pas valable (0 PV, nombre à virgule) est à corriger, pas à lancer.
 */
export function ceQuiManque(brouillon: Brouillon): string | null {
  const { talent, mode, pointsDeVieMax, chance } = brouillon;
  if (talent === null) return "Choisissez d'abord un TALENT";
  if (mode === null) return "Choisissez d'abord le mode de jeu";
  if (pointsDeVieMax === null) return "Lancez d'abord les POINTS DE VIE";
  if (!estUnMaximumDePointsDeVie(pointsDeVieMax))
    return "Corrigez les POINTS DE VIE";
  if (chance === null) return "Lancez d'abord la CHANCE";
  if (!estUneChance(chance)) return "Corrigez la CHANCE";
  return null;
}

/** La nouvelle aventure : PV pleins, DEX 7, chapitre 1. */
export function commencerAventure(brouillon: Brouillon): Aventure {
  const { talent, mode, pointsDeVieMax, chance } = brouillon;
  if (ceQuiManque(brouillon) !== null) {
    throw new Error("Le nouvel apprenti n'est pas complet.");
  }
  return uneNouvelleFeuille({
    chapitre: 1,
    mode: mode!,
    sauvegardesUtilisees: 0,
    personnage: {
      talent: talent!,
      pointsDeVieMax: pointsDeVieMax!,
      pointsDeVie: pointsDeVieMax!,
      chance: chance!,
      dexterite: DEXTERITE_DE_DEPART,
    },
  });
}

/**
 * Une feuille neuve : ni sauvegarde posée, ni notes, ni plans, ni armes, ni
 * objets, ni effets, ni combats.
 */
function uneNouvelleFeuille(
  depart: Pick<
    Aventure,
    "chapitre" | "mode" | "sauvegardesUtilisees" | "personnage"
  >,
): Aventure {
  return {
    ...depart,
    sauvegarde: null,
    notes: "",
    plans: [],
    armes: [],
    besace: besaceVide(),
    effets: [],
    combat: null,
    combats: [],
  };
}

/**
 * Mode mortel : à 0 PV, l'app PROPOSE de recommencer au chapitre 1 avec un
 * nouveau personnage. Elle ne le décide jamais : le lecteur accepte ou
 * ignore, et le livre peut déroger. Les autres modes ne le proposent pas.
 */
export function proposeDeRecommencer(mode: Mode, pointsDeVie: number): boolean {
  return MODES[mode].recommencerALaMort && pointsDeVie <= 0;
}

/**
 * Le lecteur a accepté de recommencer après une mort en mode mortel : la
 * nouvelle aventure (celle que « Nouvel apprenti » vient de créer, au chapitre
 * 1, sans armes, besace, effets ni combats) remplace l'ancienne.
 *
 * Choix par défaut (docs/regles-livre-1.md) : le livre ne fait perdre que les
 * armes et l'équipement ; les notes et les plans sont ce que le lecteur a
 * appris du livre (le lieu ne change pas d'une aventure à l'autre), ils lui
 * servent encore au nouveau départ, on les garde.
 */
export function apresLaMort(
  nouvelle: Aventure,
  morte: Pick<Aventure, "notes" | "plans">,
): Aventure {
  return { ...nouvelle, notes: morte.notes, plans: morte.plans };
}

/** Ce que le lecteur recopie de sa feuille papier sur l'écran « Déjà en route ». */
export interface Recopie {
  talent: Talent | null;
  mode: Mode | null;
  chapitre: number | null;
  pointsDeVie: number | null;
  pointsDeVieMax: number | null;
  chance: number | null;
  dexterite: number | null;
  sauvegardesUtilisees: number;
}

/** Une DEXTÉRITÉ : entier à partir de 1. */
export function estUneDexterite(valeur: unknown): valeur is number {
  return estUnEntierAuMoins(1, valeur);
}

/** Des POINTS DE VIE actuels : entier à partir de 0 (0 = à terre). */
export function estUnPointDeVieActuel(valeur: unknown): valeur is number {
  return estUnEntierAuMoins(0, valeur);
}

/** Sauvegardes utilisées : entier de 0 à 3. */
export function estUnNombreDeSauvegardes(valeur: unknown): valeur is number {
  return (
    estUnEntierAuMoins(0, valeur) && (valeur as number) <= SAUVEGARDES_DU_LIVRE
  );
}

/**
 * Ce qui manque encore pour ouvrir la feuille recopiée, dit comme le libellé
 * du bouton ; `null` quand tout est rempli. Des PV actuels au-dessus du
 * maximum ne manquent pas : l'écran le signale seulement.
 */
export function ceQuiManqueEnRoute(recopie: Recopie): string | null {
  const {
    talent,
    mode,
    chapitre,
    pointsDeVie,
    pointsDeVieMax,
    chance,
    dexterite,
  } = recopie;
  if (talent === null) return "Choisissez d'abord un TALENT";
  if (mode === null) return "Choisissez d'abord le mode de jeu";
  if (!estUnChapitre(chapitre)) return "Corrigez le dernier chapitre lu";
  if (pointsDeVieMax === null) return "Saisissez d'abord les PV maximum";
  if (!estUnMaximumDePointsDeVie(pointsDeVieMax))
    return "Corrigez les PV maximum";
  if (pointsDeVie === null) return "Saisissez d'abord les PV actuels";
  if (!estUnPointDeVieActuel(pointsDeVie)) return "Corrigez les PV actuels";
  if (chance === null) return "Saisissez d'abord la CHANCE";
  if (!estUneChance(chance)) return "Corrigez la CHANCE";
  if (dexterite === null) return "Saisissez d'abord la DEXTÉRITÉ";
  if (!estUneDexterite(dexterite)) return "Corrigez la DEXTÉRITÉ";
  return null;
}

/** L'aventure recopiée de la feuille papier, valeurs reprises telles quelles. */
export function recopierAventure(recopie: Recopie): Aventure {
  if (ceQuiManqueEnRoute(recopie) !== null) {
    throw new Error("La feuille recopiée n'est pas complète.");
  }
  const { mode, chapitre, sauvegardesUtilisees } = recopie;
  return uneNouvelleFeuille({
    chapitre: chapitre!,
    mode: mode!,
    sauvegardesUtilisees: MODES[mode!].sauvegardes ? sauvegardesUtilisees : 0,
    personnage: {
      talent: recopie.talent!,
      pointsDeVieMax: recopie.pointsDeVieMax!,
      pointsDeVie: recopie.pointsDeVie!,
      chance: recopie.chance!,
      dexterite: recopie.dexterite!,
    },
  });
}

/** Un bonus de dommage : entier, positif, nul ou négatif (un malus existe peut-être dans le livre). */
export function estUnBonusDeDegats(valeur: unknown): valeur is number {
  return Number.isInteger(valeur);
}

/**
 * Le bonus de dommage total des armes portées : la somme des bonus (choix par
 * défaut de docs/regles-livre-1.md, le livre ne précise pas encore le cumul).
 * Le combat l'ajoute aux dégâts ; les effets pourront s'y ajouter à leur tour.
 * Au-delà de 2 armes, toutes comptent : la feuille avertit sans rien retirer.
 */
export function bonusDeDegatsDesArmes(armes: readonly Arme[]): number {
  return armes.reduce((total, arme) => total + arme.bonus, 0);
}

/** Plus d'armes que les règles n'en permettent : la feuille le signale, sans bloquer. */
export function portePlusDArmesQueLesRegles(armes: readonly Arme[]): boolean {
  return armes.length > ARMES_MAX;
}

/** Sous ce nombre de POINTS DE VIE, le lecteur est en état critique (moins de 7). */
export const SEUIL_CRITIQUE = 7;

/** État critique : moins de 7 POINTS DE VIE. */
export function estCritique(pointsDeVie: number): boolean {
  return pointsDeVie < SEUIL_CRITIQUE;
}

/** Le « − » de la feuille : 1 PV de moins, sans descendre sous 0. À 0, le lecteur décide seul de la suite. */
export function retirerUnPointDeVie(pointsDeVie: number): number {
  return Math.max(0, pointsDeVie - 1);
}

/**
 * Le « + » de la feuille : 1 PV de plus, jusqu'au maximum. Des PV déjà
 * au-dessus du maximum (saisis à la main, le livre peut déroger) ne bougent pas.
 */
export function ajouterUnPointDeVie(
  pointsDeVie: number,
  pointsDeVieMax: number,
): number {
  return pointsDeVie >= pointsDeVieMax ? pointsDeVie : pointsDeVie + 1;
}

/** Des PV au-dessus du maximum : accepté, mais la feuille le signale. */
export function depasseLeMaximum({
  pointsDeVie,
  pointsDeVieMax,
}: Pick<Personnage, "pointsDeVie" | "pointsDeVieMax">): boolean {
  return pointsDeVie > pointsDeVieMax;
}

/** Rappel en tête de feuille : « Herbologie · Mode simplifié ». */
export function resume({ mode, personnage }: Aventure): string {
  return `${personnage.talent} · Mode ${MODES[mode].nom.toLowerCase()}`;
}

/** Vérifie une aventure relue depuis l'appareil, dont on ne sait rien. */
export function estUneAventure(valeur: unknown): valeur is Aventure {
  if (typeof valeur !== "object" || valeur === null) return false;
  const {
    mode,
    sauvegardesUtilisees,
    sauvegarde,
    notes,
    plans,
    combat,
    combats,
  } = valeur as Aventure;
  // Le chapitre, le personnage, les armes, la besace et les effets : ce que
  // garde aussi une sauvegarde.
  return (
    estUneSauvegarde(valeur) &&
    estUnNombreDeSauvegardes(sauvegardesUtilisees) &&
    (sauvegarde === null || estUneSauvegarde(sauvegarde)) &&
    typeof notes === "string" &&
    Array.isArray(plans) &&
    plans.every(estUnPlan) &&
    (combat === null || estUnCombat(combat)) &&
    Array.isArray(combats) &&
    combats.every(estUnCombatDeLHistorique) &&
    Object.hasOwn(MODES, mode)
  );
}

function estUneSauvegarde(valeur: unknown): valeur is Sauvegarde {
  if (typeof valeur !== "object" || valeur === null) return false;
  const { chapitre, personnage, armes, besace, effets } = valeur as Sauvegarde;
  return (
    estUnChapitre(chapitre) &&
    estUnPersonnage(personnage) &&
    Array.isArray(armes) &&
    armes.every(estUneArme) &&
    estUneBesace(besace) &&
    Array.isArray(effets) &&
    effets.every(estUnEffet)
  );
}

function estUneBesace(valeur: unknown): valeur is Besace {
  if (typeof valeur !== "object" || valeur === null) return false;
  const { objets, bourse, boulons, boulonsForces } = valeur as Besace;
  return (
    Array.isArray(objets) &&
    objets.every((objet) => typeof objet === "string") &&
    typeof bourse === "boolean" &&
    estUnNombreDeBoulons(boulons) &&
    typeof boulonsForces === "boolean"
  );
}

function estUneArme(valeur: unknown): valeur is Arme {
  if (typeof valeur !== "object" || valeur === null) return false;
  const { nom, bonus } = valeur as Arme;
  return typeof nom === "string" && estUnBonusDeDegats(bonus);
}

/**
 * Les valeurs enregistrées sont des bases : tant qu'un effet la soutient, une
 * base peut passer sous son plancher (la CHANCE prêtée par un effet a été
 * dépensée, voir valeursEffectives.ts). On vérifie donc seulement des entiers.
 */
function estUnPersonnage(valeur: unknown): valeur is Personnage {
  if (typeof valeur !== "object" || valeur === null) return false;
  const personnage = valeur as Personnage;
  return (
    (TALENTS as readonly string[]).includes(personnage.talent) &&
    Number.isInteger(personnage.pointsDeVieMax) &&
    Number.isInteger(personnage.pointsDeVie) &&
    Number.isInteger(personnage.chance) &&
    Number.isInteger(personnage.dexterite)
  );
}
