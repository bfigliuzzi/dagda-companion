/**
 * Les plans de l'aventure : un par lieu (labyrinthe, souterrains, tour), que
 * le lecteur dessine à la place du papier quadrillé. Vocabulaire : GLOSSARY.md
 * (Plan, Case, Mur, Repère) ; règles : docs/regles-livre-1.md, « Suivi de
 * lecture et notes ».
 *
 * Un plan est une grille de cases. Le nord est toujours en haut. Les cases
 * sont repérées par une colonne et une ligne, qui peuvent être négatives :
 * quand la grille grandit à gauche ou en haut, les coordonnées déjà
 * enregistrées ne changent pas, seule `grille` s'étend. Les murs (sur les
 * bords des cases), les cases numérotées et le repère « vous êtes ici »
 * viendront s'ajouter au plan avec leurs propres tickets, en s'appuyant sur
 * ces mêmes coordonnées.
 */

/** Un plan neuf compte 8 × 8 cases. */
export const COLONNES_DE_DEPART = 8;
export const LIGNES_DE_DEPART = 8;

/** Côté d'une case à l'écran, en px : la cible tactile minimale (DESIGN.md). */
export const COTE_D_UNE_CASE = 44;

/**
 * L'étendue de la grille : la case en haut à gauche (`colonne`, `ligne`) et le
 * nombre de colonnes et de lignes. Elle ne rétrécit jamais.
 */
export interface Grille {
  colonne: number;
  ligne: number;
  colonnes: number;
  lignes: number;
}

export interface Plan {
  /** Numéro propre au plan, stable tant qu'il existe (sert d'identité, pas de nom). */
  id: number;
  nom: string;
  grille: Grille;
}

/** Un plan neuf : 8 × 8 cases, encore vide, avec le numéro qui suit les autres. */
export function unNouveauPlan(nom: string, existants: readonly Plan[]): Plan {
  return {
    id: Math.max(0, ...existants.map((plan) => plan.id)) + 1,
    nom,
    grille: {
      colonne: 0,
      ligne: 0,
      colonnes: COLONNES_DE_DEPART,
      lignes: LIGNES_DE_DEPART,
    },
  };
}

/** Vérifie un plan relu depuis l'appareil, dont on ne sait rien. */
export function estUnPlan(valeur: unknown): valeur is Plan {
  if (typeof valeur !== "object" || valeur === null) return false;
  const { id, nom, grille } = valeur as Plan;
  return (
    Number.isInteger(id) && typeof nom === "string" && estUneGrille(grille)
  );
}

function estUneGrille(valeur: unknown): valeur is Grille {
  if (typeof valeur !== "object" || valeur === null) return false;
  const { colonne, ligne, colonnes, lignes } = valeur as Grille;
  return (
    Number.isInteger(colonne) &&
    Number.isInteger(ligne) &&
    Number.isInteger(colonnes) &&
    colonnes >= 1 &&
    Number.isInteger(lignes) &&
    lignes >= 1
  );
}
