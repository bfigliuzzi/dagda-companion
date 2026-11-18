<script lang="ts">
  /**
   * LE DOCK : la bande collée en bas de l'écran, sur un dégradé du noir
   * opaque (70 %) vers le transparent pour que la feuille passe dessous. C'est
   * le seul élément fixe de la feuille (DESIGN.md, « Éléments fixes »).
   *
   * Emploi : poser le ou les boutons entre les balises, empilés (écart 4 px).
   * Le dock de la feuille porte « Lancer les dés » ; ceux de « Nouveau
   * combat » et du résultat portent leur bouton de validation.
   *
   * Variante `combat` : le dock de l'écran de combat, deux boutons côte à côte
   * (1fr / 1.35fr, écart 10 px) sur fond noir plein avec un filet `trait` en
   * haut (DESIGN.md, « Éléments fixes »).
   *
   * La page qui l'emploie garde de la place en bas pour ne rien cacher
   * (voir `.feuille` dans App.svelte).
   */
  import type { Snippet } from "svelte";

  interface Props {
    children: Snippet;
    variante?: "degrade" | "combat";
  }

  let { children, variante = "degrade" }: Props = $props();
</script>

<div class="dock" class:combat={variante === "combat"}>
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

  .dock.combat {
    background: var(--noir);
    border-top: 1px solid var(--trait);
  }

  /* Aligné sur la colonne de la feuille. */
  .contenu {
    display: grid;
    gap: var(--esp-hair);
    max-width: calc(480px - 2 * var(--gutter));
    margin: 0 auto;
  }

  .combat .contenu {
    grid-template-columns: 1fr 1.35fr;
    gap: 10px;
  }
</style>
