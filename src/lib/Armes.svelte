<script lang="ts">
  /**
   * Section « Armes » de la feuille : le nom et le bonus de dommage de chaque
   * arme, à corriger d'un appui ou à retirer. Les armes ne prennent pas de
   * place dans la besace. Au-delà de 2 armes, le compteur passe en rouge avec
   * un indice, sans rien bloquer. Chaque changement remonte aussitôt, donc
   * s'enregistre aussitôt.
   *
   * Le compteur montre le bonus de dommage effectif : armes + effets (voir
   * valeursEffectives.ts), en vert avec la ligne « base +1 · rage +2 » quand un effet le
   * change, et la trace de craie quand il change.
   */
  import Indice from "./Indice.svelte";
  import Icone from "./Icone.svelte";
  import {
    ARMES_MAX,
    bonusDeDegatsDesArmes,
    estUnBonusDeDegats,
    portePlusDArmesQueLesRegles,
    type Arme,
  } from "./aventure";
  import ChampNumerique from "./ChampNumerique.svelte";
  import FormulaireDAjout from "./FormulaireDAjout.svelte";
  import NomModifiable from "./NomModifiable.svelte";
  import { formaterUnBonus } from "./signes";
  import {
    explication,
    valeurEffective,
    type Effet,
  } from "./valeursEffectives";
  import TraceDeCraie from "./TraceDeCraie.svelte";
  import ValeurEditable from "./ValeurEditable.svelte";

  interface Props {
    armes: Arme[];
    effets: readonly Effet[];
    /** « Combattre » : le livre lance un combat. */
    oncombattre: () => void;
  }

  let { armes = $bindable(), effets, oncombattre }: Props = $props();
  const id = $props.id();

  const depasse = $derived(portePlusDArmesQueLesRegles(armes));
  const bonusDesArmes = $derived(bonusDeDegatsDesArmes(armes));
  const degats = $derived(
    formaterUnBonus(valeurEffective("degats", bonusDesArmes, effets)),
  );
  const ligne = $derived(explication("degats", bonusDesArmes, effets));

  // Ajout : le formulaire remplace le bouton « Ajouter une arme ».
  let enAjout = $state(false);
  let nouveauBonus = $state<number | null>(0);

  function ouvrirLAjout() {
    nouveauBonus = 0;
    enAjout = true;
  }

  function ajouter(nom: string) {
    armes.push({
      nom,
      bonus: estUnBonusDeDegats(nouveauBonus) ? nouveauBonus : 0,
    });
    enAjout = false;
  }
</script>

<section aria-labelledby="{id}-titre">
  <div class="sh">
    <h2 id="{id}-titre">Armes</h2>
    <span class="meta" data-etat={depasse ? "depasse" : undefined}>
      {armes.length} / {ARMES_MAX} ·
      <TraceDeCraie valeur={degats} barre="2px" />
      <span data-etat={ligne !== null ? "modifie" : undefined}>
        {degats} aux dégâts
      </span>
      {#if ligne}<small data-etat="modifie">{ligne}</small>{/if}
    </span>
  </div>

  {#if armes.length > 0}
    <ul>
      {#each armes as arme, index (index)}
        <li class="row">
          <NomModifiable
            nom={arme.nom}
            onrenommer={(nom) => (arme.nom = nom)}
          />
          <span class="v">
            <ValeurEditable
              valeur={arme.bonus}
              nom="Bonus de {arme.nom}"
              champ="Bonus de {arme.nom}"
              valide={estUnBonusDeDegats}
              affiche={formaterUnBonus}
              onchange={(bonus) => (arme.bonus = bonus)}
            />
          </span>
          <button
            class="x"
            type="button"
            aria-label="Retirer {arme.nom}"
            onclick={() => armes.splice(index, 1)}
          >
            <Icone nom="croix" />
          </button>
        </li>
      {/each}
    </ul>
  {/if}

  {#if depasse}
    <Indice icone="alerte" role="note" sousListe={armes.length > 0}>
      Les règles permettent <b>{ARMES_MAX} armes</b>. Gardez-la si le livre
      l'autorise, sinon retirez-en une.
    </Indice>
  {/if}

  {#if enAjout}
    <FormulaireDAjout
      titre="Nouvelle arme"
      etiquette="Nom de l'arme"
      manque="Nommez d'abord l'arme"
      valider="Ajouter l'arme"
      onajouter={ajouter}
      onannuler={() => (enAjout = false)}
    >
      <ChampNumerique
        nom="Bonus de dommage"
        min={-99}
        bind:valeur={nouveauBonus}
      />
    </FormulaireDAjout>
  {:else}
    <div class="actions">
      <button class="add" type="button" onclick={ouvrirLAjout}>
        <Icone nom="plus" />
        Ajouter une arme
      </button>
      <button class="inline-act" type="button" onclick={oncombattre}>
        <Icone nom="epees" />
        Combattre
      </button>
    </div>
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
  .meta {
    font-size: 14px;
    color: var(--craie-2);
  }
  .meta {
    text-align: right;
  }
  .meta[data-etat="depasse"] {
    color: var(--rouge);
  }
  /* Craie verte : le bonus changé par un effet, et sa ligne d'explication. */
  [data-etat="modifie"] {
    color: var(--vert);
  }
  .meta small {
    display: block;
    margin-top: 2px;
    font-size: 12px;
  }

  ul {
    list-style: none;
  }
  .row {
    display: flex;
    align-items: center;
    gap: var(--esp-md);
    min-height: var(--ligne);
    padding: var(--esp-sm) 0;
    border-bottom: 1px solid var(--trait);
  }
  .v {
    font-weight: 700;
    font-size: 18px;
  }
  .x {
    display: grid;
    place-items: center;
    width: var(--cible);
    height: var(--cible);
    margin-right: -10px;
    color: var(--craie-3);
  }
  .x :global(svg) {
    width: 18px;
    height: 18px;
  }
  .actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 10px;
  }
  .add {
    display: flex;
    align-items: center;
    gap: var(--esp-sm);
    min-height: var(--ligne);
    color: var(--craie-2);
    font-weight: 700;
  }
  .add :global(svg) {
    width: 18px;
    height: 18px;
  }
  /* Action en ligne : pilule à contour craie. */
  .inline-act {
    display: flex;
    align-items: center;
    gap: var(--esp-sm);
    min-height: var(--cible);
    padding: 0 14px;
    border: 2px solid var(--craie);
    border-radius: var(--rayon-pill);
    font-size: 15px;
    font-weight: 700;
  }
  .inline-act :global(svg) {
    width: 18px;
    height: 18px;
  }
</style>
