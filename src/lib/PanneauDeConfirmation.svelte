<script lang="ts">
  /**
   * Le panneau de confirmation : un indice qui dit ce qui va se passer
   * (icône jaune d'information ou rouge d'avertissement), le bouton jaune plein
   * qui valide et « Annuler » en secondaire. Rien ne se passe avant l'appui sur
   * le bouton jaune ; fermer (croix, voile, Échap) ou « Annuler » laisse tout
   * comme c'était. Le texte arrive en contenu ; ConfirmerLaReprise et
   * ConfirmerLeRecommencement lui donnent les mots de chaque cas.
   */
  import type { Snippet } from "svelte";
  import Icone from "./Icone.svelte";
  import Panneau from "./Panneau.svelte";

  interface Props {
    titre: string;
    /** `info` : icône jaune. `alerte` : icône rouge, pour ce qui efface. */
    icone: "info" | "alerte";
    /** Le libellé du bouton jaune. */
    confirmer: string;
    onconfirmer: () => void;
    onfermer: () => void;
    children: Snippet;
  }

  let { titre, icone, confirmer, onconfirmer, onfermer, children }: Props =
    $props();
</script>

<Panneau {titre} {onfermer}>
  <div class="hint" class:alerte={icone === "alerte"}>
    <Icone nom={icone} />
    <span>{@render children()}</span>
  </div>
  <div class="btns">
    <button class="cta" type="button" onclick={onconfirmer}>
      {confirmer}
    </button>
    <button class="ghost" type="button" onclick={onfermer}>Annuler</button>
  </div>
</Panneau>

<style>
  /* Indice non bloquant : voir DESIGN.md, « Hints ». */
  .hint {
    display: flex;
    gap: 10px;
    margin-top: var(--esp-md);
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
  .hint.alerte :global(svg) {
    color: var(--rouge);
  }
  .hint :global(b) {
    color: var(--craie);
  }

  .btns {
    display: grid;
    gap: 10px;
    margin-top: 14px;
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
    font-size: 20px;
    font-weight: 800;
    color: var(--noir);
  }
  /* Bouton secondaire : contour `trait`, texte craie 700, 52 px. */
  .ghost {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-height: 52px;
    border: 2px solid var(--trait);
    border-radius: var(--r);
    font-weight: 700;
    color: var(--craie);
  }
</style>
