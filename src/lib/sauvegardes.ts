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
 * Toutes les fonctions rendent une nouvelle aventure, sans toucher à celle
 * qu'on leur donne, et sans rien partager avec elle : l'appelant lui passe un
 * simple objet (`$state.snapshot`), pas un proxy.
 */
import {
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
  if (mode !== "simplifie") return 0;
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
  return mode === "simplifie" && sauvegarde !== null;
}

/**
 * Pose une sauvegarde au chapitre en cours : elle garde l'état complet du
 * personnage, remplace la précédente et consomme une des 3.
 */
export function poserUneSauvegarde(aventure: Aventure): Aventure {
  if (!peutSauvegarder(aventure)) {
    throw new Error("Aucune sauvegarde à poser.");
  }
  const { chapitre, personnage, armes, besace, effets } = aventure;
  const sauvegarde: Sauvegarde = structuredClone({
    chapitre,
    personnage,
    armes,
    besace,
    effets,
  });
  return {
    ...structuredClone(aventure),
    sauvegardesUtilisees: aventure.sauvegardesUtilisees + 1,
    sauvegarde,
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
  const copie = structuredClone(aventure);
  const { chapitre, personnage, armes, besace, effets } = structuredClone(
    aventure.sauvegarde!,
  );
  const combats = copie.combats;
  const dernier = combats.at(-1);
  if (
    apresUnCombatPerdu &&
    dernier !== undefined &&
    !estNarratif(dernier) &&
    dernier.issue === "perdu"
  ) {
    combats[combats.length - 1] = { ...dernier, repriseAu: chapitre };
  }
  return {
    ...copie,
    chapitre,
    personnage,
    armes,
    besace,
    effets,
    combat: null,
    combats,
  };
}
