<script lang="ts">
  /**
   * Écran plein d'un plan, sur le modèle de l'écran « Combats » : le bouton
   * retour à gauche du titre ramène à la feuille, et le titre est le nom du
   * plan, que le lecteur corrige d'un appui. Dessous, la grille (GrilleDuPlan)
   * et un indice qui dit comment tracer un mur. « Supprimer ce plan », tout en
   * bas, demande une confirmation avant d'effacer.
   */
  import EnTeteDEcran from "./EnTeteDEcran.svelte";
  import GrilleDuPlan from "./GrilleDuPlan.svelte";
  import Indice from "./Indice.svelte";
  import PanneauDeConfirmation from "./PanneauDeConfirmation.svelte";
  import type { Plan } from "./plans";

  interface Props {
    plan: Plan;
    onrenommer: (nom: string) => void;
    onretour: () => void;
    /** Le lecteur a confirmé : le plan est effacé. */
    onsupprimer: () => void;
  }

  let { plan, onrenommer, onretour, onsupprimer }: Props = $props();

  let confirmation = $state(false);
</script>

<main class="ecran">
  <EnTeteDEcran
    titre={plan.nom}
    retour="Retour à la feuille"
    {onretour}
    {onrenommer}
  />
  <GrilleDuPlan grille={plan.grille} />
  <div class="bas">
    <Indice icone="info" role="note" marge="0">
      Glissez le doigt le long des points pour tracer un mur.
    </Indice>
    <button
      class="ghost danger"
      type="button"
      onclick={() => (confirmation = true)}
    >
      Supprimer ce plan
    </button>
  </div>
</main>

{#if confirmation}
  <PanneauDeConfirmation
    titre="Supprimer ce plan"
    icone="alerte"
    confirmer="Supprimer le plan"
    onconfirmer={() => {
      confirmation = false;
      onsupprimer();
    }}
    onfermer={() => (confirmation = false)}
  >
    <b>Le plan «&nbsp;{plan.nom}&nbsp;» sera effacé</b>, avec tout ce que vous y
    avez tracé. Cela ne peut pas être annulé.
  </PanneauDeConfirmation>
{/if}

<style>
  .ecran {
    max-width: 480px;
    margin: 0 auto;
    padding-bottom: calc(var(--esp-section) + env(safe-area-inset-bottom));
  }
  .bas {
    display: grid;
    gap: var(--esp-section);
    padding: var(--esp-section) var(--gutter) 0;
  }
  /* Bouton secondaire de danger : texte rouge, contour rouge sombre, 52 px. */
  .ghost {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-height: 52px;
    border: 2px solid var(--trait);
    border-radius: var(--r);
    font-weight: 700;
    color: var(--craie);
  }
  .ghost.danger {
    color: var(--rouge);
    border-color: var(--rouge-trait);
  }
  .ghost:focus-visible {
    outline: 2px solid var(--jaune);
    outline-offset: 3px;
  }
</style>
