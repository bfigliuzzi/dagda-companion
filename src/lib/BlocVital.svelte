<script lang="ts">
  /** Haut de la feuille : PV à gauche, CHANCE et DEXTÉRITÉ à droite. */
  import type { Personnage } from "./aventure";

  interface Props {
    personnage: Personnage;
  }

  let { personnage }: Props = $props();
  const id = $props.id();
</script>

<div class="vital">
  <div class="pv" role="group" aria-labelledby="{id}-pv">
    <div class="etiquette" id="{id}-pv">Points de vie</div>
    <div class="num">
      <b>{personnage.pointsDeVie}</b>
      <span>/ {personnage.pointsDeVieMax}</span>
    </div>
  </div>
  <div class="pile">
    <div class="stat" role="group" aria-labelledby="{id}-chance">
      <span class="etiquette" id="{id}-chance">Chance</span>
      <b>{personnage.chance}</b>
    </div>
    <div class="stat" role="group" aria-labelledby="{id}-dex">
      <span class="etiquette" id="{id}-dex">Dextérité</span>
      <b>{personnage.dexterite}</b>
    </div>
  </div>
</div>

<style>
  .vital {
    display: grid;
    grid-template-columns: 1.45fr 1fr;
    gap: var(--esp-lg);
    padding: 14px var(--gutter) var(--gutter);
    border-bottom: 2px solid var(--trait);
  }

  .etiquette {
    font-size: 13px;
    color: var(--craie-2);
    letter-spacing: 0.02em;
  }

  .num {
    display: flex;
    align-items: baseline;
    gap: var(--esp-xs);
    margin-top: 2px;
    white-space: nowrap;
  }

  .num b {
    font-size: 88px;
    font-weight: 800;
    line-height: 0.92;
    letter-spacing: -0.03em;
  }

  .num span {
    font-size: 24px;
    font-weight: 500;
    color: var(--craie-2);
  }

  .pile {
    display: flex;
    flex-direction: column;
  }

  .stat {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    min-height: var(--ligne);
    padding: var(--esp-xs) 0;
    border-bottom: 1px solid var(--trait);
  }

  .stat:last-child {
    border-bottom: 0;
  }

  .stat b {
    font-size: 32px;
    font-weight: 800;
    line-height: 1;
  }
</style>
