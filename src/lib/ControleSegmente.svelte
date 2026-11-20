<script lang="ts" generics="T extends string">
  /**
   * Contrôle segmenté (DESIGN.md, « Segmented control ») : un creux
   * `ardoise-2` à coins de 12 px, padding 4 px, deux segments ; le segment
   * actif est un aplat craie à coins de 9 px, texte noir 700, l'autre est en
   * craie grise. Ce sont de vrais boutons radio, masqués.
   *
   * Emploi :
   *
   *   <ControleSegmente etiquette="Outil" bind:valeur={outil}
   *     options={[{ valeur: "murs", libelle: "Murs" }, …]} />
   *
   * Le segment fait 44 px de haut, le contrôle 52 px avec son creux.
   */
  interface Props {
    /** Nom du groupe pour les lecteurs d'écran. */
    etiquette: string;
    options: { valeur: T; libelle: string }[];
    valeur: T;
  }

  let { etiquette, options, valeur = $bindable() }: Props = $props();

  const id = $props.id();
</script>

<div class="segments" role="radiogroup" aria-label={etiquette}>
  {#each options as option (option.valeur)}
    <label class="segment">
      <input
        class="sr"
        type="radio"
        name="{id}-segment"
        checked={valeur === option.valeur}
        onchange={() => (valeur = option.valeur)}
      />
      {option.libelle}
    </label>
  {/each}
</div>

<style>
  .segments {
    display: grid;
    grid-auto-columns: 1fr;
    grid-auto-flow: column;
    padding: var(--esp-hair);
    background: var(--ardoise-2);
    border-radius: var(--r);
  }

  .segment {
    display: grid;
    place-items: center;
    min-height: var(--cible);
    border-radius: var(--rayon-seg);
    font-weight: 700;
    color: var(--craie-2);
    cursor: pointer;
  }

  .segment:has(:checked) {
    background: var(--craie);
    color: var(--noir);
  }

  .segment:has(:focus-visible) {
    outline: 2px solid var(--jaune);
    outline-offset: 3px;
  }
</style>
