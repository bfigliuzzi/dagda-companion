<script lang="ts">
  import { estUnChapitre } from "./stockage";

  interface Props {
    chapitre: number;
    onchapitre: (chapitre: number) => void;
  }

  let { chapitre, onchapitre }: Props = $props();
  let enSaisie = $state(false);

  function saisir(event: Event & { currentTarget: HTMLInputElement }) {
    const texte = event.currentTarget.value;
    const valeur = Number(texte);
    if (texte !== "" && estUnChapitre(valeur)) onchapitre(valeur);
  }

  function touche(event: KeyboardEvent) {
    if (event.key === "Enter" || event.key === "Escape") enSaisie = false;
  }
</script>

<header class="top">
  {#if enSaisie}
    <div class="chap-champ">
      <span aria-hidden="true">§</span>
      <input
        aria-label="Dernier chapitre lu"
        type="number"
        inputmode="numeric"
        min="1"
        value={chapitre}
        oninput={saisir}
        onkeydown={touche}
        onblur={() => (enSaisie = false)}
        {@attach (champ) => champ.select()}
      />
    </div>
  {:else}
    <button class="chap" onclick={() => (enSaisie = true)}>
      <span class="sr">Dernier chapitre lu, modifier :</span>
      § {chapitre}
      <svg class="i" aria-hidden="true" viewBox="0 0 24 24">
        <path d="M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4" />
      </svg>
    </button>
  {/if}
</header>

<style>
  .top {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: var(--esp-md);
    padding: var(--gutter) var(--gutter) var(--esp-hair);
    padding-top: max(var(--gutter), env(safe-area-inset-top));
    font-size: 14px;
    color: var(--craie-2);
  }

  .chap {
    display: flex;
    align-items: center;
    gap: var(--esp-xs);
    min-height: var(--cible);
    min-width: var(--cible);
    padding: 0 var(--esp-md);
    margin-right: calc(-1 * var(--esp-md));
    color: var(--craie);
    font-weight: 700;
    font-size: 18px;
  }

  .chap svg {
    width: 18px;
    height: 18px;
    color: var(--craie-3);
  }

  .chap-champ {
    display: flex;
    align-items: center;
    gap: var(--esp-xs);
    height: var(--cible);
    padding: 0 var(--esp-md);
    background: var(--ardoise-2);
    border: 2px solid var(--jaune);
    border-radius: var(--r);
    color: var(--craie);
    font-weight: 700;
    font-size: 18px;
  }

  .chap-champ input {
    width: 5ch;
    background: none;
    border: 0;
    outline: none;
    font-weight: 700;
    appearance: textfield;
  }

  .chap-champ input::-webkit-inner-spin-button,
  .chap-champ input::-webkit-outer-spin-button {
    appearance: none;
  }
</style>
