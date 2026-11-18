<script lang="ts">
  /**
   * La confirmation de la reprise (ticket 13) : ce que la feuille va retrouver
   * et ce qui ne change pas, dans le panneau de confirmation. La section
   * « Aventure » de la feuille et l'écran « Perdu » du combat l'emploient.
   */
  import PanneauDeConfirmation from "./PanneauDeConfirmation.svelte";

  interface Props {
    /** Le chapitre où la sauvegarde la plus récente a été posée. */
    chapitre: number;
    onconfirmer: () => void;
    onfermer: () => void;
  }

  let { chapitre, onconfirmer, onfermer }: Props = $props();
</script>

<PanneauDeConfirmation
  titre="Reprendre la sauvegarde"
  icone="info"
  confirmer="Reprendre au § {chapitre}"
  {onconfirmer}
  {onfermer}
>
  La feuille revient au §&nbsp;{chapitre}, <b>telle qu'elle était</b>&nbsp;: PV,
  CHANCE, DEXTÉRITÉ, armes, besace et effets. Vos notes et l'historique des
  combats ne changent pas, et la sauvegarde utilisée ne vous est pas rendue.
</PanneauDeConfirmation>
