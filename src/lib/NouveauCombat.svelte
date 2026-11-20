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
  import Indice from "./Indice.svelte";
  import EnTeteDEcran from "./EnTeteDEcran.svelte";
  import BoutonPlein from "./BoutonPlein.svelte";
  import Icone from "./Icone.svelte";
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
    <EnTeteDEcran
      titre="Nouveau combat"
      retour="Annuler le combat"
      onretour={onannuler}
    >
      {#snippet intro()}Recopiez la fiche de l'ennemi donnée par le livre.{/snippet}
    </EnTeteDEcran>

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
        <Indice icone="info">
          Au-delà de {ADVERSAIRES_MAX_EN_NARRATIF} adversaires, le combat se joue
          aux dés, même en mode narratif.
        </Indice>
      {/if}
      {#if sejoue}
        <Indice icone="info">
          Vous&nbsp;: <b>DEX {lecteur.dexterite}</b>, dégâts <b>{degats}</b>.
          Plusieurs adversaires comptent comme un seul.
        </Indice>
      {/if}

      <Dock>
        <BoutonPlein type="submit" inactif={manque !== null}>
          {#if sejoue}
            <Icone nom="epees" />
          {/if}
          {manque ?? (sejoue ? "Commencer le combat" : "Continuer")}
        </BoutonPlein>
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

  /* Désactivé : le libellé dit ce qui manque. */
</style>
