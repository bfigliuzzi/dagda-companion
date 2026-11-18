<script lang="ts">
  /**
   * Une valeur chiffrée qu'on corrige à la main : un appui la transforme en
   * champ, Entrée, Échap ou un appui ailleurs referme le champ. La valeur est
   * reprise à chaque frappe valable, sans attendre : rien ne se perd. Une
   * frappe qui n'est pas valable (vide, décimale, hors de la règle) est
   * ignorée et l'ancienne valeur reste.
   *
   * La taille et la graisse du texte viennent de l'élément qui la contient ;
   * le champ de saisie peut être plus petit (`tailleSaisie`) pour ne pas
   * pousser la mise en page.
   */
  import { untrack } from "svelte";

  interface Props {
    valeur: number;
    /** Nom du bouton, avant « , modifier : 28 » (« Points de vie »). */
    nom: string;
    /** Nom du champ de saisie (« Points de vie actuels »). */
    champ: string;
    /** La règle de la valeur : `true` quand la saisie est acceptée. */
    valide: (valeur: number) => boolean;
    onchange: (valeur: number) => void;
    /** Comment la valeur s'écrit à l'écran (« +1 » pour un bonus) ; le nombre brut par défaut. */
    affiche?: (valeur: number) => string;
    /** Corps du texte dans le champ, quand il doit être plus petit que la valeur affichée. */
    tailleSaisie?: string;
  }

  let {
    valeur,
    nom,
    champ,
    valide,
    onchange,
    affiche = String,
    tailleSaisie,
  }: Props = $props();
  let enSaisie = $state(false);
  let texte = $state("");

  function ouvrir() {
    texte = String(untrack(() => valeur));
    enSaisie = true;
  }

  function saisir(event: Event & { currentTarget: HTMLInputElement }) {
    texte = event.currentTarget.value;
    const nombre = Number(texte);
    if (texte !== "" && valide(nombre)) onchange(nombre);
  }

  function touche(event: KeyboardEvent) {
    if (event.key === "Enter" || event.key === "Escape") enSaisie = false;
  }
</script>

{#if enSaisie}
  <input
    aria-label={champ}
    type="number"
    inputmode="numeric"
    style:font-size={tailleSaisie}
    style:width="calc({Math.max(texte.length, 2)}ch + 24px)"
    value={texte}
    oninput={saisir}
    onkeydown={touche}
    onblur={() => (enSaisie = false)}
    {@attach (saisie) => {
      saisie.focus();
      saisie.select();
    }}
  />
{:else}
  <button
    type="button"
    aria-label="{nom}, modifier : {valeur}"
    onclick={ouvrir}
  >
    {affiche(valeur)}
  </button>
{/if}

<style>
  button {
    position: relative;
    padding: 0;
    font: inherit;
    letter-spacing: inherit;
    color: inherit;
    text-align: inherit;
  }

  /* Zone d'appui d'au moins 44 px, sans agrandir la mise en page. */
  button::after {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    width: max(100%, var(--cible));
    height: max(100%, var(--cible));
    transform: translate(-50%, -50%);
  }

  input {
    height: 1.15em;
    padding: 0 var(--esp-sm);
    line-height: 1;
    background: var(--ardoise-2);
    border: 2px solid var(--jaune);
    border-radius: var(--r);
    outline: none;
    font: inherit;
    letter-spacing: inherit;
    color: var(--craie);
    text-align: center;
    appearance: textfield;
  }

  input::-webkit-inner-spin-button,
  input::-webkit-outer-spin-button {
    appearance: none;
  }
</style>
