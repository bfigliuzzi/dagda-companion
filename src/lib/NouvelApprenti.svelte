<script lang="ts">
  import {
    DEXTERITE_DE_DEPART,
    MODES,
    TALENTS,
    ceQuiManque,
    commencerAventure,
    type Aventure,
    type Mode,
    type Talent,
  } from "./aventure";
  import { tirerChance, tirerPointsDeVieMax, type De } from "./des";
  import LigneDeJet from "./LigneDeJet.svelte";

  interface Props {
    de: De;
    oncommencer: (aventure: Aventure) => void;
  }

  let { de, oncommencer }: Props = $props();
  const id = $props.id();

  let talent = $state<Talent | null>(null);
  let mode = $state<Mode | null>(null);
  let pointsDeVieMax = $state<number | null>(null);
  /** Total des 2d6 du dernier lancer ; oublié si le lecteur corrige à la main. */
  let obtenu = $state<number | null>(null);
  let chance = $state<number | null>(null);

  const brouillon = $derived({ talent, mode, pointsDeVieMax, chance });
  const manque = $derived(ceQuiManque(brouillon));

  function lancerPointsDeVie() {
    const tirage = tirerPointsDeVieMax(de);
    pointsDeVieMax = tirage.valeur;
    obtenu = tirage.obtenu;
  }
</script>

