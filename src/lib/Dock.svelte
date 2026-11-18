<script lang="ts">
  /**
   * LE DOCK : la bande collée en bas de l'écran, sur un dégradé du noir
   * opaque (70 %) vers le transparent pour que la feuille passe dessous. C'est
   * le seul élément fixe de la feuille (DESIGN.md, « Éléments fixes »).
   *
   * Emploi : poser le ou les boutons entre les balises. Le dock de la feuille
   * porte « Lancer les dés ». Le dock des écrans de combat (ticket 09), sur
   * fond noir plein avec un filet `trait` en haut, pourra reprendre ce
   * composant avec une variante.
   *
   * La page qui l'emploie garde de la place en bas pour ne rien cacher
   * (voir `.feuille` dans App.svelte).
   */
  import type { Snippet } from "svelte";

  interface Props {
    children: Snippet;
  }

  let { children }: Props = $props();
</script>

<div class="dock">
  <div class="contenu">{@render children()}</div>
</div>

<style>
  .dock {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 5;
    padding: var(--esp-md) var(--gutter) 22px;
    padding-bottom: max(22px, env(safe-area-inset-bottom));
    background: linear-gradient(to top, var(--noir) 70%, rgb(0 0 0 / 0));
  }

  /* Aligné sur la colonne de la feuille. */
  .contenu {
    max-width: calc(480px - 2 * var(--gutter));
    margin: 0 auto;
  }
</style>
