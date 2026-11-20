<script lang="ts">
  /**
   * Haut de la feuille : PV et boutons « − » / « + » à gauche, CHANCE et
   * DEXTÉRITÉ à droite. Chaque valeur se corrige à la main d'un appui, et
   * chaque changement laisse la trace de craie (voir TraceDeCraie.svelte).
   *
   * Les valeurs affichées sont les valeurs effectives (base + effets, voir
   * valeursEffectives.ts) : en vert, avec la ligne « base 7 · potion +1 », quand un effet
   * les change. « − », « + » et les corrections à la main portent sur la
   * valeur affichée ; `baseApres` en tire la base à enregistrer.
   *
   * PV et PV max sont deux valeurs distinctes : un effet sur les PV peut les
   * porter au-dessus du maximum. Le gros chiffre est alors suivi de sa
   * décomposition en vert, empilée au-dessus du maximum : « 36 (34 + 2) / 34 ».
   * Le « + » s'arrête quand la base atteint le maximum (36 avec un effet +2
   * sur un maximum de 34), et l'indice de dépassement ne parle que d'une base
   * au-dessus du maximum, saisie à la main : le dépassement dû à un effet est
   * voulu.
   *
   * En mode simplifié, la pile de droite se termine par les sauvegardes : trois
   * traits de craie, un de moins (en `trait`, discret) par sauvegarde utilisée.
   * Un appui sur les traits ouvre le panneau qui corrige le nombre utilisé.
   *
   * En mode mortel, à 0 PV, un indice PROPOSE de recommencer au chapitre 1
   * avec un nouveau personnage : « Recommencer au chapitre 1 » demande
   * confirmation (ConfirmerLeRecommencement.svelte), « Ignorer » le cache.
   * Il n'empêche rien et ne décide rien ; les autres modes n'en ont pas.
   */
  import Icone from "./Icone.svelte";
  import Indice from "./Indice.svelte";
  import {
    ajouterUnPointDeVie,
    depasseLeMaximum,
    estCritique,
    estUneChance,
    estUneDexterite,
    estUnMaximumDePointsDeVie,
    estUnPointDeVieActuel,
    proposeDeRecommencer,
    MODES,
    retirerUnPointDeVie,
    SAUVEGARDES_DU_LIVRE,
    type Mode,
    type Personnage,
  } from "./aventure";
  import ConfirmerLeRecommencement from "./ConfirmerLeRecommencement.svelte";
  import type { AvantLeCombat } from "./ecrans";
  import { sauvegardesRestantes } from "./sauvegardes";
  import SauvegardesUtilisees from "./SauvegardesUtilisees.svelte";
  import {
    baseApres,
    detaillerLePersonnage,
    valeurEffective,
    type Effet,
    type ValeurDuPersonnage,
  } from "./valeursEffectives";
  import TraceDeCraie from "./TraceDeCraie.svelte";
  import ValeurEditable from "./ValeurEditable.svelte";

  interface Props {
    /** Les bases, sans les effets. */
    personnage: Personnage;
    effets: readonly Effet[];
    /** Les sauvegardes n'existent qu'en mode simplifié. */
    mode: Mode;
    /** Sauvegardes déjà consommées (0 à 3), corrigeables à la main. */
    sauvegardesUtilisees: number;
    onsauvegardes: (utilisees: number) => void;
    /**
     * PV et CHANCE affichés avant un combat, au retour sur la feuille : la
     * trace de craie montre ce que le combat a changé.
     */
    avant?: AvantLeCombat;
    /** Le lecteur a ignoré la proposition de recommencer : on ne la remontre pas. */
    propositionIgnoree?: boolean;
    onignorer?: () => void;
    /** Le lecteur a confirmé : on repart au chapitre 1 avec un nouveau personnage. */
    onrecommencer?: () => void;
  }

  let {
    personnage = $bindable(),
    effets,
    mode,
    sauvegardesUtilisees,
    onsauvegardes,
    avant = {},
    propositionIgnoree = false,
    onignorer = () => {},
    onrecommencer = () => {},
  }: Props = $props();
  const id = $props.id();

  /** La valeur affichée et sa ligne d'explication (`null` sans effet). */
  const affiche = $derived(detaillerLePersonnage({ personnage, effets }));
  const pv = $derived(affiche.pointsDeVie.valeur);
  const max = $derived(affiche.pointsDeVieMax.valeur);
  /** « (34 + 2) » à côté du gros chiffre, quand un effet vise les PV. */
  const detail = $derived(affiche.pointsDeVie.decomposition);
  /** Où le « + » s'arrête : la base au maximum, plus les effets sur les PV. */
  const plafond = $derived(valeurEffective("pointsDeVie", max, effets));

  /** Le lecteur change la valeur affichée : on enregistre la base qui la donne. */
  function changer(cible: ValeurDuPersonnage, valeur: number) {
    personnage[cible] = baseApres(cible, valeur, effets);
  }

  /** CHANCE et DEXTÉRITÉ, dans la pile de droite. */
  const STATS = [
    { cible: "chance", nom: "Chance", champ: "CHANCE", valide: estUneChance },
    {
      cible: "dexterite",
      nom: "Dextérité",
      champ: "DEXTÉRITÉ",
      valide: estUneDexterite,
    },
  ] as const;

  const critique = $derived(estCritique(pv));
  const restantes = $derived(
    sauvegardesRestantes({ mode, sauvegardesUtilisees }),
  );
  let correction = $state(false);
  let confirmation = $state(false);
  const propose = $derived(proposeDeRecommencer(mode, pv));
  const remplissage = $derived(Math.min(100, Math.max(0, (pv / max) * 100)));
