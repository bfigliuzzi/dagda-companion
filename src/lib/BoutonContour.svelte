<script lang="ts">
  /**
   * Le bouton secondaire (DESIGN.md, « Secondaire (ghost) ») : contour `trait`
   * de 2 px, texte craie 700, 52 px. `danger` le passe en texte rouge sur
   * contour `rouge-trait`. Désactivé, seul le texte passe en craie pâle : le
   * contour reste. Par défaut le contenu est centré ; avec `ecarte`, le
   * libellé est à gauche et l'icône à droite.
   */
  import type { Snippet } from "svelte";

  interface Props {
    type?: "button" | "submit";
    danger?: boolean;
    disabled?: boolean;
    ecarte?: boolean;
    onclick?: () => void;
    children: Snippet;
  }

  let {
    type = "button",
    danger,
    disabled,
    ecarte,
    onclick,
    children,
  }: Props = $props();
</script>

<button class="contour" class:danger class:ecarte {type} {disabled} {onclick}>
  {@render children()}
</button>

<style>
  .contour {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    width: 100%;
    min-height: 52px;
    border: 2px solid var(--trait);
    border-radius: var(--r);
    font-weight: 700;
    color: var(--craie);
  }
  .contour.ecarte {
    justify-content: space-between;
    padding: 0 var(--esp-lg);
  }
  .contour:disabled {
    color: var(--craie-3);
    cursor: default;
  }
  .contour.danger {
    color: var(--rouge);
    border-color: var(--rouge-trait);
  }
</style>
