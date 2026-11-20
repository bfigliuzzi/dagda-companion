<script lang="ts">
  /**
   * L'en-tête d'un écran plein : le bouton retour à gauche du titre, puis une
   * ligne d'introduction en craie grise si l'écran en a une (en contenu).
   * L'écran garde sa place dans `<main>` et son propre espacement.
   */
  import type { Snippet } from "svelte";
  import Icone from "./Icone.svelte";

  interface Props {
    titre: string;
    /** Nom accessible du bouton retour : « Retour à la feuille », « Annuler ». */
    retour: string;
    onretour: () => void;
    intro?: Snippet;
  }

  let { titre, retour, onretour, intro }: Props = $props();
</script>

<div class="screen-h">
  <button class="retour" type="button" aria-label={retour} onclick={onretour}>
    <Icone nom="retour" />
  </button>
  <h1>{titre}</h1>
</div>
{#if intro}
  <p class="intro">{@render intro()}</p>
{/if}

<style>
  .screen-h {
    display: flex;
    align-items: center;
    gap: var(--esp-sm);
    padding: var(--gutter) var(--gutter) var(--esp-xs);
    padding-top: max(var(--gutter), env(safe-area-inset-top));
  }
  .retour {
    display: grid;
    place-items: center;
    width: var(--cible);
    height: var(--cible);
    margin-left: -12px;
    color: var(--craie-2);
  }
  h1 {
    flex: 1;
    font-size: 28px;
    font-weight: 800;
    letter-spacing: -0.015em;
  }
  .intro {
    padding: 0 var(--gutter);
    font-size: 15px;
    color: var(--craie-2);
  }
</style>
