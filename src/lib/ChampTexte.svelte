<script lang="ts">
  /**
   * Champ de texte d'un panneau (maquette, « Formulaires ») : l'étiquette de
   * 13 px en craie grise, puis le creux `ardoise-2` de 52 px, contour jaune
   * au focus, texte d'exemple en craie pâle. Le texte remonte à chaque frappe.
   */
  interface Props {
    nom: string;
    valeur: string;
    placeholder?: string;
    maxlength?: number;
    /** Le champ prend le focus à l'ouverture du panneau. */
    focus?: boolean;
  }

  let {
    nom,
    valeur = $bindable(),
    placeholder,
    maxlength,
    focus = false,
  }: Props = $props();
</script>

<label class="field">
  <span>{nom}</span>
  <input
    class="input"
    type="text"
    autocomplete="off"
    {placeholder}
    {maxlength}
    bind:value={valeur}
    {@attach focus && ((champ: HTMLInputElement) => champ.focus())}
  />
</label>

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
  .input {
    display: flex;
    width: 100%;
    min-height: 52px;
    padding: var(--esp-md) 14px;
    background: var(--ardoise-2);
    border: 2px solid transparent;
    border-radius: var(--r);
    outline: none;
    font-size: 17px;
  }
  .input:focus {
    border-color: var(--jaune);
  }
  .input::placeholder {
    color: var(--craie-3);
  }
</style>
