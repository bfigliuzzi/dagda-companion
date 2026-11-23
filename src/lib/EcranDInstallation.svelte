<script lang="ts">
  /**
   * L'écran plein « Installer l'app » (maquette 14 ; DESIGN.md, « Tutoriel
   * d'installation »), ouvert par le lien du pied de page de la feuille ; le
   * retour rend la feuille. L'appareil deviné écrit en toutes lettres, puis sa
   * marche à suivre : le bouton « Installer » du navigateur en contour jaune,
   * puisque c'est l'action de l'écran, ou ses étapes, ou une phrase. « Autre
   * appareil ? » est déplié dès l'ouverture.
   *
   * Une fois l'app installée, la marche à suivre disparaît : il ne reste que
   * le titre et la phrase d'intro.
   */
  import AutresAppareils from "./AutresAppareils.svelte";
  import EnTeteDEcran from "./EnTeteDEcran.svelte";
  import { marcheAffichee } from "./installation";
  import MarcheDInstallation from "./MarcheDInstallation.svelte";
  import type { InstallationDuNavigateur } from "./navigateur.svelte";

  interface Props {
    installation: InstallationDuNavigateur;
    onretour: () => void;
  }

  let { installation, onretour }: Props = $props();

  const appareil = $derived(installation.appareil);
  const marche = $derived(
    marcheAffichee(appareil, installation.invite !== null),
  );
</script>

<main class="ecran">
  <EnTeteDEcran titre="Installer l'app" retour="Retour à la feuille" {onretour}>
    {#snippet intro()}Installée, elle s'ouvre en plein écran depuis son icône et
      marche sans réseau. Votre aventure reste la même.{/snippet}
  </EnTeteDEcran>
  {#if !installation.installee}
    <section class="inst">
      <MarcheDInstallation {installation} {marche} surLEcran />
      <AutresAppareils
        cas={appareil?.cas ?? null}
        ouvertAuDepart
        ouParaitLeBouton="en haut de cet écran"
      />
    </section>
  {/if}
</main>

<style>
  .ecran {
    max-width: 480px;
    margin: 0 auto;
    /* Maquette, écran 14 : 24 px sous la liste, au-dessus de la zone de sécurité. */
    padding-bottom: max(24px, env(safe-area-inset-bottom));
  }

  /* Maquette, « .inst » de l'écran 14 : 6 px sous l'intro. */
  .inst {
    padding: var(--esp-xs) var(--gutter) 0;
  }
</style>
