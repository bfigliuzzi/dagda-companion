<script lang="ts">
  /**
   * Le lien discret sous un bouton (DESIGN.md, « Lien ») : texte craie grise
   * souligné, trait de soulignement en craie pâle décalé de 4 px, centré sur
   * toute la largeur, cible de 44 px au moins.
   */
  import type { Snippet } from "svelte";

  interface Props {
    onclick: () => void;
    children: Snippet;
  }

  let { onclick, children }: Props = $props();
</script>

<button class="lien" type="button" {onclick}>{@render children()}</button>

<style>
  .lien {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-height: var(--cible);
    color: var(--craie-2);
    font-weight: 700;
    text-decoration: underline;
    text-underline-offset: 4px;
    text-decoration-color: var(--craie-3);
  }
</style>
