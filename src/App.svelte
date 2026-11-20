<script lang="ts">
  import Armes from "./lib/Armes.svelte";
  import Besace from "./lib/Besace.svelte";
  import BlocVital from "./lib/BlocVital.svelte";
  import DockDeDes from "./lib/DockDeDes.svelte";
  import EcranDeCombat from "./lib/EcranDeCombat.svelte";
  import DerniersCombats from "./lib/DerniersCombats.svelte";
  import EcranDesCombats from "./lib/EcranDesCombats.svelte";
  import Effets from "./lib/Effets.svelte";
  import EnTete from "./lib/EnTete.svelte";
  import Notes from "./lib/Notes.svelte";
  import SectionAventure from "./lib/SectionAventure.svelte";
  import NouveauCombat from "./lib/NouveauCombat.svelte";
  import NouvelApprenti from "./lib/NouvelApprenti.svelte";
  import ResultatDuCombat from "./lib/ResultatDuCombat.svelte";
  import { apresLaMort, resume, type Aventure } from "./lib/aventure";
  import {
    commencerUnCombat,
    ficheDuLecteur,
    interrompreLeCombat,
    jouerJusquALaFin,
    jouerUnTour,
    type Combat,
    type CombatNarratif,
    type NouveauCombat as Nouveau,
  } from "./lib/combat";
  import { deAuHasard, type De } from "./lib/des";
  import { baseApres, valeursEffectives } from "./lib/valeursEffectives";
  import { garderEcranAllume } from "./lib/ecranAllume";
  import {
    poserUneSauvegarde,
    reprendreLaSauvegarde,
    sauvegardesRestantes,
  } from "./lib/sauvegardes";
  import {
    ecrireAventure,
    effacerAventure,
    lireAventure,
  } from "./lib/stockage";

  interface Props {
    /** Les tests injectent des dés fixés. */
    de?: De;
  }

  let { de = deAuHasard }: Props = $props();

  let aventure = $state<Aventure | null>(lireAventure(localStorage));

  // Rien ne se perd : chaque changement de l'aventure est enregistré aussitôt.
  $effect(() => {
    if (aventure) ecrireAventure(localStorage, $state.snapshot(aventure));
  });

  $effect(garderEcranAllume);

  /*
   * LE COMBAT. Le combat en cours vit dans l'aventure (il se retrouve après
   * rechargement) ; « Nouveau combat » et l'écran de résultat sont de simples
   * écrans, oubliés au rechargement.
   */
  let saisieDuCombat = $state(false);
  /** L'écran « Combats » : `ouvert` est le rang du combat déplié à l'ouverture. */
  let historique = $state<{ ouvert: number | null } | null>(null);
  /** Le combat qui vient de finir, montré par l'écran de résultat. */
  let resultat = $state<Combat | null>(null);
  /** PV et CHANCE d'avant le combat : la trace de craie au retour sur la feuille. */
  let avantLeCombat = $state<{ pointsDeVie?: number; chance?: number }>({});

  /** Le prochain écran s'ouvre en haut de la page. */
  function remonter() {
    document.documentElement.scrollTop = 0;
  }

  function ouvrirLeCombat() {
    avantLeCombat = {};
    saisieDuCombat = true;
    remonter();
  }

  function ouvrirLHistorique(ouvert: number | null = null) {
    historique = { ouvert };
    remonter();
  }

  function commencer(nouveau: Nouveau) {
    saisieDuCombat = false;
    suivre(
      commencerUnCombat(nouveau, ficheDuLecteur(valeursEffectives(aventure!))),
    );
  }

  /**
   * Mode narratif : le lecteur a indiqué l'issue. Rien n'est joué, donc ni PV
   * ni CHANCE ne bougent sur la feuille ; le combat rejoint l'historique.
   */
  function noterLIssue(combat: CombatNarratif) {
    saisieDuCombat = false;
    aventure!.combats.push(combat);
    remonter();
  }

  /**
   * Les PV et la CHANCE de la feuille suivent ceux du combat après chaque
   * tour. Ce sont des valeurs affichées : elles s'enregistrent dans la base
   * (valeursEffectives.ts). Fini, le combat rejoint l'historique.
   */
  function suivre(combat: Combat) {
    const { personnage, effets } = aventure!;
    personnage.pointsDeVie = baseApres(
      "pointsDeVie",
      combat.pointsDeVie.lecteur,
      effets,
    );
    personnage.chance = baseApres("chance", combat.chance, effets);
    if (combat.issue === null) {
      aventure!.combat = combat;
      return;
    }
    aventure!.combat = null;
    aventure!.combats.push(combat);
    resultat = combat;
    remonter();
  }

  /**
   * Mode simplifié : poser une sauvegarde (elle garde le chapitre et l'état
   * du personnage, voir sauvegardes.ts) et reprendre la plus récente. Après un
   * combat perdu, la reprise le note dans l'historique (« repris au § 52 »).
   */
  function sauvegarder() {
    aventure = poserUneSauvegarde($state.snapshot(aventure!));
  }

  function reprendre(apresUnCombatPerdu = false) {
    aventure = reprendreLaSauvegarde($state.snapshot(aventure!), {
      apresUnCombatPerdu,
    });
    resultat = null;
    avantLeCombat = {};
    remonter();
  }

  /**
   * Fin d'aventure. « Recommencer une aventure » (tous les modes) efface tout
   * de l'appareil et rouvre « Nouvel apprenti ». En mode mortel, à 0 PV,
   * accepter la proposition ouvre « Nouvel apprenti » avec le mode mortel et
   * garde les notes ; l'ancienne aventure reste enregistrée jusqu'à ce que le
   * nouveau personnage soit créé (fermer l'app entre-temps la retrouve).
   */
  let mort = $state<{ notes: string } | null>(null);
  /** Le lecteur a ignoré la proposition de recommencer ; elle revient quand ses PV retombent à 0. */
  let propositionIgnoree = $state(false);

  $effect(() => {
    if (!aventure) return;
    const { pointsDeVie } = valeursEffectives(aventure);
    // Tant que les PV sont au-dessus de 0, il n'y a plus de proposition à ignorer.
    if (pointsDeVie > 0) propositionIgnoree = false;
  });

  function toutOublierDeLEcran() {
    saisieDuCombat = false;
    historique = null;
    resultat = null;
    avantLeCombat = {};
    propositionIgnoree = false;
    remonter();
  }

  function recommencerLAventure() {
    effacerAventure(localStorage);
    mort = null;
    aventure = null;
    toutOublierDeLEcran();
  }

  function recommencerApresLaMort() {
    mort = { notes: aventure!.notes };
    aventure = null;
    toutOublierDeLEcran();
  }

  /** Retour sur la feuille : la trace de craie montre ce que le combat a changé. */
  function revenirALaFeuille({ depart }: Combat) {
    avantLeCombat = {
      pointsDeVie: depart.lecteur.pointsDeVie,
      chance: depart.lecteur.chance,
    };
    resultat = null;
    remonter();
  }

  /** Le lecteur quitte en cours : ce qui a été joué reste acquis et noté. */
  function quitter(combat: Combat) {
    aventure!.combat = null;
    if (combat.jets.length > 0)
      aventure!.combats.push(interrompreLeCombat(combat));
    revenirALaFeuille(combat);
  }
