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

/**
 * LA GRAINE DE DÉS des tests de bout en bout : une suite de faces séparées
 * par des virgules (« 5,3,6 »), rejouée en boucle comme `desFixes`. Elle se
 * passe dans l'adresse (`/?graine=5,3,6`) et n'est lue que dans l'app
 * construite en mode test (`vite build --mode test`, voir main.ts) : l'app
 * publiée tire toujours ses dés au hasard.
 *
 * `null` sans graine ou si elle n'est pas une suite de faces de 1 à 6.
 */
export function deDeLaGraine(graine: string | null): De | null {
  if (graine === null || !/^[1-6](,[1-6])*$/.test(graine)) return null;
  return desFixes(...graine.split(",").map(Number));
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

/** Lance `nombre` dés, un tirage par dé, dans l'ordre. */
export function lancerDes(de: De, nombre: number): number[] {
  return Array.from({ length: nombre }, () => de());
}

/** Le total d'un jet : la somme de ses dés, quel qu'en soit le nombre. */
export function totalDesDes(valeurs: readonly number[]): number {
  return valeurs.reduce((somme, valeur) => somme + valeur, 0);
}
