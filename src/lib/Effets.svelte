<script lang="ts">
  /**
   * Section « Effets » de la feuille : les effets temporaires (nom en vert,
   * avec la valeur qu'ils changent) et les simples rappels (en craie grise),
   * chacun avec sa durée et sa croix de retrait. Le panneau « Nouvel effet »
   * en ajoute. Retirer un effet rend les valeurs à leur base (valeursEffectives.ts,
   * `retirerUnEffet`) : la feuille montre alors la trace de craie sur chaque
   * valeur qui change.
   */
  import type { Arme, Personnage } from "./aventure";
  import {
    decrireUnEffet,
    estUnRappel,
    retirerUnEffet,
    type Effet,
  } from "./valeursEffectives";
  import NouvelEffet from "./NouvelEffet.svelte";

  interface Props {
    effets: Effet[];
    /** Le retrait d'un effet peut corriger une base (voir `retirerUnEffet`). */
    personnage: Personnage;
    /** Pour annoncer le bonus de dommage dans le panneau. */
    armes: readonly Arme[];
  }

  let {
    effets = $bindable(),
    personnage = $bindable(),
    armes,
  }: Props = $props();
  const id = $props.id();

  let ajout = $state(false);

  function retirer(index: number) {
    const apres = retirerUnEffet({ personnage, effets }, index);
    personnage = apres.personnage;
    effets = apres.effets;
  }
</script>

<section aria-labelledby="{id}-titre">
  <div class="sh">
    <h2 id="{id}-titre">Effets</h2>
    {#if effets.length > 0}
      <span class="meta">
        {effets.length}
        {effets.length > 1 ? "actifs" : "actif"}
      </span>
    {/if}
  </div>

  {#if effets.length > 0}
    <ul>
      {#each effets as effet, index (index)}
        {@const rappel = estUnRappel(effet)}
        <li class="row">
          {#if rappel}
            <span class="n" data-etat="rappel">
              <span class="prefixe">Rappel ·</span>
              {effet.nom}
            </span>
          {:else}
            <span class="n" data-etat="actif">{decrireUnEffet(effet)}</span>
          {/if}
          {#if effet.duree}<span class="d">{effet.duree}</span>{/if}
          <button
            class="x"
            type="button"
            aria-label="{rappel
              ? 'Retirer le rappel'
              : "Retirer l'effet"} {effet.nom}"
            onclick={() => retirer(index)}
          >
            <svg class="i" aria-hidden="true" viewBox="0 0 24 24">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </li>
      {/each}
    </ul>
  {/if}

  <button class="add" type="button" onclick={() => (ajout = true)}>
    <svg class="i" aria-hidden="true" viewBox="0 0 24 24">
      <path d="M12 5v14M5 12h14" />
    </svg>
    Ajouter un effet
  </button>
</section>

{#if ajout}
  <NouvelEffet
    {personnage}
    {armes}
    {effets}
    onajouter={(effet) => effets.push(effet)}
    onfermer={() => (ajout = false)}
  />
{/if}

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
  }
  /* Craie verte : un effet actif (DESIGN.md, « Three Chalks Rule »). */
  [data-etat="actif"] {
    color: var(--vert);
  }
  [data-etat="rappel"] {
    color: var(--craie-2);
  }
  .prefixe {
    color: var(--craie-3);
  }
  .d {
    font-size: 14px;
    color: var(--craie-2);
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
  button:focus-visible {
    outline: 2px solid var(--jaune);
    outline-offset: 3px;
  }
</style>
