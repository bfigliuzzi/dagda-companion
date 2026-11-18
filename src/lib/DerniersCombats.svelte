<script lang="ts">
  /**
   * Section « Combats » de la feuille (maquette, entre la Besace et les
   * Notes) : le nombre de combats livrés à droite du titre, les deux plus
   * récents (le plus récent en tête) et « Tout l'historique », qui ouvre
   * l'écran plein. Sans combat terminé, la section n'existe pas.
   */
  import type { CombatDeLHistorique } from "./combat";
  import LigneDeCombat from "./LigneDeCombat.svelte";

  interface Props {
    /** Du plus ancien au plus récent, comme l'aventure les garde. */
    combats: readonly CombatDeLHistorique[];
    onhistorique: () => void;
  }

  let { combats, onhistorique }: Props = $props();
  const id = $props.id();

  const RECENTS = 2;

  const recents = $derived(combats.slice(-RECENTS).reverse());
</script>

{#if combats.length > 0}
  <section aria-labelledby="{id}-titre">
    <div class="sh">
      <h2 id="{id}-titre">Combats</h2>
      <span class="meta">
        {combats.length} livré{combats.length > 1 ? "s" : ""}
      </span>
    </div>
    <ul>
      {#each recents as combat, rang (combats.length - rang)}
        <li><LigneDeCombat {combat} /></li>
      {/each}
    </ul>
    <button class="add" type="button" onclick={onhistorique}>
      Tout l'historique
    </button>
  </section>
{/if}

<style>
  section {
    padding: var(--esp-section) var(--gutter) var(--esp-hair);
  }
  .sh {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: var(--esp-xs);
  }
  h2 {
    font-size: 22px;
    font-weight: 800;
    line-height: 1.1;
    padding-bottom: var(--esp-hair);
    border-bottom: 2px solid var(--craie);
    letter-spacing: -0.005em;
  }
  .meta {
    font-size: 14px;
    color: var(--craie-2);
  }
  ul {
    list-style: none;
  }
  .add {
    display: flex;
    align-items: center;
    gap: var(--esp-sm);
    min-height: var(--ligne);
    color: var(--craie-2);
    font-weight: 700;
  }
  button:focus-visible {
    outline: 2px solid var(--jaune);
    outline-offset: 3px;
  }
</style>
