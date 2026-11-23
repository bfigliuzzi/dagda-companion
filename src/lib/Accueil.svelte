<script lang="ts">
  /**
   * L'ACCUEIL (GLOSSARY.md ; DESIGN.md, « Accueil ») : seulement à
   * l'ouverture de l'app sans aventure enregistrée. Le nom de l'app et ce
   * qu'elle fait, une feuille d'exemple dessinée, puis « Commencer », collant
   * en bas de l'écran, qui ouvre « Nouvel apprenti ». Entre la feuille
   * d'exemple et « Commencer », le tutoriel d'installation, tant que l'app ne
   * tourne pas installée. Le pied de page ferme l'écran.
   *
   * La feuille d'exemple est une image, pas une feuille (« The Sample Is A
   * Picture Rule ») : un téléphone en craie pâle réduit à 62 %, coupé net à
   * 410 px par un trait, rien de touchable, lu comme une seule image décrite.
   * Ses valeurs sont figées ici, à l'identique de la maquette.
   */
  import BoutonPrincipal from "./BoutonPrincipal.svelte";
  import Dock from "./Dock.svelte";
  import type { InstallationDuNavigateur } from "./navigateur.svelte";
  import PiedDePage from "./PiedDePage.svelte";
  import TutorielDInstallation from "./TutorielDInstallation.svelte";

  interface Props {
    installation: InstallationDuNavigateur;
    oncommencer: () => void;
  }

  let { installation, oncommencer }: Props = $props();
</script>

