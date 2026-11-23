<script lang="ts">
  /**
   * Le bouton principal (DESIGN.md, « Bouton de dés (principal) ») : contour
   * et texte jaunes, 58 px, pleine largeur, texte 20 px graisse 800, icône de
   * 26 px devant le libellé si besoin. C'est l'action de l'écran : « Lancer
   * les dés » sur la feuille, « Commencer » sur l'Accueil, « Installer » sur
   * l'écran « Installer l'app ». Pour valider dans un panneau, c'est
   * `BoutonPlein`.
   */
  import type { Snippet } from "svelte";

  interface Props {
    onclick: () => void;
    children: Snippet;
  }

  let { onclick, children }: Props = $props();
</script>

<button class="principal" type="button" {onclick}>
  {@render children()}
</button>

<style>
  .principal {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--esp-md);
    width: 100%;
    min-height: 58px;
    border: 2px solid var(--jaune);
    border-radius: var(--r);
    color: var(--jaune);
    font-size: 20px;
    font-weight: 800;
  }

  .principal :global(svg) {
    width: 26px;
    height: 26px;
  }
</style>
