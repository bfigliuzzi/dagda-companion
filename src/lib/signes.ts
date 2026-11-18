/**
 * Les nombres écrits avec leur signe. Un seul endroit pour le vrai signe
 * moins (« − », pas le tiret du clavier), que tout l'écran réutilise.
 */

/** Un nombre avec le vrai signe moins, sans plus : « 7 », « 0 », « −2 ». */
export function formaterUnNombre(nombre: number): string {
  return nombre < 0 ? `−${-nombre}` : String(nombre);
}

/** Un bonus avec son signe, zéro compris : « +1 », « +0 », « −2 ». */
export function formaterUnBonus(bonus: number): string {
  return bonus < 0 ? formaterUnNombre(bonus) : `+${bonus}`;
}

/** Un ajustement avec son signe, mais zéro seul : « +1 », « −2 », « 0 ». */
export function formaterUnAjustement(ajustement: number): string {
  return ajustement === 0 ? "0" : formaterUnBonus(ajustement);
}
