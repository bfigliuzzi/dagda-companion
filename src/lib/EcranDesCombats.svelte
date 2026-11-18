<script lang="ts">
  /**
   * Écran plein « Combats » (maquette 12) : tous les combats, du plus récent au
   * plus ancien, chacun repéré par son chapitre. Un appui déplie le détail
   * d'un combat (un seul à la fois). Le bouton retour, à gauche du titre,
   * ramène à la feuille.
   */
  import type { Combat } from "./combat";
  import { resumeDeLHistorique } from "./historique";
  import LigneDeCombat from "./LigneDeCombat.svelte";

  interface Props {
    /** Du plus ancien au plus récent, comme l'aventure les garde. */
    combats: readonly Combat[];
    /** Rang (dans `combats`) du combat déplié à l'ouverture. */
    ouvertAuDepart?: number | null;
    onretour: () => void;
  }

  let { combats, ouvertAuDepart = null, onretour }: Props = $props();

  // Le prop ne donne que l'état de départ : ensuite, c'est le lecteur qui déplie.
  // svelte-ignore state_referenced_locally
  let ouvert = $state<number | null>(ouvertAuDepart);

  /** Du plus récent au plus ancien, avec le rang de chaque combat dans `combats`. */
  const lignes = $derived(
    combats.map((combat, rang) => ({ combat, rang })).reverse(),
  );
</script>

<main class="ecran">
  <div class="screen-h">
    <button
      class="retour"
      type="button"
      aria-label="Retour à la feuille"
      onclick={onretour}
    >
      <svg class="i" aria-hidden="true" viewBox="0 0 24 24">
        <path d="M15 6l-6 6 6 6" />
      </svg>
    </button>
    <h1>Combats</h1>
  </div>
  <p class="intro">{resumeDeLHistorique(combats)}</p>
  <section>
    <ul>
      {#each lignes as { combat, rang } (rang)}
        <li>
          <LigneDeCombat
            {combat}
            ouvert={ouvert === rang}
            onbascule={() => (ouvert = ouvert === rang ? null : rang)}
          />
        </li>
      {/each}
    </ul>
  </section>
</main>

<style>
  .ecran {
    max-width: 480px;
    margin: 0 auto;
    padding-bottom: calc(var(--esp-section) + env(safe-area-inset-bottom));
  }

  .screen-h {
    display: flex;
    align-items: center;
    gap: var(--esp-sm);
    padding: var(--gutter) var(--gutter) var(--esp-xs);
    padding-top: max(var(--gutter), env(safe-area-inset-top));
  }

  .retour {
    display: grid;
    place-items: center;
    width: var(--cible);
    height: var(--cible);
    margin-left: -12px;
    color: var(--craie-2);
  }

  .retour:focus-visible {
    outline: 2px solid var(--jaune);
    outline-offset: 3px;
  }

  h1 {
    flex: 1;
    font-size: 28px;
    font-weight: 800;
    letter-spacing: -0.015em;
  }

  .intro {
    padding: 0 var(--gutter);
    font-size: 15px;
    color: var(--craie-2);
  }

  section {
    padding: 10px var(--gutter) var(--esp-hair);
  }

  ul {
    list-style: none;
  }
</style>
