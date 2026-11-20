/**
 * Les sauvegardes du mode simplifié (docs/regles-livre-1.md, « Modes de
 * jeu ») : 3 pour tout le livre, chacune gardant le chapitre en cours et l'état
 * complet du personnage. On ne reprend qu'à la plus récente.
 *
 * Ce que garde une sauvegarde (`Sauvegarde`, aventure.ts) : le chapitre, les
 * caractéristiques de base (PV, PV max, CHANCE, DEXTÉRITÉ, TALENT), les armes,
 * la besace avec la bourse et les boulons, et les effets. C'est ce que le
 * livre appelle le personnage (caractéristiques, talents, inventaire).
 *
 * Ce qu'elle ne garde pas, et que la reprise laisse donc comme le lecteur
 * l'a laissé : les notes (ce qu'il a appris depuis reste utile), l'historique
 * des combats (ce qui a eu lieu a eu lieu), le mode, et le nombre de
 * sauvegardes utilisées (une sauvegarde consommée ne se rend pas). Il n'y a
 * pas de combat en cours à ce moment-là : la sauvegarde se pose et se reprend
 * sur la feuille, ou depuis l'écran « Perdu » d'un combat terminé.
 *
 * Poser et reprendre rendent une nouvelle aventure, sans modifier celle qu'on
 * leur donne. Ce qui va sur la feuille (chapitre, personnage, armes, besace,
 * effets) en est une copie ; le reste, sauvegarde comprise, est repris tel
 * quel. La feuille et la sauvegarde ne partagent donc rien : jouer après une
 * pose ou une reprise ne change pas la sauvegarde. L'appelant passe un simple
 * objet (`$state.snapshot`), pas un proxy de Svelte, que `structuredClone`
 * refuse.
 */
import {
  MODES,
  SAUVEGARDES_DU_LIVRE,
  type Aventure,
  type Sauvegarde,
} from "./aventure";
import { estNarratif } from "./combat";

/** Combien de sauvegardes il reste au lecteur : 0 hors du mode simplifié. */
export function sauvegardesRestantes({
  mode,
  sauvegardesUtilisees,
}: Pick<Aventure, "mode" | "sauvegardesUtilisees">): number {
  if (!MODES[mode].sauvegardes) return 0;
  return Math.max(0, SAUVEGARDES_DU_LIVRE - sauvegardesUtilisees);
}

export function peutSauvegarder(
  aventure: Pick<Aventure, "mode" | "sauvegardesUtilisees">,
): boolean {
  return sauvegardesRestantes(aventure) > 0;
}

/** On ne reprend que s'il y a une sauvegarde, et seulement en mode simplifié. */
export function peutReprendre({
  mode,
  sauvegarde,
}: Pick<Aventure, "mode" | "sauvegarde">): boolean {
  return MODES[mode].sauvegardes && sauvegarde !== null;
}

/** Ce que garde une sauvegarde, pris d'une aventure ou d'une autre sauvegarde. */
function ceQueGardeUneSauvegarde({
  chapitre,
  personnage,
  armes,
  besace,
  effets,
}: Sauvegarde): Sauvegarde {
  return { chapitre, personnage, armes, besace, effets };
}

/**
 * Pose une sauvegarde au chapitre en cours : elle garde l'état complet du
 * personnage, remplace la précédente et consomme une des 3.
 */
export function poserUneSauvegarde(aventure: Aventure): Aventure {
  if (!peutSauvegarder(aventure)) {
    throw new Error("Aucune sauvegarde à poser.");
  }
  return {
    ...aventure,
    ...structuredClone(ceQueGardeUneSauvegarde(aventure)),
    sauvegardesUtilisees: aventure.sauvegardesUtilisees + 1,
    sauvegarde: ceQueGardeUneSauvegarde(aventure),
  };
}

export interface OptionsDeReprise {
  /**
   * Le lecteur reprend depuis l'écran « Perdu » : le dernier combat de
   * l'historique, s'il a été perdu, note le chapitre où il est revenu.
   */
  apresUnCombatPerdu?: boolean;
}

/**
 * La feuille revient à l'état de la sauvegarde la plus récente. La sauvegarde
 * reste en place (c'est toujours la plus récente) et les sauvegardes déjà
 * utilisées restent utilisées.
 */
export function reprendreLaSauvegarde(
  aventure: Aventure,
  { apresUnCombatPerdu = false }: OptionsDeReprise = {},
): Aventure {
  if (!peutReprendre(aventure)) {
    throw new Error("Aucune sauvegarde à reprendre.");
  }
  const sauvegarde = aventure.sauvegarde!;
  const { combats } = aventure;
  const dernier = combats.at(-1);
  const noterLaReprise =
    apresUnCombatPerdu &&
    dernier !== undefined &&
    !estNarratif(dernier) &&
    dernier.issue === "perdu";
  return {
    ...aventure,
    ...structuredClone(ceQueGardeUneSauvegarde(sauvegarde)),
    combat: null,
    combats: noterLaReprise
      ? [
          ...combats.slice(0, -1),
          { ...dernier, repriseAu: sauvegarde.chapitre },
        ]
      : combats,
  };
}