</script>

{#if aventure?.combat}
  {@const combat = aventure.combat}
  <EcranDeCombat
    {combat}
    ontour={() => suivre(jouerUnTour(combat, de))}
    onfinir={() => suivre(jouerJusquALaFin(combat, de))}
    onquitter={() => quitter(combat)}
  />
{:else if aventure && resultat}
  {@const combat = resultat}
  <ResultatDuCombat
    {combat}
    mode={aventure.mode}
    sauvegarde={aventure.sauvegarde}
    sauvegardesRestantes={sauvegardesRestantes(aventure)}
    onreprendre={() => reprendre(true)}
    onrecommencer={recommencerApresLaMort}
    onretour={() => {
      // « Le livre me laisse continuer » : la proposition de recommencer est ignorée.
      if (combat.issue === "perdu") propositionIgnoree = true;
      revenirALaFeuille(combat);
    }}
    ondetail={() => {
      // Le combat qui vient de finir est le dernier de l'historique. Le retour
      // se fait vers la feuille, qui joue alors la trace de craie.
      revenirALaFeuille(combat);
      ouvrirLHistorique(aventure!.combats.length - 1);
    }}
  />
{:else if aventure && historique}
  <EcranDesCombats
    combats={aventure.combats}
    ouvertAuDepart={historique.ouvert}
    onretour={() => {
      historique = null;
      remonter();
    }}
  />
{:else if aventure && saisieDuCombat}
  <NouveauCombat
    chapitre={aventure.chapitre}
    lecteur={ficheDuLecteur(valeursEffectives(aventure))}
    mode={aventure.mode}
    oncommencer={commencer}
    onissue={noterLIssue}
    onannuler={() => (saisieDuCombat = false)}
  />
{:else if aventure}
  {@const { chance } = valeursEffectives(aventure)}
  <main class="feuille">
    <EnTete
      resume={resume(aventure)}
      chapitre={aventure.chapitre}
      onchapitre={(chapitre) => (aventure!.chapitre = chapitre)}
    />
    <BlocVital
      bind:personnage={aventure.personnage}
      effets={aventure.effets}
      mode={aventure.mode}
      sauvegardesUtilisees={aventure.sauvegardesUtilisees}
      onsauvegardes={(utilisees) =>
        (aventure!.sauvegardesUtilisees = utilisees)}
      avant={avantLeCombat}
      {propositionIgnoree}
      onignorer={() => (propositionIgnoree = true)}
      onrecommencer={recommencerApresLaMort}
    />
    <Armes
      bind:armes={aventure.armes}
      effets={aventure.effets}
      oncombattre={ouvrirLeCombat}
    />
    <Effets
      bind:effets={aventure.effets}
      bind:personnage={aventure.personnage}
      armes={aventure.armes}
    />
    <!--
      Ordre de la feuille (maquette) : les Derniers combats suivent la
      Besace ; la section Aventure suit les Notes, tout en bas.
    -->
    <Besace bind:besace={aventure.besace} />
    <DerniersCombats
      combats={aventure.combats}
      onhistorique={() => ouvrirLHistorique()}
    />
    <Notes bind:notes={aventure.notes} />
    <SectionAventure
      mode={aventure.mode}
      sauvegardesUtilisees={aventure.sauvegardesUtilisees}
      sauvegarde={aventure.sauvegarde}
      onsauvegarder={sauvegarder}
      onreprendre={() => reprendre()}
      onrecommencer={recommencerLAventure}
    />
  </main>
  <!-- La CHANCE disponible est la CHANCE effective ; la dépense sort de la base (valeursEffectives.ts). -->
  <DockDeDes
    {de}
    {chance}
    ondepenser={(points) =>
      (aventure!.personnage.chance = baseApres(
        "chance",
        Math.max(0, chance - points),
        aventure!.effets,
      ))}
  />
{:else}
  <NouvelApprenti
    {de}
    apresLaMort={mort !== null}
    oncommencer={(nouvelle) => {
      aventure = mort ? apresLaMort(nouvelle, mort) : nouvelle;
      mort = null;
    }}
  />
{/if}

<style>
  .feuille {
    max-width: 480px;
    margin: 0 auto;
    /* Place pour le dock fixe : 12 + 58 + 22 px, plus la zone de sécurité. */
    padding-bottom: calc(92px + env(safe-area-inset-bottom));
  }
</style>
