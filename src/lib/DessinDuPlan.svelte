<script lang="ts">
  /**
   * Le dessin d'un plan, dans les coordonnées du plan : le SVG commence au
   * coin de la grille (`viewBox`, en px du plan), c'est GrilleDuPlan qui le
   * décale dans son cadre.
   *
   * La grille n'a pas de lignes : de petits points couleur `trait` aux
   * croisements, comme un papier pointé, sur des cases de 44 px. Une grille de
   * 8 × 8 cases a 9 × 9 points. Ils sont peints par un motif SVG (`pattern`) et
   * non un par un : une grille de 30 × 30 cases n'a qu'un rectangle à dessiner.
   * Un « N » discret au bord haut rappelle que le nord est toujours en haut.
   *
   * Les murs sont des traits de craie de 3 px à bouts arrondis, sur les bords
   * des cases. `murs` comprend le trait en train de se faire. Un mur qui
   * disparaît (effacé, ou retiré par « Annuler ») reste en craie rouge puis
   * s'efface en 1,2 s : c'est la trace de craie (DESIGN.md) ; avec
   * `prefers-reduced-motion`, il disparaît tout de suite.
   *
   * Les cases notées montrent leur numéro (13 px, craie) au milieu de la case,
   * et une note par un petit trait de craie pâle dans le coin en haut à droite.
   *
   * Le repère est un disque plein de craie de 36 px (rayon 18), posé sous le
   * numéro de la case : le numéro passe en noir 13 px 700 par-dessus, comme le
   * segment actif du contrôle « Murs / Cases » (aplat craie, texte noir), et
   * reste lu en entier même à quatre chiffres. Pâle (`pale`, le lecteur n'y
   * est plus, voir reperes.ts) : le même disque en craie pâle `craie-3`, noir
   * sur craie-3 reste à plus de 5:1. Il est annoncé dans le nom de la grille.
   */
  import { untrack } from "svelte";
  import type { Bord } from "./murs";
  import { nomDeLaCase, type Case } from "./cases";
  import { COTE_D_UNE_CASE, type Grille } from "./plans";
  import { DUREE_TRACE_MS } from "./TraceDeCraie.svelte";

  interface Props {
    grille: Grille;
    /** Les murs à l'écran : ceux du plan, plus le trait en train de se faire. */
    murs: Bord[];
    cases: Case[];
    repere: { colonne: number; ligne: number; pale: boolean } | null;
  }

  let { grille, murs, cases, repere }: Props = $props();

  /** Rayon du repère, en px : 36 px de disque dans une case de 44 px. */
  const RAYON_DU_REPERE = 18;

  const uid = $props.id();
  const motif = `points-${uid}`;

  /** Le coin en haut à gauche de la grille, en px du plan. */
  const x0 = $derived(grille.colonne * COTE_D_UNE_CASE);
  const y0 = $derived(grille.ligne * COTE_D_UNE_CASE);
  const largeur = $derived(grille.colonnes * COTE_D_UNE_CASE);
  const hauteur = $derived(grille.lignes * COTE_D_UNE_CASE);

  const cle = (bord: Bord) => `${bord.sens} ${bord.colonne} ${bord.ligne}`;

  /** Les murs qui viennent de disparaître, le temps de la trace de craie. */
  let traces = $state<{ bord: Bord; n: number }[]>([]);
  let precedents = untrack(() => murs);
  let compteur = 0;
  const minuteurs: ReturnType<typeof setTimeout>[] = [];

  $effect(() => {
    const courants = murs;
    // Par clé, en un passage : un plan de 30 × 30 peut compter près de
    // 2 000 murs, les comparer deux à deux gèlerait le trait.
    const presents = new Set(courants.map(cle));
    const partis = precedents.filter((mur) => !presents.has(cle(mur)));
    precedents = courants;
    for (const bord of partis) {
      const n = ++compteur;
      untrack(() => traces.push({ bord, n }));
      minuteurs.push(
        setTimeout(() => {
          traces = traces.filter((trace) => trace.n !== n);
        }, DUREE_TRACE_MS),
      );
    }
  });

  $effect(() => () => minuteurs.forEach(clearTimeout));

  /** Une trace ne se montre pas si le mur est revenu (« Annuler »). */
  const clesAffichees = $derived(new Set(murs.map(cle)));
  const tracesVisibles = $derived(
    traces.filter((trace) => !clesAffichees.has(cle(trace.bord))),
  );

  const surLeRepere = (colonne: number, ligne: number) =>
    repere?.colonne === colonne && repere.ligne === ligne;

  /** Le nom de la grille : sa taille, le nord, et où est le repère. */
  const nomDeLaGrille = $derived(
    `Grille du plan : ${grille.colonnes} colonnes sur ${grille.lignes} lignes, nord en haut` +
      (repere
        ? `, ${repere.pale ? "repère pâle" : "vous êtes ici"} en case ${nomDeLaCase(grille, repere.colonne, repere.ligne)}`
        : ""),
  );

  /** Les deux bouts d'un bord, en px du plan. */
  function bouts(bord: Bord) {
    const x1 = bord.colonne * COTE_D_UNE_CASE;
    const y1 = bord.ligne * COTE_D_UNE_CASE;
    const horizontal = bord.sens === "horizontal";
    return {
      x1,
      y1,
      x2: horizontal ? x1 + COTE_D_UNE_CASE : x1,
      y2: horizontal ? y1 : y1 + COTE_D_UNE_CASE,
    };
  }
