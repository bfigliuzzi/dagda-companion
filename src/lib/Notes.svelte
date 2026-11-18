<script lang="ts">
  /**
   * Section « Notes » de la feuille : du texte libre (indices, mots de passe,
   * plans décrits en mots), pas de dessin. Le texte remonte à chaque frappe,
   * l'enregistrement se fait donc au fil de l'écriture.
   */
  interface Props {
    notes: string;
  }

  let { notes = $bindable() }: Props = $props();

  const id = $props.id();

  // La zone s'agrandit avec son contenu (`field-sizing`, CSS). Pour les
  // navigateurs qui ne le connaissent pas encore, on mesure à la main.
  function ajusterLaHauteur(zone: HTMLTextAreaElement) {
    if (CSS.supports("field-sizing", "content")) return;
    const ajuster = () => {
      zone.style.height = "auto";
      zone.style.height = `${zone.scrollHeight}px`;
    };
    ajuster();
    zone.addEventListener("input", ajuster);
    return () => zone.removeEventListener("input", ajuster);
  }
</script>

<section>
  <div class="sh"><h2 id="{id}-titre">Notes</h2></div>
  <textarea
    aria-labelledby="{id}-titre"
    bind:value={notes}
    {@attach ajusterLaHauteur}></textarea>
</section>

<style>
  section {
    padding: var(--esp-section) var(--gutter) var(--esp-hair);
  }
  .sh {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: var(--esp-xs);
  }
  h2 {
    font-size: 22px;
    font-weight: 800;
    line-height: 1.1;
    padding-bottom: var(--esp-hair);
    border-bottom: 2px solid var(--craie);
    letter-spacing: -0.005em;
  }
  textarea {
    display: block;
    width: 100%;
    margin-top: var(--esp-sm);
    min-height: 120px;
    padding: var(--esp-md) 0;
    background: none;
    border: 0;
    border-top: 2px solid var(--trait);
    border-bottom: 2px solid var(--trait);
    border-radius: 0;
    color: var(--craie);
    font: inherit;
    font-size: 15px;
    line-height: 1.55;
    field-sizing: content;
    overflow: hidden;
    resize: none;
  }
  textarea:focus-visible {
    outline: 2px solid var(--jaune);
    outline-offset: 3px;
    border-radius: 6px;
  }
</style>
