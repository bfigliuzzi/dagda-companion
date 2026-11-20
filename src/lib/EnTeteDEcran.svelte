<script lang="ts">
  /**
   * L'en-tête d'un écran plein : le bouton retour à gauche du titre, puis une
   * ligne d'introduction en craie grise si l'écran en a une (en contenu).
   * L'écran garde sa place dans `<main>` et son propre espacement.
   *
   * Avec `onrenommer`, le titre est le nom de l'écran, que le lecteur corrige
   * d'un appui (même geste que le nom d'une arme : voir NomModifiable).
   */
  import type { Snippet } from "svelte";
  import Icone from "./Icone.svelte";
  import NomModifiable from "./NomModifiable.svelte";

  interface Props {
    titre: string;
    /** Nom accessible du bouton retour : « Retour à la feuille », « Annuler ». */
    retour: string;
    onretour: () => void;
    intro?: Snippet;
    /** Le titre devient un nom modifiable ; reçoit le nom corrigé, jamais vide. */
    onrenommer?: (nom: string) => void;
  }

  let { titre, retour, onretour, intro, onrenommer }: Props = $props();
</script>

<div class="screen-h">
  <button class="retour" type="button" aria-label={retour} onclick={onretour}>
    <Icone nom="retour" />
  </button>
  <h1>
    {#if onrenommer}
      <NomModifiable nom={titre} {onrenommer} />
    {:else}
      {titre}
    {/if}
  </h1>
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
  /* Le nom modifiable garde le corps du titre et une cible de 44 px. */
  h1 :global(button) {
    display: block;
    width: 100%;
    min-height: var(--cible);
    font-weight: inherit;
    letter-spacing: inherit;
  }
  .intro {
    padding: 0 var(--gutter);
    font-size: 15px;
    color: var(--craie-2);
  }
</style>
