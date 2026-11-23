<script lang="ts">
  /**
   * Les étapes d'installation (DESIGN.md, « Tutoriel d'installation ») :
   * numérotées, parce que l'ordre compte. Les boutons du navigateur sont
   * dessinés dans la phrase, tels qu'ils apparaissent à l'écran, et lus par
   * leur nom.
   */
  import Icone from "./Icone.svelte";
  import type { Morceau } from "./installation";

  interface Props {
    etapes: readonly (readonly Morceau[])[];
  }

  let { etapes }: Props = $props();
</script>

<ol aria-label="Étapes">
  {#each etapes as etape, rang (rang)}
    <li class="etape">
      <b aria-hidden="true">{rang + 1}</b><span>
        {#each etape as morceau, i (i)}{#if typeof morceau === "string"}{morceau}{:else}<Icone
              nom={morceau.icone}
              nomAccessible={morceau.nom}
            />{/if}{/each}
      </span>
    </li>
  {/each}
</ol>

<style>
  ol {
    list-style: none;
  }

  /* Maquette, « .etape » : grille 28 px / 1fr, 48 px au moins, filet en bas. */
  .etape {
    display: grid;
    grid-template-columns: 28px 1fr;
    gap: var(--esp-xs);
    align-items: baseline;
    min-height: var(--ligne);
    padding: var(--esp-md) 0;
    border-bottom: 1px solid var(--trait);
  }

  /* Le numéro : 18 px 800 en craie pâle. */
  .etape > b {
    font-size: 18px;
    font-weight: 800;
    color: var(--craie-3);
  }

  /* Le bouton du navigateur dessiné : 20 px, en craie, posé sur la ligne. */
  .etape :global(svg) {
    width: 20px;
    height: 20px;
    vertical-align: -4px;
    margin: 0 2px;
    color: var(--craie);
  }
</style>
