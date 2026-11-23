<script lang="ts" module>
  /** Les pictogrammes de l'app, tous sur la même grille de 24 (voir DESIGN.md). */
  export type NomIcone =
    | "alerte"
    | "chance"
    | "crane"
    | "croix"
    | "crayon"
    | "de"
    | "disquette"
    | "drapeau"
    | "epees"
    | "finir"
    | "github"
    | "info"
    | "moins"
    | "plus"
    | "relancer"
    | "retour"
    | "valider";
</script>

<script lang="ts">
  /**
   * Un pictogramme en SVG en ligne : trait de 2 px, extrémités arrondies,
   * sans remplissage, en `currentColor` (le style `svg.i` est dans app.css).
   * Il est toujours décoratif : le bouton qui le porte a son propre libellé.
   * Le contexte règle la taille : le composant parent cible l'icône avec
   * `.bouton :global(svg)`.
   */
  interface Props {
    nom: NomIcone;
  }

  let { nom }: Props = $props();
</script>

<svg class="i" aria-hidden="true" viewBox="0 0 24 24">
  {#if nom === "alerte"}
    <path d="M12 3 2 20h20L12 3zM12 10v4M12 17h.01" />
  {:else if nom === "chance"}
    <path
      d="M12 12c-3-1-5-3-5-5a2.5 2.5 0 0 1 5-.5 2.5 2.5 0 0 1 5 .5c0 2-2 4-5 5zm0 0c1 3 3 5 5 5a2.5 2.5 0 0 0 .5-5M12 12c-1 3-3 5-5 5a2.5 2.5 0 0 1-.5-5M12 12v9"
    />
  {:else if nom === "crane"}
    <path
      d="M12 3a8 8 0 0 0-5 14.2V20h10v-2.8A8 8 0 0 0 12 3zM9 11h.01M15 11h.01M10 20v-2M14 20v-2"
    />
  {:else if nom === "croix"}
    <path d="M6 6l12 12M18 6 6 18" />
  {:else if nom === "crayon"}
    <path d="M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4" />
  {:else if nom === "de"}
    <rect x="3" y="3" width="18" height="18" rx="4" />
    <circle cx="8.5" cy="8.5" r="1.3" fill="currentColor" />
    <circle cx="15.5" cy="15.5" r="1.3" fill="currentColor" />
    <circle cx="12" cy="12" r="1.3" fill="currentColor" />
  {:else if nom === "disquette"}
    <path d="M5 4h11l3 3v13H5zM8 4v5h7V4M8 20v-6h8v6" />
  {:else if nom === "drapeau"}
    <path d="M5 21V4h12l-2.5 4L17 12H5" />
  {:else if nom === "epees"}
    <path d="M14.5 17.5 3 6V3h3l11.5 11.5M13 19l6-6M16 16l4 4M19 21l2-2" />
  {:else if nom === "finir"}
    <path d="M5 6l7 6-7 6M13 6l7 6-7 6" />
  {:else if nom === "github"}
    <path
      d="M9 19c-4 1.3-4-2-6-2.5M15 21v-3.4a3 3 0 0 0-.9-2.3c2.9-.3 6-1.4 6-6.4a5 5 0 0 0-1.4-3.5 4.6 4.6 0 0 0-.1-3.4s-1.1-.3-3.6 1.3a12.4 12.4 0 0 0-6.4 0C6.1 1.7 5 2 5 2a4.6 4.6 0 0 0-.1 3.4A5 5 0 0 0 3.5 9c0 5 3.1 6.1 6 6.4a3 3 0 0 0-.9 2.3V21"
    />
  {:else if nom === "info"}
    <circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7.5h.01" />
  {:else if nom === "moins"}
    <path d="M5 12h14" />
  {:else if nom === "plus"}
    <path d="M12 5v14M5 12h14" />
  {:else if nom === "relancer"}
    <path d="M20 12a8 8 0 1 1-2.4-5.7M20 4v5h-5" />
  {:else if nom === "retour"}
    <path d="M15 6l-6 6 6 6" />
  {:else if nom === "valider"}
    <path d="M5 12.5l4.5 4.5L19 7" />
  {/if}
</svg>
