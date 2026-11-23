<script lang="ts">
  /**
   * LE PIED DE PAGE (DESIGN.md, « Pied de page ») : le nom de l'app et sa
   * version, l'icône GitHub vers l'accueil du dépôt, puis les liens du bas
   * (« Mentions légales », « Installer l'app »). Il ferme la feuille et l'Accueil ;
   * jamais les écrans de combat, de plan, d'historique ni de création.
   *
   * Emploi : le poser tout en bas de la page, juste après le dock collant
   * (`<Dock collant>`) ; il se colle alors 12 px sous le dock arrivé au bout
   * de la page, au lieu de 32 px sous le dernier contenu.
   */
  import Icone from "./Icone.svelte";
  import { version } from "./version";

  interface Props {
    /**
     * Le lien « Installer l'app », absent (`null`) quand l'app tourne
     * installée. Sur l'Accueil, il mène à la section du tutoriel ; sur la
     * feuille, `onclick` ouvre l'écran « Installer l'app ».
     */
    installer: { href: string; onclick?: () => void } | null;
  }

  let { installer }: Props = $props();
</script>

<footer class="pied">
  <div class="qui">
    <p class="nom">
      Compagnon de La Saga de Dagda<small>Version {version}</small>
    </p>
    <a
      class="gh"
      href="https://github.com/bfigliuzzi/dagda-companion"
      aria-label="Code source sur GitHub"
    >
      <Icone nom="github" />
    </a>
  </div>
  <nav aria-label="Pied de page">
    <!-- Relatif : l'app est servie sous /dagda-companion/ sur GitHub Pages. -->
    <a class="lien" href="mentions-legales.html">Mentions légales</a>
    {#if installer}
      {@const { href, onclick } = installer}
      <a
        class="lien"
        {href}
        onclick={onclick &&
          ((evenement) => {
            evenement.preventDefault();
            onclick();
          })}
      >
        Installer l'app
      </a>
    {/if}
  </nav>
</footer>

<style>
  /* Maquette, « .pied » : dans la colonne de la feuille (480 px), marges de 18 px. */
  .pied {
    width: calc(100% - 2 * var(--gutter));
    max-width: calc(480px - 2 * var(--gutter));
    margin: 32px auto 0;
    padding-top: var(--esp-md);
    /* Maquette, écran 2 : 24 px sous le pied de page, au-dessus de la zone de sécurité. */
    padding-bottom: max(24px, env(safe-area-inset-bottom));
    border-top: 2px solid var(--trait);
  }

  /* Maquette, « .dock.pose + .pied » : 12 px sous le dock arrivé au bout de la page. */
  :global(.dock) ~ .pied {
    margin-top: var(--esp-md);
  }

  .qui {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--esp-md);
  }

  .nom {
    font-size: 15px;
    font-weight: 700;
  }

  .nom small {
    display: block;
    font-size: 14px;
    font-weight: 400;
    color: var(--craie-3);
  }

  .gh {
    display: grid;
    place-items: center;
    width: var(--cible);
    height: var(--cible);
    margin-right: -10px;
    color: var(--craie-2);
  }

  nav {
    display: flex;
    flex-wrap: wrap;
    column-gap: 22px;
    margin-top: 2px;
  }

  /* Maquette, « .lien » : 15 px 700 craie grise, souligné en craie pâle. */
  .lien {
    display: inline-flex;
    align-items: center;
    gap: var(--esp-xs);
    min-height: var(--cible);
    color: var(--craie-2);
    font-size: 15px;
    font-weight: 700;
    text-decoration: underline;
    text-underline-offset: 4px;
    text-decoration-color: var(--craie-3);
  }
</style>
