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
  import BoutonPrincipal from "./BoutonPrincipal.svelte";
  import EnTeteDEcran from "./EnTeteDEcran.svelte";
  import EtapesDInstallation from "./EtapesDInstallation.svelte";
  import Icone from "./Icone.svelte";
  import { enToutesLettres, marcheAffichee } from "./installation";
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
      {#if marche.type === "bouton"}
        <p class="detecte">
          {#if appareil}
            Sur <b>{enToutesLettres(appareil)}</b>, votre navigateur propose
            l'installation&nbsp;:
          {:else}
            Votre navigateur propose l'installation&nbsp;:
          {/if}
        </p>
        <div class="installer">
          <BoutonPrincipal onclick={() => installation.installer()}>
            <Icone nom="installer" />Installer
          </BoutonPrincipal>
        </div>
      {:else if appareil && marche.type === "etapes"}
        <p class="detecte">Sur <b>{enToutesLettres(appareil)}</b>&nbsp;:</p>
        <EtapesDInstallation etapes={marche.etapes} />
      {:else if appareil && marche.type === "aucune"}
        <p class="detecte">
          Sur <b>{enToutesLettres(appareil)}</b>, ce navigateur n'installe pas
          les apps web&nbsp;; l'app marche très bien dans un onglet.
        </p>
      {:else if appareil && marche.type === "attente"}
        <p class="detecte">
          Sur <b>{enToutesLettres(appareil)}</b>, le bouton
          «&nbsp;Installer&nbsp;» apparaît ici quand le navigateur le propose.
        </p>
      {/if}
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

  /* L'appareil deviné en toutes lettres : 14 px craie grise, nom en craie 700. */
  .detecte {
    margin-top: var(--esp-lg);
    font-size: 14px;
    color: var(--craie-2);
  }

  .detecte b {
    color: var(--craie);
    font-weight: 700;
  }

  /* Le bouton principal (maquette, « .inst .cta ») : 16 px sous la phrase. */
  .installer {
    margin-top: var(--esp-lg);
  }
</style>
