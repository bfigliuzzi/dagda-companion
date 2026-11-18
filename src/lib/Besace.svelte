<script lang="ts">
  /**
   * Section « Besace » de la feuille : 24 emplacements dessinés en traits de
   * comptage, les objets du lecteur, et la bourse avec son compteur de
   * boulons. La bourse occupe un emplacement, les boulons aucun. Dépasser 24
   * avertit sans rien bloquer ; sans bourse, le compteur est éteint mais le
   * lecteur peut le forcer. Chaque changement remonte aussitôt, donc
   * s'enregistre aussitôt.
   */
  import {
    EMPLACEMENTS_MAX,
    ajouterUnBoulon,
    emplacementsOccupes,
    estUnNombreDeBoulons,
    formaterLesBoulons,
    peutCompterLesBoulons,
    portePlusDObjetsQueLaBesace,
    retirerUnBoulon,
    type Besace,
  } from "./aventure";
  import ValeurEditable from "./ValeurEditable.svelte";

  interface Props {
    besace: Besace;
  }

  let { besace = $bindable() }: Props = $props();
  const id = $props.id();

  const occupes = $derived(emplacementsOccupes(besace));
  const depasse = $derived(portePlusDObjetsQueLaBesace(besace));
  const compteurActif = $derived(peutCompterLesBoulons(besace));
  // Un trait par emplacement ; au-delà de 24, un trait rouge par objet en trop.
  const traits = $derived(Math.max(EMPLACEMENTS_MAX, occupes));

  // Ajout : le formulaire remplace le bouton « Ajouter un objet ».
  let enAjout = $state(false);
  let nouveauNom = $state("");
  const nomVide = $derived(nouveauNom.trim() === "");

  function ouvrirLAjout() {
    nouveauNom = "";
    enAjout = true;
  }

  function ajouter(event: SubmitEvent) {
    event.preventDefault();
    if (nomVide) return;
    besace.objets.push(nouveauNom.trim());
    enAjout = false;
  }

  // Correction du nom : un appui sur le nom ouvre un champ, repris à la frappe.
  let nomEnSaisie = $state<number | null>(null);

  function saisirLeNom(
    index: number,
    event: Event & { currentTarget: HTMLInputElement },
  ) {
    const texte = event.currentTarget.value.trim();
    if (texte !== "") besace.objets[index] = texte;
  }

  function toucheDuNom(event: KeyboardEvent) {
    if (event.key === "Enter" || event.key === "Escape") nomEnSaisie = null;
  }

  const focaliser = (champ: HTMLInputElement) => {
    champ.focus();
    champ.select();
  };
</script>

