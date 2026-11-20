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
  import EcranDuPlan from "./lib/EcranDuPlan.svelte";
  import Notes from "./lib/Notes.svelte";
  import Plans from "./lib/Plans.svelte";
  import SectionAventure from "./lib/SectionAventure.svelte";
  import NouveauCombat from "./lib/NouveauCombat.svelte";
  import NouvelApprenti from "./lib/NouvelApprenti.svelte";
  import ResultatDuCombat from "./lib/ResultatDuCombat.svelte";
  import { apresLaMort, resume, type Aventure } from "./lib/aventure";
  import {
    commencerUnCombat,
    ficheDuLecteur,
    jouerJusquALaFin,
    jouerUnTour,
    type Combat,
    type CombatNarratif,
    type NouveauCombat as Nouveau,
  } from "./lib/combat";
  import { deAuHasard, type De } from "./lib/des";
  import {
    apresLeTour,
    ecranDeDepart,
    fermerLHistorique,
    laFeuille,
    ouvrirLHistorique,
    retourDuCombat,
    type Ecran,
  } from "./lib/ecrans";
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
  import { quitterLeCombat, suivreLeCombat } from "./lib/suiviDuCombat";

  interface Props {
    /** Les tests injectent des dés fixés. */
    de?: De;
  }

  let { de = deAuHasard }: Props = $props();

  const lue = lireAventure(localStorage);
  let aventure = $state<Aventure | null>(lue);

  // Rien ne se perd : chaque changement de l'aventure est enregistré aussitôt.
  $effect(() => {
    if (aventure) ecrireAventure(localStorage, $state.snapshot(aventure));
  });

  $effect(garderEcranAllume);

  /*
   * L'ÉCRAN. Un seul écran à la fois (ecrans.ts) ; il est oublié au
   * rechargement, sauf le combat en cours, qui vit dans l'aventure.
   */
  let ecran = $state<Ecran>(ecranDeDepart(lue));

  /** Le plan de l'écran ouvert, s'il existe encore. */
  const planOuvert = $derived.by(() => {
    const ouvert = ecran;
    if (ouvert.nom !== "plan") return undefined;
    return aventure?.plans.find((plan) => plan.id === ouvert.id);
  });

  /** Ouvre un écran ; il s'ouvre en haut de la page. */
  function aller(suivant: Ecran) {
    ecran = suivant;
    document.documentElement.scrollTop = 0;
  }

  function commencer(nouveau: Nouveau) {
    suivre(
      commencerUnCombat(nouveau, ficheDuLecteur(valeursEffectives(aventure!))),
    );
  }

  /**
   * Mode narratif : le lecteur a indiqué l'issue. Rien n'est joué, donc ni PV
   * ni CHANCE ne bougent sur la feuille ; le combat rejoint l'historique.
   */
  function noterLIssue(combat: CombatNarratif) {
    aventure!.combats.push(combat);
    aller(laFeuille());
  }

  /** Après chaque tour, la feuille suit le combat (suiviDuCombat.ts). */
  function suivre(combat: Combat) {
    aventure = suivreLeCombat(aventure!, combat);
    const suivant = apresLeTour(combat);
    if (suivant.nom === "resultat") aller(suivant);
    else ecran = suivant;
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
    aller(laFeuille());
  }

  /** Le lecteur a ignoré la proposition de recommencer ; elle revient quand ses PV retombent à 0. */
  let propositionIgnoree = $state(false);

  $effect(() => {
    if (!aventure) return;
    const { pointsDeVie } = valeursEffectives(aventure);
    // Tant que les PV sont au-dessus de 0, il n'y a plus de proposition à ignorer.
    if (pointsDeVie > 0) propositionIgnoree = false;
  });

  /**
   * Fin d'aventure. « Recommencer une aventure » (tous les modes) efface tout
   * de l'appareil et rouvre « Nouvel apprenti ». En mode mortel, à 0 PV,
   * accepter la proposition ouvre « Nouvel apprenti » avec le mode mortel et
   * garde les notes ; l'ancienne aventure reste enregistrée jusqu'à ce que le
   * nouveau personnage soit créé (fermer l'app entre-temps la retrouve).
   */
  function recommencer(apresLaMort: Pick<Aventure, "notes" | "plans"> | null) {
    aventure = null;
    propositionIgnoree = false;
    aller({ nom: "nouvelApprenti", apresLaMort });
  }

  function recommencerLAventure() {
    effacerAventure(localStorage);
    recommencer(null);
  }

  function recommencerApresLaMort() {
    recommencer({
      notes: aventure!.notes,
      plans: $state.snapshot(aventure!.plans),
    });
  }

  function quitter(combat: Combat) {
    aventure = quitterLeCombat(aventure!, combat);
    aller(retourDuCombat(combat));
  }
