/**
 * Les dés du livre : tous des d6.
 *
 * Une règle qui lance des dés reçoit le dé en paramètre, pour que les tests
 * puissent la jouer avec des dés fixés (voir docs/tests.md).
 */

/** Un dé à six faces : chaque appel donne un entier de 1 à 6. */
export type De = () => number;

export const deAuHasard: De = () => 1 + Math.floor(Math.random() * 6);

/** Un dé qui donne les valeurs indiquées, dans l'ordre, puis recommence. */
export function desFixes(...valeurs: number[]): De {
  let rang = 0;
  return () => valeurs[rang++ % valeurs.length];
}

/** POINTS DE VIE max à la création : 2d6 × 4. `obtenu` est le total des 2d6. */
export function tirerPointsDeVieMax(de: De): {
  obtenu: number;
  valeur: number;
} {
  const obtenu = de() + de();
  return { obtenu, valeur: obtenu * 4 };
}

/** CHANCE à la création : 1d6. */
export function tirerChance(de: De): number {
  return de();
}
