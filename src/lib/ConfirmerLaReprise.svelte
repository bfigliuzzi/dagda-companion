<script lang="ts">
  /**
   * La confirmation de la reprise (ticket 13) : un panneau qui dit ce que la
   * feuille va retrouver et ce qui ne change pas, avec le bouton jaune plein
   * qui reprend et « Annuler » en secondaire. Rien n'est repris avant l'appui
   * sur le bouton jaune ; fermer (croix, voile, Échap) ou « Annuler » laisse
   * tout comme c'était. La section « Aventure » de la feuille et l'écran
   * « Perdu » du combat l'emploient.
   */
  import Panneau from "./Panneau.svelte";

  interface Props {
    /** Le chapitre où la sauvegarde la plus récente a été posée. */
    chapitre: number;
    onconfirmer: () => void;
    onfermer: () => void;
  }

  let { chapitre, onconfirmer, onfermer }: Props = $props();
</script>

<Panneau titre="Reprendre la sauvegarde" {onfermer}>
  <div class="hint">
    <svg class="i" aria-hidden="true" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7.5h.01" />
    </svg>
    <span>
      La feuille revient au §&nbsp;{chapitre}, <b>telle qu'elle était</b>&nbsp;:
      PV, CHANCE, DEXTÉRITÉ, armes, besace et effets. Vos notes et l'historique
      des combats ne changent pas, et la sauvegarde utilisée ne vous est pas
      rendue.
    </span>
  </div>
  <div class="btns">
    <button class="cta" type="button" onclick={onconfirmer}>
      Reprendre au § {chapitre}
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
