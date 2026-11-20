/**
 * Les cases notées d'un plan : un numéro de chapitre, une courte note, ou les
 * deux. Vocabulaire : GLOSSARY.md (Case) ; règles : docs/regles-livre-1.md,
 * « Suivi de lecture et notes ».
 *
 * Seules les cases qui portent quelque chose sont enregistrées : vider une case
 * la retire de la liste. Elles sont repérées par les coordonnées du plan
 * (colonne, ligne), comme les murs : elles peuvent être négatives et ne
 * changent pas quand la grille grandit.
 *
 * `ordre` est le rang d'écriture du numéro : chaque fois qu'une case reçoit un
 * nouveau numéro, elle prend le rang suivant. Si deux cases portent le même
 * numéro, « la dernière numérotée » est celle dont l'`ordre` est le plus grand
 * (c'est là que le repère va, voir reperes.ts). Changer la note ne change pas l'ordre.
 */

import type { Grille } from "./plans";

/** Longueur maximale d'une note : de quoi écrire « porte fermée, clé chez le gobelin » sur une ligne du panneau. */
export const LONGUEUR_MAX_DE_LA_NOTE = 60;
/** Plus grand numéro de chapitre accepté : quatre chiffres tiennent dans une case de 44 px à 13 px. */
export const CHAPITRE_MAX = 9999;

export interface Case {
  colonne: number;
  ligne: number;
  /** Le numéro de chapitre, entier de 1 à 9999, ou `null`. */
  chapitre: number | null;
  /** La note courte, vide s'il n'y en a pas. */
  note: string;
  /** Rang d'écriture du numéro (voir plus haut). */
  ordre: number;
}

/** Ce que le lecteur écrit dans une case. */
export interface Contenu {
  chapitre: number | null;
  note: string;
}

export function laCase(
  cases: readonly Case[],
  colonne: number,
  ligne: number,
): Case | undefined {
  return cases.find((c) => c.colonne === colonne && c.ligne === ligne);
}

/**
 * Les cases une fois la case (colonne, ligne) écrite. Rien à écrire : la même
 * liste, pour que l'appelant n'enregistre rien. Ni numéro ni note : la case est retirée.
 */
export function definirLaCase(
  cases: readonly Case[],
  colonne: number,
  ligne: number,
  contenu: Contenu,
): Case[] {
  const note = contenu.note.slice(0, LONGUEUR_MAX_DE_LA_NOTE);
  const { chapitre } = contenu;
  const avant = laCase(cases, colonne, ligne);
  if (chapitre === null && note === "") {
    return avant ? cases.filter((c) => c !== avant) : (cases as Case[]);
  }
  if (avant && avant.chapitre === chapitre && avant.note === note) {
    return cases as Case[];
  }
  const dernier = Math.max(0, ...cases.map((c) => c.ordre));
  // Une case numérotée qui est déjà la dernière écrite garde son rang : taper
  // « 47 » chiffre par chiffre ne fait pas monter le compteur à chaque touche.
  const dejaLaDerniere = avant?.chapitre != null && avant.ordre === dernier;
  const ordre =
    chapitre !== null && chapitre !== avant?.chapitre && !dejaLaDerniere
      ? dernier + 1
      : (avant?.ordre ?? 0);
  const apres: Case = { colonne, ligne, chapitre, note, ordre };
  return avant
    ? cases.map((c) => (c === avant ? apres : c))
    : [...cases, apres];
}

/**
 * Le nom d'une case pour un humain : « colonne-ligne », à partir de 1 depuis le
 * coin en haut à gauche de la grille d'aujourd'hui. Quand la grille grandit par
 * le haut ou la gauche, les noms se décalent : ils suivent ce que le lecteur voit.
 */
export function nomDeLaCase(
  grille: Grille,
  colonne: number,
  ligne: number,
): string {
  return `${colonne - grille.colonne + 1}-${ligne - grille.ligne + 1}`;
}

/**
 * Le nom lu par les lecteurs d'écran : « Case 3-5, chapitre 47, note : clé ».
 * La case qui porte le repère le dit à la fin : « , vous êtes ici », ou
 * « , vous étiez ici (repère pâle) » quand le dernier chapitre lu n'est pas sur le plan.
 */
export function nomAccessible(
  grille: Grille,
  colonne: number,
  ligne: number,
  contenu: Case | undefined,
  repere?: "ici" | "pale",
): string {
  let nom = `Case ${nomDeLaCase(grille, colonne, ligne)}`;
  if (contenu?.chapitre != null) nom += `, chapitre ${contenu.chapitre}`;
  if (contenu?.note) nom += `, note : ${contenu.note}`;
  if (repere === "ici") nom += ", vous êtes ici";
  if (repere === "pale") nom += ", vous étiez ici (repère pâle)";
  return nom;
}

/** Les autres cases (pas celle de `colonne`, `ligne`) qui portent ce numéro. */
export function autresCasesDuChapitre(
  cases: readonly Case[],
  chapitre: number,
  colonne: number,
  ligne: number,
): Case[] {
  return cases.filter(
    (c) =>
      c.chapitre === chapitre && !(c.colonne === colonne && c.ligne === ligne),
  );
}

/** La dernière case numérotée avec ce numéro, ou `undefined`. */
export function derniereCaseNumerotee(
  cases: readonly Case[],
  chapitre: number,
): Case | undefined {
  return cases
    .filter((c) => c.chapitre === chapitre)
    .reduce<Case | undefined>(
      (derniere, c) => (!derniere || c.ordre > derniere.ordre ? c : derniere),
      undefined,
    );
}

/** Vérifie une case relue depuis l'appareil, dont on ne sait rien. */
export function estUneCase(valeur: unknown): valeur is Case {
  if (typeof valeur !== "object" || valeur === null) return false;
  const { colonne, ligne, chapitre, note, ordre } = valeur as Case;
  return (
    Number.isInteger(colonne) &&
    Number.isInteger(ligne) &&
    (chapitre === null ||
      (Number.isInteger(chapitre) &&
        chapitre >= 1 &&
        chapitre <= CHAPITRE_MAX)) &&
    typeof note === "string" &&
    Number.isInteger(ordre)
  );
}
