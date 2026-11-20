/**
 * Le repère « vous êtes ici » d'un plan. Vocabulaire : GLOSSARY.md (Repère) ;
 * règles : docs/regles-livre-1.md, « Suivi de lecture et notes ».
 *
 * On enregistre peu : la case où il est (coordonnées du plan, comme les murs
 * et les cases notées), le chapitre pour lequel il y a été posé, et si c'est à
 * la main. La position « où il était » d'un chapitre absent du plan est
 * justement ce qu'on enregistre : sans elle, rien ne dirait où il était.
 *
 * `repereApres` dit où il va : on l'appelle quand le chapitre change et quand
 * les cases du plan changent. `repereAffiche` dit s'il est plein ou pâle, et
 * tout ce qui montre le repère (grille, noms lus, indice, ligne de la feuille)
 * en découle.
 */

import { derniereCaseNumerotee, laCase, type Case } from "./cases";

export interface Repere {
  colonne: number;
  ligne: number;
  /** Le dernier chapitre lu au moment où le repère a pris cette place. */
  chapitre: number;
  /** Posé par « Je suis ici » : il y reste jusqu'au prochain changement de chapitre. */
  manuel: boolean;
}

/**
 * Le repère d'un plan quand le dernier chapitre lu est `chapitre` :
 * 1. posé à la main pour ce même chapitre : il ne bouge pas ;
 * 2. une case porte ce numéro : il va sur la dernière numérotée ;
 * 3. sinon il reste où il était (pâle, voir `repereAffiche`), ou il n'y en a
 *    pas (`null`).
 * Un repère posé à la main perd son « à la main » dès que le chapitre change :
 * revenir plus tard à ce chapitre ne le rend pas.
 */
export function repereApres(
  repere: Repere | null,
  cases: readonly Case[],
  chapitre: number,
): Repere | null {
  if (repere?.manuel && repere.chapitre === chapitre) return repere;
  const sur = derniereCaseNumerotee(cases, chapitre);
  if (sur) {
    return { colonne: sur.colonne, ligne: sur.ligne, chapitre, manuel: false };
  }
  if (!repere) return null;
  return repere.manuel ? { ...repere, manuel: false } : repere;
}

/** Le repère tel qu'on le montre : sa case, et s'il est pâle. */
export interface RepereAffiche {
  colonne: number;
  ligne: number;
  pale: boolean;
}

/**
 * Le repère à montrer quand le dernier chapitre lu est `chapitre`. Il est
 * plein quand le lecteur y est : posé à la main pour ce chapitre, ou sur une
 * case qui porte ce numéro. Sinon il est pâle : le chapitre a changé, ou sa
 * case a été vidée ou renumérotée.
 */
export function repereAffiche(
  repere: Repere | null,
  cases: readonly Case[],
  chapitre: number,
): RepereAffiche | null {
  if (!repere) return null;
  const { colonne, ligne } = repere;
  const plein =
    repere.chapitre === chapitre &&
    (repere.manuel || laCase(cases, colonne, ligne)?.chapitre === chapitre);
  return { colonne, ligne, pale: !plein };
}

/**
 * Le numéro à écrire après « ici § » sur la ligne du plan : celui de la case
 * du repère quand il est plein. Pâle, il n'y en a pas : « ici » laisserait
 * croire que le lecteur y est.
 */
export function numeroDuRepere(
  repere: Repere | null,
  cases: readonly Case[],
  chapitre: number,
): number | null {
  const affiche = repereAffiche(repere, cases, chapitre);
  if (!affiche || affiche.pale) return null;
  return laCase(cases, affiche.colonne, affiche.ligne)?.chapitre ?? null;
}

/**
 * Faut-il l'indice « § N n'est pas sur ce plan » ? Oui quand le repère est
 * pâle. Sans repère, seulement si une case est numérotée : sur un plan encore
 * vierge, il n'y a rien à comparer.
 */
export function chapitreAbsentAAnnoncer(
  repere: Repere | null,
  cases: readonly Case[],
  chapitre: number,
): boolean {
  const affiche = repereAffiche(repere, cases, chapitre);
  return affiche ? affiche.pale : cases.some((c) => c.chapitre !== null);
}

/** « Je suis ici » : le repère sur cette case, pour le chapitre lu. */
export function poserLeRepere(
  colonne: number,
  ligne: number,
  chapitre: number,
): Repere {
  return { colonne, ligne, chapitre, manuel: true };
}

/** Vérifie un repère relu depuis l'appareil : `null` (jamais placé) ou bien formé. */
export function estUnRepere(valeur: unknown): valeur is Repere | null {
  if (valeur === null) return true;
  if (typeof valeur !== "object") return false;
  const { colonne, ligne, chapitre, manuel } = valeur as Repere;
  return (
    Number.isInteger(colonne) &&
    Number.isInteger(ligne) &&
    Number.isInteger(chapitre) &&
    typeof manuel === "boolean"
  );
}

/** Deux repères sont les mêmes (même case, même chapitre, même façon d'être posés). */
export function memeRepere(a: Repere | null, b: Repere | null): boolean {
  if (a === null || b === null) return a === b;
  return (
    a.colonne === b.colonne &&
    a.ligne === b.ligne &&
    a.chapitre === b.chapitre &&
    a.manuel === b.manuel
  );
}
