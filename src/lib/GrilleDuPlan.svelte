<script lang="ts">
  /**
   * La grille d'un plan : pas de lignes, de petits points couleur `trait` aux
   * croisements, comme un papier pointé. Les cases ont 44 px de côté ; un « N »
   * discret au bord haut rappelle que le nord est toujours en haut.
   *
   * Les points sont posés sur les coins des cases : une grille de 8 × 8 cases
   * a 9 × 9 points. Les points du bord dépassent d'un rien dans la marge de
   * l'écran, pour que la grille de 8 cases tienne dans 354 px (390 px de
   * large moins les marges).
   *
   * Les murs sont des traits de craie de 3 px à bouts arrondis, sur les bords
   * des cases. Quand `actif` est vrai, un doigt (ou la souris) trace : la
   * logique du trait est dans murs.ts, ce composant ne fait que convertir les
   * pixels en cases et montrer le trait pendant qu'il se fait. Le trait fini
   * est remis à `ontrait`, qui l'applique au plan.
   *
   * Un mur qui disparaît (effacé, ou retiré par « Annuler ») reste en craie
   * rouge puis s'efface en 1,2 s : c'est la trace de craie (DESIGN.md) ; avec
   * `prefers-reduced-motion`, il disparaît tout de suite.
   *
   * `touch-action: none` : un doigt sur la grille dessine au lieu de faire
   * défiler la page. Seul le premier doigt posé compte ; un second doigt est
   * ignoré (le défilement à deux doigts viendra avec le ticket 03).
   */
  import { untrack } from "svelte";
  import {
    appliquerLeTrait,
    changementEnCours,
    commencerUnTrait,
    finirLeTrait,
    memeBord,
    prolongerLeTrait,
    type Bord,
    type Changement,
    type Position,
    type Trait,
  } from "./murs";
  import { COTE_D_UNE_CASE, type Grille } from "./plans";
  import { DUREE_TRACE_MS } from "./TraceDeCraie.svelte";

  interface Props {
    grille: Grille;
    murs: Bord[];
    /** Faux en mode Cases : la grille ne trace pas. */
    actif?: boolean;
    ontrait?: (changement: Changement) => void;
  }

  let { grille, murs, actif = true, ontrait }: Props = $props();

  const largeur = $derived(grille.colonnes * COTE_D_UNE_CASE);
  const hauteur = $derived(grille.lignes * COTE_D_UNE_CASE);
  /** Rangs des points : une rangée et une colonne de plus que de cases. */
  const lignesDePoints = $derived(
    Array.from({ length: grille.lignes + 1 }, (_, rang) => rang),
  );
  const colonnesDePoints = $derived(
    Array.from({ length: grille.colonnes + 1 }, (_, rang) => rang),
  );

  let svg: SVGSVGElement;
  let trait = $state.raw<Trait | null>(null);
  let doigt: number | null = null;

  /** Les murs à l'écran : ceux du plan, plus le trait en train de se faire. */
  const affiches = $derived.by(() => {
    const enCours = trait && changementEnCours(trait);
    return enCours ? appliquerLeTrait(murs, enCours) : murs;
  });

  /** La position du pointeur, en cases, dans les coordonnées du plan. */
  function position(evenement: PointerEvent): Position {
    const cadre = svg.getBoundingClientRect();
    return {
      x: (evenement.clientX - cadre.left) / COTE_D_UNE_CASE + grille.colonne,
      y: (evenement.clientY - cadre.top) / COTE_D_UNE_CASE + grille.ligne,
    };
  }

  function poser(evenement: PointerEvent) {
    if (!actif || doigt !== null) return;
    if (evenement.pointerType === "mouse" && evenement.button !== 0) return;
    doigt = evenement.pointerId;
    // Le trait continue même si le doigt sort de la grille. La capture peut
    // être refusée (pointeur déjà relâché, jsdom) : le trait se fait sans elle.
    try {
      (evenement.currentTarget as Element).setPointerCapture?.(doigt);
    } catch {
      // Sans capture, les mouvements hors de la zone sont simplement perdus.
    }
    trait = commencerUnTrait(murs, grille, position(evenement));
  }

  function glisser(evenement: PointerEvent) {
    if (evenement.pointerId !== doigt || !trait) return;
    trait = prolongerLeTrait(trait, position(evenement));
  }

  function lever(evenement: PointerEvent) {
    if (evenement.pointerId !== doigt || !trait) return;
    const changement = finirLeTrait(
      prolongerLeTrait(trait, position(evenement)),
    );
    doigt = null;
    trait = null;
    if (changement) ontrait?.(changement);
  }

  /** Le navigateur reprend la main (appel, geste système) : le trait est abandonné. */
  function abandonner(evenement: PointerEvent) {
    if (evenement.pointerId !== doigt) return;
    doigt = null;
    trait = null;
  }

  /** Les murs qui viennent de disparaître, le temps de la trace de craie. */
  let traces = $state<{ bord: Bord; n: number }[]>([]);
  let precedents = untrack(() => affiches);
  let compteur = 0;
  const minuteurs: ReturnType<typeof setTimeout>[] = [];

  $effect(() => {
    const courants = affiches;
    const partis = precedents.filter(
      (mur) => !courants.some((autre) => memeBord(autre, mur)),
    );
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
  const tracesVisibles = $derived(
    traces.filter(
      (trace) => !affiches.some((mur) => memeBord(mur, trace.bord)),
    ),
  );

  /** Les deux bouts d'un bord, en px dans la grille. */
  function bouts(bord: Bord) {
    const x1 = (bord.colonne - grille.colonne) * COTE_D_UNE_CASE;
    const y1 = (bord.ligne - grille.ligne) * COTE_D_UNE_CASE;
    const horizontal = bord.sens === "horizontal";
    return {
      x1,
      y1,
      x2: horizontal ? x1 + COTE_D_UNE_CASE : x1,
      y2: horizontal ? y1 : y1 + COTE_D_UNE_CASE,
    };
  }

  const cle = (bord: Bord) => `${bord.sens} ${bord.colonne} ${bord.ligne}`;
</script>

<!-- Tracer au clavier ou au lecteur d'écran est hors périmètre en v1 (spec des
     plans, « Contraintes ») : la zone de tracé n'a pas de rôle interactif. -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="grille"
  data-etat={actif ? "actif" : undefined}
  onpointerdown={poser}
  onpointermove={glisser}
  onpointerup={lever}
  onpointercancel={abandonner}
>
  <span class="nord" aria-hidden="true">N</span>
  <svg
    bind:this={svg}
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
    {#each affiches as mur (cle(mur))}
      <line {...bouts(mur)} data-etat="mur" />
    {/each}
    {#each tracesVisibles as trace (trace.n)}
      <line {...bouts(trace.bord)} data-etat="efface" />
    {/each}
  </svg>
</div>

<style>
  .grille {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: var(--esp-md);
    user-select: none;
    -webkit-user-select: none;
  }
  /* Un doigt dessine : le navigateur ne fait ni défiler ni zoomer sous lui. */
  .grille[data-etat="actif"] {
    touch-action: none;
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
  /* Un mur : trait de craie de 3 px, bouts arrondis. */
  line {
    stroke: var(--craie);
    stroke-width: 3;
    stroke-linecap: round;
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
