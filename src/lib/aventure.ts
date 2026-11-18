/**
 * L'aventure telle que l'app la tient : le personnage, le mode de jeu et le
 * dernier chapitre lu. Règles : docs/regles-livre-1.md.
 */

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

export const MODES = {
  narratif: {
    nom: "Narratif",
    description:
      "Vous décidez de l'issue des combats, sauf au-delà de 5 adversaires.",
  },
  simplifie: {
    nom: "Simplifié",
    description: "Toutes les règles, avec 3 sauvegardes pour tout le livre.",
  },
  mortel: {
    nom: "Mortel",
    description: "Toutes les règles. Mourir, c'est recommencer au chapitre 1.",
  },
} as const;

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

export interface Aventure {
  /** Dernier chapitre lu, noté par le lecteur avant une pause. */
  chapitre: number;
  mode: Mode;
  /**
   * Sauvegardes déjà consommées, de 0 à 3. Ne compte qu'en mode simplifié ;
   * 0 dans les autres modes.
   */
  sauvegardesUtilisees: number;
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
  return {
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
  };
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
  return {
    chapitre: chapitre!,
    mode: mode!,
    sauvegardesUtilisees: mode === "simplifie" ? sauvegardesUtilisees : 0,
    personnage: {
      talent: recopie.talent!,
      pointsDeVieMax: recopie.pointsDeVieMax!,
      pointsDeVie: recopie.pointsDeVie!,
      chance: recopie.chance!,
      dexterite: recopie.dexterite!,
    },
  };
}

/** Rappel en tête de feuille : « Herbologie · Mode simplifié ». */
export function resume({ mode, personnage }: Aventure): string {
  return `${personnage.talent} · Mode ${MODES[mode].nom.toLowerCase()}`;
}

/** Vérifie une aventure relue depuis l'appareil, dont on ne sait rien. */
export function estUneAventure(valeur: unknown): valeur is Aventure {
  if (typeof valeur !== "object" || valeur === null) return false;
  const { chapitre, mode, personnage, sauvegardesUtilisees } =
    valeur as Aventure;
  return (
    estUnChapitre(chapitre) &&
    estUnNombreDeSauvegardes(sauvegardesUtilisees) &&
    Object.hasOwn(MODES, mode) &&
    estUnPersonnage(personnage)
  );
}

function estUnPersonnage(valeur: unknown): valeur is Personnage {
  if (typeof valeur !== "object" || valeur === null) return false;
  const personnage = valeur as Personnage;
  return (
    (TALENTS as readonly string[]).includes(personnage.talent) &&
    estUnMaximumDePointsDeVie(personnage.pointsDeVieMax) &&
    Number.isInteger(personnage.pointsDeVie) &&
    estUneChance(personnage.chance) &&
    Number.isInteger(personnage.dexterite)
  );
}