</script>

<span class="nord" aria-hidden="true">N</span>
<svg
  role="img"
  aria-label={nomDeLaGrille}
  width={largeur}
  height={hauteur}
  viewBox="{x0} {y0} {largeur} {hauteur}"
>
  <defs>
    <!-- Un point au milieu d'un carreau de 44 px décalé de 22 px : les
         points tombent sur les multiples de 44, les coins des cases. -->
    <pattern
      id={motif}
      patternUnits="userSpaceOnUse"
      x="-22"
      y="-22"
      width={COTE_D_UNE_CASE}
      height={COTE_D_UNE_CASE}
    >
      <circle cx="22" cy="22" r="2.5" />
    </pattern>
  </defs>
  <rect
    x={x0 - 22}
    y={y0 - 22}
    width={largeur + 44}
    height={hauteur + 44}
    fill="url(#{motif})"
  />
  {#each murs as mur (cle(mur))}
    <line {...bouts(mur)} data-etat="mur" />
  {/each}
  {#each tracesVisibles as trace (trace.n)}
    <line {...bouts(trace.bord)} data-etat="efface" />
  {/each}
  {#if repere}
    <circle
      class="repere"
      cx={(repere.colonne + 0.5) * COTE_D_UNE_CASE}
      cy={(repere.ligne + 0.5) * COTE_D_UNE_CASE}
      r={RAYON_DU_REPERE}
      data-repere
      data-etat={repere.pale ? "pale" : "repere"}
    />
  {/if}
  {#each cases as c (`${c.colonne},${c.ligne}`)}
    {#if c.chapitre !== null}
      <text
        data-sur-repere={surLeRepere(c.colonne, c.ligne) || undefined}
        x={(c.colonne + 0.5) * COTE_D_UNE_CASE}
        y={(c.ligne + 0.5) * COTE_D_UNE_CASE}
      >
        {c.chapitre}
      </text>
    {/if}
    {#if c.note !== ""}
      <!-- Le trait en coin : une diagonale de 8 px en haut à droite de la
           case, à 3 px des bords. Elle passe à 21 px du milieu de la case :
           elle longe le disque du repère (rayon 18) sans le toucher. -->
      <line
        x1={(c.colonne + 1) * COTE_D_UNE_CASE - 11}
        y1={c.ligne * COTE_D_UNE_CASE + 3}
        x2={(c.colonne + 1) * COTE_D_UNE_CASE - 3}
        y2={c.ligne * COTE_D_UNE_CASE + 11}
        data-etat="note"
      />
    {/if}
  {/each}
</svg>

<style>
  /* Le « N » : étiquette de 13 px en craie pâle, centrée au-dessus du bord haut. */
  .nord {
    position: absolute;
    bottom: calc(100% + var(--esp-xs));
    left: 50%;
    transform: translateX(-50%);
    font-size: 13px;
    line-height: 1;
    letter-spacing: 0.02em;
    color: var(--craie-3);
  }
  svg {
    display: block;
    overflow: visible;
  }
  circle {
    fill: var(--trait);
  }
  /* Le repère : disque plein de craie ; pâle, en craie pâle (craie-3). */
  circle.repere {
    fill: var(--craie);
  }
  circle.repere[data-etat="pale"] {
    fill: var(--craie-3);
  }
  /* Le numéro de la case du repère : noir par-dessus le disque. */
  text[data-sur-repere] {
    fill: var(--noir);
  }
  /* Un mur : trait de craie de 3 px, bouts arrondis. */
  line {
    stroke: var(--craie);
    stroke-width: 3;
    stroke-linecap: round;
  }
  /* Le numéro d'une case : 13 px graisse 700 en craie, au milieu de la case. */
  text {
    fill: var(--craie);
    font-size: 13px;
    font-weight: 700;
    text-anchor: middle;
    dominant-baseline: central;
    pointer-events: none;
  }
  /* Le trait en coin d'une case qui porte une note : craie grise, 2 px, bouts arrondis. */
  line[data-etat="note"] {
    stroke: var(--craie-2);
    stroke-width: 2;
  }
  /* Le mur effacé : craie rouge, puis fondu de 1,2 s en sortie exponentielle. */
  line[data-etat="efface"] {
    stroke: var(--rouge);
  }
  @media (prefers-reduced-motion: no-preference) {
    line[data-etat="efface"] {
      animation: effacer 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
  }
  /* Animations réduites : le mur effacé disparaît tout de suite. */
  @media (prefers-reduced-motion: reduce) {
    line[data-etat="efface"] {
      display: none;
    }
  }
  @keyframes effacer {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }
</style>
