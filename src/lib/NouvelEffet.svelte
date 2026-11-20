<script lang="ts">
  /**
   * Le panneau « Nouvel effet » : un nom, puis soit la valeur que l'effet
   * change (une puce par cible) et de combien, soit un simple rappel en
   * texte. La durée est une note libre : l'app ne connaît pas le temps de
   * l'histoire. L'indice annonce ce qui va changer sur la feuille, calculé
   * par valeursEffectives.ts. Rien n'est ajouté avant l'appui sur le bouton jaune.
   */
  import Icone from "./Icone.svelte";
  import type { Arme, Personnage } from "./aventure";
  import ChampNumerique from "./ChampNumerique.svelte";
  import {
    CIBLES,
    NOMS_DES_CIBLES,
    valeursEffectives,
    type Cible,
    type Effet,
  } from "./valeursEffectives";
  import Panneau from "./Panneau.svelte";
  import { formaterUnBonus } from "./signes";

  interface Props {
    personnage: Personnage;
    armes: readonly Arme[];
    /** Les effets déjà actifs, pour annoncer la valeur de départ. */
    effets: readonly Effet[];
    onajouter: (effet: Effet) => void;
    onfermer: () => void;
  }

  let { personnage, armes, effets, onajouter, onfermer }: Props = $props();
  const id = $props.id();

  let nom = $state("");
  let rappel = $state(false);
  let cible = $state<Cible | null>(null);
  let valeur = $state<number | null>(1);
  let duree = $state("");

  /** Ce qui manque, dit comme le libellé du bouton ; `null` quand tout est rempli. */
  const manque = $derived.by(() => {
    if (nom.trim() === "") return "Nommez d'abord l'effet";
    if (rappel) return null;
    if (cible === null) return "Choisissez d'abord la valeur modifiée";
    if (!Number.isInteger(valeur)) return "Indiquez de combien";
    return null;
  });

  /** Les valeurs effectives avant et après l'effet, pour l'indice. */
  const apercu = $derived.by(() => {
    if (rappel || cible === null || !Number.isInteger(valeur)) return null;
    const nouvel: Effet = { nom, duree, cible, valeur: valeur! };
    return {
      cible,
      avant: valeursEffectives({ personnage, armes, effets }),
      apres: valeursEffectives({
        personnage,
        armes,
        effets: [...effets, nouvel],
      }),
    };
  });

  function ajouter(event: SubmitEvent) {
    event.preventDefault();
    if (manque !== null) return;
    onajouter({
      nom: nom.trim(),
      duree: duree.trim(),
      cible: rappel ? null : cible,
      valeur: rappel ? 0 : valeur!,
    });
    onfermer();
  }

  const focaliser = (champ: HTMLInputElement) => champ.focus();
</script>

