<script lang="ts">
  /**
   * Écran plein du combat, tour par tour : les deux camps face à face (PV en
   * gros chiffres, barre, statistiques), le bandeau d'état critique, le
   * journal (un jet par ligne, le plus récent en haut ; tour en cours en
   * clair, tours passés en craie grise, dégâts subis en rouge) et le dock de
   * combat : « Finir » joue le reste d'un coup, « Tour suivant » un tour.
   *
   * L'écran ne joue rien lui-même : il montre le combat que lui passe App et
   * remonte les appuis. Les règles sont dans combat.ts.
   */
  import Icone from "./Icone.svelte";
  import { estCritique } from "./aventure";
  import { ennemiAchevable, toursJoues, type Combat, type Jet } from "./combat";
  import Dock from "./Dock.svelte";
  import { termeDuBonus } from "./historique";
  import TraceDeCraie from "./TraceDeCraie.svelte";

  interface Props {
    combat: Combat;
    ontour: () => void;
    onfinir: () => void;
    onquitter: () => void;
  }

  let { combat, ontour, onfinir, onquitter }: Props = $props();
  const id = $props.id();

  const pvLecteur = $derived(combat.pointsDeVie.lecteur);
  const pvEnnemi = $derived(combat.pointsDeVie.ennemi);
  const critique = $derived(estCritique(pvLecteur));
  const tour = $derived(Math.max(1, toursJoues(combat)));

  /** Largeur de la barre de PV, en % du maximum. */
  const barre = (pv: number, max: number) =>
    Math.min(100, Math.max(0, (pv / max) * 100));

  /** Le journal, le jet le plus récent en premier. */
  const lignes = $derived(
    combat.jets.map((jet) => ({ jet, passe: jet.tour < tour })).reverse(),
  );

  function qui(jet: Jet): string {
    const enPremier = jet.attaquant === combat.premier;
    if (jet.attaquant === "lecteur")
      return enPremier ? "VOUS ATTAQUEZ" : "VOUS RIPOSTEZ";
    return enPremier ? "L'ENNEMI ATTAQUE" : "L'ENNEMI RIPOSTE";
  }

  /** Le texte du badge : « 1 CHANCE dépensée automatiquement ». */
  function badge({ chance, degats }: Jet): string | null {
    const points = chance + (degats?.chance ?? 0);
    if (points === 0) return null;
    return points > 1
      ? `${points} CHANCE dépensées automatiquement`
      : `${points} CHANCE dépensée automatiquement`;
  }
</script>

<!--
  Une valeur changée par la CHANCE garde son ancienne valeur barrée juste
  avant (DESIGN.md, Signature), sans fondu : le journal est un relevé, le jet
  des dés doit y rester lisible.
