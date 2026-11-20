<script lang="ts">
  /**
   * Écran plein d'un plan, sur le modèle de l'écran « Combats » : le bouton
   * retour à gauche du titre ramène à la feuille, et le titre est le nom du
   * plan, que le lecteur corrige d'un appui. Dessous, la grille (GrilleDuPlan),
   * où le lecteur trace les murs au doigt, et, tant que le plan n'a aucun mur,
   * un indice qui dit comment en tracer un. La grille prend toute la hauteur
   * libre de l'écran ; le plan y défile à deux doigts (GrilleDuPlan). « Supprimer ce plan », sous la
   * grille, demande une confirmation avant d'effacer.
   *
   * La barre fixe du bas porte le contrôle « Murs / Cases » (seul Murs agit
   * pour l'instant ; les cases arrivent avec leur ticket) et « Annuler », qui
   * défait le dernier trait entier, sans rétrécir la grille. L'historique des traits tient à l'écran
   * ouvert : il repart à zéro quand on revient à la feuille.
   */
  import ControleSegmente from "./ControleSegmente.svelte";
  import Dock from "./Dock.svelte";
  import EnTeteDEcran from "./EnTeteDEcran.svelte";
  import GrilleDuPlan from "./GrilleDuPlan.svelte";
  import Indice from "./Indice.svelte";
  import PanneauDeCase from "./PanneauDeCase.svelte";
  import PanneauDeConfirmation from "./PanneauDeConfirmation.svelte";
  import {
    agrandirLaGrille,
    appliquerLeTrait,
    defaireLeTrait,
    type Bord,
    type Changement,
  } from "./murs";
  import { definirLaCase, type Case, type Contenu } from "./cases";
  import type { Grille, Plan } from "./plans";

  interface Props {
    plan: Plan;
    onrenommer: (nom: string) => void;
    /** Les murs ont changé (un trait, ou « Annuler ») : le plan les enregistre. */
    onmurs: (murs: Bord[]) => void;
    /** Un mur tracé sur le bord a fait grandir la grille : le plan l'enregistre. */
    ongrille: (grille: Grille) => void;
    /** Une case a été écrite ou vidée : le plan enregistre les cases. */
    oncases: (cases: Case[]) => void;
    onretour: () => void;
    /** Le lecteur a confirmé : le plan est effacé. */
    onsupprimer: () => void;
  }

  let {
    plan,
    onrenommer,
    onmurs,
    ongrille,
    oncases,
    onretour,
    onsupprimer,
  }: Props = $props();

  let confirmation = $state(false);
  /** La case dont le panneau est ouvert, en coordonnées du plan. */
  let selection = $state<{ colonne: number; ligne: number } | null>(null);
  let outil = $state<"murs" | "cases">("murs");
  /** Les traits de cet écran, du plus ancien au dernier. */
  let traits = $state.raw<Changement[]>([]);

  function tracer(changement: Changement) {
    const grille = agrandirLaGrille(plan.grille, changement);
    if (grille !== plan.grille) ongrille(grille);
    onmurs(appliquerLeTrait(plan.murs, changement));
    traits = [...traits, changement];
  }

  function ecrireLaCase(contenu: Contenu) {
    if (!selection) return;
    const cases = definirLaCase(
      plan.cases,
      selection.colonne,
      selection.ligne,
      contenu,
    );
    if (cases !== plan.cases) oncases(cases);
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
    cases={plan.cases}
    actif={outil === "murs"}
    ontrait={tracer}
    oncase={(colonne, ligne) => (selection = { colonne, ligne })}
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

{#if selection}
  <PanneauDeCase
    grille={plan.grille}
    cases={plan.cases}
    colonne={selection.colonne}
    ligne={selection.ligne}
    onmodifier={ecrireLaCase}
    onvider={() => ecrireLaCase({ chapitre: null, note: "" })}
    onfermer={() => (selection = null)}
  />
{/if}

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
  /* L'écran tient dans la hauteur du téléphone : en-tête, grille (qui prend
     la place libre), indice et « Supprimer ce plan », puis la barre fixe. */
  .ecran {
    display: flex;
    flex-direction: column;
    min-height: 100dvh;
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