<main class="ecran">
  <h1>Nouvel apprenti</h1>

  <!-- « Déjà en route » (recopier un personnage commencé sur papier) : ticket 03. -->
  <div class="segments" role="radiogroup" aria-label="Type d'aventure">
    <label class="segment">
      <input class="sr" type="radio" name="{id}-depart" checked />
      Nouvelle aventure
    </label>
    <label class="segment">
      <input class="sr" type="radio" name="{id}-depart" disabled />
      Déjà en route
    </label>
  </div>

  <p class="intro">
    La veille de votre examen à l'Académie de Dagda. Trois choix, puis
    l'aventure commence au chapitre 1.
  </p>

  <section>
    <h2 id="{id}-talent">Talent</h2>
    <div class="puces" role="radiogroup" aria-labelledby="{id}-talent">
      {#each TALENTS as nom (nom)}
        <label class="puce">
          <input
            class="sr"
            type="radio"
            name="{id}-talent"
            value={nom}
            bind:group={talent}
          />
          {nom}
        </label>
      {/each}
    </div>
  </section>

  <section>
    <h2 id="{id}-mode">Mode de jeu</h2>
    <div class="choix" role="radiogroup" aria-labelledby="{id}-mode">
      {#each Object.entries(MODES) as [cle, { nom, description }] (cle)}
        <label class="choix-ligne">
          <input
            class="sr"
            type="radio"
            name="{id}-mode"
            value={cle}
            bind:group={mode}
            aria-labelledby="{id}-mode-{cle}-nom"
            aria-describedby="{id}-mode-{cle}-description"
          />
          <span class="radio" aria-hidden="true"></span>
          <span class="t">
            <b id="{id}-mode-{cle}-nom">{nom}</b>
            <span id="{id}-mode-{cle}-description">{description}</span>
          </span>
        </label>
      {/each}
    </div>
  </section>

  <section>
    <h2>Caractéristiques</h2>
    <LigneDeJet
      nom="Points de vie"
      etiquette="Points de vie maximum"
      objet="les points de vie"
      min={1}
      detail={obtenu === null ? "2 dés × 4" : `2 dés × 4 · obtenu ${obtenu}`}
      bind:valeur={pointsDeVieMax}
      onlancer={lancerPointsDeVie}
      onsaisie={() => (obtenu = null)}
    />
    <LigneDeJet
      nom="Chance"
      etiquette="Chance"
      objet="la chance"
      min={0}
      detail="1 dé"
      bind:valeur={chance}
      onlancer={() => (chance = tirerChance(de))}
    />
    <div class="ligne-fixe">
      <span class="n">
        Dextérité<small>Fixée à 7 pour tous les apprentis</small>
      </span>
      <b>{DEXTERITE_DE_DEPART}</b>
    </div>
  </section>

  <div class="dock">
    <button
      class="valider"
      disabled={manque !== null}
      onclick={() => oncommencer(commencerAventure(brouillon))}
    >
      {manque ?? "Commencer l'aventure"}
    </button>
  </div>
</main>

<style>
  .ecran {
    max-width: 480px;
    margin: 0 auto;
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
  }

  h1 {
    padding: var(--gutter) var(--gutter) var(--esp-xs);
    padding-top: max(var(--gutter), env(safe-area-inset-top));
    font-size: 28px;
    font-weight: 800;
    letter-spacing: -0.015em;
  }

  .segments {
    display: grid;
    grid-template-columns: 1fr 1fr;
    margin: var(--esp-hair) var(--gutter) 14px;
    padding: var(--esp-hair);
    background: var(--ardoise-2);
    border-radius: var(--r);
  }

  .segment {
    display: grid;
    place-items: center;
    min-height: var(--cible);
    border-radius: var(--rayon-seg);
    font-weight: 700;
    color: var(--craie-2);
    cursor: pointer;
  }

  .segment:has(:checked) {
    background: var(--craie);
    color: var(--noir);
  }

  .segment:has(:disabled) {
    color: var(--craie-3);
    cursor: default;
  }

  .intro {
    padding: 0 var(--gutter);
    font-size: 15px;
    color: var(--craie-2);
  }

  section {
    padding: var(--esp-section) var(--gutter) var(--esp-hair);
  }

  h2 {
    margin-bottom: var(--esp-xs);
    padding-bottom: var(--esp-hair);
    border-bottom: 2px solid var(--craie);
    font-size: 22px;
    font-weight: 800;
    line-height: 1.1;
    letter-spacing: -0.005em;
  }

  .puces {
    display: flex;
    flex-wrap: wrap;
    gap: var(--esp-sm);
    margin-top: var(--esp-sm);
  }

  .puce {
    display: flex;
    align-items: center;
    min-height: var(--cible);
    padding: 0 var(--esp-lg);
    border: 2px solid var(--trait);
    border-radius: var(--rayon-pill);
    font-weight: 700;
    color: var(--craie-2);
    cursor: pointer;
  }

  .puce:has(:checked) {
    border-color: var(--jaune);
    color: var(--jaune);
  }

  .choix {
    margin-top: var(--esp-sm);
  }

  .choix-ligne {
    display: flex;
    gap: var(--esp-md);
    align-items: flex-start;
    min-height: var(--ligne);
    padding: var(--esp-md) 0;
    border-bottom: 1px solid var(--trait);
    cursor: pointer;
  }

  .radio {
    flex: none;
    width: 24px;
    height: 24px;
    margin-top: 1px;
    border: 2px solid var(--craie-3);
    border-radius: var(--rayon-round);
  }

  .choix-ligne:has(:checked) .radio {
    border-color: var(--jaune);
    background: var(--jaune);
    box-shadow: inset 0 0 0 5px var(--noir);
  }

  .t b {
    display: block;
    font-size: 17px;
  }

  .t span {
    font-size: 14px;
    color: var(--craie-2);
  }

  /* Les vrais boutons radio sont masqués : l'anneau de focus passe à leur étiquette. */
  .puce:has(:focus-visible),
  .segment:has(:focus-visible),
  .choix-ligne:has(:focus-visible) {
    outline: 2px solid var(--jaune);
    outline-offset: 3px;
  }

  .ligne-fixe {
    display: flex;
    align-items: center;
    gap: var(--esp-md);
    min-height: 64px;
    padding: 10px 0;
  }

  .ligne-fixe .n {
    flex: 1;
  }

  .ligne-fixe small {
    display: block;
    font-size: 13px;
    color: var(--craie-2);
  }

  .ligne-fixe b {
    font-size: 32px;
    font-weight: 800;
    line-height: 1;
  }

  .dock {
    position: sticky;
    bottom: 0;
    margin-top: auto;
    padding: var(--esp-md) var(--gutter) 22px;
    padding-bottom: max(22px, env(safe-area-inset-bottom));
    background: linear-gradient(to top, var(--noir) 70%, rgb(0 0 0 / 0));
  }

  .valider {
    width: 100%;
    min-height: 58px;
    border: 2px solid var(--jaune);
    border-radius: var(--r);
    color: var(--jaune);
    font-size: 20px;
    font-weight: 800;
  }

  .valider:disabled {
    border-color: var(--craie-3);
    color: var(--craie-3);
    cursor: default;
  }
</style>
