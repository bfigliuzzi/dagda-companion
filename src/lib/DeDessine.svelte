<script lang="ts">
  /**
   * Un d6 dessiné en SVG : carré de 84 px, trait de craie de 3 px, coins de
   * 16 px, points de 14 px (DESIGN.md, « Dice dock »). `valeur` de 1 à 6 ;
   * `null` dessine une face vide, avant le lancer. Le dessin est décoratif :
   * le parent porte le nom lu par les lecteurs d'écran.
   */

  interface Props {
    valeur: number | null;
  }

  let { valeur }: Props = $props();

  // Centres des points sur une face de 84 px : 24, 42 et 60.
  const G = 24;
  const M = 42;
  const D = 60;
  const FACES: Record<number, [number, number][]> = {
    1: [[M, M]],
    2: [
      [G, G],
      [D, D],
    ],
    3: [
      [G, G],
      [M, M],
      [D, D],
    ],
    4: [
      [G, G],
      [D, G],
      [G, D],
      [D, D],
    ],
    5: [
      [G, G],
      [D, G],
      [M, M],
      [G, D],
      [D, D],
    ],
    6: [
      [G, G],
      [D, G],
      [G, M],
      [D, M],
      [G, D],
      [D, D],
    ],
  };

  const points = $derived(valeur === null ? [] : (FACES[valeur] ?? []));
</script>

<svg
  class="de"
  width="84"
  height="84"
  viewBox="0 0 84 84"
  aria-hidden="true"
  focusable="false"
>
  <rect
    x="1.5"
    y="1.5"
    width="81"
    height="81"
    rx="14.5"
    fill="none"
    stroke="currentColor"
    stroke-width="3"
  />
  {#each points as [x, y] (`${x}-${y}`)}
    <circle cx={x} cy={y} r="7" fill="currentColor" />
  {/each}
</svg>

<style>
  .de {
    flex: none;
    color: var(--craie);
  }
</style>
