<script lang="ts">
  /**
   * Écran plein « Combats » (maquette 12) : tous les combats, du plus récent au
   * plus ancien, chacun repéré par son chapitre. Un appui déplie le détail
   * d'un combat (un seul à la fois). Le bouton retour, à gauche du titre,
   * ramène à la feuille.
   */
  import EnTeteDEcran from "./EnTeteDEcran.svelte";
  import type { CombatDeLHistorique } from "./combat";
  import { resumeDeLHistorique } from "./historique";
  import LigneDeCombat from "./LigneDeCombat.svelte";

  interface Props {
    /** Du plus ancien au plus récent, comme l'aventure les garde. */
    combats: readonly CombatDeLHistorique[];
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
  <EnTeteDEcran titre="Combats" retour="Retour à la feuille" {onretour}>
    {#snippet intro()}{resumeDeLHistorique(combats)}{/snippet}
  </EnTeteDEcran>
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

  section {
    padding: 10px var(--gutter) var(--esp-hair);
  }

  ul {
    list-style: none;
  }
</style>
