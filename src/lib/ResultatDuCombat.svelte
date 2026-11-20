<script lang="ts">
  /**
   * Écran de fin de combat. « Gagné » : ce qui a changé, l'ancienne valeur
   * barrée avant la nouvelle, puis « Retour à la feuille ». « Perdu » (le
   * lecteur à 0 PV) : l'app le signale et renvoie au livre ; elle propose des
   * issues sans en imposer aucune. Le combat ne décide jamais du chapitre
   * suivant : c'est le livre.
   *
   * En mode simplifié, « Reprendre la sauvegarde · § 87 » vient en premier,
   * avec la confirmation de la reprise, quand une sauvegarde est posée ; un
   * indice rappelle qu'on reprend toujours la plus récente. Les autres modes
   * n'ont pas de sauvegarde et n'en parlent pas.
   *
   * En mode mortel, « Recommencer au chapitre 1 » vient après « Le livre me
   * laisse continuer », en rouge : le lecteur accepte (après confirmation) ou
   * ignore, l'app ne décide pas de la mort.
   */
  import { MODES, type Mode, type Sauvegarde } from "./aventure";
  import { bilanDuCombat, type Combat } from "./combat";
  import ConfirmerLaReprise from "./ConfirmerLaReprise.svelte";
  import ConfirmerLeRecommencement from "./ConfirmerLeRecommencement.svelte";
  import Dock from "./Dock.svelte";

  interface Props {
    /** Un combat terminé, gagné ou perdu. */
    combat: Combat;
    onretour: () => void;
    /** « Voir le détail des N tours » : ouvre l'historique sur ce combat. */
    ondetail: () => void;
    mode: Mode;
    /** La sauvegarde la plus récente, `null` si le lecteur n'en a pas posé. */
    sauvegarde: Sauvegarde | null;
    /** Ce qui reste des 3 sauvegardes du livre. */
    sauvegardesRestantes: number;
    /** Le lecteur a confirmé la reprise de la sauvegarde. */
    onreprendre: () => void;
    /** Mode mortel : le lecteur a confirmé qu'il recommence au chapitre 1. */
    onrecommencer: () => void;
  }

  let {
    combat,
    onretour,
    ondetail,
    mode,
    sauvegarde,
    sauvegardesRestantes,
    onreprendre,
    onrecommencer,
  }: Props = $props();

  let confirmation = $state(false);
  let recommencement = $state(false);
  const recommencerALaMort = $derived(MODES[mode].recommencerALaMort);
  const avecSauvegardes = $derived(MODES[mode].sauvegardes);

  const gagne = $derived(combat.issue === "gagne");
  const bilan = $derived(bilanDuCombat(combat));
  const tours = $derived(
    `${bilan.tours} ${bilan.tours > 1 ? "tours" : "tour"}`,
  );
  const points = $derived(
    bilan.chanceDepensee > 1
      ? `${bilan.chanceDepensee} points dépensés`
      : `${bilan.chanceDepensee} point dépensé`,
  );
</script>

