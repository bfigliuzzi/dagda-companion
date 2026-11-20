<script lang="ts">
  /**
   * Le nom d'une ligne de la feuille (arme, objet) : un bouton qui montre le
   * nom ; un appui le remplace par un champ, repris à la frappe. Entrée,
   * Échap ou la perte du focus referment le champ. Un nom vidé n'est pas
   * remonté : l'ancien nom reste.
   *
   * Le bouton et le champ prennent la place du nom dans une ligne `flex` :
   * c'est la ligne qui les met en page (ils ont `flex: 1`).
   */

  interface Props {
    nom: string;
    /** Le nom corrigé, déjà épuré des espaces autour, jamais vide. */
    onrenommer: (nom: string) => void;
  }

  let { nom, onrenommer }: Props = $props();

  let enSaisie = $state(false);

  function saisir(event: Event & { currentTarget: HTMLInputElement }) {
    const texte = event.currentTarget.value.trim();
    if (texte !== "") onrenommer(texte);
  }

  function touche(event: KeyboardEvent) {
    if (event.key === "Enter" || event.key === "Escape") enSaisie = false;
  }

  const focaliser = (champ: HTMLInputElement) => {
    champ.focus();
    champ.select();
  };
</script>

{#if enSaisie}
  <input
    class="saisie"
    aria-label="Nom de {nom}"
    type="text"
    value={nom}
    oninput={saisir}
    onkeydown={touche}
    onblur={() => (enSaisie = false)}
    {@attach focaliser}
  />
{:else}
  <button class="n" type="button" onclick={() => (enSaisie = true)}>
    {nom}
  </button>
{/if}

<style>
  .n {
    flex: 1;
    padding: 0;
    text-align: left;
    font: inherit;
    color: inherit;
  }
  .saisie {
    flex: 1;
    min-width: 0;
    height: 52px;
    padding: 0 14px;
    background: var(--ardoise-2);
    border: 2px solid var(--jaune);
    border-radius: var(--r);
    outline: none;
    font: inherit;
    font-size: 17px;
    color: var(--craie);
  }
</style>
