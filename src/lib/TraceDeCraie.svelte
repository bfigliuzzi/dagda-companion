<script module lang="ts">
  /** Durée pendant laquelle l'ancienne valeur reste barrée, puis s'efface. */
  export const DUREE_TRACE_MS = 1200;
</script>

<script lang="ts">
  /**
   * LA TRACE DE CRAIE : quand une valeur est remplacée, l'ancienne reste
   * barrée en rouge juste avant la nouvelle, puis s'efface en 1,2 s. C'est la
   * seule animation de l'app (DESIGN.md, « Signature : la trace de craie »).
   *
   * Emploi : poser le composant juste AVANT la valeur affichée, dans le sens
   * de la lecture, et lui donner la même valeur.
   *
   *   <TraceDeCraie valeur={pointsDeVie} taille="24px" />
   *   <b>{pointsDeVie}</b>
   *
   * Props :
   * - `valeur` (obligatoire) : la valeur courante, nombre ou texte. Le
   *   composant la surveille : à chaque changement il affiche l'ancienne.
   *   Rien ne s'affiche à l'ouverture ni quand la valeur reste la même.
   * - `taille` : corps du texte barré (« 24px », « 36px »). Hérité par défaut.
   * - `barre` : épaisseur du trait de barre, « 3px » par défaut (« 2px »
   *   dans une ligne de liste).
   *
   * Règles :
   * - Si la valeur change encore pendant que la trace est visible, la trace
   *   garde la valeur d'avant la série (28 → 27 → 26 montre « 28 » barré)
   *   et repart pour 1,2 s.
   * - La trace se joue une fois, jamais en boucle : le composant retire
   *   l'élément après `DUREE_TRACE_MS`.
   * - `prefers-reduced-motion: reduce` : pas de fondu, l'ancienne valeur
   *   reste barrée sans animation pendant 1,2 s, puis disparaît.
   * - Pour les lecteurs d'écran : « avant : 31 ».
   */
  import { untrack } from "svelte";

  interface Props {
    valeur: number | string;
    taille?: string;
    barre?: string;
  }

  let { valeur, taille, barre = "3px" }: Props = $props();

  /** `n` change à chaque trace pour que le fondu reparte de zéro. */
  let trace = $state<{ ancienne: string; n: number } | null>(null);
  let precedente = untrack(() => String(valeur));
  let compteur = 0;
  let minuteur: ReturnType<typeof setTimeout> | undefined;

  $effect(() => {
    const courante = String(valeur);
    if (courante === precedente) return;
    // Pendant une trace déjà visible, on garde la valeur d'avant la série.
    const ancienne = untrack(() => trace?.ancienne ?? precedente);
    precedente = courante;
    clearTimeout(minuteur);
    trace = { ancienne, n: ++compteur };
    minuteur = setTimeout(() => (trace = null), DUREE_TRACE_MS);
  });

  $effect(() => () => clearTimeout(minuteur));
</script>

{#if trace}
  {#key trace.n}
    <s class="trace" style:font-size={taille} style:--barre={barre}>
      <span class="sr">avant :&nbsp;</span>{trace.ancienne}
    </s>
  {/key}
{/if}

<style>
  .trace {
    font-weight: 700;
    color: var(--rouge);
    text-decoration: line-through;
    text-decoration-thickness: var(--barre);
    margin-right: var(--esp-hair);
  }

  /* Sans demande de réduire les animations : fondu de 1,2 s, sortie exponentielle. */
  @media (prefers-reduced-motion: no-preference) {
    .trace {
      animation: effacer 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
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
