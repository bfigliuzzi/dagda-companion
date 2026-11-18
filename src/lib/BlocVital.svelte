<script lang="ts">
  /**
   * Haut de la feuille : PV et boutons « − » / « + » à gauche, CHANCE et
   * DEXTÉRITÉ à droite. Chaque valeur se corrige à la main d'un appui, et
   * chaque changement laisse la trace de craie (voir TraceDeCraie.svelte).
   *
   * Les valeurs affichées sont les valeurs effectives (base + effets, voir
   * valeursEffectives.ts) : en vert, avec la ligne « base 7 · potion +1 », quand un effet
   * les change. « − », « + » et les corrections à la main portent sur la
   * valeur affichée ; `baseApres` en tire la base à enregistrer.
   */
  import {
    ajouterUnPointDeVie,
    depasseLeMaximum,
    estCritique,
    estUneChance,
    estUneDexterite,
    estUnMaximumDePointsDeVie,
    estUnPointDeVieActuel,
    retirerUnPointDeVie,
    type Personnage,
  } from "./aventure";
  import {
    baseApres,
    explication,
    valeurEffective,
    type Cible,
    type Effet,
  } from "./valeursEffectives";
  import TraceDeCraie from "./TraceDeCraie.svelte";
  import ValeurEditable from "./ValeurEditable.svelte";

  interface Props {
    /** Les bases, sans les effets. */
    personnage: Personnage;
    effets: readonly Effet[];
    /**
     * PV et CHANCE affichés avant un combat, au retour sur la feuille : la
     * trace de craie montre ce que le combat a changé.
     */
    avant?: { pointsDeVie?: number; chance?: number };
  }

  let { personnage = $bindable(), effets, avant = {} }: Props = $props();
  const id = $props.id();

  type Valeur = Exclude<Cible, "degats">;

  /** La valeur affichée et sa ligne d'explication (`null` sans effet). */
  const affiche = $derived.by(() => {
    const lire = (cible: Valeur) => ({
      valeur: valeurEffective(cible, personnage[cible], effets),
      explication: explication(cible, personnage[cible], effets),
    });
    return {
      pointsDeVie: lire("pointsDeVie"),
      pointsDeVieMax: lire("pointsDeVieMax"),
      chance: lire("chance"),
      dexterite: lire("dexterite"),
    };
  });
  const pv = $derived(affiche.pointsDeVie.valeur);
  const max = $derived(affiche.pointsDeVieMax.valeur);

  /** Le lecteur change la valeur affichée : on enregistre la base qui la donne. */
  function changer(cible: Valeur, valeur: number) {
    personnage[cible] = baseApres(cible, valeur, effets);
  }

  /** CHANCE et DEXTÉRITÉ, dans la pile de droite. */
  const STATS = [
    { cible: "chance", nom: "Chance", champ: "CHANCE", valide: estUneChance },
    {
      cible: "dexterite",
      nom: "Dextérité",
      champ: "DEXTÉRITÉ",
      valide: estUneDexterite,
    },
  ] as const;

  const critique = $derived(estCritique(pv));
  const remplissage = $derived(Math.min(100, Math.max(0, (pv / max) * 100)));
</script>