-->
{#snippet ancienne(valeur: number)}
  <s class="ancienne"><span class="sr">avant :&nbsp;</span>{valeur}</s>
{/snippet}

<main class="ecran">
  <div class="versus">
    <div class="side-c" role="group" aria-labelledby="{id}-vous">
      <div class="who" id="{id}-vous">Vous</div>
      <b data-etat={critique ? "critique" : undefined}>
        <TraceDeCraie valeur={pvLecteur} taille="24px" />
        <span>{pvLecteur}</span><small>
          {` / ${combat.depart.lecteur.pointsDeVieMax}`}
        </small>
      </b>
      <div class="bar" aria-hidden="true">
        <u
          data-etat={critique ? "critique" : undefined}
          style:width="{barre(
            pvLecteur,
            combat.depart.lecteur.pointsDeVieMax,
          )}%"
        ></u>
      </div>
      <div class="st">
        CHANCE {combat.chance} · DEX {combat.depart.lecteur.dexterite}
      </div>
    </div>
    <div class="side-c" role="group" aria-labelledby="{id}-ennemi">
      <div class="who" id="{id}-ennemi">Ennemi · §&nbsp;{combat.chapitre}</div>
      <b>
        <TraceDeCraie valeur={pvEnnemi} taille="24px" />
        <span>{pvEnnemi}</span><small>
          {` / ${combat.depart.ennemi.pointsDeVie}`}
        </small>
      </b>
      <div class="bar" aria-hidden="true">
        <u style:width="{barre(pvEnnemi, combat.depart.ennemi.pointsDeVie)}%"
        ></u>
      </div>
      <div class="st">DEX {combat.depart.ennemi.dexterite}</div>
    </div>
  </div>

  {#if critique}
    <div class="crit-banner" role="alert">
      <Icone nom="alerte" />
      <span>
        État critique. La CHANCE sera dépensée seule si un coup peut achever
        l'ennemi.
      </span>
    </div>
  {/if}

  <div class="turnh">
    <h2>Tour {tour}</h2>
    <span class="label">
      {combat.premier === "lecteur"
        ? "vous frappez en premier"
        : "l'ennemi frappe en premier"}
    </span>
  </div>

  <ol class="log" aria-label="Journal">
    {#each lignes as { jet, passe }, rang (combat.jets.length - rang)}
      <li
        class="t-row"
        class:latest={rang === 0}
        data-etat={passe ? "passe" : "en-cours"}
      >
        <div class="who">{passe ? `TOUR ${jet.tour} · ` : ""}{qui(jet)}</div>
        {#if jet.degats === null}
          <div class="what" data-etat="rate">2 dés = {jet.total}, raté.</div>
        {:else if jet.attaquant === "lecteur"}
          {@const auto = badge(jet)}
          <div class="what">
            2 dés = {#if jet.chance > 0}{@render ancienne(
                jet.des[0] + jet.des[1],
              )}{/if} <b>{jet.total}</b>, touché. Dégâts 1 + {#if jet.degats.chance > 0}{@render ancienne(
                jet.degats.de,
              )}{/if}
            {jet.degats.de + jet.degats.chance}{termeDuBonus(jet.degats.bonus)} =
            <b>{jet.degats.total}</b>.
            {#if jet.pointsDeVie === 0}Ennemi achevé.{:else if ennemiAchevable(jet.pointsDeVie, combat.depart.lecteur.bonus)}Ennemi
              achevable.{/if}
          </div>
          {#if auto}
            <span class="auto">
              <Icone nom="chance" />{auto}
            </span>
          {/if}
        {:else}
          <div class="what">
            2 dés = <b>{jet.total}</b>, touché. Dégâts 1 + {jet.degats
              .de}{termeDuBonus(jet.degats.bonus)} =
            <span data-etat="subis">−{jet.degats.total} PV</span>
          </div>
        {/if}
      </li>
    {/each}
  </ol>

  <button class="quitter" type="button" onclick={onquitter}>
    Quitter le combat
  </button>

  <Dock variante="combat">
    <button class="ghost" type="button" onclick={onfinir}>
      <Icone nom="finir" />
      Finir
    </button>
    <button class="cta" type="button" onclick={ontour}>Tour suivant</button>
  </Dock>
</main>

<style>
  .ecran {
    max-width: 480px;
    margin: 0 auto;
    /* Place pour le dock fixe : 1 + 12 + 58 + 22 px, plus la zone de sécurité. */
    padding-top: env(safe-area-inset-top);
    padding-bottom: calc(93px + env(safe-area-inset-bottom));
  }

  /* Face-à-face */
  .versus {
    display: grid;
    grid-template-columns: 1fr 1fr;
    border-bottom: 2px solid var(--trait);
  }

  .side-c {
    min-width: 0;
    padding: 14px var(--gutter);
  }

  .side-c + .side-c {
    border-left: 2px solid var(--trait);
  }

  .side-c .who {
    overflow: hidden;
    font-size: 14px;
    color: var(--craie-2);
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .side-c b {
    font-size: 52px;
    font-weight: 800;
    line-height: 1;
    white-space: nowrap;
  }

  .side-c b small {
    font-size: 18px;
    font-weight: 500;
    color: var(--craie-2);
  }

  .side-c b[data-etat="critique"] {
    color: var(--rouge);
  }

  .bar {
    height: 6px;
    margin-top: var(--esp-sm);
    background: var(--trait);
    border-radius: 3px;
  }

  .bar u {
    display: block;
    height: 6px;
    background: var(--craie);
    border-radius: 3px;
  }

  .bar u[data-etat="critique"] {
    background: var(--rouge);
  }

  .side-c .st {
    margin-top: var(--esp-xs);
    font-size: 13px;
    color: var(--craie-2);
  }

  /* Bandeau d'état critique : le seul indice encadré. */
  .crit-banner {
    display: flex;
    gap: 10px;
    margin: var(--esp-md) var(--gutter) 0;
    padding: 10px var(--esp-md);
    border: 2px solid var(--rouge);
    border-radius: var(--r);
    font-size: 14px;
  }

  .crit-banner :global(svg) {
    flex: none;
    width: 20px;
    height: 20px;
    color: var(--rouge);
  }

  /* Journal */
  .turnh {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    padding: 14px var(--gutter) 2px;
  }

  h2 {
    font-size: 22px;
    font-weight: 800;
    line-height: 1.1;
    letter-spacing: -0.005em;
  }

  .label {
    font-size: 13px;
    color: var(--craie-2);
    letter-spacing: 0.02em;
  }

  .log {
    padding: 0 var(--gutter);
    list-style: none;
  }

  .t-row {
    padding: 10px 0;
    border-bottom: 1px solid var(--trait);
  }

  .t-row.latest {
    padding-top: var(--esp-md);
  }

  .t-row .who {
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.02em;
    color: var(--craie-2);
  }

  .t-row .what {
    margin-top: 2px;
    font-size: 16px;
  }

  .t-row .what b {
    font-weight: 800;
  }

  /* Coup manqué en craie pâle. */
  [data-etat="rate"] {
    color: var(--craie-3);
  }

  /* Ancienne valeur, barrée en rouge (2px dans une ligne). */
  .ancienne {
    font-weight: 700;
    color: var(--rouge);
    text-decoration: line-through;
    text-decoration-thickness: 2px;
  }

  /* Badge automatique : chaque dépense de CHANCE faite par l'app. */
  .auto {
    display: inline-flex;
    align-items: center;
    gap: var(--esp-xs);
    margin-top: var(--esp-xs);
    padding: 3px 10px;
    border: 1.5px solid var(--jaune);
    border-radius: var(--rayon-pill);
    font-size: 13px;
    font-weight: 700;
    color: var(--jaune);
  }

  .auto :global(svg) {
    width: 14px;
    height: 14px;
  }

  /* Dégâts subis par le lecteur. */
  [data-etat="subis"] {
    font-weight: 800;
    color: var(--rouge);
  }

  /* Tours passés : craie grise, qui agit en craie pâle. */
  .t-row[data-etat="passe"] .what {
    color: var(--craie-2);
  }

  .t-row[data-etat="passe"] .who {
    color: var(--craie-3);
  }

  /*
   * La maquette n'a aucun contrôle pour quitter : le ticket 09 l'exige. Un
   * lien discret (style `.link` de la maquette) clôt le journal, sous la
   * partie vue à l'ouverture, qui reste celle de la maquette.
   */
  .quitter {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-height: var(--cible);
    margin-top: var(--esp-lg);
    color: var(--craie-2);
    font-weight: 700;
    text-decoration: underline;
    text-underline-offset: 4px;
    text-decoration-color: var(--craie-3);
  }

  /* Dock de combat */
  .ghost {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    width: 100%;
    min-height: 52px;
    border: 2px solid var(--trait);
    border-radius: var(--r);
    font-weight: 700;
    color: var(--craie);
  }

  .cta {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--esp-md);
    width: 100%;
    min-height: 58px;
    background: var(--jaune);
    border: 2px solid var(--jaune);
    border-radius: var(--r);
    color: var(--noir);
    font-size: 20px;
    font-weight: 800;
  }
</style>