</script>

<div class="vital">
  <div class="pv" role="group" aria-labelledby="{id}-pv">
    <div class="etiquette">
      <span id="{id}-pv">Points de vie</span>
      {#if affiche.pointsDeVie.explication}
        <small data-etat="modifie">{affiche.pointsDeVie.explication}</small>
      {/if}
      {#if affiche.pointsDeVieMax.explication}
        <small data-etat="modifie">
          max : {affiche.pointsDeVieMax.explication}
        </small>
      {/if}
    </div>
    <div class="num">
      <TraceDeCraie valeur={pv} taille="24px" depuis={avant.pointsDeVie} />
      <b
        data-etat={critique
          ? "critique"
          : affiche.pointsDeVie.explication !== null
            ? "modifie"
            : undefined}
      >
        <ValeurEditable
          valeur={pv}
          nom="Points de vie"
          champ="Points de vie actuels"
          tailleSaisie="52px"
          valide={estUnPointDeVieActuel}
          onchange={(valeur) => changer("pointsDeVie", valeur)}
        />
      </b>
      <span class="apres">
        {#if detail}
          <small class="detail" data-etat="modifie">{detail}</small>
        {/if}
        <span
          class="max"
          data-etat={affiche.pointsDeVieMax.explication !== null
            ? "modifie"
            : undefined}
        >
          /
          <TraceDeCraie valeur={max} taille="24px" />
          <ValeurEditable
            valeur={max}
            nom="Points de vie maximum"
            champ="Points de vie maximum"
            valide={estUnMaximumDePointsDeVie}
            onchange={(valeur) => changer("pointsDeVieMax", valeur)}
          />
        </span>
      </span>
    </div>
    <div class="barre" aria-hidden="true">
      <u
        data-etat={critique ? "critique" : undefined}
        style:width="{remplissage}%"
      ></u>
    </div>
    {#if critique}<span class="sr">état critique</span>{/if}
    <div class="steps">
      <button
        class="step moins"
        type="button"
        aria-label="Retirer un point de vie"
        onclick={() => changer("pointsDeVie", retirerUnPointDeVie(pv))}
      >
        <Icone nom="moins" />
      </button>
      <button
        class="step"
        type="button"
        aria-label="Ajouter un point de vie"
        onclick={() => changer("pointsDeVie", ajouterUnPointDeVie(pv, plafond))}
      >
        <Icone nom="plus" />
      </button>
    </div>
  </div>
  <div class="pile">
    {#each STATS as { cible, nom, champ, valide } (cible)}
      {@const { valeur, explication } = affiche[cible]}
      <div class="stat" role="group" aria-labelledby="{id}-{cible}">
        <span class="etiquette">
          <span id="{id}-{cible}">{nom}</span>
          {#if explication}<small data-etat="modifie">{explication}</small>{/if}
        </span>
        <span class="valeur">
          <TraceDeCraie
            {valeur}
            taille="20px"
            barre="2px"
            depuis={cible === "chance" ? avant.chance : undefined}
          />
          <b data-etat={explication !== null ? "modifie" : undefined}>
            <ValeurEditable
              {valeur}
              {nom}
              {champ}
              {valide}
              onchange={(nouvelle) => changer(cible, nouvelle)}
            />
          </b>
        </span>
      </div>
    {/each}
    {#if MODES[mode].sauvegardes}
      <div class="stat" role="group" aria-labelledby="{id}-sauvegardes">
        <span class="etiquette" id="{id}-sauvegardes">Sauvegardes</span>
        <button
          class="marks"
          type="button"
          aria-label="{restantes} {restantes > 1
            ? 'sauvegardes restantes'
            : 'sauvegarde restante'} sur {SAUVEGARDES_DU_LIVRE}"
          onclick={() => (correction = true)}
        >
          {#each Array.from({ length: SAUVEGARDES_DU_LIVRE }, (_, i) => i) as index (index)}
            <i class:used={index < sauvegardesUtilisees}></i>
          {/each}
        </button>
      </div>
    {/if}
  </div>
  {#if depasseLeMaximum({ pointsDeVie: pv, pointsDeVieMax: plafond })}
    <div class="indice-pleine-largeur">
      <Indice icone="alerte" role="status" marge="-2px 0 0">
        Vos PV dépassent le maximum de <b>{max}</b>. Gardez-les si le livre
        l'autorise, sinon revenez au maximum.
      </Indice>
    </div>
  {/if}
  {#if propose && !propositionIgnoree}
    <div class="indice">
      <Icone nom="alerte" />
      <div class="suite">
        <span role="status">
          <b>Vos PV sont à 0.</b> En mode mortel, mourir, c'est recommencer au chapitre&nbsp;1
          avec un nouveau personnage. Si le livre en dispose autrement, continuez&nbsp;:
          rien n'est décidé sans vous.
        </span>
        <button
          class="ghost danger"
          type="button"
          onclick={() => (confirmation = true)}
        >
          <span>Recommencer au chapitre 1</span>
          <Icone nom="relancer" />
        </button>
        <button class="link" type="button" onclick={onignorer}>Ignorer</button>
      </div>
    </div>
  {/if}
</div>

{#if confirmation}
  <ConfirmerLeRecommencement
    cas="mort"
    onconfirmer={() => {
      confirmation = false;
      onrecommencer();
    }}
    onfermer={() => (confirmation = false)}
  />
{/if}

{#if correction}
  <SauvegardesUtilisees
    utilisees={sauvegardesUtilisees}
    onchoisir={onsauvegardes}
    onfermer={() => (correction = false)}
  />
{/if}

<style>
  .vital {
    display: grid;
    grid-template-columns: 1.45fr 1fr;
    gap: var(--esp-lg);
    padding: 14px var(--gutter) var(--gutter);
    border-bottom: 2px solid var(--trait);
  }

  /*
   * La colonne des PV garde sa largeur : la trace de craie, posée 1,2 s
   * devant le gros chiffre, ne pousse pas la pile de droite.
   */
  .pv {
    min-width: 0;
  }

  .etiquette {
    font-size: 13px;
    color: var(--craie-2);
    letter-spacing: 0.02em;
  }

  .num {
    display: flex;
    flex-wrap: nowrap;
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

  /*
   * Après le gros chiffre : la décomposition « (34 + 2) », s'il y en a une,
   * empilée au-dessus du maximum « / 34 ». Le maximum reste sur la ligne de
   * base du gros chiffre, et la pile ne prend que la largeur de sa plus
   * longue ligne : à 390 px, la colonne des PV garde sa place.
   */
  .apres {
    display: flex;
    flex-direction: column;
    align-self: last baseline;
  }

  /*
   * La décomposition : craie verte, puisqu'elle vient d'un effet ; corps de
   * l'étiquette (13 px) mais en graisse 700, car ce sont des chiffres. Ce
   * corps la garde à peu près aussi large que « / 34 » : même avec la trace
   * de craie devant le gros chiffre, la ligne reste à l'écart de la pile de
   * droite à 390 px.
   */
  .detail {
    font-size: 13px;
    font-weight: 700;
    line-height: 1.2;
  }

  .max {
    font-size: 24px;
    font-weight: 500;
    color: var(--craie-2);
  }

  /* Le maximum, comme le reste de la ligne, tient dans un bouton de 44 px. */
  .max :global(button) {
    text-align: left;
  }

  [data-etat="critique"] {
    color: var(--rouge);
  }

  /* Craie verte : une valeur changée par un effet, et sa ligne d'explication. */
  [data-etat="modifie"] {
    color: var(--vert);
  }

  .etiquette small {
    display: block;
    margin-top: 2px;
    font-size: 12px;
  }

  .barre {
    height: 6px;
    margin-top: var(--esp-sm);
    background: var(--trait);
    border-radius: 3px;
  }

  .barre u {
    display: block;
    height: 6px;
    background: var(--craie);
    border-radius: 3px;
  }

  .barre u[data-etat="critique"] {
    background: var(--rouge);
  }

  .steps {
    display: flex;
    gap: 10px;
    margin-top: var(--esp-md);
  }

  .step {
    display: grid;
    place-items: center;
    width: 56px;
    height: 56px;
    color: var(--craie);
    border: 2px solid var(--craie);
    border-radius: var(--rayon-round);
  }

  .step.moins {
    color: var(--rouge);
    border-color: var(--rouge);
  }

  .step :global(svg) {
    width: 26px;
    height: 26px;
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

  .valeur {
    display: flex;
    align-items: baseline;
  }

  /*
   * Les sauvegardes : traits de 6 × 24 px, craie si disponible, `trait` si
   * utilisée (DESIGN.md, « Tally marks »). Le bouton les entoure pour porter
   * une cible de 44 px ; son rembourrage ne bouge pas les traits.
   */
  .marks {
    display: flex;
    gap: var(--esp-xs);
    align-items: center;
    justify-content: flex-end;
    min-width: var(--cible);
    min-height: var(--cible);
    margin: -10px 0;
    padding: 10px 0 10px 10px;
  }
  .marks i {
    width: 6px;
    height: 24px;
    border-radius: var(--rayon-tick);
    background: var(--craie);
  }
  .marks i.used {
    background: var(--trait);
  }

  .stat b {
    font-size: 32px;
    font-weight: 800;
    line-height: 1;
  }

  .stat b :global(button) {
    text-align: right;
  }

  .indice-pleine-largeur {
    grid-column: 1 / -1;
  }

  /*
   * Indice mortel : un indice (DESIGN.md, « Hints ») qui porte aussi un
   * bouton et dont seul le texte est annoncé (role="status"). Le composant
   * Indice enferme son contenu dans un <span> : on garde donc ce balisage-ci.
   */
  .indice {
    grid-column: 1 / -1;
    display: flex;
    gap: 10px;
    margin-top: -2px;
    padding: 10px 0 0;
    border-top: 2px solid var(--trait);
    font-size: 14px;
    color: var(--craie-2);
  }

  .indice :global(svg) {
    flex: none;
    width: 20px;
    height: 20px;
    margin-top: 1px;
    color: var(--rouge);
  }

  .indice b {
    color: var(--craie);
  }

  .suite {
    display: grid;
    flex: 1;
    gap: 10px;
  }

  /* Bouton secondaire de danger : texte rouge, contour rouge sombre, libellé à gauche, icône à droite. */
  .ghost {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    width: 100%;
    min-height: 52px;
    padding: 0 var(--esp-lg);
    border: 2px solid var(--trait);
    border-radius: var(--r);
    font-weight: 700;
    color: var(--craie);
  }

  .ghost.danger {
    color: var(--rouge);
    border-color: var(--rouge-trait);
  }

  .ghost :global(svg) {
    flex: none;
    width: 24px;
    height: 24px;
    margin: 0;
    color: inherit;
  }

  /* Lien discret : craie grise soulignée (maquette, `.link`). */
  .link {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: var(--cible);
    color: var(--craie-2);
    font-weight: 700;
    text-decoration: underline;
    text-underline-offset: 4px;
    text-decoration-color: var(--craie-3);
  }
</style>
