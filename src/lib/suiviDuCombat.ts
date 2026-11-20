/**
 * Ce que le combat en cours change à l'aventure. Les fonctions rendent une
 * nouvelle aventure, sans modifier celle qu'on leur donne.
 */
import type { Aventure } from "./aventure";
import { interrompreLeCombat, type Combat } from "./combat";
import { baseApres } from "./valeursEffectives";

/**
 * Les PV et la CHANCE de la feuille suivent ceux du combat après chaque
 * tour. Ce sont des valeurs affichées : elles s'enregistrent dans la base
 * (valeursEffectives.ts). Fini, le combat rejoint l'historique.
 */
export function suivreLeCombat(aventure: Aventure, combat: Combat): Aventure {
  const { personnage, effets, combats } = aventure;
  const fini = combat.issue !== null;
  return {
    ...aventure,
    personnage: {
      ...personnage,
      pointsDeVie: baseApres("pointsDeVie", combat.pointsDeVie.lecteur, effets),
      chance: baseApres("chance", combat.chance, effets),
    },
    combat: fini ? null : combat,
    combats: fini ? [...combats, combat] : combats,
  };
}

/** Le lecteur quitte en cours : ce qui a été joué reste acquis et noté. */
export function quitterLeCombat(aventure: Aventure, combat: Combat): Aventure {
  return {
    ...aventure,
    combat: null,
    combats:
      combat.jets.length > 0
        ? [...aventure.combats, interrompreLeCombat(combat)]
        : aventure.combats,
  };
}
