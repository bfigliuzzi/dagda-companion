<script lang="ts">
  import EnTete from "./lib/EnTete.svelte";
  import { garderEcranAllume } from "./lib/ecranAllume";
  import { ecrirePartie, lirePartie } from "./lib/stockage";

  const partie = $state(lirePartie(localStorage));

  // Rien ne se perd : chaque changement de la partie est enregistré aussitôt.
  $effect(() => {
    ecrirePartie(localStorage, $state.snapshot(partie));
  });

  $effect(garderEcranAllume);
</script>

<main class="feuille">
  <EnTete
    chapitre={partie.chapitre}
    onchapitre={(chapitre) => (partie.chapitre = chapitre)}
  />
</main>

<style>
  .feuille {
    max-width: 480px;
    margin: 0 auto;
    padding-bottom: env(safe-area-inset-bottom);
  }
</style>
