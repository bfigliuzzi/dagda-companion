/**
 * Enregistrement de l'aventure sur l'appareil (localStorage).
 *
 * On parle ici d'« enregistrement » et non de « sauvegarde » : dans le livre,
 * une sauvegarde est un point de reprise du mode simplifié (voir GLOSSARY.md).
 *
 * Le contenu est versionné : { version, aventure }. Pour changer la forme de
 * `Aventure`, on monte VERSION et on ajoute dans MIGRATIONS la fonction qui
 * passe de l'ancienne version à la nouvelle.
 */

import { besaceVide, estUneAventure, type Aventure } from "./aventure";

export const CLE_STOCKAGE = "dagda-compagnon";
export const VERSION = 10;

interface Enregistrement {
  version: number;
  aventure: unknown;
}

/**
 * MIGRATIONS[n] transforme une aventure de la version n en version n + 1.
 *
 * Pas de migration depuis la version 1 : elle ne tenait que le chapitre, sans
 * personnage. Le lecteur repasse par « Nouvel apprenti ».
 */
const MIGRATIONS: Record<number, (aventure: unknown) => unknown> = {
  // Version 3 : on compte les sauvegardes utilisées. Une aventure de la
  // version 2 n'en a encore consommé aucune (la pose d'une sauvegarde n'existait pas).
  2: (aventure) => ({ ...(aventure as object), sauvegardesUtilisees: 0 }),
  // Version 4 : les notes libres. Une aventure de la version 3 n'en a pas écrit.
  3: (aventure) => ({ ...(aventure as object), notes: "" }),
  // Version 5 : les armes. Une aventure de la version 4 n'en a pas ajouté.
  4: (aventure) => ({ ...(aventure as object), armes: [] }),
  // Version 6 : la besace, la bourse et les boulons. Une aventure de la version 5 n'en a rien noté.
  5: (aventure) => ({ ...(aventure as object), besace: besaceVide() }),
  // Version 7 : les effets temporaires. Une aventure de la version 6 n'en a aucun.
  6: (aventure) => ({ ...(aventure as object), effets: [] }),
  // Version 8 : les combats. Une aventure de la version 7 n'en a mené aucun.
  7: (aventure) => ({ ...(aventure as object), combat: null, combats: [] }),
  // Version 9 : les combats narratifs rejoignent les combats joués dans `combats`.
  // Les combats de la version 8 sont tous joués : ils restent tels quels. Monter
  // la version empêche une app de la version 8 de lire (et d'écraser) un
  // enregistrement qui contient un combat narratif.
  8: (aventure) => aventure,
  // Version 10 : la sauvegarde posée en mode simplifié (voir sauvegardes.ts). Une
  // aventure de la version 9 n'en a posé aucune ; le nombre de sauvegardes déjà
  // utilisées, lui, existe depuis la version 3 et reste tel quel. Il n'y a donc
  // rien à reprendre pour elle, quelles que soient les sauvegardes consommées.
  9: (aventure) => ({ ...(aventure as object), sauvegarde: null }),
};

/** L'aventure enregistrée, ou `null` s'il n'y en a pas encore. */
export function lireAventure(stockage: Storage): Aventure | null {
  try {
    const brut = stockage.getItem(CLE_STOCKAGE);
    if (brut === null) return null;
    const enregistrement = JSON.parse(brut) as Enregistrement;
    return migrer(enregistrement) ?? null;
  } catch {
    return null;
  }
}

export function ecrireAventure(stockage: Storage, aventure: Aventure): void {
  const enregistrement: Enregistrement = { version: VERSION, aventure };
  try {
    // Une version plus récente de l'app a écrit ici : on ne détruit pas son aventure.
    if (versionEnregistree(stockage) > VERSION) return;
    stockage.setItem(CLE_STOCKAGE, JSON.stringify(enregistrement));
  } catch {
    // Stockage plein ou interdit (navigation privée) : l'app continue sans.
  }
}

/** Le lecteur recommence : plus rien de l'aventure ne reste sur l'appareil. */
export function effacerAventure(stockage: Storage): void {
  try {
    stockage.removeItem(CLE_STOCKAGE);
  } catch {
    // Stockage interdit : il n'y avait rien d'enregistré.
  }
}

function versionEnregistree(stockage: Storage): number {
  try {
    const brut = stockage.getItem(CLE_STOCKAGE);
    return brut === null ? 0 : Number(JSON.parse(brut).version) || 0;
  } catch {
    return 0;
  }
}

function migrer({ version, aventure }: Enregistrement): Aventure | undefined {
  if (!Number.isInteger(version) || version > VERSION) return undefined;
  let courante = aventure;
  for (let v = version; v < VERSION; v++) {
    const etape = MIGRATIONS[v];
    if (!etape) return undefined;
    courante = etape(courante);
  }
  return estUneAventure(courante) ? courante : undefined;
}
