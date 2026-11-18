<script lang="ts">
  /**
   * Champ numérique à pas à pas : « − », la valeur et « + » dans un creux.
   * Le lecteur saisit au clavier ou compte par pas de 1. Un champ vide
   * (`null`) passe à `min` au premier appui.
   */

  interface Props {
    nom: string;
    /** Plus petite valeur que le pas à pas accepte. */
    min: number;
    valeur: number | null;
    /** Collé devant la valeur : « § » (avec son espace) du chapitre, « + » d'un bonus. */
    prefixe?: string;
  }

  let { nom, min, valeur = $bindable(), prefixe }: Props = $props();
  const id = $props.id();

  /**
   * Avec un préfixe, le champ prend la largeur de son nombre : le préfixe
   * reste collé à la valeur, comme « § 112 » ou « +2 » dans la maquette.
   */
  const largeur = $derived(Math.max(1, String(valeur ?? "").length));

  function diminuer() {
    valeur = valeur === null ? min : Math.max(min, Math.trunc(valeur) - 1);
  }

  function augmenter() {
    valeur = valeur === null ? min : Math.trunc(valeur) + 1;
  }
</script>

<div class="champ">
  <span class="etiquette" id="{id}-nom">{nom}</span>
  <div class="creux">
    <button type="button" aria-label="Diminuer {nom}" onclick={diminuer}>
      <svg class="i" aria-hidden="true" viewBox="0 0 24 24">
        <path d="M5 12h14" />
      </svg>
    </button>
    <span class="valeur">
      {#if prefixe}<span class="prefixe" aria-hidden="true">
          {prefixe}
        </span>{/if}
      <input
        aria-labelledby="{id}-nom"
        type="number"
        inputmode="numeric"
        {min}
        placeholder="–"
        style:width={prefixe ? `${largeur}ch` : undefined}
        bind:value={valeur}
      />
    </span>
    <button type="button" aria-label="Augmenter {nom}" onclick={augmenter}>
      <svg class="i" aria-hidden="true" viewBox="0 0 24 24">
        <path d="M12 5v14M5 12h14" />
      </svg>
    </button>
  </div>
</div>

<style>
  .champ {
    margin-top: 14px;
  }

  .etiquette {
    display: block;
    margin-bottom: 6px;
    font-size: 13px;
    color: var(--craie-2);
  }

  .creux {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--esp-hair);
    background: var(--ardoise-2);
    border-radius: var(--r);
  }

  .creux:focus-within {
    outline: 2px solid var(--jaune);
  }

  button {
    display: grid;
    place-items: center;
    width: var(--cible);
    height: var(--cible);
    color: var(--craie-2);
  }

  button svg {
    width: 18px;
    height: 18px;
  }

  .valeur {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    font-weight: 700;
  }

  .prefixe {
    pointer-events: none;
  }

  input {
    width: 4ch;
    padding: 0;
    background: none;
    border: 0;
    outline: none;
    font: inherit;
    color: inherit;
    text-align: center;
    appearance: textfield;
  }

  input::placeholder {
    color: var(--craie-3);
  }

  input::-webkit-inner-spin-button,
  input::-webkit-outer-spin-button {
    appearance: none;
  }
</style>
