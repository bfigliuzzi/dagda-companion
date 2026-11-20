<script lang="ts">
  /**
   * La grille d'un plan : pas de lignes, de petits points couleur `trait` aux
   * croisements, comme un papier pointé. Les cases ont 44 px de côté ; un « N »
   * discret au bord haut rappelle que le nord est toujours en haut.
   *
   * Les points sont posés sur les coins des cases : une grille de 8 × 8 cases
   * a 9 × 9 points. Les points du bord dépassent d'un rien dans la marge de
   * l'écran, pour que la grille de 8 cases tienne dans 354 px (390 px de
   * large moins les marges). Murs, numéros et repère s'ajouteront par-dessus,
   * dans le même repère (tickets suivants).
   */
  import { COTE_D_UNE_CASE, type Grille } from "./plans";

  interface Props {
    grille: Grille;
  }

  let { grille }: Props = $props();

  const largeur = $derived(grille.colonnes * COTE_D_UNE_CASE);
  const hauteur = $derived(grille.lignes * COTE_D_UNE_CASE);
  /** Rangs des points : une rangée et une colonne de plus que de cases. */
  const lignesDePoints = $derived(
    Array.from({ length: grille.lignes + 1 }, (_, rang) => rang),
  );
  const colonnesDePoints = $derived(
    Array.from({ length: grille.colonnes + 1 }, (_, rang) => rang),
  );
</script>

<div class="grille">
  <span class="nord" aria-hidden="true">N</span>
  <svg
    role="img"
    aria-label="Grille du plan : {grille.colonnes} colonnes sur {grille.lignes} lignes, nord en haut"
    width={largeur}
    height={hauteur}
    viewBox="0 0 {largeur} {hauteur}"
  >
    {#each lignesDePoints as ligne (ligne)}
      {#each colonnesDePoints as colonne (colonne)}
        <circle
          cx={colonne * COTE_D_UNE_CASE}
          cy={ligne * COTE_D_UNE_CASE}
          r="2.5"
        />
      {/each}
    {/each}
  </svg>
</div>

<style>
  .grille {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: var(--esp-md);
  }
  /* Le « N » : étiquette de 13 px en craie pâle, au-dessus du bord haut. */
  .nord {
    margin-bottom: var(--esp-xs);
    font-size: 13px;
    letter-spacing: 0.02em;
    color: var(--craie-3);
  }
  svg {
    display: block;
    flex: none;
    overflow: visible;
  }
  circle {
    fill: var(--trait);
  }
</style>
