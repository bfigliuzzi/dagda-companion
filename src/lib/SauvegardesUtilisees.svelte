<script lang="ts">
  /**
   * Le panneau « Sauvegardes utilisées » : le lecteur corrige à la main le
   * nombre de sauvegardes déjà consommées (de 0 à 3), par exemple après en
   * avoir posé une sur le papier. Le choix compte aussitôt, comme toute valeur
   * de la feuille (« Rien ne se perd ») : il n'y a pas de bouton de validation.
   * Il ne touche pas à la sauvegarde déjà posée.
   */
  import Indice from "./Indice.svelte";
  import { SAUVEGARDES_DU_LIVRE } from "./aventure";
  import Panneau from "./Panneau.svelte";

  interface Props {
    utilisees: number;
    onchoisir: (utilisees: number) => void;
    onfermer: () => void;
  }

  let { utilisees, onchoisir, onfermer }: Props = $props();
  const id = $props.id();
</script>

<Panneau titre="Sauvegardes utilisées" {onfermer}>
  <div class="field">
    <span id="{id}-choix">Sauvegardes déjà utilisées</span>
    <div class="chips" role="radiogroup" aria-labelledby="{id}-choix">
      {#each Array.from({ length: SAUVEGARDES_DU_LIVRE + 1 }, (_, n) => n) as n (n)}
        <label class="chip">
          <input
            class="sr"
            type="radio"
            name="{id}-utilisees"
            value={n}
            checked={utilisees === n}
            onchange={() => onchoisir(n)}
          />
          {n}
        </label>
      {/each}
    </div>
  </div>
  <Indice icone="info">
    Le livre en donne <b>{SAUVEGARDES_DU_LIVRE} pour toute l'aventure</b>.
    Corrigez ici celles que vous avez déjà utilisées en dehors de l'app.
  </Indice>
</Panneau>

<style>
  .field {
    display: block;
    margin-top: 14px;
  }
  .field > span {
    display: block;
    margin-bottom: var(--esp-xs);
    font-size: 13px;
    color: var(--craie-2);
  }

  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: var(--esp-sm);
  }
  .chip {
    display: flex;
    align-items: center;
    min-height: var(--cible);
    padding: 0 var(--esp-lg);
    border: 2px solid var(--trait);
    border-radius: var(--rayon-pill);
    font-weight: 700;
    color: var(--craie-2);
    cursor: pointer;
  }
  .chip:has(:checked) {
    border-color: var(--jaune);
    color: var(--jaune);
  }
  .chip:has(:focus-visible) {
    outline: 2px solid var(--jaune);
    outline-offset: 3px;
  }

  /* Indice non bloquant : voir DESIGN.md, « Hints ». */
</style>
