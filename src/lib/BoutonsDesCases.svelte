<script lang="ts">
  /**
   * Les cases d'un plan en mode Cases : chaque case de la grille est un vrai
   * bouton de 44 px, invisible, posé sur le dessin et nommé (cases.ts,
   * `nomAccessible`) : « Case 3-5, chapitre 47, note : clé », suivi du repère
   * s'il est sur elle. Ces boutons n'existent qu'en mode Cases : en mode Murs,
   * 900 boutons de plus ne servent à rien et alourdissent le DOM.
   *
   * Un bouton ne décide pas s'il est appuyé : il remet son `click` à
   * `onclic`, et GrilleDuPlan demande aux doigts si c'était un appui ou un
   * glissé (doigtsSurLePlan.ts).
   */
  import { nomAccessible, type Case } from "./cases";
  import { COTE_D_UNE_CASE, type Grille } from "./plans";

  interface Props {
    grille: Grille;
    cases: Case[];
    repere: { colonne: number; ligne: number; pale: boolean } | null;
    /** `detail` vaut 0 pour un clic sans doigt (clavier, lecteur d'écran). */
    onclic: (colonne: number, ligne: number, detail: number) => void;
  }

  let { grille, cases, repere, onclic }: Props = $props();

  /** Les cases qui portent quelque chose, par coordonnées : « colonne,ligne ». */
  const casesParPosition = $derived(
    new Map(cases.map((c) => [`${c.colonne},${c.ligne}`, c])),
  );

  /** Toutes les cases de la grille, ligne par ligne. */
  const toutesLesCases = $derived(
    Array.from({ length: grille.colonnes * grille.lignes }, (_, i) => ({
      colonne: grille.colonne + (i % grille.colonnes),
      ligne: grille.ligne + Math.floor(i / grille.colonnes),
    })),
  );

  /** Le repère tel que l'annonce le nom de sa case, s'il est sur elle. */
  const repereSur = (colonne: number, ligne: number) =>
    repere?.colonne === colonne && repere.ligne === ligne
      ? repere.pale
        ? "pale"
        : "ici"
      : undefined;
</script>

<div
  class="cases"
  role="group"
  aria-label="Cases du plan"
  style:width="{grille.colonnes * COTE_D_UNE_CASE}px"
  style:grid-template-columns="repeat({grille.colonnes}, {COTE_D_UNE_CASE}px)"
>
  {#each toutesLesCases as { colonne, ligne }, i (i)}
    <button
      type="button"
      data-colonne={colonne}
      data-ligne={ligne}
      aria-label={nomAccessible(
        grille,
        colonne,
        ligne,
        casesParPosition.get(`${colonne},${ligne}`),
        repereSur(colonne, ligne),
      )}
      onclick={(evenement) => onclic(colonne, ligne, evenement.detail)}
    ></button>
  {/each}
</div>

<style>
  /* Des boutons de 44 px, invisibles, sur le dessin. */
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
</style>
