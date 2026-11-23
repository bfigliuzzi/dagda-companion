<script lang="ts">
  /**
   * La marche à suivre de l'appareil deviné (DESIGN.md, « Tutoriel
   * d'installation »), sur l'Accueil comme sur l'écran « Installer l'app » :
   * - le bouton « Installer » du navigateur quand il le propose ;
   * - sinon ses étapes numérotées ;
   * - ou une phrase, quand le navigateur n'installe pas les apps web, ou
   *   quand son bouton n'est pas encore proposé.
   * Rien pour un appareil inconnu : « Autre appareil ? » prend le relais.
   *
   * Avec `surLEcran` (écran « Installer l'app »), l'appareil est écrit en
   * toutes lettres en tête de phrase (« Sur Android avec Chrome, … ») et
   * « Installer » est le bouton principal, puisque c'est l'action de l'écran.
   * Sans (Accueil), « Installer » est un bouton secondaire, pour laisser le
   * jaune à « Commencer ».
   */
  import BoutonContour from "./BoutonContour.svelte";
  import BoutonPrincipal from "./BoutonPrincipal.svelte";
  import EtapesDInstallation from "./EtapesDInstallation.svelte";
  import Icone from "./Icone.svelte";
  import { enToutesLettres, type MarcheAffichee } from "./installation";
  import type { InstallationDuNavigateur } from "./navigateur.svelte";

  interface Props {
    installation: InstallationDuNavigateur;
    marche: MarcheAffichee;
    surLEcran?: boolean;
  }

  let { installation, marche, surLEcran = false }: Props = $props();

  /** L'appareil écrit en tête de phrase, seulement sur l'écran. */
  const nomme = $derived(
    surLEcran && installation.appareil
      ? enToutesLettres(installation.appareil)
      : null,
  );
</script>

{#if marche.type === "bouton"}
  {#if surLEcran}
    <p class="detecte">
      {#if nomme}Sur <b>{nomme}</b>, votre{:else}Votre{/if} navigateur propose l'installation&nbsp;:
    </p>
    <div class="installer principal">
      <BoutonPrincipal onclick={() => installation.installer()}>
        <Icone nom="installer" />Installer
      </BoutonPrincipal>
    </div>
  {:else}
    <div class="installer">
      <BoutonContour onclick={() => installation.installer()}>
        <Icone nom="installer" />Installer
      </BoutonContour>
    </div>
  {/if}
{:else if marche.type === "etapes"}
  {#if nomme}
    <p class="detecte">Sur <b>{nomme}</b>&nbsp;:</p>
  {/if}
  <EtapesDInstallation etapes={marche.etapes} />
{:else if marche.type === "aucune"}
  <p class="detecte">
    {#if nomme}Sur <b>{nomme}</b>, ce{:else}Ce{/if} navigateur n'installe pas les
    apps web&nbsp;; l'app marche très bien dans un onglet.
  </p>
{:else if marche.type === "attente"}
  <p class="detecte">
    {#if nomme}Sur <b>{nomme}</b>, le{:else}Le{/if} bouton «&nbsp;Installer&nbsp;»
    apparaît ici quand le navigateur le propose.
  </p>
{/if}

<style>
  /* Maquette, « .inst .detecte » : ce que fait le navigateur, en 14 px craie
     grise, l'appareil en craie 700. */
  .detecte {
    margin-top: var(--esp-lg);
    font-size: 14px;
    color: var(--craie-2);
  }

  .detecte b {
    color: var(--craie);
    font-weight: 700;
  }

  /* Maquette, « .inst .ghost » : 14 px sous la phrase. */
  .installer {
    margin-top: 14px;
  }

  /* Maquette, « .inst .cta » de l'écran 14 : 16 px sous la phrase. */
  .installer.principal {
    margin-top: var(--esp-lg);
  }
</style>
