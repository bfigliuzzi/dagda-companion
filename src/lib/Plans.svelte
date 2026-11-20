<script lang="ts">
  /**
   * Section « Plans » de la feuille, juste après les Notes : une ligne de 48 px
   * par plan, avec son nom, qui ouvre l'écran du plan, puis « Nouveau plan »,
   * qui demande un nom (FormulaireDAjout, comme pour une arme). Sans plan, seul
   * « Nouveau plan » s'affiche. Chaque plan créé s'enregistre aussitôt, avec
   * le reste de l'aventure.
   *
   * À droite de la ligne : « ici § 203 » quand le repère est sur une case
   * numérotée (le numéro de cette case, même si le repère est pâle), sinon le
   * nombre de cases notées (« 3 cases notées », « 1 case notée », rien pour 0).
   */
  import FormulaireDAjout from "./FormulaireDAjout.svelte";
  import Icone from "./Icone.svelte";
  import { laCase } from "./cases";
  import { unNouveauPlan, type Plan } from "./plans";

  interface Props {
    plans: Plan[];
    /** Un appui sur la ligne d'un plan. */
    onouvrir: (id: number) => void;
  }

  let { plans = $bindable(), onouvrir }: Props = $props();
  const id = $props.id();

  let enAjout = $state(false);

  /** Le chapitre de la case du repère, ou `null`. */
  function ici(plan: Plan): number | null {
    const { repere } = plan;
    return repere
      ? (laCase(plan.cases, repere.colonne, repere.ligne)?.chapitre ?? null)
      : null;
  }

  function ajouter(nom: string) {
    plans.push(unNouveauPlan(nom, plans));
    enAjout = false;
  }
</script>

<section aria-labelledby="{id}-titre">
  <div class="sh"><h2 id="{id}-titre">Plans</h2></div>

  {#if plans.length > 0}
    <ul>
      {#each plans as plan (plan.id)}
        <li>
          <button class="row" type="button" onclick={() => onouvrir(plan.id)}>
            <span class="nom">{plan.nom}</span>
            {#if ici(plan) !== null}
              <span class="val">ici § {ici(plan)}</span>
            {:else if plan.cases.length > 0}
              <span class="detail">
                {plan.cases.length}
                {plan.cases.length > 1 ? "cases notées" : "case notée"}
              </span>
            {/if}
          </button>
        </li>
      {/each}
    </ul>
  {/if}

  {#if enAjout}
    <FormulaireDAjout
      titre="Nouveau plan"
      etiquette="Nom du plan"
      manque="Nommez d'abord le plan"
      valider="Créer le plan"
      onajouter={ajouter}
      onannuler={() => (enAjout = false)}
    />
  {:else}
    <button class="add" type="button" onclick={() => (enAjout = true)}>
      <Icone nom="plus" />
      Nouveau plan
    </button>
  {/if}
</section>

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
  ul {
    list-style: none;
  }
  .row {
    display: flex;
    align-items: center;
    width: 100%;
    min-height: var(--ligne);
    padding: var(--esp-sm) 0;
    border-bottom: 1px solid var(--trait);
    text-align: left;
  }
  .nom {
    flex: 1;
  }
  /* Valeur de la ligne (DESIGN.md, « Rows ») : 18 px graisse 700, chiffres tabulaires. */
  .val {
    font-size: 18px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }
  /* Le nombre de cases notées décrit le plan, il n'en est pas une valeur : 14 px craie grise. */
  .detail {
    font-size: 14px;
    color: var(--craie-2);
    font-variant-numeric: tabular-nums;
  }
  .add {
    display: flex;
    align-items: center;
    gap: var(--esp-sm);
    min-height: var(--ligne);
    margin-top: 10px;
    color: var(--craie-2);
    font-weight: 700;
  }
  .add :global(svg) {
    width: 18px;
    height: 18px;
  }
  button:focus-visible {
    outline: 2px solid var(--jaune);
    outline-offset: 3px;
  }
</style>