{#snippet croix(nom: string, retirer: () => void)}
  <button class="x" type="button" aria-label={nom} onclick={retirer}>
    <svg class="i" aria-hidden="true" viewBox="0 0 24 24">
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  </button>
{/snippet}

<section aria-labelledby="{id}-titre">
  <div class="sh">
    <h2 id="{id}-titre">Besace</h2>
    <span class="meta" class:depasse>{occupes} / {EMPLACEMENTS_MAX}</span>
  </div>
  <div
    class="tally"
    role="img"
    aria-label="{occupes} emplacements utilisés sur {EMPLACEMENTS_MAX}"
  >
    {#each Array.from({ length: traits }, (_, i) => i) as index (index)}
      <i
        class:f={index < Math.min(occupes, EMPLACEMENTS_MAX)}
        class:over={index >= EMPLACEMENTS_MAX}
      ></i>
    {/each}
  </div>

  <ul>
    <li class="row">
      <span class="n" class:eteint={!besace.bourse}>
        {besace.bourse ? "Bourse" : "Boulons"}
      </span>
      <span class="purse">
        <button
          class="mini"
          type="button"
          aria-label="Retirer un boulon"
          aria-disabled={compteurActif ? undefined : true}
          onclick={() => {
            if (compteurActif) besace.boulons = retirerUnBoulon(besace.boulons);
          }}
        >
          <svg class="i" aria-hidden="true" viewBox="0 0 24 24">
            <path d="M5 12h14" />
          </svg>
        </button>
        <span class="v" class:eteint={!compteurActif}>
          {#if compteurActif}
            <ValeurEditable
              valeur={besace.boulons}
              nom="Boulons"
              champ="Boulons"
              valide={estUnNombreDeBoulons}
              affiche={formaterLesBoulons}
              onchange={(boulons) => (besace.boulons = boulons)}
            />
          {:else}
            {formaterLesBoulons(besace.boulons)}
          {/if}
        </span>
        <button
          class="mini"
          type="button"
          aria-label="Ajouter un boulon"
          aria-disabled={compteurActif ? undefined : true}
          onclick={() => {
            if (compteurActif) besace.boulons = ajouterUnBoulon(besace.boulons);
          }}
        >
          <svg class="i" aria-hidden="true" viewBox="0 0 24 24">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </span>
      {#if besace.bourse}
        {@render croix("Retirer la bourse", () => (besace.bourse = false))}
      {/if}
    </li>
    {#each besace.objets as objet, index (index)}
      <li class="row">
        {#if nomEnSaisie === index}
          <input
            class="saisie"
            aria-label="Nom de {objet}"
            type="text"
            value={objet}
            oninput={(event) => saisirLeNom(index, event)}
            onkeydown={toucheDuNom}
            onblur={() => (nomEnSaisie = null)}
            {@attach focaliser}
          />
        {:else}
          <button class="n" type="button" onclick={() => (nomEnSaisie = index)}>
            {objet}
          </button>
        {/if}
        {@render croix(`Retirer ${objet}`, () =>
          besace.objets.splice(index, 1),
        )}
      </li>
    {/each}
  </ul>

  {#if !besace.bourse}
    <div class="hint">
      <svg class="i" aria-hidden="true" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v6M12 7.5h.01" />
      </svg>
      <span>
        {#if besace.boulonsForces}
          Compteur forcé : il faut normalement une <b>bourse</b> pour transporter
          des boulons.
        {:else}
          Il faut une <b>bourse</b> pour transporter des boulons.
        {/if}
      </span>
    </div>
    <div class="actions">
      <button class="add" type="button" onclick={() => (besace.bourse = true)}>
        <svg class="i" aria-hidden="true" viewBox="0 0 24 24">
          <path d="M12 5v14M5 12h14" />
        </svg>
        Ajouter une bourse
      </button>
      <button
        class="lien"
        type="button"
        onclick={() => (besace.boulonsForces = !besace.boulonsForces)}
      >
        {besace.boulonsForces ? "Désactiver le compteur" : "Forcer le compteur"}
      </button>
    </div>
  {/if}

  {#if depasse}
    <div class="hint" role="note">
      <svg class="i warn" aria-hidden="true" viewBox="0 0 24 24">
        <path d="M12 3 2 20h20L12 3zM12 10v4M12 17h.01" />
      </svg>
      <span>
        La besace a <b>{EMPLACEMENTS_MAX} emplacements</b>. Gardez l'objet si le
        livre l'autorise, sinon retirez-en un.
      </span>
    </div>
  {/if}

  {#if enAjout}
    <form aria-label="Nouvel objet" onsubmit={ajouter}>
      <label class="champ">
        <span>Nom de l'objet</span>
        <input
          class="texte"
          type="text"
          autocomplete="off"
          bind:value={nouveauNom}
          {@attach focaliser}
        />
      </label>
      <div class="btns">
        <button class="valider" type="submit" aria-disabled={nomVide}>
          {nomVide ? "Nommez d'abord l'objet" : "Ajouter l'objet"}
        </button>
        <button class="annuler" type="button" onclick={() => (enAjout = false)}>
          Annuler
        </button>
      </div>
    </form>
  {:else}
    <button class="add" type="button" onclick={ouvrirLAjout}>
      <svg class="i" aria-hidden="true" viewBox="0 0 24 24">
        <path d="M12 5v14M5 12h14" />
      </svg>
      Ajouter un objet
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
  .meta {
    font-size: 14px;
    color: var(--craie-2);
  }
  .meta.depasse {
    color: var(--rouge);
  }

  .tally {
    display: flex;
    flex-wrap: wrap;
    gap: 3px;
    margin: 4px 0 6px;
  }
  .tally i {
    width: 6px;
    height: 16px;
    border-radius: 2px;
    background: var(--trait);
  }
  .tally i.f {
    background: var(--craie);
  }
  .tally i.over {
    background: var(--rouge);
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
  .n {
    flex: 1;
    padding: 0;
    text-align: left;
    font: inherit;
    color: inherit;
  }
  .n.eteint {
    color: var(--craie-3);
  }
  .purse {
    display: flex;
    align-items: center;
    gap: var(--esp-sm);
  }
  .mini {
    display: grid;
    place-items: center;
    width: var(--cible);
    height: var(--cible);
    border: 2px solid var(--trait);
    border-radius: 50%;
    color: var(--craie-2);
  }
  .mini[aria-disabled="true"] {
    color: var(--craie-3);
  }
  .mini svg {
    width: 18px;
    height: 18px;
  }
  .v {
    font-weight: 700;
    font-size: 18px;
  }
  .v.eteint {
    color: var(--craie-3);
  }
  .x {
    display: grid;
    place-items: center;
    width: var(--cible);
    height: var(--cible);
    margin-right: -10px;
    color: var(--craie-3);
  }
  .x svg {
    width: 18px;
    height: 18px;
  }
  .saisie {
    flex: 1;
    min-width: 0;
    height: 36px;
    padding: 0 var(--esp-sm);
    background: var(--ardoise-2);
    border: 2px solid var(--jaune);
    border-radius: var(--r);
    outline: none;
    font: inherit;
    color: var(--craie);
  }

  .hint {
    display: flex;
    gap: 10px;
    margin-top: 14px;
    padding: 10px 0 0;
    border-top: 2px solid var(--trait);
    font-size: 14px;
    color: var(--craie-2);
  }
  ul + .hint {
    border-top: 0;
    padding-top: var(--esp-xs);
  }
  .hint svg {
    flex: none;
    width: 20px;
    height: 20px;
    margin-top: 1px;
    color: var(--jaune);
  }
  .hint svg.warn {
    color: var(--rouge);
  }
  .hint b {
    color: var(--craie);
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
  .add svg {
    width: 18px;
    height: 18px;
  }
  .lien {
    min-height: var(--cible);
    color: var(--craie-2);
    font-size: 14px;
    font-weight: 700;
    text-decoration: underline;
  }

  form {
    margin-top: var(--esp-xs);
  }
  .champ {
    display: block;
    margin-top: 14px;
  }
  .champ > span {
    display: block;
    margin-bottom: var(--esp-xs);
    font-size: 13px;
    color: var(--craie-2);
  }
  .texte {
    display: flex;
    width: 100%;
    min-height: 52px;
    padding: var(--esp-md) 14px;
    background: var(--ardoise-2);
    border: 2px solid transparent;
    border-radius: var(--r);
    outline: none;
    font-size: 17px;
  }
  .texte:focus {
    border-color: var(--jaune);
  }
  .btns {
    display: grid;
    gap: 10px;
    margin-top: 14px;
  }
  .valider {
    width: 100%;
    min-height: 58px;
    border: 2px solid var(--jaune);
    border-radius: var(--r);
    background: var(--jaune);
    color: var(--noir);
    font-size: 20px;
    font-weight: 800;
  }
  .valider[aria-disabled="true"] {
    background: none;
    border-color: var(--craie-3);
    color: var(--craie-3);
  }
  .annuler {
    min-height: 52px;
    border: 2px solid var(--trait);
    border-radius: var(--r);
    font-weight: 700;
  }
  button:focus-visible {
    outline: 2px solid var(--jaune);
    outline-offset: 3px;
  }
</style>
