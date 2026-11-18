/**
 * Enregistrement de la partie sur l'appareil (localStorage).
 *
 * On parle ici d'« enregistrement » et non de « sauvegarde » : dans le livre,
 * une sauvegarde est un point de reprise du mode simplifié (voir GLOSSARY.md).
 *
 * Le contenu est versionné : { version, partie }. Pour changer la forme de
 * `Partie`, on monte VERSION et on ajoute dans MIGRATIONS la fonction qui
 * passe de l'ancienne version à la nouvelle.
 */

export const CLE_STOCKAGE = "dagda-compagnon";
export const VERSION = 1;

export interface Partie {
  /** Dernier chapitre lu, noté par le lecteur avant une pause. */
  chapitre: number;
}

interface Enregistrement {
  version: number;
  partie: unknown;
}

/** MIGRATIONS[n] transforme une partie de la version n en version n + 1. */
const MIGRATIONS: Record<number, (partie: unknown) => unknown> = {};

/** Un chapitre du livre : entier à partir de 1. */
export function estUnChapitre(valeur: unknown): valeur is number {
  return Number.isInteger(valeur) && (valeur as number) >= 1;
}

export function partieNeuve(): Partie {
  return { chapitre: 1 };
}

export function lirePartie(stockage: Storage): Partie {
  try {
    const brut = stockage.getItem(CLE_STOCKAGE);
    if (brut === null) return partieNeuve();
    const enregistrement = JSON.parse(brut) as Enregistrement;
    return migrer(enregistrement) ?? partieNeuve();
  } catch {
    return partieNeuve();
  }
}

export function ecrirePartie(stockage: Storage, partie: Partie): void {
  const enregistrement: Enregistrement = { version: VERSION, partie };
  try {
    // Une version plus récente de l'app a écrit ici : on ne détruit pas sa partie.
    if (versionEnregistree(stockage) > VERSION) return;
    stockage.setItem(CLE_STOCKAGE, JSON.stringify(enregistrement));
  } catch {
    // Stockage plein ou interdit (navigation privée) : l'app continue sans.
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

function migrer({ version, partie }: Enregistrement): Partie | undefined {
  if (!Number.isInteger(version) || version > VERSION) return undefined;
  let courante = partie;
  for (let v = version; v < VERSION; v++) {
    const etape = MIGRATIONS[v];
    if (!etape) return undefined;
    courante = etape(courante);
  }
  return estUnePartie(courante) ? courante : undefined;
}

function estUnePartie(valeur: unknown): valeur is Partie {
  return (
    typeof valeur === "object" &&
    valeur !== null &&
    estUnChapitre((valeur as Partie).chapitre)
  );
}
