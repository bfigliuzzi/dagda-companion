/**
 * Les écrans de l'app, et le chemin de l'un à l'autre. `App.svelte` tient un
 * seul écran à la fois (`Ecran`) et le montre ; ajouter un écran, c'est
 * ajouter un membre à cette union.
 *
 * Seule l'aventure s'enregistre (le combat en cours compris) : l'écran ouvert
 * est oublié au rechargement, et l'app rouvre alors la feuille, ou le combat
 * s'il y en a un en cours, ou l'Accueil s'il n'y a pas d'aventure
 * (`ecranDeDepart`).
 */
import type { Aventure } from "./aventure";
import type { Combat } from "./combat";

/**
 * PV et CHANCE affichés avant un combat. Au retour sur la feuille, la trace
 * de craie part de ces valeurs pour montrer ce que le combat a changé (vide :
 * pas de trace).
 */
export interface AvantLeCombat {
  pointsDeVie?: number;
  chance?: number;
}

export type Ecran =
  /**
   * L'Accueil (GLOSSARY.md) : seulement à l'ouverture de l'app sans aventure
   * enregistrée. Recommencer une aventure va droit à « Nouvel apprenti ».
   */
  | { nom: "accueil" }
  /** Créer un personnage ; après une mort en mode mortel, avec les notes gardées. */
  | {
      nom: "nouvelApprenti";
      apresLaMort: Pick<Aventure, "notes" | "plans"> | null;
    }
  | { nom: "feuille"; avant: AvantLeCombat }
  /** Le formulaire « Nouveau combat » (ou l'issue d'un combat narratif). */
  | { nom: "nouveauCombat" }
  /** Le combat en cours, celui de `Aventure.combat`. */
  | { nom: "combat" }
  /** Le combat qui vient de finir. */
  | { nom: "resultat"; combat: Combat }
  /**
   * L'écran « Combats » : `deplie` est le rang du combat déplié à
   * l'ouverture ; `avant` attend le retour sur la feuille.
   */
  | { nom: "historique"; deplie: number | null; avant: AvantLeCombat }
  /** L'écran d'un plan, repéré par son `id` (plans.ts) ; le retour rend la feuille. */
  | { nom: "plan"; id: number };

export function laFeuille(avant: AvantLeCombat = {}): Ecran {
  return { nom: "feuille", avant };
}

/** À l'ouverture de l'app : le combat en cours, sinon la feuille, sinon l'Accueil. */
export function ecranDeDepart(aventure: Aventure | null): Ecran {
  if (aventure === null) return { nom: "accueil" };
  if (aventure.combat !== null) return { nom: "combat" };
  return laFeuille();
}

/** Après un tour : le combat continue, ou son résultat s'affiche. */
export function apresLeTour(combat: Combat): Ecran {
  return combat.issue === null
    ? { nom: "combat" }
    : { nom: "resultat", combat };
}

/** Retour sur la feuille après un combat : la trace de craie montre ce qu'il a changé. */
export function retourDuCombat({ depart }: Combat): Ecran {
  return laFeuille({
    pointsDeVie: depart.lecteur.pointsDeVie,
    chance: depart.lecteur.chance,
  });
}

/** Ouvre l'écran « Combats » ; le retour rendra la feuille telle qu'on l'a laissée. */
export function ouvrirLHistorique(
  depuis: Ecran,
  deplie: number | null = null,
): Ecran {
  const avant = depuis.nom === "feuille" ? depuis.avant : {};
  return { nom: "historique", deplie, avant };
}

/** Quitte l'écran « Combats » pour la feuille, avec la trace qu'elle attendait. */
export function fermerLHistorique(ecran: Ecran): Ecran {
  return laFeuille(ecran.nom === "historique" ? ecran.avant : {});
}
