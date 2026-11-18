<script lang="ts">
  /**
   * La section « Aventure », tout en bas de la feuille, loin du pouce
   * (DESIGN.md, « Layout » ; maquette, « Feuille entière »). Elle porte les
   * actions de l'aventure entière. En mode simplifié : « Sauvegarder ici »
   * (avec ce qui reste de sauvegardes ; désactivé quand les 3 sont utilisées,
   * et son libellé le dit) et « Reprendre la sauvegarde · § 87 », qui demande
   * confirmation ; sans sauvegarde posée, il n'y a rien à reprendre et la
   * ligne n'existe pas. Dans tous les modes, en dernière ligne : « Recommencer
   * une aventure », en rouge, qui demande confirmation puis efface l'aventure.
   */
  import type { Mode, Sauvegarde } from "./aventure";
  import ConfirmerLaReprise from "./ConfirmerLaReprise.svelte";
  import ConfirmerLeRecommencement from "./ConfirmerLeRecommencement.svelte";
  import { sauvegardesRestantes } from "./sauvegardes";

  interface Props {
    mode: Mode;
    sauvegardesUtilisees: number;
    sauvegarde: Sauvegarde | null;
    onsauvegarder: () => void;
    onreprendre: () => void;
    /** Le lecteur a confirmé : l'aventure est effacée. */
    onrecommencer: () => void;
  }

  let {
    mode,
    sauvegardesUtilisees,
    sauvegarde,
    onsauvegarder,
    onreprendre,
    onrecommencer,
  }: Props = $props();
  const id = $props.id();

  let confirmation = $state(false);
  let recommencement = $state(false);

  const restantes = $derived(
    sauvegardesRestantes({ mode, sauvegardesUtilisees }),
  );
  /** Lu par les lecteurs d'écran après chaque pose. */
  let annonce = $state("");

  function sauvegarder() {
    if (restantes === 0) return;
    onsauvegarder();
    annonce = `Sauvegarde posée au chapitre en cours. ${restantes - 1} restante${restantes - 1 > 1 ? "s" : ""}.`;
  }
</script>

<section class="game" aria-labelledby="{id}-titre">
  <div class="sh"><h2 id="{id}-titre">Aventure</h2></div>
  <ul>
    {#if mode === "simplifie"}
      <li>
        {#if restantes > 0}
          <button class="row" type="button" onclick={sauvegarder}>
            <span class="n">Sauvegarder ici</span>
            <span class="d">
              {restantes}
              {restantes > 1 ? "restantes" : "restante"}
            </span>
            <svg class="i" aria-hidden="true" viewBox="0 0 24 24">
              <path d="M5 4h11l3 3v13H5zM8 4v5h7V4M8 20v-6h8v6" />
            </svg>
          </button>
        {:else}
          <button class="row eteint" type="button" aria-disabled="true">
            <span class="n">Plus aucune sauvegarde</span>
            <svg class="i" aria-hidden="true" viewBox="0 0 24 24">
              <path d="M5 4h11l3 3v13H5zM8 4v5h7V4M8 20v-6h8v6" />
            </svg>
          </button>
        {/if}
      </li>
      {#if sauvegarde}
        <li>
          <button
            class="row"
            type="button"
            onclick={() => (confirmation = true)}
          >
            <span class="n">
              Reprendre la sauvegarde · § {sauvegarde.chapitre}
            </span>
            <svg class="i" aria-hidden="true" viewBox="0 0 24 24">
              <path d="M20 12a8 8 0 1 1-2.4-5.7M20 4v5h-5" />
            </svg>
          </button>
        </li>
      {/if}
    {/if}
    <li>
      <button class="row" type="button" onclick={() => (recommencement = true)}>
        <span class="n danger">Recommencer une aventure</span>
      </button>
    </li>
  </ul>
  <p class="sr" aria-live="polite">{annonce}</p>
</section>

{#if confirmation && sauvegarde}
  <ConfirmerLaReprise
    chapitre={sauvegarde.chapitre}
    onconfirmer={() => {
      confirmation = false;
      onreprendre();
    }}
    onfermer={() => (confirmation = false)}
  />
{/if}

{#if recommencement}
  <ConfirmerLeRecommencement
    cas="aventure"
    onconfirmer={() => {
      recommencement = false;
      onrecommencer();
    }}
    onfermer={() => (recommencement = false)}
  />
{/if}

<style>
  /* Maquette, « .game » : plus d'air au-dessus que les autres sections, texte 14 px. */
  .game {
    padding: 24px var(--gutter) var(--esp-sm);
    color: var(--craie-2);
    font-size: 14px;
  }
  .sh {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: var(--esp-xs);
  }
  h2 {
    font-size: 18px;
    font-weight: 800;
    line-height: 1.1;
    padding-bottom: var(--esp-hair);
    border-bottom: 2px solid var(--craie);
    letter-spacing: -0.005em;
  }
  ul {
    list-style: none;
  }
  .row {
    display: flex;
    align-items: center;
    gap: var(--esp-md);
    width: 100%;
    min-height: var(--ligne);
    padding: var(--esp-sm) 0;
    border-bottom: 1px solid var(--trait);
    color: var(--craie);
    text-align: left;
  }
  .n {
    flex: 1;
  }
  .d {
    font-size: 14px;
    color: var(--craie-2);
  }
  /* Danger : texte rouge 700, sans icône (maquette, `.danger`). */
  .danger {
    color: var(--rouge);
    font-weight: 700;
  }
  .row svg {
    color: var(--craie-2);
  }
  /* Désactivé : craie pâle, le libellé dit pourquoi (DESIGN.md, « Buttons »). */
  .row.eteint,
  .row.eteint svg {
    color: var(--craie-3);
    cursor: default;
  }
</style>
