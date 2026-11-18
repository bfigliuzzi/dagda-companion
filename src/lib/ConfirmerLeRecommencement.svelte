<script lang="ts">
  /**
   * La confirmation de « Recommencer » : ce qui sera effacé, dans le panneau de
   * confirmation. Rien n'est effacé avant l'appui sur le bouton jaune.
   *
   * Deux cas :
   * - `aventure` : « Recommencer une aventure » de la section « Aventure »,
   *   valable dans tous les modes. Toute l'aventure est effacée de l'appareil.
   * - `mort` : le mode mortel, à 0 PV (feuille ou écran « Perdu »). Le lecteur
   *   perd ses armes et son équipement et crée un nouveau personnage au
   *   chapitre 1 ; l'app ne l'impose jamais, elle le propose.
   */
  import PanneauDeConfirmation from "./PanneauDeConfirmation.svelte";

  interface Props {
    cas: "aventure" | "mort";
    onconfirmer: () => void;
    onfermer: () => void;
  }

  let { cas, onconfirmer, onfermer }: Props = $props();
</script>

<PanneauDeConfirmation
  titre={cas === "mort"
    ? "Recommencer au chapitre 1"
    : "Recommencer une aventure"}
  icone="alerte"
  confirmer={cas === "mort"
    ? "Créer un nouveau personnage"
    : "Effacer et recommencer"}
  {onconfirmer}
  {onfermer}
>
  {#if cas === "mort"}
    <b>Vous perdez vos armes et votre équipement</b>&nbsp;: armes, besace,
    bourse, boulons et effets. L'historique des combats repart de zéro ; vos
    notes restent. Vous créez un nouveau personnage en mode mortel, et
    l'aventure reprend au chapitre&nbsp;1.
  {:else}
    <b>Toute l'aventure sera effacée de cet appareil</b>&nbsp;: personnage,
    armes, besace, effets, notes, historique des combats et sauvegardes. Vous
    repartirez de l'écran «&nbsp;Nouvel apprenti&nbsp;». Cela ne peut pas être
    annulé.
  {/if}
</PanneauDeConfirmation>
