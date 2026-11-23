<script lang="ts">
  /**
   * Le dock de la feuille : le bouton « Lancer les dés » (contour jaune,
   * pleine largeur) et le panneau de dés qu'il ouvre. Le dock est collant :
   * il se pose à la fin de la feuille, juste avant le pied de page.
   */
  import BoutonPrincipal from "./BoutonPrincipal.svelte";
  import Icone from "./Icone.svelte";
  import type { De } from "./des";
  import Dock from "./Dock.svelte";
  import PanneauDeDes from "./PanneauDeDes.svelte";

  interface Props {
    de: De;
    /** CHANCE disponible sur la feuille. */
    chance: number;
    /** Le lecteur a validé un total ajusté : les points de CHANCE dépensés. */
    ondepenser: (points: number) => void;
  }

  let { de, chance, ondepenser }: Props = $props();

  let ouvert = $state(false);
</script>

<Dock collant>
  <BoutonPrincipal onclick={() => (ouvert = true)}>
    <Icone nom="de" />
    Lancer les dés
  </BoutonPrincipal>
</Dock>

{#if ouvert}
  <PanneauDeDes {de} {chance} {ondepenser} onfermer={() => (ouvert = false)} />
{/if}
