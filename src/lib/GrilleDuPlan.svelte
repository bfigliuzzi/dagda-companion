<script lang="ts">
  /**
   * La grille d'un plan : pas de lignes, de petits points couleur `trait` aux
   * croisements, comme un papier pointé. Les cases ont 44 px de côté ; un « N »
   * discret au bord haut rappelle que le nord est toujours en haut.
   *
   * Les points sont posés sur les coins des cases : une grille de 8 × 8 cases
   * a 9 × 9 points. Ils sont peints par un motif SVG (`pattern`) et non un par
   * un : une grille de 30 × 30 cases n'a qu'un rectangle à dessiner.
   *
   * Les murs sont des traits de craie de 3 px à bouts arrondis, sur les bords
   * des cases. Quand `actif` est vrai, un doigt (ou la souris) trace : la
   * logique du trait est dans murs.ts, ce composant ne fait que convertir les
   * pixels en cases et montrer le trait pendant qu'il se fait. Le trait fini
   * est remis à `ontrait`, qui l'applique au plan (et fait grandir la grille).
   *
   * Un mur qui disparaît (effacé, ou retiré par « Annuler ») reste en craie
   * rouge puis s'efface en 1,2 s : c'est la trace de craie (DESIGN.md) ; avec
   * `prefers-reduced-motion`, il disparaît tout de suite.
   *
   * LA VUE. La grille est posée dans un cadre fixe (`.vue`) qui la coupe à ses
   * bords, et décalée par un `transform` : c'est nous qui la faisons défiler,
   * pas le navigateur (vueDuPlan.ts). Le SVG dessine dans les coordonnées du
   * plan (`viewBox` qui commence au coin de la grille, en px du plan) et le
   * décalage vaut « coin de la grille − point du plan au coin du cadre ». Quand la grille
   * grandit vers le haut ou la gauche, son coin recule de 44 px et le
   * `viewBox` aussi, dans la même mise à jour du DOM : chaque mur reste au
   * même pixel de l'écran, il n'y a rien à compenser après coup. La vue est
   * accrochée au coin haut-gauche du cadre, pas à son milieu : quand le cadre
   * change de hauteur (l'indice du plan vide s'en va), rien ne bouge non plus.
   *
   * LES DOIGTS. `touch-action: none` sur tout le cadre : le navigateur ne fait
   * ni défiler ni zoomer sous les doigts. Un doigt seul trace (en mode Murs).
   * Deux doigts font défiler le plan, dans les deux modes ; si le second se
   * pose pendant un trait, le trait est abandonné sans rien changer (il n'est
   * appliqué qu'au lever du doigt), et le geste reste un défilement jusqu'à
   * ce que tous les doigts soient levés. La molette d'une souris fait aussi
   * défiler.
   *
   * LES CASES. Les cases notées montrent leur numéro (13 px, craie) au milieu
   * de la case, et une note par un petit trait de craie pâle dans le coin en
   * haut à droite. En mode Cases (`actif` faux), chaque case de la grille est
   * en plus un vrai bouton nommé (cases.ts, `nomAccessible`), posé sur le
   * dessin : « Case 3-5, chapitre 47, note : clé ». Ces boutons n'existent
   * qu'en mode Cases : en mode Murs, 900 boutons de plus ne servent à rien et
   * alourdissent le DOM. Un appui est un doigt seul qui se pose sur une case
   * et se lève sans avoir bougé de plus de 10 px : le `click` du bouton ouvre
   * alors la case (`oncase`). Dès que le doigt glisse, ou qu'un second doigt se
   * pose, `aGlisse` passe à vrai et le `click` qui suit est ignoré : rien ne
   * s'ouvre et rien ne se trace. C'est le `click`, et non la levée du doigt,
   * qui ouvre : le panneau et son voile n'existent qu'après, sinon le `click`
   * du même appui tomberait sur le voile et le fermerait aussitôt. Un doigt
   * seul n'est pas « capturé » en mode Cases, pour que le `click` arrive au
   * bouton touché. Le clavier et les lecteurs d'écran cliquent sans doigt
   * (`detail` à 0) : ils ouvrent toujours.
   */
  import { untrack } from "svelte";
  import {
    appliquerLeTrait,
    commencerUnTrait,
    finirLeTrait,
    prolongerLeTrait,
    type Bord,
    type Changement,
    type Position,
    type Trait,
  } from "./murs";
  import { nomAccessible, type Case } from "./cases";
  import { COTE_D_UNE_CASE, type Grille } from "./plans";
  import { DUREE_TRACE_MS } from "./TraceDeCraie.svelte";
  import { deplacerLaVue, vueDOuverture, type Vue } from "./vueDuPlan";

  interface Props {
    grille: Grille;
    murs: Bord[];
    cases?: Case[];
    /** Faux en mode Cases : la grille ne trace pas, ses cases sont des boutons. */
    actif?: boolean;
    ontrait?: (changement: Changement) => void;
    /** Le lecteur a touché une case (coordonnées du plan). */
    oncase?: (colonne: number, ligne: number) => void;
  }

  let {
    grille,
    murs,
    cases = [],
    actif = true,
    ontrait,
    oncase,
  }: Props = $props();

  const uid = $props.id();
  const motif = `points-${uid}`;

  /** Le coin en haut à gauche de la grille, en px du plan. */
  const x0 = $derived(grille.colonne * COTE_D_UNE_CASE);
  const y0 = $derived(grille.ligne * COTE_D_UNE_CASE);
  const largeur = $derived(grille.colonnes * COTE_D_UNE_CASE);
  const hauteur = $derived(grille.lignes * COTE_D_UNE_CASE);

  let cadre: HTMLDivElement;
  let svg: SVGSVGElement;
  /** Le point du plan au coin en haut à gauche du cadre, en px du plan. */
  let vue = $state<Vue>({ x: 0, y: 0 });

  /** À l'ouverture, une fois le cadre mesuré : la grille en haut, si elle y tient. */
  $effect(() => {
    untrack(() => {
      vue = vueDOuverture(grille, tailleDuCadre());
    });
  });

  const tailleDuCadre = () => ({
    largeur: cadre.clientWidth,
    hauteur: cadre.clientHeight,
  });

  let trait = $state.raw<Trait | null>(null);
  /** Les doigts posés, et leur dernière position à l'écran. */
  // Rien à l'écran n'en dépend : une Map ordinaire, sans réactivité.
  // eslint-disable-next-line svelte/prefer-svelte-reactivity
  const doigts = new Map<number, { x: number; y: number }>();
  /** Le doigt qui trace, s'il y en a un. */
  let doigtDuTrait: number | null = null;
  /** Au-delà de ce déplacement, en px, un doigt n'appuie plus : il glisse. */
  const SEUIL_D_UN_APPUI = 10;
  /** Où le doigt s'est posé en mode Cases, pour savoir s'il appuie ou glisse. */
  let departDuDoigt = { x: 0, y: 0 };
  /** Le doigt a glissé (ou un second s'est posé) : le `click` qui suit n'ouvre rien. */
  let aGlisse = false;
  /** Deux doigts se sont posés : jusqu'au dernier levé, le geste fait défiler. */
  let defilement = false;

  /**
   * Le trait en cours, réduit à ce qui change l'écran : `bords` et `mode`
   * gardent la même valeur tant que le doigt ne passe pas un nouveau bord,
   * donc les murs affichés ne sont pas recalculés à chaque mouvement.
   */
  const bordsDuTrait = $derived(trait?.bords);
  const modeDuTrait = $derived(trait?.mode);

  /** Les murs à l'écran : ceux du plan, plus le trait en train de se faire. */
  const affiches = $derived(
    modeDuTrait && bordsDuTrait
      ? appliquerLeTrait(murs, { mode: modeDuTrait, bords: [...bordsDuTrait] })
      : murs,
  );

  /** La position du pointeur, en cases, dans les coordonnées du plan. */
  function position(evenement: PointerEvent): Position {
    const cadre = svg.getBoundingClientRect();
    return {
      x: (evenement.clientX - cadre.left) / COTE_D_UNE_CASE + grille.colonne,
      y: (evenement.clientY - cadre.top) / COTE_D_UNE_CASE + grille.ligne,
    };
  }

  /** La capture peut être refusée (pointeur déjà relâché, jsdom) : le geste se fait sans elle. */
  function capturer(evenement: PointerEvent, id: number) {
    try {
      (evenement.currentTarget as Element).setPointerCapture?.(id);
    } catch {
      // Sans capture, les mouvements hors du cadre sont simplement perdus.
    }
  }

  function poser(evenement: PointerEvent) {
    if (evenement.pointerType === "mouse" && evenement.button !== 0) return;
    const id = evenement.pointerId;
    doigts.set(id, { x: evenement.clientX, y: evenement.clientY });
    // Le geste continue même si le doigt sort du cadre. En mode Cases, un
    // doigt seul n'est pas capturé : la capture ferait recevoir le `click` au
    // cadre au lieu du bouton touché. Il l'est dès qu'un second doigt se pose.
    if (actif || doigts.size >= 2) {
      for (const doigt of doigts.keys()) capturer(evenement, doigt);
    }
    if (doigts.size >= 2) {
      // Un second doigt : le trait en cours est abandonné, on fait défiler.
      defilement = true;
      doigtDuTrait = null;
      trait = null;
      aGlisse = true;
    } else if (actif && !defilement) {
      doigtDuTrait = id;
      trait = commencerUnTrait(murs, grille, position(evenement));
    } else if (!actif && !defilement) {
      departDuDoigt = { x: evenement.clientX, y: evenement.clientY };
      aGlisse = false;
    }
  }

  /** Le milieu des deux premiers doigts posés. */
  function milieu() {
    const [a, b] = doigts.values();
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  }

  function glisser(evenement: PointerEvent) {
    const id = evenement.pointerId;
    if (!doigts.has(id)) return;
    if (
      !aGlisse &&
      Math.hypot(
        evenement.clientX - departDuDoigt.x,
        evenement.clientY - departDuDoigt.y,
      ) > SEUIL_D_UN_APPUI
    ) {
      aGlisse = true;
    }
    if (id === doigtDuTrait && trait) {
      doigts.set(id, { x: evenement.clientX, y: evenement.clientY });
      trait = prolongerLeTrait(trait, position(evenement));
      return;
    }
    if (!defilement || doigts.size < 2) {
      doigts.set(id, { x: evenement.clientX, y: evenement.clientY });
      return;
    }
    const avant = milieu();
    doigts.set(id, { x: evenement.clientX, y: evenement.clientY });
    const apres = milieu();
    faireDefiler({ x: apres.x - avant.x, y: apres.y - avant.y });
  }

  function faireDefiler(glisse: { x: number; y: number }) {
    vue = deplacerLaVue(vue, glisse, grille, tailleDuCadre());
  }

  function lever(evenement: PointerEvent) {
    const id = evenement.pointerId;
    if (id === doigtDuTrait && trait) {
      const changement = finirLeTrait(
        prolongerLeTrait(trait, position(evenement)),
      );
      trait = null;
      doigtDuTrait = null;
      if (changement) ontrait?.(changement);
    }
    oublier(id);
  }

  /** Le navigateur reprend la main (appel, geste système) : le trait est abandonné. */
  function abandonner(evenement: PointerEvent) {
    if (evenement.pointerId === doigtDuTrait) {
      trait = null;
      doigtDuTrait = null;
    }
    aGlisse = true;
    oublier(evenement.pointerId);
  }

  function oublier(id: number) {
    doigts.delete(id);
    if (doigts.size === 0) defilement = false;
  }

  /** La molette (ou le pavé tactile) fait défiler ; Ctrl + molette reste le zoom. */
  function molette(evenement: WheelEvent) {
    if (evenement.ctrlKey) return;
    evenement.preventDefault();
    const pas = evenement.deltaMode === WheelEvent.DOM_DELTA_LINE ? 16 : 1;
    faireDefiler({ x: -evenement.deltaX * pas, y: -evenement.deltaY * pas });
  }

  $effect(() => {
    // Écouteur non passif : sans lui, la molette ferait défiler la page.
    cadre.addEventListener("wheel", molette, { passive: false });
    return () => cadre.removeEventListener("wheel", molette);
  });

  const cle = (bord: Bord) => `${bord.sens} ${bord.colonne} ${bord.ligne}`;

  /** Les murs qui viennent de disparaître, le temps de la trace de craie. */
  let traces = $state<{ bord: Bord; n: number }[]>([]);
  let precedents = untrack(() => affiches);
  let compteur = 0;
  const minuteurs: ReturnType<typeof setTimeout>[] = [];

  $effect(() => {
    const courants = affiches;
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
  const clesAffichees = $derived(new Set(affiches.map(cle)));
  const tracesVisibles = $derived(
    traces.filter((trace) => !clesAffichees.has(cle(trace.bord))),
  );

  /** Les cases qui portent quelque chose, par coordonnées : « colonne,ligne ». */
  const casesParPosition = $derived(
    new Map(cases.map((c) => [`${c.colonne},${c.ligne}`, c])),
  );

  /** Toutes les cases de la grille, ligne par ligne, pour les boutons du mode Cases. */
  const cellules = $derived(
    Array.from({ length: grille.colonnes * grille.lignes }, (_, i) => ({
      colonne: grille.colonne + (i % grille.colonnes),
      ligne: grille.ligne + Math.floor(i / grille.colonnes),
    })),
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

<!-- Tracer au clavier ou au lecteur d'écran est hors périmètre en v1 (spec des
     plans, « Contraintes ») : la zone de tracé n'a pas de rôle interactif. -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="vue"
  bind:this={cadre}
  data-testid="vue-du-plan"
  data-etat={actif ? "actif" : undefined}
  onpointerdown={poser}
  onpointermove={glisser}
  onpointerup={lever}
  onpointercancel={abandonner}
>
  <div
    class="plateau"
    style:transform="translate3d({x0 - vue.x}px, {y0 - vue.y}px, 0)"
  >
    <span class="nord" aria-hidden="true">N</span>
    <svg
      bind:this={svg}
      role="img"
      aria-label="Grille du plan : {grille.colonnes} colonnes sur {grille.lignes} lignes, nord en haut"
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
      {#each affiches as mur (cle(mur))}
        <line {...bouts(mur)} data-etat="mur" />
      {/each}
      {#each tracesVisibles as trace (trace.n)}
        <line {...bouts(trace.bord)} data-etat="efface" />
      {/each}
      {#each cases as c (`${c.colonne},${c.ligne}`)}
        {#if c.chapitre !== null}
          <text
            x={(c.colonne + 0.5) * COTE_D_UNE_CASE}
            y={(c.ligne + 0.5) * COTE_D_UNE_CASE}
          >
            {c.chapitre}
          </text>
        {/if}
        {#if c.note !== ""}
          <!-- Le trait en coin : en haut à droite de la case, à 5 px des bords. -->
          <line
            x1={(c.colonne + 1) * COTE_D_UNE_CASE - 15}
            y1={c.ligne * COTE_D_UNE_CASE + 5}
            x2={(c.colonne + 1) * COTE_D_UNE_CASE - 5}
            y2={c.ligne * COTE_D_UNE_CASE + 15}
            data-etat="note"
          />
        {/if}
      {/each}
    </svg>
    {#if !actif}
      <div
        class="cases"
        role="group"
        aria-label="Cases du plan"
        style:width="{largeur}px"
        style:grid-template-columns="repeat({grille.colonnes}, {COTE_D_UNE_CASE}px)"
      >
        {#each cellules as cellule, i (i)}
          <button
            type="button"
            data-colonne={cellule.colonne}
            data-ligne={cellule.ligne}
            aria-label={nomAccessible(
              grille,
              cellule.colonne,
              cellule.ligne,
              casesParPosition.get(`${cellule.colonne},${cellule.ligne}`),
            )}
            onclick={(evenement) => {
              // Un clic de doigt ou de souris compte s'il n'a pas glissé ; sans
              // doigt (clavier, lecteur d'écran), `detail` vaut 0.
              if (evenement.detail === 0 || !aGlisse) {
                oncase?.(cellule.colonne, cellule.ligne);
              }
            }}
          ></button>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  /* Le cadre : il prend la place libre de l'écran et coupe la grille à ses
     bords, sans barre de défilement. */
  .vue {
    position: relative;
    flex: 1 1 0;
    min-height: calc(6 * 44px);
    overflow: hidden;
    /* Les doigts sont à nous : un trace, deux font défiler. */
    touch-action: none;
    user-select: none;
    -webkit-user-select: none;
  }
  /* La grille, décalée pour que le point de la vue soit au coin du cadre. */
  .plateau {
    position: absolute;
    left: 0;
    top: 0;
    will-change: transform;
  }
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
  /* Les cases du mode Cases : des boutons de 44 px, invisibles, sur le dessin. */
  .cases {
    position: absolute;
    left: 0;
    top: 0;
    display: grid;
    grid-auto-rows: 44px;
  }
  .cases button {
    width: 100%;
    height: 100%;
    padding: 0;
    border-radius: 0;
  }
  .cases button:focus-visible {
    outline: 2px solid var(--jaune);
    outline-offset: -3px;
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
