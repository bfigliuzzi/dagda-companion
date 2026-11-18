/**
 * La CHANCE dépensée pour ajuster le total d'un jet (docs/regles-livre-1.md,
 * « Chance »). Règle pure : le panneau de dés l'emploie, et le combat (jets du
 * lecteur seulement) pourra l'employer aussi.
 *
 * Chaque point dépensé décale de 1 le total, quel que soit le nombre de dés,
 * vers le haut ou vers le bas. Le seul plafond est la CHANCE disponible : le
 * livre ne borne pas le total à ce que les dés peuvent donner, et l'app ne
 * bloque pas plus que lui.
 */

/** Le résultat d'un ajustement. */
export interface TotalAjuste {
  /** Points demandés, ramenés à ce que la CHANCE permet : de −chance à +chance. */
  ajustement: number;
  /** Le total une fois décalé. */
  total: number;
  /** CHANCE à retirer de la feuille : 1 par point, dans les deux sens. */
  cout: number;
}

/** Une CHANCE disponible utilisable : entière, jamais négative. */
function disponible(chance: number): number {
  return Math.max(0, Math.trunc(chance));
}

function borner(ajustement: number, chance: number): number {
  const plafond = disponible(chance);
  // `+ 0` évite un « −0 » quand le plafond est nul.
  return Math.max(-plafond, Math.min(plafond, Math.trunc(ajustement))) + 0;
}

/** Décale `total` de `ajustement` points, sans dépenser plus que `chanceDisponible`. */
export function ajusterLeTotal(
  total: number,
  ajustement: number,
  chanceDisponible: number,
): TotalAjuste {
  const borne = borner(ajustement, chanceDisponible);
  return { ajustement: borne, total: total + borne, cout: Math.abs(borne) };
}

/** Un pas de plus (`sens` = 1) ou de moins (`sens` = −1), borné par la CHANCE disponible. */
export function changerLAjustement(
  ajustement: number,
  sens: 1 | -1,
  chanceDisponible: number,
): number {
  return borner(ajustement + sens, chanceDisponible);
}
