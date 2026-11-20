<script lang="ts">
  /**
   * La grille d'un plan dans son cadre : la vue, et ce que font les doigts.
   * Le dessin est dans DessinDuPlan, les boutons du mode Cases dans
   * BoutonsDesCases, le sens de chaque doigt dans doigtsSurLePlan.ts.
   *
   * LA VUE. La grille est posée dans un cadre fixe (`.vue`) qui la coupe à ses
   * bords, et décalée par un `transform` : c'est nous qui la faisons défiler,
   * pas le navigateur (vueDuPlan.ts). Le dessin est dans les coordonnées du
   * plan et le décalage vaut « coin de la grille − point du plan au coin du
   * cadre ». Quand la grille grandit vers le haut ou la gauche, son coin
   * recule de 44 px et le `viewBox` du dessin aussi, dans la même mise à jour
   * du DOM : chaque mur reste au même pixel de l'écran, il n'y a rien à
   * compenser après coup. La vue est accrochée au coin haut-gauche du cadre,
   * pas à son milieu : quand le cadre change de hauteur (l'indice du plan vide
   * s'en va), rien ne bouge non plus. À l'ouverture, la vue montre le repère
   * (`vueDOuvertureSur`).
   *
   * LES DOIGTS. `touch-action: none` sur tout le cadre : le navigateur ne fait
   * ni défiler ni zoomer sous les doigts. Quand `actif` est vrai (mode Murs),
   * un doigt (ou la souris) trace : la logique du trait est dans murs.ts, ce
   * composant ne fait que convertir les pixels en cases et montrer le trait
   * pendant qu'il se fait. Le trait fini est remis à `ontrait`, qui l'applique
   * au plan (et fait grandir la grille). Deux doigts, ou la molette d'une
   * souris, font défiler. En mode Cases (`actif` faux), un appui sur une case
   * l'ouvre (`oncase`).
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
  import type { Case } from "./cases";
  import { COTE_D_UNE_CASE, type Grille } from "./plans";
  import {
    deplacerLaVue,
    vueDOuverture,
    vueDOuvertureSur,
    vueQuiDegageLaCase,
    type Vue,
  } from "./vueDuPlan";
  import { doigtsSurLePlan, type Intention } from "./doigtsSurLePlan";
  import DessinDuPlan from "./DessinDuPlan.svelte";
  import BoutonsDesCases from "./BoutonsDesCases.svelte";

  interface Props {
    grille: Grille;
    murs: Bord[];
    cases?: Case[];
    /** Le repère « vous êtes ici » (case en coordonnées du plan), pâle ou non. */
    repere?: { colonne: number; ligne: number; pale: boolean } | null;
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
    repere = null,
    actif = true,
    ontrait,
    oncase,
  }: Props = $props();

  /** Le coin en haut à gauche de la grille, en px du plan. */
  const x0 = $derived(grille.colonne * COTE_D_UNE_CASE);
  const y0 = $derived(grille.ligne * COTE_D_UNE_CASE);

  let cadre: HTMLDivElement;
  /** La grille décalée dans le cadre : son coin est celui du dessin. */
  let plateau: HTMLDivElement;
  /** Le point du plan au coin en haut à gauche du cadre, en px du plan. */
  let vue = $state<Vue>({ x: 0, y: 0 });

  /**
   * À l'ouverture, une fois le cadre mesuré : sur chaque axe, la grille
   * centrée en largeur et en haut du cadre si elle y tient ; sinon, avec un
   * repère, la vue centrée sur lui sans passer une case au-delà du bord
   * (vueDuPlan.ts).
   */
  $effect(() => {
    untrack(() => {
      vue = repere
        ? vueDOuvertureSur(
            { x: repere.colonne + 0.5, y: repere.ligne + 0.5 },
            grille,
            tailleDuCadre(),
          )
        : vueDOuverture(grille, tailleDuCadre());
    });
  });

  /**
   * Le panneau d'une case s'est ouvert, son haut à `hautDuPanneau` px de
   * l'écran : si la case de la ligne `ligne` passe dessous, la vue la remonte
   * au milieu de ce qui reste visible du cadre (vueDuPlan.ts).
   */
  export function degagerLaCase(ligne: number, hautDuPanneau: number) {
    const { top, height } = cadre.getBoundingClientRect();
    vue = vueQuiDegageLaCase(vue, ligne, {
      haut: Math.max(0, -top),
      bas: Math.min(height, hautDuPanneau - top),
    });
  }

  const tailleDuCadre = () => ({
    largeur: cadre.clientWidth,
    hauteur: cadre.clientHeight,
  });

  function faireDefiler(glisse: { x: number; y: number }) {
    vue = deplacerLaVue(vue, glisse, grille, tailleDuCadre());
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

  const doigts = doigtsSurLePlan();
  let trait = $state.raw<Trait | null>(null);

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
    const coin = plateau.getBoundingClientRect();
    return {
      x: (evenement.clientX - coin.left) / COTE_D_UNE_CASE + grille.colonne,
      y: (evenement.clientY - coin.top) / COTE_D_UNE_CASE + grille.ligne,
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

  /** Ce que les doigts veulent, appliqué au trait et à la vue. */
  function suivre(intention: Intention, evenement: PointerEvent) {
    switch (intention.quoi) {
      case "commencer le trait":
        trait = commencerUnTrait(murs, grille, position(evenement));
        break;
      case "prolonger le trait":
        if (trait) trait = prolongerLeTrait(trait, position(evenement));
        break;
      case "finir le trait":
        if (trait) {
          const changement = finirLeTrait(
            prolongerLeTrait(trait, position(evenement)),
          );
          trait = null;
          if (changement) ontrait?.(changement);
        }
        break;
      case "abandonner le trait":
        trait = null;
        break;
      case "defiler":
        faireDefiler(intention.glisse);
        break;
    }
  }

  function poser(evenement: PointerEvent) {
    const { intention, capturer: aCapturer } = doigts.poser(evenement, actif);
    for (const id of aCapturer) capturer(evenement, id);
    suivre(intention, evenement);
  }

  function ouvrirSiAppui(colonne: number, ligne: number, detail: number) {
    if (doigts.cliquer(detail).quoi === "ouvrir la case") {
      oncase?.(colonne, ligne);
    }
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
  onpointermove={(evenement) => suivre(doigts.glisser(evenement), evenement)}
  onpointerup={(evenement) => suivre(doigts.lever(evenement), evenement)}
  onpointercancel={(evenement) =>
    suivre(doigts.abandonner(evenement), evenement)}
>
  <div
    class="plateau"
    bind:this={plateau}
    style:transform="translate3d({x0 - vue.x}px, {y0 - vue.y}px, 0)"
  >
    <DessinDuPlan {grille} murs={affiches} {cases} {repere} />
    {#if !actif}
      <BoutonsDesCases {grille} {cases} {repere} onclic={ouvrirSiAppui} />
    {/if}
  </div>
</div>

<style>
  /* Le cadre : il prend la place libre de l'écran et coupe la grille à ses
     bords, sans barre de défilement. Un écart de 12 px sous le titre : les
     murs coupés au défilement ne collent pas à l'en-tête. */
  .vue {
    position: relative;
    margin-top: var(--esp-md);
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
</style>
