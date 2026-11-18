<script lang="ts">
  import EnTete from "./lib/EnTete.svelte";
  import { garderEcranAllume } from "./lib/ecranAllume";
  import { ecrireAventure, lireAventure } from "./lib/stockage";

  const aventure = $state(lireAventure(localStorage));

  // Rien ne se perd : chaque changement de l'aventure est enregistré aussitôt.
  $effect(() => {
    ecrireAventure(localStorage, $state.snapshot(aventure));
  });

  $effect(garderEcranAllume);
</script>

<main class="feuille">
  <EnTete
    chapitre={aventure.chapitre}
    onchapitre={(chapitre) => (aventure.chapitre = chapitre)}
  />
</main>

<style>
  .feuille {
    max-width: 480px;
    margin: 0 auto;
    padding-bottom: env(safe-area-inset-bottom);
  }
</style>
