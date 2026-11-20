/**
 * Les plans de l'aventure : un par lieu (labyrinthe, souterrains, tour), que
 * le lecteur dessine à la place du papier quadrillé. Vocabulaire : GLOSSARY.md
 * (Plan, Case, Mur, Repère) ; règles : docs/regles-livre-1.md, « Suivi de
 * lecture et notes ».
 *
 * Un plan est une grille de cases. Le nord est toujours en haut. Les cases
 * sont repérées par une colonne et une ligne, qui peuvent être négatives :
 * quand la grille grandit à gauche ou en haut, les coordonnées déjà
 * enregistrées ne changent pas, seule `grille` s'étend. Les murs sont posés
 * sur les bords des cases, repérés dans ces mêmes coordonnées (voir murs.ts).
 * Les cases notées (numéro de chapitre, note : voir cases.ts) sont repérées
 * dans ces mêmes coordonnées ; le repère « vous êtes ici » viendra avec son ticket.
 */

import { estUneCase, type Case } from "./cases";
import { estUnBord, type Bord } from "./murs";

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
  /** Les murs, dans l'ordre où ils ont été posés (voir murs.ts). */
  murs: Bord[];
  /** Les cases qui portent un numéro ou une note (voir cases.ts). */
  cases: Case[];
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
    murs: [],
    cases: [],
  };
}

/** Vérifie un plan relu depuis l'appareil, dont on ne sait rien. */
export function estUnPlan(valeur: unknown): valeur is Plan {
  if (typeof valeur !== "object" || valeur === null) return false;
  const { id, nom, grille, murs, cases } = valeur as Plan;
  return (
    Number.isInteger(id) &&
    typeof nom === "string" &&
    estUneGrille(grille) &&
    Array.isArray(murs) &&
    murs.every(estUnBord) &&
    Array.isArray(cases) &&
    cases.every(estUneCase)
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
