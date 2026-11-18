<script lang="ts">
  import BlocVital from "./lib/BlocVital.svelte";
  import EnTete from "./lib/EnTete.svelte";
  import NouvelApprenti from "./lib/NouvelApprenti.svelte";
  import { resume, type Aventure } from "./lib/aventure";
  import { deAuHasard, type De } from "./lib/des";
  import { garderEcranAllume } from "./lib/ecranAllume";
  import { ecrireAventure, lireAventure } from "./lib/stockage";

  interface Props {
    /** Les tests injectent des dés fixés. */
    de?: De;
  }

  let { de = deAuHasard }: Props = $props();

  let aventure = $state<Aventure | null>(lireAventure(localStorage));

  // Rien ne se perd : chaque changement de l'aventure est enregistré aussitôt.
  $effect(() => {
    if (aventure) ecrireAventure(localStorage, $state.snapshot(aventure));
  });

  $effect(garderEcranAllume);
</script>

{#if aventure}
  <main class="feuille">
    <EnTete
      resume={resume(aventure)}
      chapitre={aventure.chapitre}
      onchapitre={(chapitre) => (aventure!.chapitre = chapitre)}
    />
    <BlocVital bind:personnage={aventure.personnage} />
  </main>
{:else}
  <NouvelApprenti {de} oncommencer={(nouvelle) => (aventure = nouvelle)} />
{/if}

<style>
  .feuille {
    max-width: 480px;
    margin: 0 auto;
    padding-bottom: env(safe-area-inset-bottom);
  }
</style>
