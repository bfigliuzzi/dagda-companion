<script lang="ts">
  /**
   * Le bouton jaune plein qui valide (DESIGN.md, « Valider dans un panneau ») :
   * 58 px, texte noir 20 px graisse 800, icône de 26 px devant le libellé si
   * besoin. Il n'est jamais grisé pour de bon : avec `inactif`, il passe en
   * contour craie pâle et son libellé dit ce qui manque, mais l'appui reste
   * reçu (`aria-disabled`, pas `disabled`).
   */
  import type { Snippet } from "svelte";

  interface Props {
    type?: "button" | "submit";
    inactif?: boolean;
    onclick?: () => void;
    children: Snippet;
  }

  let { type = "button", inactif, onclick, children }: Props = $props();
</script>

<button class="plein" {type} aria-disabled={inactif} {onclick}>
  {@render children()}
</button>

<style>
  .plein {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--esp-md);
    width: 100%;
    min-height: 58px;
    background: var(--jaune);
    border: 2px solid var(--jaune);
    border-radius: var(--r);
    color: var(--noir);
    font-size: 20px;
    font-weight: 800;
  }
  .plein :global(svg) {
    width: 26px;
    height: 26px;
  }
  .plein[aria-disabled="true"] {
    background: none;
    border-color: var(--craie-3);
    color: var(--craie-3);
    cursor: default;
  }
</style>
