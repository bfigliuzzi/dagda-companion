<script lang="ts">
  /**
   * Ligne de jet de la création : le nom, la valeur tirée en 32 px et le
   * bouton « Lancer ». La valeur reste un champ : on la corrige à la main.
   */

  interface Props {
    nom: string;
    /** Nom du champ pour les lecteurs d'écran (« Points de vie maximum »). */
    etiquette: string;
    /** Ce qu'on lance, après « Lancer » (« les points de vie »). */
    objet: string;
    detail: string;
    /** Plus petite valeur valable pour la saisie à la main. */
    min: number;
    valeur: number | null;
    onlancer: () => void;
    onsaisie?: () => void;
  }

  let {
    nom,
    etiquette,
    objet,
    detail,
    min,
    valeur = $bindable(),
    onlancer,
    onsaisie,
  }: Props = $props();

  const tiree = $derived(valeur !== null && valeur !== undefined);
</script>

<div class="ligne">
  <span class="n">{nom}<small>{detail}</small></span>
  <input
    aria-label={etiquette}
    type="number"
    inputmode="numeric"
    {min}
    placeholder="–"
    bind:value={valeur}
    oninput={onsaisie}
  />
  <button
    class="lancer"
    aria-label="{tiree ? 'Relancer' : 'Lancer'} {objet}"
    onclick={onlancer}
  >
    {#if tiree}
      <svg class="i" aria-hidden="true" viewBox="0 0 24 24">
        <path d="M20 12a8 8 0 1 1-2.4-5.7M20 4v5h-5" />
      </svg>
    {:else}
      <svg class="i" aria-hidden="true" viewBox="0 0 24 24">
        <rect x="3" y="3" width="18" height="18" rx="4" />
        <circle cx="8.5" cy="8.5" r="1.3" fill="currentColor" />
        <circle cx="15.5" cy="15.5" r="1.3" fill="currentColor" />
        <circle cx="12" cy="12" r="1.3" fill="currentColor" />
      </svg>
      Lancer
    {/if}
  </button>
</div>

<style>
  .ligne {
    display: flex;
    align-items: center;
    gap: var(--esp-md);
    min-height: 64px;
    padding: 10px 0;
    border-bottom: 1px solid var(--trait);
  }

  .n {
    flex: 1;
  }

  small {
    display: block;
    font-size: 13px;
    color: var(--craie-2);
  }

  input {
    width: 3ch;
    min-height: var(--cible);
    padding: 0 var(--esp-hair);
    background: none;
    border: 2px solid transparent;
    border-radius: var(--r);
    outline: none;
    font-size: 32px;
    font-weight: 800;
    line-height: 1;
    text-align: right;
    appearance: textfield;
    box-sizing: content-box;
  }

  input:focus {
    background: var(--ardoise-2);
    border-color: var(--jaune);
  }

  input::placeholder {
    color: var(--craie-3);
  }

  input::-webkit-inner-spin-button,
  input::-webkit-outer-spin-button {
    appearance: none;
  }

  .lancer {
    display: flex;
    align-items: center;
    gap: var(--esp-xs);
    min-height: var(--cible);
    min-width: var(--cible);
    justify-content: center;
    padding: 0 14px;
    border: 2px solid var(--jaune);
    border-radius: var(--rayon-pill);
    color: var(--jaune);
    font-weight: 700;
  }

  .lancer svg {
    width: 18px;
    height: 18px;
  }
</style>
