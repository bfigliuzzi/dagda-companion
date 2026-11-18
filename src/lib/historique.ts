/**
 * Ce que la feuille et l'écran « Combats » disent de l'historique : les
 * phrases de la maquette (sous-texte d'une ligne, résumé en tête d'écran).
 * Pur : il lit des `Combat` (combat.ts) et rend du texte.
 *
 * Un combat « interrompu » (le lecteur l'a quitté en cours) figure dans
 * l'historique : il a coûté des PV, que la feuille montre déjà. Il n'est ni
 * gagné ni perdu.
 */
import { bilanDuCombat, estNarratif, type CombatDeLHistorique } from "./combat";

const accorder = (nombre: number, singulier: string, pluriel: string) =>
  `${nombre} ${nombre > 1 ? pluriel : singulier}`;

/**
 * « 7 tours · 7 adversaires », avec « · quitté en cours » si le combat l'a
 * été, ou « · repris au § 52 » si le lecteur a repris sa sauvegarde après
 * l'avoir perdu ; « Narratif » quand le lecteur a indiqué l'issue (il n'y a ni tours à
 * compter ni PV perdus).
 */
export function sousTexteDUnCombat(combat: CombatDeLHistorique): string {
  if (estNarratif(combat)) return "Narratif";
  const morceaux = [
    accorder(bilanDuCombat(combat).tours, "tour", "tours"),
    accorder(combat.adversaires, "adversaire", "adversaires"),
  ];
  if (combat.issue === "interrompu") morceaux.push("quitté en cours");
  if (combat.repriseAu !== undefined)
    morceaux.push(`repris au §\u00a0${combat.repriseAu}`);
  return morceaux.join(" · ");
}

/** « 3 combats · 2 gagnés · 40 PV perdus en tout ». */
export function resumeDeLHistorique(
  combats: readonly CombatDeLHistorique[],
): string {
  const gagnes = combats.filter(({ issue }) => issue === "gagne").length;
  const pointsDeVie = combats.reduce(
    (somme, combat) => somme + bilanDuCombat(combat).pointsDeViePerdus,
    0,
  );
  return [
    accorder(combats.length, "combat", "combats"),
    accorder(gagnes, "gagné", "gagnés"),
    `${pointsDeVie} PV ${pointsDeVie > 1 ? "perdus" : "perdu"} en tout`,
  ].join(" · ");
}

/** Les dégâts d'un coup : « 1 + 1 dé », « 1 + 1 dé + 1 », « 1 + 1 dé − 2 ». */
export function formuleDeDegats(bonus: number): string {
  if (bonus > 0) return `1 + 1 dé + ${bonus}`;
  if (bonus < 0) return `1 + 1 dé − ${-bonus}`;
  return "1 + 1 dé";
}
