<script lang="ts">
  /**
   * Écran plein « Nouveau combat » : le lecteur recopie la fiche de l'ennemi
   * donnée par le livre. Pas de nom à taper : le combat est repéré par son
   * chapitre, prérempli avec le dernier chapitre lu. Puis DEXTÉRITÉ, PV,
   * adversaires et bonus de dégâts (0 par défaut), et qui frappe en premier.
   * L'indice rappelle les chiffres effectifs du lecteur.
   *
   * Mode narratif : jusqu'à 5 adversaires, le formulaire ne demande que le
   * chapitre et le nombre d'adversaires, puis ouvre l'écran « Gagné » /
   * « Perdu » (IssueDuCombat.svelte) : les statistiques de l'ennemi ne sont
   * demandées que si le combat se joue, soit au-delà de 5 adversaires, soit
   * parce que le lecteur choisit « Jouer le combat aux dés ».
   */
  import { untrack } from "svelte";
  import { MODES, type Mode } from "./aventure";
  import ChampNumerique from "./ChampNumerique.svelte";
  import {
    ADVERSAIRES_MAX_EN_NARRATIF,
    ceQuiManqueALIssue,
    ceQuiManqueAuCombat,
    combatNarratif,
    lecteurChoisitLIssue,
    nouveauCombat,
    type CombatNarratif,
    type FicheDuLecteur,
    type NouveauCombat,
  } from "./combat";
  import Dock from "./Dock.svelte";
  import { formuleDeDegats } from "./historique";
  import IssueDuCombat from "./IssueDuCombat.svelte";

  interface Props {
    /** Dernier chapitre lu : le chapitre du combat par défaut. */
    chapitre: number;
    /** Les valeurs effectives du lecteur, pour l'indice. */
    lecteur: FicheDuLecteur;
    /** Le mode de jeu : le narratif laisse dire l'issue d'un petit groupe. */
    mode: Mode;
    oncommencer: (nouveau: NouveauCombat) => void;
    /** Mode narratif : le lecteur a indiqué l'issue, rien n'est joué. */
    onissue: (combat: CombatNarratif) => void;
    onannuler: () => void;
  }

  let {
    chapitre: dernierChapitre,
    lecteur,
    mode,
    oncommencer,
    onissue,
    onannuler,
  }: Props = $props();

  let brouillon = $state({
    chapitre: untrack(() => dernierChapitre) as number | null,
    dexterite: null as number | null,
    pointsDeVie: null as number | null,
    adversaires: 1 as number | null,
    bonus: 0 as number | null,
    ennemiEnPremier: false,
  });
  /** Narratif : le lecteur a demandé à jouer un combat dont il aurait pu dire l'issue. */
  let jouerQuandMeme = $state(false);
  /** L'écran « Gagné » / « Perdu » remplace le formulaire. */
  let aLIssue = $state(false);

  /** Le combat se joue : la fiche de l'ennemi est demandée en entier. */
  const sejoue = $derived(
    jouerQuandMeme || !lecteurChoisitLIssue(mode, brouillon.adversaires ?? 1),
  );
  const manque = $derived(
    sejoue ? ceQuiManqueAuCombat(brouillon) : ceQuiManqueALIssue(brouillon),
  );

  /** « 1 + 1 dé + 1 », « 1 + 1 dé », « 1 + 1 dé − 2 ». */
  const degats = $derived(formuleDeDegats(lecteur.bonus));

  function commencer(event: SubmitEvent) {
    event.preventDefault();
    if (manque !== null) return;
    if (sejoue) oncommencer(nouveauCombat(brouillon));
    else aLIssue = true;
  }
</script>

