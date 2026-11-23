<script lang="ts">
  /**
   * « Autre appareil ? » (DESIGN.md, « Tutoriel d'installation ») : la
   * détection peut se tromper, ce lien déplie les marches à suivre des six
   * cas du tableau (spec vitrine), l'appareil en gras, les navigateurs en
   * gris. L'appareil deviné porte la pastille « votre appareil ».
   */
  import Icone from "./Icone.svelte";
  import type { Cas } from "./installation";

  interface Props {
    /** Le cas de l'appareil deviné, s'il y en a un. */
    cas: Cas | null;
    /** Déplié à l'ouverture (écran « Installer l'app », appareil inconnu). */
    ouvertAuDepart: boolean;
    /**
     * Où paraît le bouton « Installer » du navigateur : en haut de l'écran
     * « Installer l'app », juste au-dessus de ce lien sur l'Accueil.
     */
    ouParaitLeBouton: "en haut de cet écran" | "au-dessus";
  }

  let { cas, ouvertAuDepart, ouParaitLeBouton }: Props = $props();

  // Le prop ne donne que l'état de départ : ensuite, c'est le lecteur qui déplie.
  // svelte-ignore state_referenced_locally
  let ouvert = $state(ouvertAuDepart);

  const id = $props.id();
</script>

{#snippet appareil(nom: string, ici: boolean)}
  <span>
    {#if ici}{nom} <em class="ici">votre appareil</em>{:else}{nom}{/if}
  </span>
{/snippet}

<button
  class="autre"
  type="button"
  aria-expanded={ouvert}
  aria-controls="{id}-appareils"
  onclick={() => (ouvert = !ouvert)}
>
  Autre appareil&nbsp;? <Icone nom="chevron" />
</button>
{#if ouvert}
  <ul class="appareils" id="{id}-appareils" aria-label="Tous les appareils">
    <li class="appareil">
      <div class="a">
        {@render appareil("Android", cas === "android")}<small>
          Chrome, Edge, Samsung Internet
        </small>
      </div>
      <p class="n">
        Le bouton «&nbsp;Installer&nbsp;» apparaît {ouParaitLeBouton} quand le navigateur
        le propose.
      </p>
    </li>
    <li class="appareil">
      <div class="a">
        {@render appareil("Android", cas === "androidFirefox")}<small>
          Firefox
        </small>
      </div>
      <p class="n">
        Menu <Icone nom="menu" nomAccessible="trois points" /> puis
        <b>«&nbsp;Installer&nbsp;»</b>.
      </p>
    </li>
    <li class="appareil">
      <div class="a">
        {@render appareil("iPhone, iPad", cas === "ios")}<small>
          Safari, Chrome, Edge
        </small>
      </div>
      <p class="n">
        Bouton Partager <Icone nom="partager" nomAccessible="Partager" /> puis
        <b>«&nbsp;Sur l'écran d'accueil&nbsp;»</b>.
      </p>
    </li>
    <li class="appareil">
      <div class="a">
        {@render appareil("Ordinateur", cas === "ordinateur")}<small>
          Chrome, Edge
        </small>
      </div>
      <p class="n">
        Le bouton «&nbsp;Installer&nbsp;» apparaît {ouParaitLeBouton} quand le navigateur
        le propose.
      </p>
    </li>
    <li class="appareil">
      <div class="a">
        {@render appareil("Mac", cas === "macSafari")}<small>Safari</small>
      </div>
      <p class="n">Menu Fichier puis <b>«&nbsp;Ajouter au Dock&nbsp;»</b>.</p>
    </li>
    <li class="appareil">
      <div class="a">
        {@render appareil("Ordinateur", cas === "ordinateurFirefox")}<small>
          Firefox
        </small>
      </div>
      <p class="n">
        Ce navigateur n'installe pas les apps web&nbsp;; l'app marche très bien
        dans un onglet.
      </p>
    </li>
  </ul>
{/if}

<style>
  /* Maquette, « .lien.autre » : le style lien, aligné à gauche, chevron de 18 px. */
  .autre {
    display: inline-flex;
    align-items: center;
    justify-content: flex-start;
    gap: var(--esp-xs);
    min-height: var(--cible);
    margin-top: var(--esp-xs);
    color: var(--craie-2);
    font-size: 15px;
    font-weight: 700;
    text-decoration: underline;
    text-underline-offset: 4px;
    text-decoration-color: var(--craie-3);
  }

  .autre :global(svg) {
    width: 18px;
    height: 18px;
  }

  /* Le chevron se retourne quand la liste est dépliée. */
  .autre[aria-expanded="true"] :global(svg) {
    transform: rotate(180deg);
  }

  .appareils {
    margin-top: var(--esp-hair);
    list-style: none;
  }

  .appareil {
    padding: 10px 0;
    border-bottom: 1px solid var(--trait);
  }

  /* L'appareil en 16 px 700 craie à gauche, les navigateurs en 13 px craie pâle à droite. */
  .a {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: baseline;
    gap: 10px;
    font-size: 16px;
    font-weight: 700;
  }

  .a small {
    font-size: 13px;
    font-weight: 400;
    color: var(--craie-3);
    white-space: nowrap;
  }

  /* La pastille « votre appareil » : 13 px craie, contour de 1,5 px, pilule. */
  .ici {
    font-style: normal;
    font-size: 13px;
    font-weight: 400;
    color: var(--craie);
    border: 1.5px solid var(--trait);
    border-radius: var(--rayon-pill);
    padding: 1px var(--esp-sm);
    margin-left: var(--esp-xs);
    white-space: nowrap;
  }

  /* La marche à suivre : 14 px craie grise, libellés à toucher en craie 700. */
  .n {
    margin-top: 2px;
    font-size: 14px;
    color: var(--craie-2);
  }

  .n :global(svg) {
    width: 18px;
    height: 18px;
    vertical-align: -4px;
    color: var(--craie);
  }

  .n b {
    color: var(--craie);
    font-weight: 700;
  }
</style>
