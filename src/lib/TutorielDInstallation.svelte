<script lang="ts">
  /**
   * LE TUTORIEL D'INSTALLATION de l'Accueil (maquette, écrans 13b et 13c ;
   * DESIGN.md, « Tutoriel d'installation ») : titre souligné « Installer
   * l'app » et l'appareil deviné à droite, une phrase qui dit pourquoi
   * installer, puis la marche à suivre de cet appareil :
   * - le bouton « Installer » du navigateur quand il le propose, en bouton
   *   secondaire pour laisser le jaune à « Commencer » ;
   * - sinon ses étapes numérotées ;
   * - ou une phrase, quand le navigateur n'installe pas les apps web.
   * « Autre appareil ? » déplie toutes les marches à suivre.
   *
   * Emploi : seulement quand l'app ne tourne pas installée. Le lien
   * « Installer l'app » du pied de page de l'Accueil mène ici
   * (`#installer-accueil`).
   */
  import AutresAppareils from "./AutresAppareils.svelte";
  import { marcheAffichee } from "./installation";
  import MarcheDInstallation from "./MarcheDInstallation.svelte";
  import type { InstallationDuNavigateur } from "./navigateur.svelte";

  interface Props {
    installation: InstallationDuNavigateur;
  }

  let { installation }: Props = $props();

  const appareil = $derived(installation.appareil);
  const marche = $derived(
    marcheAffichee(appareil, installation.invite !== null),
  );
</script>

<section
  class="inst"
  id="installer-accueil"
  aria-labelledby="installer-accueil-titre"
>
  <div class="sh">
    <h2 id="installer-accueil-titre">Installer l'app</h2>
    {#if appareil}
      <span class="meta">
        {appareil.nom.appareil} · {appareil.nom.navigateur}
      </span>
    {/if}
  </div>
  <p class="pourquoi">
    Installée, elle s'ouvre en plein écran depuis son icône et marche sans
    réseau.
  </p>
  <MarcheDInstallation {installation} {marche} />
  <AutresAppareils
    cas={appareil?.cas ?? null}
    ouvertAuDepart={marche.type === "inconnue"}
    ouParaitLeBouton="au-dessus"
  />
</section>

<style>
  /* Maquette, « .inst » : 28 px sous la légende de la feuille d'exemple. */
  .inst {
    padding: 28px var(--gutter) 0;
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

  .meta {
    font-size: 14px;
    color: var(--craie-2);
  }

  /* Pourquoi installer : 15 px craie grise, 10 px sous le titre. */
  .pourquoi {
    margin-top: 10px;
    font-size: 15px;
    color: var(--craie-2);
  }
</style>