</script>

{#if !aventure || ecran.nom === "nouvelApprenti"}
  {@const mort = ecran.nom === "nouvelApprenti" ? ecran.apresLaMort : null}
  <NouvelApprenti
    {de}
    apresLaMort={mort !== null}
    oncommencer={(nouvelle) => {
      aventure = mort ? apresLaMort(nouvelle, mort) : nouvelle;
      ecran = laFeuille();
    }}
  />
{:else if ecran.nom === "combat" && aventure.combat}
  {@const combat = aventure.combat}
  <EcranDeCombat
    {combat}
    ontour={() => suivre(jouerUnTour(combat, de))}
    onfinir={() => suivre(jouerJusquALaFin(combat, de))}
    onquitter={() => quitter(combat)}
  />
{:else if ecran.nom === "resultat"}
  {@const combat = ecran.combat}
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
      aller(retourDuCombat(combat));
    }}
    ondetail={() =>
      // Le combat qui vient de finir est le dernier de l'historique. Le retour
      // se fait vers la feuille, qui joue alors la trace de craie.
      aller(
        ouvrirLHistorique(retourDuCombat(combat), aventure!.combats.length - 1),
      )}
  />
{:else if ecran.nom === "historique"}
  <EcranDesCombats
    combats={aventure.combats}
    ouvertAuDepart={ecran.deplie}
    onretour={() => aller(fermerLHistorique(ecran))}
  />
{:else if planOuvert}
  {@const plan = planOuvert}
  <EcranDuPlan
    {plan}
    onrenommer={(nom) => (plan.nom = nom)}
    onretour={() => aller(laFeuille())}
    onsupprimer={() => {
      aventure!.plans = aventure!.plans.filter((p) => p.id !== plan.id);
      aller(laFeuille());
    }}
  />
{:else if ecran.nom === "nouveauCombat"}
  <NouveauCombat
    chapitre={aventure.chapitre}
    lecteur={ficheDuLecteur(valeursEffectives(aventure))}
    mode={aventure.mode}
    oncommencer={commencer}
    onissue={noterLIssue}
    onannuler={() => (ecran = laFeuille())}
  />
{:else if ecran.nom === "feuille"}
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
      avant={ecran.avant}
      {propositionIgnoree}
      onignorer={() => (propositionIgnoree = true)}
      onrecommencer={recommencerApresLaMort}
    />
    <Armes
      bind:armes={aventure.armes}
      effets={aventure.effets}
      oncombattre={() => aller({ nom: "nouveauCombat" })}
    />
    <Effets
      bind:effets={aventure.effets}
      bind:personnage={aventure.personnage}
      armes={aventure.armes}
    />
    <!--
      Ordre de la feuille (maquette) : les Derniers combats suivent la
      Besace ; les Plans suivent les Notes ; la section Aventure vient
      ensuite, tout en bas.
    -->
    <Besace bind:besace={aventure.besace} />
    <DerniersCombats
      combats={aventure.combats}
      onhistorique={() => aller(ouvrirLHistorique(ecran))}
    />
    <Notes bind:notes={aventure.notes} />
    <Plans
      bind:plans={aventure.plans}
      onouvrir={(id) => aller({ nom: "plan", id })}
    />
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
{/if}

<style>
  .feuille {
    max-width: 480px;
    margin: 0 auto;
    /* Place pour le dock fixe : 12 + 58 + 22 px, plus la zone de sécurité. */
    padding-bottom: calc(92px + env(safe-area-inset-bottom));
  }
</style>
