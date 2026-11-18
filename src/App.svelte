<script lang="ts">
  import Armes from "./lib/Armes.svelte";
  import Besace from "./lib/Besace.svelte";
  import BlocVital from "./lib/BlocVital.svelte";
  import DockDeDes from "./lib/DockDeDes.svelte";
  import Effets from "./lib/Effets.svelte";
  import EnTete from "./lib/EnTete.svelte";
  import Notes from "./lib/Notes.svelte";
  import NouvelApprenti from "./lib/NouvelApprenti.svelte";
  import { resume, type Aventure } from "./lib/aventure";
  import { deAuHasard, type De } from "./lib/des";
  import { baseApres, valeurEffective } from "./lib/valeursEffectives";
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
  {@const chance = valeurEffective(
    "chance",
    aventure.personnage.chance,
    aventure.effets,
  )}
  <main class="feuille">
    <EnTete
      resume={resume(aventure)}
      chapitre={aventure.chapitre}
      onchapitre={(chapitre) => (aventure!.chapitre = chapitre)}
    />
    <BlocVital bind:personnage={aventure.personnage} effets={aventure.effets} />
    <Armes bind:armes={aventure.armes} effets={aventure.effets} />
    <Effets
      bind:effets={aventure.effets}
      bind:personnage={aventure.personnage}
      armes={aventure.armes}
    />
    <!--
      Ordre de la feuille (maquette) : les Derniers combats suivent la
      Besace ; la section Aventure suit les Notes, tout en bas.
    -->
    <Besace bind:besace={aventure.besace} />
    <Notes bind:notes={aventure.notes} />
  </main>
  <!-- La CHANCE disponible est la CHANCE effective ; la dépense sort de la base (valeursEffectives.ts). -->
  <DockDeDes
    {de}
    {chance}
    ondepenser={(points) =>
      (aventure!.personnage.chance = baseApres(
        "chance",
        Math.max(0, chance - points),
        aventure!.effets,
      ))}
  />
{:else}
  <NouvelApprenti {de} oncommencer={(nouvelle) => (aventure = nouvelle)} />
{/if}

<style>
  .feuille {
    max-width: 480px;
    margin: 0 auto;
    /* Place pour le dock fixe : 12 + 58 + 22 px, plus la zone de sécurité. */
    padding-bottom: calc(92px + env(safe-area-inset-bottom));
  }
</style>