<main class="ecran">
  <div class="result">
    <div class="ico-xl" class:perdu={!gagne} aria-hidden="true">
      <svg class="i" viewBox="0 0 24 24">
        {#if gagne}
          <path d="M5 21V4h12l-2.5 4L17 12H5" />
        {:else}
          <path
            d="M12 3a8 8 0 0 0-5 14.2V20h10v-2.8A8 8 0 0 0 12 3zM9 11h.01M15 11h.01M10 20v-2M14 20v-2"
          />
        {/if}
      </svg>
    </div>
    <h1 class="big" class:perdu={!gagne}>{gagne ? "Gagné" : "Perdu"}</h1>
    {#if gagne}
      <p>
        Ennemi du §&nbsp;{combat.chapitre} vaincu en {tours}. Reprenez la
        lecture au chapitre indiqué par le livre.
      </p>
    {:else}
      <p>
        Vos points de vie sont à 0. Suivez ce qu'indique le livre. L'app ne
        décide rien à votre place.
      </p>
    {/if}
  </div>

  {#if gagne}
    <ul class="delta">
      <li class="row">
        <span class="n">Points de vie</span>
        <b>
          {#if bilan.pointsDeViePerdus > 0}<s class="ancienne">
              <span class="sr">avant :&nbsp;</span>{combat.depart.lecteur
                .pointsDeVie}
            </s>{/if}{combat.pointsDeVie.lecteur}
        </b>
      </li>
      <li class="row">
        <span class="n">Chance</span>
        <b>
          {#if bilan.chanceDepensee > 0}<s class="ancienne">
              <span class="sr">avant :&nbsp;</span>{combat.depart.lecteur
                .chance}
            </s>{/if}{combat.chance}
        </b>
      </li>
      {#if bilan.chanceDepensee > 0}
        <li class="row">
          <span class="n gris">Dont {points} automatiquement</span>
        </li>
      {/if}
    </ul>

    <Dock>
      <button class="cta" type="button" onclick={onretour}>
        Retour à la feuille
      </button>
      <button class="link" type="button" onclick={ondetail}>
        {bilan.tours > 1
          ? `Voir le détail des ${bilan.tours} tours`
          : "Voir le détail du tour"}
      </button>
    </Dock>
  {:else}
    <!--
      Les issues possibles à 0 PV, aucune imposée (maquette, « Points de vie
      à 0 »).
    -->
    <div class="issues">
      {#if avecSauvegardes && sauvegarde}
        <button
          class="ghost"
          type="button"
          onclick={() => (confirmation = true)}
        >
          <span>Reprendre la sauvegarde · § {sauvegarde.chapitre}</span>
          <svg class="i" aria-hidden="true" viewBox="0 0 24 24">
            <path d="M20 12a8 8 0 1 1-2.4-5.7M20 4v5h-5" />
          </svg>
        </button>
      {/if}
      <button class="ghost" type="button" onclick={onretour}>
        <span>Le livre me laisse continuer</span>
        <svg class="i" aria-hidden="true" viewBox="0 0 24 24">
          <path d="M5 6l7 6-7 6M13 6l7 6-7 6" />
        </svg>
      </button>
      {#if recommencerALaMort}
        <button
          class="ghost danger"
          type="button"
          onclick={() => (recommencement = true)}
        >
          <span>Recommencer au chapitre 1</span>
          <svg class="i" aria-hidden="true" viewBox="0 0 24 24">
            <path d="M20 12a8 8 0 1 1-2.4-5.7M20 4v5h-5" />
          </svg>
        </button>
      {/if}
    </div>
    {#if avecSauvegardes}
      <div class="hint">
        <svg class="i" aria-hidden="true" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7.5h.01" />
        </svg>
        <span>
          {#if sauvegarde}
            Mode simplifié&nbsp;: on reprend toujours la <b>
              sauvegarde la plus récente
            </b>.
          {:else}
            Mode simplifié&nbsp;: aucune sauvegarde posée, il n'y a rien à
            reprendre.
          {/if}
          {#if sauvegardesRestantes > 0}
            Il vous en reste <b>{sauvegardesRestantes}</b>.
          {:else}
            Il ne vous en reste plus.
          {/if}
        </span>
      </div>
    {/if}
  {/if}
</main>

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
    cas="mort"
    onconfirmer={() => {
      recommencement = false;
      onrecommencer();
    }}
    onfermer={() => (recommencement = false)}
  />
{/if}

<style>
  .ecran {
    max-width: 480px;
    margin: 0 auto;
    padding-bottom: calc(92px + env(safe-area-inset-bottom));
  }

  .result {
    padding: 40px var(--gutter) 0;
    padding-top: max(40px, env(safe-area-inset-top));
  }

  .ico-xl {
    display: grid;
    place-items: center;
    width: 64px;
    height: 64px;
    border: 2px solid var(--craie);
    border-radius: var(--rayon-round);
  }

  .ico-xl svg {
    width: 30px;
    height: 30px;
  }

  .ico-xl.perdu {
    border-color: var(--rouge);
    color: var(--rouge);
  }

  .big {
    margin-top: 14px;
    font-size: 40px;
    font-weight: 800;
    line-height: 1.05;
    letter-spacing: -0.02em;
  }

  .big.perdu {
    color: var(--rouge);
  }

  p {
    margin-top: 10px;
    font-size: 16px;
    color: var(--craie-2);
  }

  .delta {
    margin: 22px var(--gutter) 0;
    list-style: none;
  }

  .row {
    display: flex;
    align-items: center;
    gap: var(--esp-md);
    min-height: var(--ligne);
    padding: var(--esp-sm) 0;
    border-bottom: 1px solid var(--trait);
  }

  .n {
    flex: 1;
  }

  .gris {
    color: var(--craie-2);
  }

  .row b {
    font-size: 20px;
  }

  /* L'ancienne valeur, barrée en rouge juste avant la nouvelle. */
  .ancienne {
    margin-right: var(--esp-sm);
    font-weight: 700;
    color: var(--rouge);
    text-decoration: line-through;
    text-decoration-thickness: 2px;
  }

  .issues {
    display: grid;
    gap: 10px;
    padding: 26px var(--gutter) 0;
  }

  /* Bouton secondaire : contour `trait`, libellé à gauche, icône à droite. */
  .ghost {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    width: 100%;
    min-height: 52px;
    padding: 0 var(--esp-lg);
    border: 2px solid var(--trait);
    border-radius: var(--r);
    font-weight: 700;
    color: var(--craie);
  }

  /* Variante de danger : texte rouge, contour rouge sombre (maquette). */
  .ghost.danger {
    color: var(--rouge);
    border-color: var(--rouge-trait);
  }

  /* Indice non bloquant sous les issues : voir DESIGN.md, « Hints ». */
  .hint {
    display: flex;
    gap: 10px;
    margin: 18px var(--gutter) 0;
    padding: 10px 0 0;
    border-top: 2px solid var(--trait);
    font-size: 14px;
    color: var(--craie-2);
  }

  .hint svg {
    flex: none;
    width: 20px;
    height: 20px;
    margin-top: 1px;
    color: var(--jaune);
  }

  .hint b {
    color: var(--craie);
  }

  /* Lien discret sous le bouton : craie grise soulignée (maquette, `.link`). */
  .link {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-height: var(--cible);
    color: var(--craie-2);
    font-weight: 700;
    text-decoration: underline;
    text-underline-offset: 4px;
    text-decoration-color: var(--craie-3);
  }

  .cta {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-height: 58px;
    background: var(--jaune);
    border: 2px solid var(--jaune);
    border-radius: var(--r);
    color: var(--noir);
    font-size: 20px;
    font-weight: 800;
  }
</style>
