<script lang="ts">
  /**
   * Une ligne d'historique (maquette, « Fight rows »). Grille 64 px / 1fr /
   * auto, 56 px au moins : le chapitre en gras à gauche, l'issue avec son
   * sous-texte au milieu (rouge si « Perdu »), les PV perdus en rouge à droite.
   *
   * Sans `onbascule`, la ligne est un simple résumé (la feuille). Avec, c'est
   * un bouton : un appui déplie le détail (PV et CHANCE avant et après, fiches
   * de départ, puis les jets, le plus récent en premier ; les trois derniers
   * d'abord, les autres sur demande). Un combat narratif n'a rien de tout
   * cela : son détail dit seulement que le lecteur a indiqué l'issue.
   */
  import {
    bilanDuCombat,
    estNarratif,
    type CombatDeLHistorique,
    type Degats,
    type Jet,
  } from "./combat";
  import { formuleDeDegats, sousTexteDUnCombat } from "./historique";

  interface Props {
    combat: CombatDeLHistorique;
    /** Défini : la ligne est dépliable ; son détail s'affiche si `ouvert`. */
    onbascule?: () => void;
    ouvert?: boolean;
  }

  let { combat, onbascule, ouvert = false }: Props = $props();
  const id = $props.id();

  const VISIBLES = 3;

  const bilan = $derived(bilanDuCombat(combat));
  const titre = $derived(
    { gagne: "Gagné", perdu: "Perdu", interrompu: "Interrompu" }[
      combat.issue ?? "interrompu"
    ],
  );

  let toutVoir = $state(false);
  // Replié, un combat oublie qu'on avait tout déplié.
  $effect(() => {
    if (!ouvert) toutVoir = false;
  });

  /** Du plus récent au plus ancien. */
  const jets = $derived(estNarratif(combat) ? [] : [...combat.jets].reverse());
  const montres = $derived(toutVoir ? jets : jets.slice(0, VISIBLES));
  const cachees = $derived(jets.length - montres.length);

  const perdus = ({ total }: Degats) =>
    `${total} ${total > 1 ? "dégâts" : "dégât"}`;
  /** Le coup du lecteur qui met l'ennemi à 0 PV le dit, après un espace. */
  const achevement = ({ pointsDeVie }: Jet) =>
    pointsDeVie === 0 ? " Ennemi achevé." : "";

  /** Les dés, et le total retenu si la CHANCE l'a changé : « 9 », « 9 → 8 ». */
  const obtenu = ({ des, total, chance }: Jet) =>
    chance > 0 ? `${des[0] + des[1]} → ${total}` : `${des[0] + des[1]}`;
</script>

{#snippet resume()}
  <span class="c">§&nbsp;{combat.chapitre}</span>
  <span class="r"><b>{titre}</b><span>{sousTexteDUnCombat(combat)}</span></span>
  {#if bilan.pointsDeViePerdus > 0}
    <span class="lost">−{bilan.pointsDeViePerdus} PV</span>
  {:else}
    <span></span>
  {/if}
{/snippet}

{#if onbascule}
  <button
    class="fight"
    class:l={combat.issue === "perdu"}
    class:open={ouvert}
    type="button"
    aria-expanded={ouvert}
    aria-controls="{id}-detail"
    onclick={onbascule}
  >
    {@render resume()}
  </button>
  {#if ouvert}
    <div
      class="detail"
      id="{id}-detail"
      role="region"
      aria-label="Détail du § {combat.chapitre}"
    >
      {#if estNarratif(combat)}
        <div>
          Combat narratif · {combat.adversaires}
          {combat.adversaires > 1 ? "adversaires" : "adversaire"}.
        </div>
        <div>Vous avez indiqué l'issue&nbsp;: aucun jet, aucun PV perdu.</div>
      {:else}
        <div>
          PV <b>
            {combat.depart.lecteur.pointsDeVie} → {combat.pointsDeVie.lecteur}
          </b>
          · CHANCE
          {#if bilan.chanceDepensee > 0}
            <b>{combat.depart.lecteur.chance} → {combat.chance}</b>
            ({bilan.chanceDepensee} automatique{bilan.chanceDepensee > 1
              ? "s"
              : ""})
          {:else}
            <b>{combat.depart.lecteur.chance}</b>, aucune dépensée
          {/if}
        </div>
        <div>
          Vous : DEX <b>{combat.depart.lecteur.dexterite}</b>, dégâts
          <b>{formuleDeDegats(combat.depart.lecteur.bonus)}</b>
          · Ennemi : DEX <b>{combat.depart.ennemi.dexterite}</b>,
          <b>{combat.depart.ennemi.pointsDeVie}</b> PV, dégâts
          <b>{formuleDeDegats(combat.depart.ennemi.bonus)}</b>
        </div>
        <ul>
          {#each montres as jet (jet.attaquant + jet.tour)}
            <li>
              {#if jet.attaquant === "lecteur"}
                Tour {jet.tour} · vous&nbsp;: 2 dés = {obtenu(
                  jet,
                )}{#if !jet.degats}, raté.{:else}, touché, <b>
                    {perdus(jet.degats)}
                  </b>.{achevement(jet)}{/if}
              {:else}
                Tour {jet.tour} · ennemi&nbsp;: 2 dés = {obtenu(
                  jet,
                )}{#if !jet.degats}, raté.{:else}, touché, <b class="lost">
                    −{jet.degats.total} PV
                  </b>{/if}
              {/if}
            </li>
          {/each}
        </ul>
        {#if cachees > 0}
          <button class="add" type="button" onclick={() => (toutVoir = true)}>
            {cachees > 1
              ? `Les ${cachees} lignes précédentes`
              : "La ligne précédente"}
          </button>
        {/if}
      {/if}
    </div>
  {/if}
{:else}
  <div class="fight" class:l={combat.issue === "perdu"}>
    {@render resume()}
  </div>
{/if}

<style>
  .fight {
    display: grid;
    grid-template-columns: 64px 1fr auto;
    align-items: center;
    gap: var(--esp-md);
    width: 100%;
    min-height: 56px;
    padding: var(--esp-sm) 0;
    border-bottom: 1px solid var(--trait);
    text-align: left;
  }
  .fight.open {
    border-bottom: 0;
  }
  .c {
    font-weight: 800;
    font-size: 18px;
  }
  .r b {
    display: block;
    font-size: 16px;
  }
  .r span {
    font-size: 13px;
    color: var(--craie-2);
  }
  .fight.l .r b {
    color: var(--rouge);
  }
  .lost {
    color: var(--rouge);
    font-weight: 700;
  }

  .detail {
    padding: var(--esp-hair) 0 var(--esp-md);
    border-bottom: 1px solid var(--trait);
    font-size: 14px;
    color: var(--craie-2);
  }
  .detail > div,
  .detail li {
    padding: var(--esp-hair) 0;
  }
  ul {
    list-style: none;
  }
  .detail b {
    font-weight: 700;
    color: var(--craie);
  }
  .detail b.lost {
    color: var(--rouge);
  }
  .add {
    display: flex;
    align-items: center;
    gap: var(--esp-sm);
    min-height: var(--cible);
    color: var(--craie-2);
    font-weight: 700;
  }
  button:focus-visible {
    outline: 2px solid var(--jaune);
    outline-offset: 3px;
  }
</style>
