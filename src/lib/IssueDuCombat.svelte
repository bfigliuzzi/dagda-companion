<script lang="ts">
  /**
   * Écran « Combat » du mode narratif (maquette 8) : le lecteur indique
   * simplement comment le combat s'est terminé, par deux grands choix de
   * 120 px, « Gagné » (contour craie) et « Perdu » (contour rouge). Rien n'est
   * joué : ni PV perdus, ni CHANCE dépensée, et « Perdu » ne décide rien à la
   * place du lecteur. Le lien « Jouer le combat aux dés » laisse jouer le combat
   * normalement.
   */
  import Icone from "./Icone.svelte";
  import { ADVERSAIRES_MAX_EN_NARRATIF, type CombatNarratif } from "./combat";

  interface Props {
    chapitre: number;
    adversaires: number;
    onissue: (issue: CombatNarratif["issue"]) => void;
    onjouer: () => void;
    onannuler: () => void;
  }

  let { chapitre, adversaires, onissue, onjouer, onannuler }: Props = $props();
</script>

<main class="ecran">
  <div class="screen-h">
    <button
      class="retour"
      type="button"
      aria-label="Annuler"
      onclick={onannuler}
    >
      <Icone nom="retour" />
    </button>
    <h1>Combat</h1>
  </div>
  <p class="intro">
    Mode narratif · §&nbsp;{chapitre} · {adversaires}
    {adversaires > 1 ? "adversaires" : "adversaire"}
  </p>

  <div class="result">
    <h2 class="big">Comment s'est terminé ce combat&nbsp;?</h2>
  </div>

  <div class="big-choice">
    <button type="button" onclick={() => onissue("gagne")}>
      <Icone nom="drapeau" />
      Gagné
    </button>
    <button class="l" type="button" onclick={() => onissue("perdu")}>
      <Icone nom="crane" />
      Perdu
    </button>
  </div>

  <div class="jouer">
    <button class="link" type="button" onclick={onjouer}>
      Jouer le combat aux dés
    </button>
  </div>

  <div class="hint">
    <Icone nom="info" />
    <span>
      Au-delà de {ADVERSAIRES_MAX_EN_NARRATIF} adversaires, le combat se joue aux
      dés, même en mode narratif.
    </span>
  </div>
</main>

<style>
  .ecran {
    max-width: 480px;
    margin: 0 auto;
    padding-bottom: calc(var(--gutter) + env(safe-area-inset-bottom));
  }

  .screen-h {
    display: flex;
    align-items: center;
    gap: var(--esp-sm);
    padding: var(--gutter) var(--gutter) var(--esp-xs);
    padding-top: max(var(--gutter), env(safe-area-inset-top));
  }

  .retour {
    display: grid;
    place-items: center;
    width: var(--cible);
    height: var(--cible);
    margin-left: -12px;
    color: var(--craie-2);
  }

  h1 {
    flex: 1;
    font-size: 28px;
    font-weight: 800;
    letter-spacing: -0.015em;
  }

  .intro {
    padding: 0 var(--gutter);
    font-size: 15px;
    color: var(--craie-2);
  }

  .result {
    padding: 28px var(--gutter) 0;
  }

  .big {
    margin-top: 14px;
    font-size: 32px;
    font-weight: 800;
    line-height: 1.05;
    letter-spacing: -0.02em;
  }

  .big-choice {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--esp-md);
    margin: 26px var(--gutter) 0;
  }

  .big-choice button {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    min-height: 120px;
    border: 2px solid var(--craie);
    border-radius: var(--r);
    font-size: 20px;
    font-weight: 800;
  }

  .big-choice button.l {
    border-color: var(--rouge);
    color: var(--rouge);
  }

  .big-choice :global(svg) {
    width: 30px;
    height: 30px;
  }

  .jouer {
    padding: var(--gutter);
  }

  /* Lien discret : craie grise soulignée (maquette, `.link`). */
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

  .hint {
    display: flex;
    gap: 10px;
    margin: 0 var(--gutter);
    padding: 10px 0 0;
    border-top: 2px solid var(--trait);
    font-size: 14px;
    color: var(--craie-2);
  }

  .hint :global(svg) {
    flex: none;
    width: 20px;
    height: 20px;
    margin-top: 1px;
    color: var(--jaune);
  }
</style>