<main class="accueil">
  <div class="haut">
    <h1>Compagnon de La Saga de Dagda</h1>
    <p>
      La feuille d'aventure du livre-jeu, sur le téléphone posé à côté du livre.
      Vous lisez, l'app tient les comptes.
    </p>
  </div>

  <div
    class="apercu"
    role="img"
    aria-label="Exemple de feuille : 28 points de vie sur 32 (avant : 31), CHANCE 4, DEXTÉRITÉ 8 grâce à une potion, une épée courte et une dague, 9 objets sur 24 dans la besace."
  >
    <div class="tel" aria-hidden="true">
      <div class="top">
        <span>Herbologie · Mode simplifié</span><span class="chap">§ 112</span>
      </div>
      <div class="vitals">
        <div class="pv">
          <div class="label">Points de vie</div>
          <div class="num"><s class="was">31</s><b>28</b><span>/ 32</span></div>
        </div>
        <div class="side">
          <div class="stat"><span class="label">Chance</span><b>4</b></div>
          <div class="stat">
            <span class="label">Dextérité</span><b class="eff">8</b>
          </div>
        </div>
      </div>
      <section>
        <div class="sh">
          <h2>Armes</h2>
          <span class="meta">2 / 2</span>
        </div>
        <div class="row">
          <span class="n">Épée courte</span><span class="v">+1</span>
        </div>
        <div class="row">
          <span class="n">Dague</span><span class="v">0</span>
        </div>
      </section>
      <section>
        <div class="sh">
          <h2>Effets</h2>
          <span class="meta">1 actif</span>
        </div>
        <div class="row effect">
          <span class="n">Potion d'adresse</span><span class="d">DEX +1</span>
        </div>
      </section>
      <section>
        <div class="sh">
          <h2>Besace</h2>
          <span class="meta">9 / 24</span>
        </div>
        <div class="tally">
          {#each { length: 24 }, i (i)}<i class:f={i < 9}></i>{/each}
        </div>
        <div class="row"><span class="n">Corde</span></div>
        <div class="row">
          <span class="n">Bourse</span><span class="v">12 boulons</span>
        </div>
      </section>
    </div>
  </div>
  <p class="legende">Une feuille d'exemple. La vôtre commence vierge.</p>

  {#if !installation.installee}
    <TutorielDInstallation {installation} />
  {/if}
</main>

<Dock collant variante="accueil">
  <div>
    <BoutonPrincipal onclick={oncommencer}>Commencer</BoutonPrincipal>
    <p class="mention">
      Projet de fan non officiel · tout reste sur votre téléphone
    </p>
  </div>
</Dock>
<PiedDePage
  installer={installation.installee ? null : { href: "#installer-accueil" }}
/>

<style>
  /* La colonne de la feuille (480 px). */
  .accueil {
    max-width: 480px;
    margin: 0 auto;
  }

  /* Maquette, « .acc-h ». La zone de sécurité compte avec viewport-fit=cover. */
  .haut {
    padding: 22px var(--gutter) 0;
    padding-top: max(22px, env(safe-area-inset-top));
  }

  h1 {
    font-size: 28px;
    font-weight: 800;
    letter-spacing: -0.015em;
    line-height: 1.1;
    text-wrap: balance;
  }

  .haut p {
    margin-top: var(--esp-sm);
    color: var(--craie-2);
  }

  /* Maquette, « .apercu » : le cadre coupe net le téléphone à 410 px, sur un trait. */
  .apercu {
    position: relative;
    height: 410px;
    margin-top: 22px;
    overflow: hidden;
    border-bottom: 2px solid var(--trait);
  }

  /* Le téléphone dessiné : 390 × 844 réduit à 62 %, contour craie pâle, ni fond ni ombre. */
  .tel {
    position: absolute;
    left: 50%;
    top: 0;
    width: 390px;
    height: 844px;
    margin-left: -195px;
    transform: scale(0.62);
    transform-origin: top center;
    border: 3px solid var(--craie-3);
    border-radius: 46px;
    padding-top: 34px;
    pointer-events: none;
  }

  /* L'encoche. */
  .tel::before {
    content: "";
    position: absolute;
    top: var(--esp-md);
    left: 50%;
    width: 90px;
    height: var(--esp-sm);
    margin-left: -45px;
    border-radius: var(--esp-hair);
    background: var(--trait);
  }

  /* Les motifs de la feuille, tels que la maquette les dessine. */
  .top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--esp-md) var(--gutter) var(--esp-hair);
    font-size: 14px;
    color: var(--craie-2);
  }

  .chap {
    display: flex;
    align-items: center;
    gap: var(--esp-xs);
    min-height: var(--cible);
    padding: 0 var(--esp-md);
    margin-right: calc(-1 * var(--esp-md));
    color: var(--craie);
    font-weight: 700;
    font-size: 18px;
  }

  .vitals {
    display: grid;
    grid-template-columns: 1.45fr 1fr;
    gap: var(--esp-lg);
    padding: 14px var(--gutter) var(--gutter);
    border-bottom: 2px solid var(--trait);
  }

  .label {
    font-size: 13px;
    color: var(--craie-2);
    letter-spacing: 0.02em;
  }

  .num {
    display: flex;
    flex-wrap: nowrap;
    white-space: nowrap;
    align-items: baseline;
    gap: var(--esp-xs);
    margin-top: 2px;
  }

  .num b {
    font-size: 88px;
    line-height: 0.92;
    font-weight: 800;
    letter-spacing: -0.03em;
  }

  .num span {
    font-size: 24px;
    color: var(--craie-2);
    font-weight: 500;
  }

  .was {
    font-size: 24px;
    font-weight: 700;
    color: var(--rouge);
    text-decoration: line-through;
    text-decoration-thickness: 3px;
    margin-right: var(--esp-hair);
  }

  .side {
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
    border: 0;
  }

  .stat b {
    font-size: 32px;
    font-weight: 800;
    line-height: 1;
  }

  .stat .eff {
    color: var(--vert);
  }

  section {
    padding: var(--esp-lg) var(--gutter) var(--esp-hair);
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

  .row {
    display: flex;
    align-items: center;
    gap: var(--esp-md);
    min-height: var(--ligne);
    padding: var(--esp-sm) 0;
    border-bottom: 1px solid var(--trait);
  }

  .row .n {
    flex: 1;
  }

  .row .v {
    font-weight: 700;
    font-size: 18px;
  }

  .effect .n {
    color: var(--vert);
  }

  .effect .d {
    font-size: 14px;
    color: var(--craie-2);
  }

  .tally {
    display: flex;
    gap: 3px;
    margin: var(--esp-hair) 0 var(--esp-xs);
  }

  .tally i {
    width: var(--esp-xs);
    height: var(--esp-lg);
    border-radius: var(--rayon-tick);
    background: var(--trait);
  }

  .tally i.f {
    background: var(--craie);
  }

  /* Maquette, « .legende » : 10 px sous le trait. */
  .legende {
    margin-top: 10px;
    text-align: center;
    font-size: 15px;
    color: var(--craie-2);
  }

  /* Maquette, « .dock .mention » : centrée, 8 px sous le bouton. */
  .mention {
    margin-top: var(--esp-sm);
    text-align: center;
    font-size: 13px;
    color: var(--craie-3);
  }
</style>
