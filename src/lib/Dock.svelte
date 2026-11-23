<script lang="ts">
  /**
   * LE DOCK : la bande en bas de l'écran, sur un dégradé du noir opaque
   * (70 %) vers le transparent pour que la page passe dessous (DESIGN.md,
   * « Éléments fixes »).
   *
   * Emploi : poser le ou les boutons entre les balises, empilés (écart 4 px).
   * Le dock de la feuille porte « Lancer les dés » ; ceux de « Nouveau
   * combat » et du résultat portent leur bouton de validation.
   *
   * `collant` : le dock de la feuille et celui de l'Accueil. Collant (`sticky`) au lieu de fixe, il
   * se pose à la fin de la page, 20 px sous le dernier contenu et juste avant
   * le pied de page : il reste en bas de l'écran pendant toute la page, puis
   * s'arrête au-dessus du pied de page, qui ne passe donc jamais dessous.
   * Il prend sa place dans la page, qui n'a pas à en garder pour lui.
   *
   * Sans `collant`, le dock est fixe, et la page qui l'emploie garde de la
   * place en bas pour ne rien cacher.
   *
   * Variante `combat` : le dock de l'écran de combat, deux boutons côte à côte
   * (1fr / 1.35fr, écart 10 px) sur fond noir plein avec un filet `trait` en
   * haut (DESIGN.md, « Éléments fixes »).
   *
   * Variante `plan` : la barre de l'écran d'un plan, même fond noir plein et
   * même filet que le dock de combat, mais le contrôle « Murs / Cases »
   * d'abord, plus large (1.35fr), puis « Annuler » (1fr).
   *
   * Variante `accueil` : le dock « Commencer » de l'Accueil, même fond noir
   * plein et même filet que le dock de combat, une seule colonne (DESIGN.md,
   * « Accueil »).
   */
  import type { Snippet } from "svelte";

  interface Props {
    children: Snippet;
    variante?: "degrade" | "combat" | "plan" | "accueil";
    collant?: boolean;
  }

  let { children, variante = "degrade", collant = false }: Props = $props();
</script>

<div
  class="dock"
  data-testid="dock"
  class:combat={variante === "combat"}
  class:plan={variante === "plan"}
  class:accueil={variante === "accueil"}
  class:collant
>
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

  /* Maquette, « .dock.pose » : 20 px sous la section Aventure. */
  .dock.collant {
    position: sticky;
    margin-top: var(--esp-section);
  }

  .dock.combat,
  .dock.plan,
  .dock.accueil {
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

  .combat .contenu,
  .plan .contenu {
    grid-template-columns: 1fr 1.35fr;
    gap: 10px;
  }

  .plan .contenu {
    grid-template-columns: 1.35fr 1fr;
  }
</style>
