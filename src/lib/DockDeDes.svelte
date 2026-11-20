<script lang="ts">
  /**
   * Le dock de la feuille : le bouton « Lancer les dés » (contour jaune,
   * pleine largeur) et le panneau de dés qu'il ouvre.
   */
  import Icone from "./Icone.svelte";
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
    <Icone nom="de" />
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

  .lancer :global(svg) {
    width: 26px;
    height: 26px;
  }
</style>
