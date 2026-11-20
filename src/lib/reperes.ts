/**
 * Le repère « vous êtes ici » d'un plan. Vocabulaire : GLOSSARY.md (Repère) ;
 * règles : docs/regles-livre-1.md, « Suivi de lecture et notes ».
 *
 * On enregistre peu : la case où il est (coordonnées du plan, comme les murs
 * et les cases notées), le chapitre pour lequel il y a été posé, et si c'est à
 * la main. Le reste se déduit du dernier chapitre lu : il est « pâle » quand
 * son chapitre n'est plus le chapitre lu (`repere.chapitre !== chapitre`).
 * La position « où il était » d'un chapitre absent du plan est justement ce
 * qu'on enregistre : sans elle, rien ne dirait où il était.
 *
 * `repereApres` est la seule règle : on l'appelle quand le chapitre change,
 * quand les cases du plan changent, et on s'en sert aussi pour dessiner.
 */

import { derniereCaseNumerotee, type Case } from "./cases";

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
 * 3. sinon il reste où il était (pâle), ou il n'y en a pas (`null`).
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