{#snippet passage(de: number | string, a: number | string)}
  de <b>{de} à {a}</b>
{/snippet}

<Panneau titre="Nouvel effet" {onfermer}>
  <form onsubmit={ajouter}>
    <label class="field">
      <span>Nom</span>
      <input
        class="input"
        type="text"
        autocomplete="off"
        bind:value={nom}
        {@attach focaliser}
      />
    </label>

    <div class="seg" role="radiogroup" aria-label="Type d'effet">
      <label class="segment">
        <input
          class="sr"
          type="radio"
          name="{id}-type"
          value={false}
          bind:group={rappel}
        />
        Change une valeur
      </label>
      <label class="segment">
        <input
          class="sr"
          type="radio"
          name="{id}-type"
          value={true}
          bind:group={rappel}
        />
        Simple rappel
      </label>
    </div>

    {#if !rappel}
      <div class="field">
        <span id="{id}-cible">Valeur modifiée</span>
        <div class="chips" role="radiogroup" aria-labelledby="{id}-cible">
          {#each CIBLES as choix (choix)}
            <label class="chip">
              <input
                class="sr"
                type="radio"
                name="{id}-cible"
                value={choix}
                bind:group={cible}
              />
              {NOMS_DES_CIBLES[choix].puce}
            </label>
          {/each}
        </div>
      </div>
      <div class="pair">
        <ChampNumerique
          nom="De combien"
          min={-99}
          prefixe={valeur !== null && valeur >= 0 ? "+" : undefined}
          bind:valeur
        />
        <label class="field">
          <span>Durée (facultatif)</span>
          <input
            class="input"
            type="text"
            autocomplete="off"
            placeholder="ex. 24 h"
            bind:value={duree}
          />
        </label>
      </div>
    {:else}
      <label class="field">
        <span>Durée (facultatif)</span>
        <input
          class="input"
          type="text"
          autocomplete="off"
          placeholder="ex. 24 h"
          bind:value={duree}
        />
      </label>
    {/if}

    <div class="hint">
      <Icone nom="info" />
      <span>
        {#if rappel}
          Un simple rappel ne change aucune valeur. Vous le retirerez quand le
          livre le dira.
        {:else}
          {#if apercu}
            {@const { avant, apres } = apercu}
            {#if apercu.cible === "pointsDeVie"}
              PV passeront {@render passage(
                avant.pointsDeVie,
                apres.pointsDeVie,
              )}.
            {:else if apercu.cible === "pointsDeVieMax"}
              PV max passera {@render passage(
                avant.pointsDeVieMax,
                apres.pointsDeVieMax,
              )}.
            {:else if apercu.cible === "chance"}
              CHANCE passera {@render passage(avant.chance, apres.chance)}.
            {:else if apercu.cible === "dexterite"}
              DEX passera {@render passage(avant.dexterite, apres.dexterite)}.
            {:else}
              Bonus de dommage passera {@render passage(
                formaterUnBonus(avant.degats),
                formaterUnBonus(apres.degats),
              )}.
            {/if}
          {/if}
          Vous retirerez l'effet quand le livre le dira.
        {/if}
      </span>
    </div>

    <div class="btns">
      <button class="cta" type="submit" aria-disabled={manque !== null}>
        {manque ?? (rappel ? "Ajouter le rappel" : "Ajouter l'effet")}
      </button>
    </div>
  </form>
</Panneau>

<style>
  /* Champs : voir la maquette, « Formulaires ». */
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

  /* Contrôle segmenté : les vrais boutons radio sont masqués. */
  .seg {
    display: grid;
    grid-template-columns: 1fr 1fr;
    margin: 14px 0;
    padding: var(--esp-hair);
    background: var(--ardoise-2);
    border-radius: var(--r);
  }
  .segment {
    display: grid;
    place-items: center;
    min-height: var(--cible);
    border-radius: var(--rayon-seg);
    font-weight: 700;
    color: var(--craie-2);
    cursor: pointer;
  }
  .segment:has(:checked) {
    background: var(--craie);
    color: var(--noir);
  }

  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: var(--esp-sm);
  }
  .chip {
    display: flex;
    align-items: center;
    min-height: var(--cible);
    padding: 0 var(--esp-lg);
    border: 2px solid var(--trait);
    border-radius: var(--rayon-pill);
    font-weight: 700;
    color: var(--craie-2);
    cursor: pointer;
  }
  .chip:has(:checked) {
    border-color: var(--jaune);
    color: var(--jaune);
  }
  .segment:has(:focus-visible),
  .chip:has(:focus-visible) {
    outline: 2px solid var(--jaune);
    outline-offset: 3px;
  }

  .pair {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--esp-md);
    margin-top: var(--esp-hair);
  }

  /* Indice non bloquant : voir DESIGN.md, « Hints ». */
  .hint {
    display: flex;
    gap: 10px;
    margin-top: var(--esp-md);
    padding: 10px 0 0;
    border-top: 2px solid var(--trait);
    font-size: 14px;
    color: var(--craie-2);
  }
  .hint :global(svg) {
    flex: none;
    width: 20px;
    height: 20px;
    margin-top: 1px;
    color: var(--jaune);
  }
  .hint b {
    color: var(--craie);
  }

  .btns {
    display: grid;
    gap: 10px;
    margin-top: 14px;
  }
  .cta {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-height: 58px;
    background: var(--jaune);
    border: 2px solid var(--jaune);
    border-radius: var(--r);
    font-size: 20px;
    font-weight: 800;
    color: var(--noir);
  }
  .cta[aria-disabled="true"] {
    background: none;
    border-color: var(--craie-3);
    color: var(--craie-3);
  }
</style>