<div class="vital">
  <div class="pv" role="group" aria-labelledby="{id}-pv">
    <div class="etiquette">
      <span id="{id}-pv">Points de vie</span>
      {#if affiche.pointsDeVie.explication}
        <small class="vert">{affiche.pointsDeVie.explication}</small>
      {/if}
      {#if affiche.pointsDeVieMax.explication}
        <small class="vert">max : {affiche.pointsDeVieMax.explication}</small>
      {/if}
    </div>
    <div class="num">
      <TraceDeCraie valeur={pv} taille="24px" depuis={avant.pointsDeVie} />
      <b
        class:critique
        class:vert={!critique && affiche.pointsDeVie.explication !== null}
      >
        <ValeurEditable
          valeur={pv}
          nom="Points de vie"
          champ="Points de vie actuels"
          tailleSaisie="52px"
          valide={estUnPointDeVieActuel}
          onchange={(valeur) => changer("pointsDeVie", valeur)}
        />
      </b>
      <span
        class="max"
        class:vert={affiche.pointsDeVieMax.explication !== null}
      >
        /
        <TraceDeCraie valeur={max} taille="24px" />
        <ValeurEditable
          valeur={max}
          nom="Points de vie maximum"
          champ="Points de vie maximum"
          valide={estUnMaximumDePointsDeVie}
          onchange={(valeur) => changer("pointsDeVieMax", valeur)}
        />
      </span>
    </div>
    <div class="barre" aria-hidden="true">
      <u class:critique style:width="{remplissage}%"></u>
    </div>
    {#if critique}<span class="sr">état critique</span>{/if}
    <div class="steps">
      <button
        class="step moins"
        type="button"
        aria-label="Retirer un point de vie"
        onclick={() => changer("pointsDeVie", retirerUnPointDeVie(pv))}
      >
        <svg class="i" aria-hidden="true" viewBox="0 0 24 24">
          <path d="M5 12h14" />
        </svg>
      </button>
      <button
        class="step"
        type="button"
        aria-label="Ajouter un point de vie"
        onclick={() => changer("pointsDeVie", ajouterUnPointDeVie(pv, max))}
      >
        <svg class="i" aria-hidden="true" viewBox="0 0 24 24">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>
    </div>
  </div>
  <div class="pile">
    {#each STATS as { cible, nom, champ, valide } (cible)}
      {@const { valeur, explication } = affiche[cible]}
      <div class="stat" role="group" aria-labelledby="{id}-{cible}">
        <span class="etiquette">
          <span id="{id}-{cible}">{nom}</span>
          {#if explication}<small class="vert">{explication}</small>{/if}
        </span>
        <span class="valeur">
          <TraceDeCraie
            {valeur}
            taille="20px"
            barre="2px"
            depuis={cible === "chance" ? avant.chance : undefined}
          />
          <b class:vert={explication !== null}>
            <ValeurEditable
              {valeur}
              {nom}
              {champ}
              {valide}
              onchange={(nouvelle) => changer(cible, nouvelle)}
            />
          </b>
        </span>
      </div>
    {/each}
  </div>
  {#if depasseLeMaximum({ pointsDeVie: pv, pointsDeVieMax: max })}
    <div class="indice" role="status">
      <svg class="i" aria-hidden="true" viewBox="0 0 24 24">
        <path d="M12 3 2 20h20L12 3zM12 10v4M12 17h.01" />
      </svg>
      <span>
        Vos PV dépassent le maximum de <b>{max}</b>. Gardez-les si le livre
        l'autorise, sinon revenez au maximum.
      </span>
    </div>
  {/if}
</div>

<style>
  .vital {
    display: grid;
    grid-template-columns: 1.45fr 1fr;
    gap: var(--esp-lg);
    padding: 14px var(--gutter) var(--gutter);
    border-bottom: 2px solid var(--trait);
  }

  .etiquette {
    font-size: 13px;
    color: var(--craie-2);
    letter-spacing: 0.02em;
  }

  .num {
    display: flex;
    flex-wrap: nowrap;
    align-items: baseline;
    gap: var(--esp-xs);
    margin-top: 2px;
    white-space: nowrap;
  }

  .num b {
    font-size: 88px;
    font-weight: 800;
    line-height: 0.92;
    letter-spacing: -0.03em;
  }

  .max {
    font-size: 24px;
    font-weight: 500;
    color: var(--craie-2);
  }

  /* Le maximum, comme le reste de la ligne, tient dans un bouton de 44 px. */
  .max :global(button) {
    text-align: left;
  }

  .critique {
    color: var(--rouge);
  }

  /* Craie verte : une valeur changée par un effet, et sa ligne d'explication. */
  .vert {
    color: var(--vert);
  }

  .etiquette small {
    display: block;
    margin-top: 2px;
    font-size: 12px;
  }

  .barre {
    height: 6px;
    margin-top: var(--esp-sm);
    background: var(--trait);
    border-radius: 3px;
  }

  .barre u {
    display: block;
    height: 6px;
    background: var(--craie);
    border-radius: 3px;
  }

  .barre u.critique {
    background: var(--rouge);
  }

  .steps {
    display: flex;
    gap: 10px;
    margin-top: var(--esp-md);
  }

  .step {
    display: grid;
    place-items: center;
    width: 56px;
    height: 56px;
    color: var(--craie);
    border: 2px solid var(--craie);
    border-radius: var(--rayon-round);
  }

  .step.moins {
    color: var(--rouge);
    border-color: var(--rouge);
  }

  .step svg {
    width: 26px;
    height: 26px;
  }

  .pile {
    display: flex;
    flex-direction: column;
  }

  .stat {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    min-height: var(--ligne);
    padding: var(--esp-xs) 0;
    border-bottom: 1px solid var(--trait);
  }

  .stat:last-child {
    border-bottom: 0;
  }

  .valeur {
    display: flex;
    align-items: baseline;
  }

  .stat b {
    font-size: 32px;
    font-weight: 800;
    line-height: 1;
  }

  .stat b :global(button) {
    text-align: right;
  }

  /* Indice non bloquant : voir DESIGN.md, « Hints ». */
  .indice {
    grid-column: 1 / -1;
    display: flex;
    gap: 10px;
    margin-top: -2px;
    padding: 10px 0 0;
    border-top: 2px solid var(--trait);
    font-size: 14px;
    color: var(--craie-2);
  }

  .indice svg {
    flex: none;
    width: 20px;
    height: 20px;
    margin-top: 1px;
    color: var(--rouge);
  }

  .indice b {
    color: var(--craie);
  }
</style>
