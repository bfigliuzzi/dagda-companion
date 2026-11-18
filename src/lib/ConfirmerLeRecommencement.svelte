<script lang="ts">
  /**
   * La confirmation de « Recommencer » : un panneau qui dit ce qui sera
   * effacé, avec le bouton jaune plein qui valide et « Annuler » en
   * secondaire. Rien n'est effacé avant l'appui sur le bouton jaune ; fermer
   * (croix, voile, Échap) ou « Annuler » laisse tout comme c'était.
   *
   * Deux cas :
   * - `aventure` : « Recommencer une aventure » de la section « Aventure »,
   *   valable dans tous les modes. Toute l'aventure est effacée de l'appareil.
   * - `mort` : le mode mortel, à 0 PV (feuille ou écran « Perdu »). Le lecteur
   *   perd ses armes et son équipement et crée un nouveau personnage au
   *   chapitre 1 ; l'app ne l'impose jamais, elle le propose.
   */
  import Panneau from "./Panneau.svelte";

  interface Props {
    cas: "aventure" | "mort";
    onconfirmer: () => void;
    onfermer: () => void;
  }

  let { cas, onconfirmer, onfermer }: Props = $props();
</script>

<Panneau
  titre={cas === "mort"
    ? "Recommencer au chapitre 1"
    : "Recommencer une aventure"}
  {onfermer}
>
  <div class="hint">
    <svg class="i" aria-hidden="true" viewBox="0 0 24 24">
      <path d="M12 3 2 20h20L12 3zM12 10v4M12 17h.01" />
    </svg>
    <span>
      {#if cas === "mort"}
        <b>Vous perdez vos armes et votre équipement</b>&nbsp;: armes, besace,
        bourse, boulons et effets. L'historique des combats repart de zéro ; vos
        notes restent. Vous créez un nouveau personnage en mode mortel, et
        l'aventure reprend au chapitre&nbsp;1.
      {:else}
        <b>Toute l'aventure sera effacée de cet appareil</b>&nbsp;: personnage,
        armes, besace, effets, notes, historique des combats et sauvegardes.
        Vous repartirez de l'écran «&nbsp;Nouvel apprenti&nbsp;». Cela ne peut
        pas être annulé.
      {/if}
    </span>
  </div>
  <div class="btns">
    <button class="cta" type="button" onclick={onconfirmer}>
      {cas === "mort"
        ? "Créer un nouveau personnage"
        : "Effacer et recommencer"}
    </button>
    <button class="ghost" type="button" onclick={onfermer}>Annuler</button>
  </div>
</Panneau>

<style>
  /* Indice non bloquant, version avertissement (icône rouge) : DESIGN.md, « Hints ». */
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
    color: var(--rouge);
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
