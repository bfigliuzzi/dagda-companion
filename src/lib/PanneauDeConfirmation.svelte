<script lang="ts">
  /**
   * Le panneau de confirmation : un indice qui dit ce qui va se passer
   * (icône jaune d'information ou rouge d'avertissement), le bouton jaune plein
   * qui valide et « Annuler » en secondaire. Rien ne se passe avant l'appui sur
   * le bouton jaune ; fermer (croix, voile, Échap) ou « Annuler » laisse tout
   * comme c'était. Le texte arrive en contenu ; ConfirmerLaReprise et
   * ConfirmerLeRecommencement lui donnent les mots de chaque cas.
   */
  import Indice from "./Indice.svelte";
  import BoutonPlein from "./BoutonPlein.svelte";
  import BoutonContour from "./BoutonContour.svelte";
  import type { Snippet } from "svelte";
  import Panneau from "./Panneau.svelte";

  interface Props {
    titre: string;
    /** `info` : icône jaune. `alerte` : icône rouge, pour ce qui efface. */
    icone: "info" | "alerte";
    /** Le libellé du bouton jaune. */
    confirmer: string;
    onconfirmer: () => void;
    onfermer: () => void;
    children: Snippet;
  }

  let { titre, icone, confirmer, onconfirmer, onfermer, children }: Props =
    $props();
</script>

<Panneau {titre} {onfermer}>
  <Indice {icone} marge="var(--esp-md) 0 0">{@render children()}</Indice>
  <div class="btns">
    <BoutonPlein onclick={onconfirmer}>{confirmer}</BoutonPlein>
    <BoutonContour onclick={onfermer}>Annuler</BoutonContour>
  </div>
</Panneau>

<style>
  /* Indice non bloquant : voir DESIGN.md, « Hints ». */
  .btns {
    display: grid;
    gap: 10px;
    margin-top: 14px;
  }
</style>
