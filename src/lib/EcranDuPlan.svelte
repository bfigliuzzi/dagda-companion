<script lang="ts">
  /**
   * Écran plein d'un plan, sur le modèle de l'écran « Combats » : le bouton
   * retour à gauche du titre ramène à la feuille, et le titre est le nom du
   * plan, que le lecteur corrige d'un appui. Dessous, la grille (GrilleDuPlan),
   * où le lecteur trace les murs au doigt, et, tant que le plan n'a aucun mur,
   * un indice qui dit comment en tracer un. « Supprimer ce plan », sous la
   * grille, demande une confirmation avant d'effacer.
   *
   * La barre fixe du bas porte le contrôle « Murs / Cases » (seul Murs agit
   * pour l'instant ; les cases arrivent avec leur ticket) et « Annuler », qui
   * défait le dernier trait entier. L'historique des traits tient à l'écran
   * ouvert : il repart à zéro quand on revient à la feuille.
   */
  import ControleSegmente from "./ControleSegmente.svelte";
  import Dock from "./Dock.svelte";
  import EnTeteDEcran from "./EnTeteDEcran.svelte";
  import GrilleDuPlan from "./GrilleDuPlan.svelte";
  import Indice from "./Indice.svelte";
  import PanneauDeConfirmation from "./PanneauDeConfirmation.svelte";
  import {
    appliquerLeTrait,
    defaireLeTrait,
    type Bord,
    type Changement,
  } from "./murs";
  import type { Plan } from "./plans";

  interface Props {
    plan: Plan;
    onrenommer: (nom: string) => void;
    /** Les murs ont changé (un trait, ou « Annuler ») : le plan les enregistre. */
    onmurs: (murs: Bord[]) => void;
    onretour: () => void;
    /** Le lecteur a confirmé : le plan est effacé. */
    onsupprimer: () => void;
  }

  let { plan, onrenommer, onmurs, onretour, onsupprimer }: Props = $props();

  let confirmation = $state(false);
  let outil = $state<"murs" | "cases">("murs");
  /** Les traits de cet écran, du plus ancien au dernier. */
  let traits = $state.raw<Changement[]>([]);

  function tracer(changement: Changement) {
    onmurs(appliquerLeTrait(plan.murs, changement));
    traits = [...traits, changement];
  }

  function annuler() {
    const dernier = traits.at(-1);
    if (!dernier) return;
    onmurs(defaireLeTrait(plan.murs, dernier));
    traits = traits.slice(0, -1);
  }
</script>

<main class="ecran">
  <EnTeteDEcran
    titre={plan.nom}
    retour="Retour à la feuille"
    {onretour}
    {onrenommer}
  />
  <GrilleDuPlan
    grille={plan.grille}
    murs={plan.murs}
    actif={outil === "murs"}
    ontrait={tracer}
  />
  <div class="bas">
    {#if plan.murs.length === 0}
      <Indice icone="info" role="note" marge="0">
        Glissez le doigt le long des points pour tracer un mur.
      </Indice>
    {/if}
    <button
      class="ghost danger"
      type="button"
      onclick={() => (confirmation = true)}
    >
      Supprimer ce plan
    </button>
  </div>

  <Dock variante="plan">
    <ControleSegmente
      etiquette="Outil"
      bind:valeur={outil}
      options={[
        { valeur: "murs", libelle: "Murs" },
        { valeur: "cases", libelle: "Cases" },
      ]}
    />
    <button
      class="ghost"
      type="button"
      disabled={traits.length === 0}
      onclick={annuler}
    >
      Annuler
    </button>
  </Dock>
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
    /* Place pour la barre fixe : 1 + 12 + 52 + 22 px, puis l'écart d'une
       section, pour que « Supprimer ce plan » reste au-dessus d'elle. */
    padding-bottom: calc(
      87px + var(--esp-section) + env(safe-area-inset-bottom)
    );
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
  /* « Annuler » sans rien à défaire : contour et texte en craie pâle. */
  .ghost:disabled {
    color: var(--craie-3);
    cursor: default;
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
