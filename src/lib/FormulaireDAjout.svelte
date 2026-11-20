<script lang="ts">
  /**
   * Le formulaire qui remplace le bouton « Ajouter … » d'une section de la
   * feuille : un champ de nom (pris en main dès l'ouverture), les champs
   * propres à la section (en contenu), le bouton jaune qui valide et
   * « Annuler ». Tant que le nom est vide, le bouton dit ce qui manque au
   * lieu de bloquer par un message d'erreur.
   *
   * Le formulaire garde le nom qu'on tape : à chaque ouverture, il repart
   * vide. La section ne reçoit que le nom épuré, jamais vide.
   */
  import type { Snippet } from "svelte";

  interface Props {
    /** Nom accessible du formulaire : « Nouvelle arme ». */
    titre: string;
    /** Étiquette du champ de nom : « Nom de l'arme ». */
    etiquette: string;
    /** Libellé du bouton quand le nom est vide : « Nommez d'abord l'arme ». */
    manque: string;
    /** Libellé du bouton quand tout est prêt : « Ajouter l'arme ». */
    valider: string;
    onajouter: (nom: string) => void;
    onannuler: () => void;
    /** Les champs propres à la section, sous le nom. */
    children?: Snippet;
  }

  let {
    titre,
    etiquette,
    manque,
    valider,
    onajouter,
    onannuler,
    children,
  }: Props = $props();

  let nom = $state("");
  const nomVide = $derived(nom.trim() === "");

  function ajouter(event: SubmitEvent) {
    event.preventDefault();
    if (nomVide) return;
    onajouter(nom.trim());
  }

  const focaliser = (champ: HTMLInputElement) => {
    champ.focus();
    champ.select();
  };
</script>

<form aria-label={titre} onsubmit={ajouter}>
  <label class="champ">
    <span>{etiquette}</span>
    <input
      class="texte"
      type="text"
      autocomplete="off"
      bind:value={nom}
      {@attach focaliser}
    />
  </label>
  {@render children?.()}
  <div class="btns">
    <button class="valider" type="submit" aria-disabled={nomVide}>
      {nomVide ? manque : valider}
    </button>
    <button class="annuler" type="button" onclick={onannuler}>Annuler</button>
  </div>
</form>

<style>
  form {
    margin-top: var(--esp-xs);
  }
  .champ {
    display: block;
    margin-top: 14px;
  }
  .champ > span {
    display: block;
    margin-bottom: var(--esp-xs);
    font-size: 13px;
    color: var(--craie-2);
  }
  .texte {
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
  .texte:focus {
    border-color: var(--jaune);
  }
  .btns {
    display: grid;
    gap: 10px;
    margin-top: 14px;
  }
  .valider {
    width: 100%;
    min-height: 58px;
    border: 2px solid var(--jaune);
    border-radius: var(--r);
    background: var(--jaune);
    color: var(--noir);
    font-size: 20px;
    font-weight: 800;
  }
  .valider[aria-disabled="true"] {
    background: none;
    border-color: var(--craie-3);
    color: var(--craie-3);
  }
  .annuler {
    min-height: 52px;
    border: 2px solid var(--trait);
    border-radius: var(--r);
    font-weight: 700;
  }
</style>
