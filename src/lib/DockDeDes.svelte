<script lang="ts">
  /**
   * Le dock de la feuille : le bouton « Lancer les dés » (contour jaune,
   * pleine largeur) et le panneau de dés qu'il ouvre.
   */
  import type { De } from "./des";
  import Dock from "./Dock.svelte";
  import PanneauDeDes from "./PanneauDeDes.svelte";

  interface Props {
    de: De;
    /** CHANCE disponible sur la feuille. */
    chance: number;
    /** Le lecteur a validé un total ajusté : les points de CHANCE dépensés. */
    ondepenser: (points: number) => void;
  }

  let { de, chance, ondepenser }: Props = $props();

  let ouvert = $state(false);
</script>

<Dock>
  <button class="lancer" type="button" onclick={() => (ouvert = true)}>
    <svg class="i" aria-hidden="true" viewBox="0 0 24 24">
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <circle cx="8.5" cy="8.5" r="1.3" fill="currentColor" />
      <circle cx="15.5" cy="15.5" r="1.3" fill="currentColor" />
      <circle cx="12" cy="12" r="1.3" fill="currentColor" />
    </svg>
    Lancer les dés
  </button>
</Dock>

{#if ouvert}
  <PanneauDeDes {de} {chance} {ondepenser} onfermer={() => (ouvert = false)} />
{/if}

<style>
  .lancer {
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

  .lancer svg {
    width: 26px;
    height: 26px;
  }
</style>
