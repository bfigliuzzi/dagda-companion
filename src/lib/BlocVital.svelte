<script lang="ts">
  /**
   * Haut de la feuille : PV et boutons « − » / « + » à gauche, CHANCE et
   * DEXTÉRITÉ à droite. Chaque valeur se corrige à la main d'un appui, et
   * chaque changement laisse la trace de craie (voir TraceDeCraie.svelte).
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
  import TraceDeCraie from "./TraceDeCraie.svelte";
  import ValeurEditable from "./ValeurEditable.svelte";

  interface Props {
    personnage: Personnage;
  }

  let { personnage = $bindable() }: Props = $props();
  const id = $props.id();

  const critique = $derived(estCritique(personnage.pointsDeVie));
  const remplissage = $derived(
    Math.min(
      100,
      Math.max(0, (personnage.pointsDeVie / personnage.pointsDeVieMax) * 100),
    ),
  );
</script>

<div class="vital">
  <div class="pv" role="group" aria-labelledby="{id}-pv">
    <div class="etiquette" id="{id}-pv">Points de vie</div>
    <div class="num">
      <TraceDeCraie valeur={personnage.pointsDeVie} taille="24px" />
      <b class:critique>
        <ValeurEditable
          valeur={personnage.pointsDeVie}
          nom="Points de vie"
          champ="Points de vie actuels"
          tailleSaisie="52px"
          valide={estUnPointDeVieActuel}
          onchange={(valeur) => (personnage.pointsDeVie = valeur)}
        />
      </b>
      <span class="max">
        /
        <TraceDeCraie valeur={personnage.pointsDeVieMax} taille="24px" />
        <ValeurEditable
          valeur={personnage.pointsDeVieMax}
          nom="Points de vie maximum"
          champ="Points de vie maximum"
          valide={estUnMaximumDePointsDeVie}
          onchange={(valeur) => (personnage.pointsDeVieMax = valeur)}
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
        onclick={() =>
          (personnage.pointsDeVie = retirerUnPointDeVie(
            personnage.pointsDeVie,
          ))}
      >
        <svg class="i" aria-hidden="true" viewBox="0 0 24 24">
          <path d="M5 12h14" />
        </svg>
      </button>
      <button
        class="step"
        type="button"
        aria-label="Ajouter un point de vie"
        onclick={() =>
          (personnage.pointsDeVie = ajouterUnPointDeVie(
            personnage.pointsDeVie,
            personnage.pointsDeVieMax,
          ))}
      >
        <svg class="i" aria-hidden="true" viewBox="0 0 24 24">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>
    </div>
  </div>
  <div class="pile">
    <div class="stat" role="group" aria-labelledby="{id}-chance">
      <span class="etiquette" id="{id}-chance">Chance</span>
      <span class="valeur">
        <TraceDeCraie valeur={personnage.chance} taille="20px" barre="2px" />
        <b>
          <ValeurEditable
            valeur={personnage.chance}
            nom="Chance"
            champ="CHANCE"
            valide={estUneChance}
            onchange={(valeur) => (personnage.chance = valeur)}
          />
        </b>
      </span>
    </div>
    <div class="stat" role="group" aria-labelledby="{id}-dex">
      <span class="etiquette" id="{id}-dex">Dextérité</span>
      <span class="valeur">
        <TraceDeCraie valeur={personnage.dexterite} taille="20px" barre="2px" />
        <b>
          <ValeurEditable
            valeur={personnage.dexterite}
            nom="Dextérité"
            champ="DEXTÉRITÉ"
            valide={estUneDexterite}
            onchange={(valeur) => (personnage.dexterite = valeur)}
          />
        </b>
      </span>
    </div>
  </div>
  {#if depasseLeMaximum(personnage)}
    <div class="indice" role="status">
      <svg class="i" aria-hidden="true" viewBox="0 0 24 24">
        <path d="M12 3 2 20h20L12 3zM12 10v4M12 17h.01" />
      </svg>
      <span>
        Vos PV dépassent le maximum de <b>{personnage.pointsDeVieMax}</b>.
        Gardez-les si le livre l'autorise, sinon revenez au maximum.
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
