<script lang="ts">
  /**
   * Le panneau d'une case du plan : le numéro de chapitre (champ numérique),
   * une note courte (60 caractères au plus, lue en entier ici) et « Vider la
   * case ». Il n'a pas de bouton de validation : tout est enregistré à chaque
   * modification, le lecteur le ferme avec la croix, le voile ou Échap.
   *
   * Un numéro qui sort de 1 à 9999 n'est pas enregistré : la case garde son
   * ancien numéro. Un numéro déjà écrit dans une autre case ne bloque rien :
   * un indice le dit.
   *
   * « Je suis ici » place le repère sur cette case (le plan s'en charge,
   * `onici`) et ferme le panneau ; il est au-dessus de « Vider la case ».
   * C'est le bouton secondaire de la maquette (`.ghost` : contour `trait`,
   * texte craie 700, 52 px), pas le jaune : tout s'enregistre déjà à chaque
   * modification, le jaune n'a pas d'action principale à porter ici.
   */
  import { untrack } from "svelte";
  import ChampNumerique from "./ChampNumerique.svelte";
  import Indice from "./Indice.svelte";
  import LienDiscret from "./LienDiscret.svelte";
  import Panneau from "./Panneau.svelte";
  import {
    autresCasesDuChapitre,
    CHAPITRE_MAX,
    laCase,
    LONGUEUR_MAX_DE_LA_NOTE,
    nomDeLaCase,
    type Case,
    type Contenu,
  } from "./cases";
  import type { Grille } from "./plans";

  interface Props {
    grille: Grille;
    /** Toutes les cases notées du plan, pour repérer un numéro en double. */
    cases: readonly Case[];
    colonne: number;
    ligne: number;
    /** Le contenu a changé : le plan l'enregistre. */
    onmodifier: (contenu: Contenu) => void;
    /** « Vider la case » : le plan retire la case. */
    onvider: () => void;
    /** « Je suis ici » : le plan place le repère sur cette case. */
    onici: () => void;
    onfermer: () => void;
  }

  let {
    grille,
    cases,
    colonne,
    ligne,
    onmodifier,
    onvider,
    onici,
    onfermer,
  }: Props = $props();

  const depart = untrack(() => laCase(cases, colonne, ligne));
  let chapitre = $state<number | null>(depart?.chapitre ?? null);
  let note = $state(depart?.note ?? "");

  const estUnChapitre = (valeur: number | null): valeur is number =>
    Number.isInteger(valeur) && valeur! >= 1 && valeur! <= CHAPITRE_MAX;

  /** À chaque modification, le plan enregistre. */
  $effect(() => {
    const saisi = chapitre;
    const texte = note;
    untrack(() => {
      // Un numéro invalide est ignoré : la case garde celui qu'elle avait.
      const garde = laCase(cases, colonne, ligne)?.chapitre ?? null;
      const valable = saisi === null || estUnChapitre(saisi);
      onmodifier({ chapitre: valable ? saisi : garde, note: texte });
    });
  });

  const doublons = $derived(
    estUnChapitre(chapitre)
      ? autresCasesDuChapitre(cases, chapitre, colonne, ligne)
      : [],
  );
  const nomsDesDoublons = $derived(
    doublons.map((c) => nomDeLaCase(grille, c.colonne, c.ligne)),
  );
</script>

<Panneau titre="Case {nomDeLaCase(grille, colonne, ligne)}" {onfermer}>
  <ChampNumerique
    nom="Chapitre"
    min={1}
    prefixe="§&nbsp;"
    bind:valeur={chapitre}
  />

  <label class="field">
    <span>Note</span>
    <input
      class="input"
      type="text"
      autocomplete="off"
      maxlength={LONGUEUR_MAX_DE_LA_NOTE}
      placeholder="ex. clé, porte fermée"
      bind:value={note}
    />
  </label>

  {#if doublons.length > 0}
    <Indice icone="info" role="status" marge="var(--esp-md) 0 0">
      Le <b>§ {chapitre}</b> est déjà sur {doublons.length > 1
        ? "les cases"
        : "la case"}
      {nomsDesDoublons.join(", ")}.
    </Indice>
  {/if}

  <div class="boutons">
    <button
      class="ghost"
      type="button"
      onclick={() => {
        onici();
        onfermer();
      }}
    >
      Je suis ici
    </button>
    <LienDiscret
      onclick={() => {
        onvider();
        onfermer();
      }}
    >
      Vider la case
    </LienDiscret>
  </div>
</Panneau>

<style>
  /* Champs : voir la maquette, « Formulaires » (comme « Nouvel effet »). */
  .field {
    display: block;
    margin-top: 14px;
  }
  .field > span {
    display: block;
    margin-bottom: var(--esp-xs);
    font-size: 13px;
    color: var(--craie-2);
  }
  .input {
    display: flex;
    width: 100%;
    min-height: 52px;
    padding: var(--esp-md) 14px;
    background: var(--ardoise-2);
    border: 2px solid transparent;
    border-radius: var(--r);
    outline: none;
    font-size: 17px;
  }
  .input:focus {
    border-color: var(--jaune);
  }
  .input::placeholder {
    color: var(--craie-3);
  }

  .boutons {
    display: grid;
    gap: 10px;
    margin-top: 14px;
  }
  /* Bouton secondaire de la maquette (« .ghost »). */
  .ghost {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-height: 52px;
    border: 2px solid var(--trait);
    border-radius: var(--r);
    font-weight: 700;
    color: var(--craie);
  }
  .ghost:focus-visible {
    outline: 2px solid var(--jaune);
    outline-offset: 3px;
  }
</style>
