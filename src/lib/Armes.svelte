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
  import {
    ARMES_MAX,
    bonusDeDegatsDesArmes,
    estUnBonusDeDegats,
    formaterUnBonus,
    portePlusDArmesQueLesRegles,
    type Arme,
  } from "./aventure";
  import ChampNumerique from "./ChampNumerique.svelte";
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
  let nouveauNom = $state("");
  let nouveauBonus = $state<number | null>(0);
  const nomVide = $derived(nouveauNom.trim() === "");

  function ouvrirLAjout() {
    nouveauNom = "";
    nouveauBonus = 0;
    enAjout = true;
  }

  function ajouter(event: SubmitEvent) {
    event.preventDefault();
    if (nomVide) return;
    armes.push({
      nom: nouveauNom.trim(),
      bonus: estUnBonusDeDegats(nouveauBonus) ? nouveauBonus : 0,
    });
    enAjout = false;
  }

  // Correction du nom : un appui sur le nom ouvre un champ, repris à la frappe.
  let nomEnSaisie = $state<number | null>(null);

  function saisirLeNom(
    index: number,
    event: Event & { currentTarget: HTMLInputElement },
  ) {
    const texte = event.currentTarget.value.trim();
    if (texte !== "") armes[index].nom = texte;
  }

  function toucheDuNom(event: KeyboardEvent) {
    if (event.key === "Enter" || event.key === "Escape") nomEnSaisie = null;
  }

  const focaliser = (champ: HTMLInputElement) => {
    champ.focus();
    champ.select();
  };
</script>

<section aria-labelledby="{id}-titre">
  <div class="sh">
    <h2 id="{id}-titre">Armes</h2>
    <span class="meta" class:depasse>
      {armes.length} / {ARMES_MAX} ·
      <TraceDeCraie valeur={degats} barre="2px" />
      <span class:vert={ligne !== null}>{degats} aux dégâts</span>
      {#if ligne}<small class="vert">{ligne}</small>{/if}
    </span>
  </div>

  {#if armes.length > 0}
    <ul>
      {#each armes as arme, index (index)}
        <li class="row">
          {#if nomEnSaisie === index}
            <input
              class="saisie"
              aria-label="Nom de {arme.nom}"
              type="text"
              value={arme.nom}
              oninput={(event) => saisirLeNom(index, event)}
              onkeydown={toucheDuNom}
              onblur={() => (nomEnSaisie = null)}
              {@attach focaliser}
            />
          {:else}
            <button
              class="n"
              type="button"
              onclick={() => (nomEnSaisie = index)}
            >
              {arme.nom}
            </button>
          {/if}
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
            <svg class="i" aria-hidden="true" viewBox="0 0 24 24">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </li>
      {/each}
    </ul>
  {/if}

  {#if depasse}
    <div class="hint" role="note">
      <svg class="i" aria-hidden="true" viewBox="0 0 24 24">
        <path d="M12 3 2 20h20L12 3zM12 10v4M12 17h.01" />
      </svg>
      <span>
        Les règles permettent <b>{ARMES_MAX} armes</b>. Gardez-la si le livre
        l'autorise, sinon retirez-en une.
      </span>
    </div>
  {/if}

  {#if enAjout}
    <form aria-label="Nouvelle arme" onsubmit={ajouter}>
      <label class="champ">
        <span>Nom de l'arme</span>
        <input
          class="texte"
          type="text"
          autocomplete="off"
          bind:value={nouveauNom}
          {@attach focaliser}
        />
      </label>
      <ChampNumerique
        nom="Bonus de dommage"
        min={-99}
        bind:valeur={nouveauBonus}
      />
      <div class="btns">
        <button class="valider" type="submit" aria-disabled={nomVide}>
          {nomVide ? "Nommez d'abord l'arme" : "Ajouter l'arme"}
        </button>
        <button class="annuler" type="button" onclick={() => (enAjout = false)}>
          Annuler
        </button>
      </div>
    </form>
  {:else}
    <div class="actions">
      <button class="add" type="button" onclick={ouvrirLAjout}>
        <svg class="i" aria-hidden="true" viewBox="0 0 24 24">
          <path d="M12 5v14M5 12h14" />
        </svg>
        Ajouter une arme
      </button>
      <button class="inline-act" type="button" onclick={oncombattre}>
        <svg class="i" aria-hidden="true" viewBox="0 0 24 24">
          <path
            d="M14.5 17.5 3 6V3h3l11.5 11.5M13 19l6-6M16 16l4 4M19 21l2-2"
          />
        </svg>
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
  .meta.depasse {
    color: var(--rouge);
  }
  /* Craie verte : le bonus changé par un effet, et sa ligne d'explication. */
  .vert {
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
  .n {
    flex: 1;
    padding: 0;
    text-align: left;
    font: inherit;
    color: inherit;
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
  .inline-act svg {
    width: 18px;
    height: 18px;
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
