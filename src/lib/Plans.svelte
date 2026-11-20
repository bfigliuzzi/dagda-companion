<script lang="ts">
  /**
   * Section « Plans » de la feuille, juste après les Notes : une ligne de 48 px
   * par plan, avec son nom, qui ouvre l'écran du plan, puis « Nouveau plan »,
   * qui demande un nom (FormulaireDAjout, comme pour une arme). Sans plan, seul
   * « Nouveau plan » s'affiche. Chaque plan créé s'enregistre aussitôt, avec
   * le reste de l'aventure.
   *
   * À droite de la ligne : « ici § 203 » quand le repère est plein sur une
   * case numérotée (reperes.ts, `numeroDuRepere`), sinon le nombre de cases
   * notées (« 3 cases notées », « 1 case notée », rien pour 0) : un repère
   * pâle ne dit pas « ici », le lecteur n'y est plus.
   */
  import FormulaireDAjout from "./FormulaireDAjout.svelte";
  import Icone from "./Icone.svelte";
  import { unNouveauPlan, type Plan } from "./plans";
  import { numeroDuRepere } from "./reperes";

  interface Props {
    plans: Plan[];
    /** Le dernier chapitre lu, pour savoir si le repère d'un plan est plein. */
    chapitre: number;
    /** Un appui sur la ligne d'un plan. */
    onouvrir: (id: number) => void;
  }

  let { plans = $bindable(), chapitre, onouvrir }: Props = $props();
  const id = $props.id();

  let enAjout = $state(false);

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
        {@const numero = numeroDuRepere(plan.repere, plan.cases, chapitre)}
        <li>
          <button class="row" type="button" onclick={() => onouvrir(plan.id)}>
            <span class="nom">{plan.nom}</span>
            {#if numero !== null}
              <span class="val"><span class="ici">ici</span> § {numero}</span>
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
  /* « ici » se lit avec le numéro sans en être la valeur : 14 px graisse 400
     craie grise, comme « / 32 » après les PV. */
  .ici {
    font-size: 14px;
    font-weight: 400;
    color: var(--craie-2);
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