{#if aLIssue}
  <IssueDuCombat
    chapitre={brouillon.chapitre!}
    adversaires={brouillon.adversaires!}
    onissue={(issue) =>
      onissue(
        combatNarratif(brouillon.chapitre!, brouillon.adversaires!, issue),
      )}
    onjouer={() => {
      jouerQuandMeme = true;
      aLIssue = false;
    }}
    {onannuler}
  />
{:else}
  <main class="ecran">
    <div class="screen-h">
      <button
        class="retour"
        type="button"
        aria-label="Annuler le combat"
        onclick={onannuler}
      >
        <svg class="i" aria-hidden="true" viewBox="0 0 24 24">
          <path d="M15 6l-6 6 6 6" />
        </svg>
      </button>
      <h1>Nouveau combat</h1>
    </div>
    <p class="intro">Recopiez la fiche de l'ennemi donnée par le livre.</p>

    <form aria-label="Fiche de l'ennemi" onsubmit={commencer}>
      <ChampNumerique
        nom="Chapitre du combat"
        prefixe="§&nbsp;"
        min={1}
        bind:valeur={brouillon.chapitre}
      />
      <div class="pair">
        {#if sejoue}
          <ChampNumerique
            nom="Dextérité"
            min={1}
            bind:valeur={brouillon.dexterite}
          />
          <ChampNumerique
            nom="Points de vie"
            min={1}
            bind:valeur={brouillon.pointsDeVie}
          />
        {/if}
        <!-- Seul à jouer (narratif, jusqu'à 5) : le champ prend toute la largeur. -->
        <div class="adversaires" class:seul={!sejoue}>
          <ChampNumerique
            nom="Adversaires"
            min={1}
            bind:valeur={brouillon.adversaires}
          />
        </div>
        {#if sejoue}
          <ChampNumerique
            nom="Bonus de dégâts"
            min={-99}
            bind:valeur={brouillon.bonus}
          />
        {/if}
      </div>
      {#if sejoue}
        <label class="toggle">
          <span>L'ennemi frappe en premier</span>
          <input
            class="sr"
            type="checkbox"
            role="switch"
            bind:checked={brouillon.ennemiEnPremier}
          />
          <span class="sw" aria-hidden="true"></span>
        </label>
      {/if}
      {#if MODES[mode].issueAuChoix}
        <div class="hint">
          <svg class="i" aria-hidden="true" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7.5h.01" />
          </svg>
          <span>
            Au-delà de {ADVERSAIRES_MAX_EN_NARRATIF} adversaires, le combat se joue
            aux dés, même en mode narratif.
          </span>
        </div>
      {/if}
      {#if sejoue}
        <div class="hint">
          <svg class="i" aria-hidden="true" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7.5h.01" />
          </svg>
          <span>
            Vous&nbsp;: <b>DEX {lecteur.dexterite}</b>, dégâts <b>{degats}</b>.
            Plusieurs adversaires comptent comme un seul.
          </span>
        </div>
      {/if}

      <Dock>
        <button class="cta" type="submit" aria-disabled={manque !== null}>
          {#if sejoue}
            <svg class="i" aria-hidden="true" viewBox="0 0 24 24">
              <path
                d="M14.5 17.5 3 6V3h3l11.5 11.5M13 19l6-6M16 16l4 4M19 21l2-2"
              />
            </svg>
          {/if}
          {manque ?? (sejoue ? "Commencer le combat" : "Continuer")}
        </button>
      </Dock>
    </form>
  </main>
{/if}

<style>
  .ecran {
    max-width: 480px;
    margin: 0 auto;
    /* Place pour le dock fixe : 12 + 58 + 22 px, plus la zone de sécurité. */
    padding-bottom: calc(92px + env(safe-area-inset-bottom));
  }

  .screen-h {
    display: flex;
    align-items: center;
    gap: var(--esp-sm);
    padding: var(--gutter) var(--gutter) var(--esp-xs);
    padding-top: max(var(--gutter), env(safe-area-inset-top));
  }

  .retour {
    display: grid;
    place-items: center;
    width: var(--cible);
    height: var(--cible);
    margin-left: -12px;
    color: var(--craie-2);
  }

  h1 {
    flex: 1;
    font-size: 28px;
    font-weight: 800;
    letter-spacing: -0.015em;
  }

  .intro {
    padding: 0 var(--gutter);
    font-size: 15px;
    color: var(--craie-2);
  }

  form {
    padding: 0 var(--gutter);
  }

  .pair {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--esp-md);
  }

  .adversaires.seul {
    grid-column: 1 / -1;
  }

  .toggle {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 52px;
    margin-top: 10px;
    cursor: pointer;
  }

  .sw {
    position: relative;
    flex: none;
    width: 52px;
    height: 32px;
    background: var(--ardoise-2);
    border: 2px solid var(--craie-3);
    border-radius: 16px;
  }

  .sw::after {
    content: "";
    position: absolute;
    top: 4px;
    left: 4px;
    width: 20px;
    height: 20px;
    background: var(--craie-3);
    border-radius: var(--rayon-round);
  }

  /* Activé : le jaune des choix cochés (DESIGN.md, « Craie jaune »). */
  .toggle:has(:checked) .sw {
    border-color: var(--jaune);
  }

  .toggle:has(:checked) .sw::after {
    left: 24px;
    background: var(--jaune);
  }

  .toggle:has(:focus-visible) .sw {
    outline: 2px solid var(--jaune);
    outline-offset: 3px;
  }

  .hint {
    display: flex;
    gap: 10px;
    margin-top: 14px;
    padding: 10px 0 0;
    border-top: 2px solid var(--trait);
    font-size: 14px;
    color: var(--craie-2);
  }

  .hint svg {
    flex: none;
    width: 20px;
    height: 20px;
    margin-top: 1px;
    color: var(--jaune);
  }

  .hint b {
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

  .cta svg {
    width: 26px;
    height: 26px;
  }

  /* Désactivé : le libellé dit ce qui manque. */
  .cta[aria-disabled="true"] {
    background: none;
    border-color: var(--craie-3);
    color: var(--craie-3);
    cursor: default;
  }
</style>
