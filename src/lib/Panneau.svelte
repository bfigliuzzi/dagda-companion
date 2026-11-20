<script lang="ts">
  /**
   * LE PANNEAU : la feuille qui glisse depuis le bas, par-dessus la feuille de
   * personnage (DESIGN.md, « Bottom sheet »). Le panneau de dés l'emploie ; le
   * panneau « Nouvel effet » (ticket 08) l'emploiera aussi.
   *
   * Emploi : le parent décide quand le panneau existe, avec un `{#if}`, et le
   * retire dans `onfermer`.
   *
   *   {#if ouvert}
   *     <Panneau titre="Nouvel effet" onfermer={() => (ouvert = false)}>
   *       …le contenu…
   *     </Panneau>
   *   {/if}
   *
   * Props :
   * - `titre` : le titre de 22 px, aussi le nom du dialogue pour les lecteurs
   *   d'écran.
   * - `onfermer` : appelé par le bouton de fermeture, un appui sur le voile
   *   ou la touche Échap. Fermer ne valide rien : c'est au contenu de
   *   n'agir que sur son propre bouton de validation.
   * - le contenu est passé entre les balises.
   *
   * Accessibilité : rôle `dialog` modal, nommé par le titre. Le focus entre
   * dans le panneau à l'ouverture, reste pris dans le panneau avec Tab et
   * Maj+Tab, et revient à l'élément qui l'avait à la fermeture. La feuille ne
   * défile plus derrière le voile tant que le panneau est ouvert.
   */
  import Icone from "./Icone.svelte";
  import { onMount, type Snippet } from "svelte";

  interface Props {
    titre: string;
    onfermer: () => void;
    children: Snippet;
  }

  let { titre, onfermer, children }: Props = $props();
  const id = $props.id();

  let panneau: HTMLDivElement;

  const FOCALISABLES =
    'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';

  onMount(() => {
    const avant = document.activeElement;
    const defilement = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panneau.focus();
    return () => {
      document.body.style.overflow = defilement;
      if (avant instanceof HTMLElement) avant.focus();
    };
  });

  function touche(event: KeyboardEvent) {
    if (event.key === "Escape") {
      event.preventDefault();
      onfermer();
      return;
    }
    if (event.key !== "Tab") return;
    const cibles = Array.from(
      panneau.querySelectorAll<HTMLElement>(FOCALISABLES),
    );
    if (cibles.length === 0) return;
    const premiere = cibles[0];
    const derniere = cibles[cibles.length - 1];
    const actif = document.activeElement;
    // Sur les bords du panneau, ou hors du panneau, le focus fait le tour.
    if (event.shiftKey && (actif === premiere || actif === panneau)) {
      event.preventDefault();
      derniere.focus();
    } else if (!event.shiftKey && actif === derniere) {
      event.preventDefault();
      premiere.focus();
    } else if (!panneau.contains(actif)) {
      event.preventDefault();
      premiere.focus();
    }
  }
</script>

<svelte:window onkeydown={touche} />

<div
  class="voile"
  data-testid="voile"
  role="presentation"
  onclick={onfermer}
></div>
<div
  class="panneau"
  role="dialog"
  aria-modal="true"
  aria-labelledby="{id}-titre"
  tabindex="-1"
  bind:this={panneau}
>
  <div class="poignee" aria-hidden="true"></div>
  <div class="entete">
    <h2 id="{id}-titre">{titre}</h2>
    <button class="fermer" type="button" aria-label="Fermer" onclick={onfermer}>
      <Icone nom="croix" />
    </button>
  </div>
  {@render children()}
</div>

<style>
  /* Le voile couvre toute la feuille, PV compris : on les voit au-dessus du panneau. */
  .voile {
    position: fixed;
    inset: 0;
    z-index: 10;
    background: rgb(0 0 0 / 0.72);
  }

  .panneau {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 11;
    max-width: 480px;
    max-height: calc(100dvh - var(--gutter));
    margin: 0 auto;
    padding: 10px var(--gutter) 22px;
    padding-bottom: max(22px, env(safe-area-inset-bottom));
    overflow-y: auto;
    overscroll-behavior: contain;
    background: var(--ardoise-1);
    border-top: 2px solid var(--craie);
    border-radius: var(--rayon-sheet) var(--rayon-sheet) 0 0;
    outline: none;
  }

  /* Il glisse une fois depuis le bas, sauf si le lecteur réduit les animations. */
  @media (prefers-reduced-motion: no-preference) {
    .panneau {
      animation: glisser 0.22s cubic-bezier(0.16, 1, 0.3, 1);
    }
  }

  @keyframes glisser {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
  }

  .poignee {
    width: 44px;
    height: 5px;
    margin: 0 auto var(--esp-md);
    background: var(--craie-3);
    border-radius: 3px;
  }

  .entete {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  h2 {
    font-size: 22px;
    font-weight: 800;
    line-height: 1.1;
  }

  .fermer {
    display: grid;
    place-items: center;
    width: var(--cible);
    height: var(--cible);
    margin-right: -10px;
    color: var(--craie-2);
  }
</style>
