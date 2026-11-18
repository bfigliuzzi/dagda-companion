<script lang="ts">
  /**
   * Le panneau de dés : 1 dé ou 2 dés, le lancer, le total, puis l'ajustement
   * avec la CHANCE (1 point = 1 CHANCE, dans les deux sens, borné par la CHANCE
   * disponible : voir chance.ts). La CHANCE n'est retirée qu'en validant avec
   * « Garder » ; fermer le panneau ne dépense rien.
   *
   * Le lecteur qui a lancé ses vrais dés peut les saisir (« J'ai lancé mes
   * propres dés ») : mêmes dés dessinés, même total, même ajustement.
   *
   * Les dés sont injectés (`de`) pour jouer le panneau avec des dés fixés.
   */
  import {
    ajusterLeTotal,
    changerLAjustement,
    formaterUnAjustement,
  } from "./chance";
  import { lancerDes, totalDesDes, type De } from "./des";
  import DeDessine from "./DeDessine.svelte";
  import Panneau from "./Panneau.svelte";

  interface Props {
    de: De;
    /** CHANCE disponible sur la feuille : le plafond de l'ajustement. */
    chance: number;
    /** Appelé en validant, avec les points de CHANCE dépensés (jamais 0). */
    ondepenser: (points: number) => void;
    onfermer: () => void;
  }

  let { de, chance, ondepenser, onfermer }: Props = $props();
  const id = $props.id();

  let nombre = $state<1 | 2>(2);
  /** Les dés lancés, `null` tant que rien n'est lancé. */
  let des = $state<number[] | null>(null);
  let ajustement = $state(0);

  const jet = $derived(des === null ? null : totalDesDes(des));
  const ajuste = $derived(
    jet === null ? null : ajusterLeTotal(jet, ajustement, chance),
  );
  const reste = $derived(Math.max(0, Math.trunc(chance)));
  const peutBaisser = $derived(
    changerLAjustement(ajuste?.ajustement ?? 0, -1, chance) !==
      (ajuste?.ajustement ?? 0),
  );
  const peutMonter = $derived(
    changerLAjustement(ajuste?.ajustement ?? 0, 1, chance) !==
      (ajuste?.ajustement ?? 0),
  );

  /** Les dés saisis à la main : les pas à pas des dés remplacent le hasard. */
  let saisie = $state(false);

  const nomDesDes = $derived.by(() => {
    const mot = nombre === 1 ? "Dé" : "Dés";
    if (des === null)
      return `${mot} : pas encore lancé${nombre === 1 ? "" : "s"}`;
    return `${mot} : ${des.join(" et ")}`;
  });

  /** « Il vous reste 4 points · 2 seront dépensés » */
  const resteEtDepense = $derived.by(() => {
    if (reste === 0) return "Il ne vous reste aucun point";
    const cout = ajuste?.cout ?? 0;
    const depense =
      cout === 0
        ? ""
        : ` · ${cout} ${cout > 1 ? "seront dépensés" : "sera dépensé"}`;
    return `Il vous reste ${points(reste)}${depense}`;
  });

  /** Les rangs des deux dés possibles. */
  const rangs = [0, 1];

  const points = (n: number) => `${n} point${n > 1 ? "s" : ""}`;

  function choisir(n: 1 | 2) {
    nombre = n;
    des = null;
    saisie = false;
    ajustement = 0;
  }

  function lancer() {
    des = lancerDes(de, nombre);
    saisie = false;
    ajustement = 0;
  }

  function saisirMesDes() {
    des = Array.from({ length: nombre }, () => 1);
    saisie = true;
    ajustement = 0;
  }

  function changerUnDe(rang: number, sens: 1 | -1) {
    des![rang] = Math.min(6, Math.max(1, des![rang] + sens));
  }

  const nomDuDe = (rang: number) =>
    des!.length > 1 ? `le dé ${rang + 1}` : "le dé";

  function garder() {
    if (ajuste && ajuste.cout > 0) ondepenser(ajuste.cout);
    onfermer();
  }
</script>

<Panneau titre="Lancer les dés" {onfermer}>
  <div class="segments" role="radiogroup" aria-label="Nombre de dés">
    <label class="segment">
      <input
        class="sr"
        type="radio"
        name="{id}-nombre"
        checked={nombre === 1}
        onchange={() => choisir(1)}
      />
      1 dé
    </label>
    <label class="segment">
      <input
        class="sr"
        type="radio"
        name="{id}-nombre"
        checked={nombre === 2}
        onchange={() => choisir(2)}
      />
      2 dés
    </label>
  </div>

  <div class="des" role="img" aria-label={nomDesDes}>
    {#each rangs.slice(0, nombre) as rang (rang)}
      <DeDessine valeur={des?.[rang] ?? null} />
    {/each}
  </div>

  {#if saisie && des}
    <div class="saisie">
      {#each rangs.slice(0, des.length) as rang (rang)}
        <div class="pas" role="group" aria-label="Dé {rang + 1}">
          <button
            type="button"
            aria-label="Baisser {nomDuDe(rang)}"
            disabled={des[rang] <= 1}
            onclick={() => changerUnDe(rang, -1)}
          >
            <svg class="i" aria-hidden="true" viewBox="0 0 24 24">
              <path d="M5 12h14" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Monter {nomDuDe(rang)}"
            disabled={des[rang] >= 6}
            onclick={() => changerUnDe(rang, 1)}
          >
            <svg class="i" aria-hidden="true" viewBox="0 0 24 24">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </div>
      {/each}
    </div>
  {/if}

  {#if ajuste}
    <div class="total" role="status">
      {#if ajuste.cout > 0}
        <s class="avant"><span class="sr">avant :&nbsp;</span>{jet}</s>
        <span class="sr">maintenant&nbsp;</span>
      {/if}
      <b>{ajuste.total}</b>
      <small>
        {#if ajuste.cout > 0}total ajusté avec {points(ajuste.cout)} de CHANCE{/if}
      </small>
    </div>

    <div class="ajuster">
      <span class="t">
        Ajuster avec la CHANCE
        <small>{resteEtDepense}</small>
      </span>
      <span class="pas-chance">
        <button
          type="button"
          aria-label="Baisser le total"
          disabled={!peutBaisser}
          onclick={() =>
            (ajustement = changerLAjustement(ajuste.ajustement, -1, chance))}
        >
          <svg class="i" aria-hidden="true" viewBox="0 0 24 24">
            <path d="M5 12h14" />
          </svg>
        </button>
        <b>{formaterUnAjustement(ajuste.ajustement)}</b>
        <button
          type="button"
          aria-label="Monter le total"
          disabled={!peutMonter}
          onclick={() =>
            (ajustement = changerLAjustement(ajuste.ajustement, 1, chance))}
        >
          <svg class="i" aria-hidden="true" viewBox="0 0 24 24">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </span>
    </div>
  {/if}

  <div class="boutons">
    {#if ajuste}
      <button class="valider" type="button" onclick={garder}>
        <svg class="i" aria-hidden="true" viewBox="0 0 24 24">
          <path d="M5 12.5l4.5 4.5L19 7" />
        </svg>
        Garder {ajuste.total}
      </button>
      <button class="secondaire" type="button" onclick={lancer}>
        <svg class="i" aria-hidden="true" viewBox="0 0 24 24">
          <path d="M20 12a8 8 0 1 1-2.4-5.7M20 4v5h-5" />
        </svg>
        Relancer
      </button>
    {:else}
      <button class="valider" type="button" onclick={lancer}>
        <svg class="i" aria-hidden="true" viewBox="0 0 24 24">
          <rect x="3" y="3" width="18" height="18" rx="4" />
          <circle cx="8.5" cy="8.5" r="1.3" fill="currentColor" />
          <circle cx="15.5" cy="15.5" r="1.3" fill="currentColor" />
          <circle cx="12" cy="12" r="1.3" fill="currentColor" />
        </svg>
        Lancer
      </button>
    {/if}
    {#if !saisie}
      <button class="lien" type="button" onclick={saisirMesDes}>
        J'ai lancé mes propres dés
      </button>
    {/if}
  </div>
</Panneau>

<style>
  /* Contrôle segmenté : voir DESIGN.md. Les vrais boutons radio sont masqués. */
  .segments {
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

  .segment:has(:focus-visible) {
    outline: 2px solid var(--jaune);
    outline-offset: 3px;
  }

  .des,
  .saisie {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--esp-lg);
  }

  .des {
    margin: 10px 0 var(--esp-hair);
  }

  /* Un pas à pas par dé, centré sous lui : 92 px de large + 8 px d'écart = 84 px + 16 px. */
  .saisie {
    gap: var(--esp-sm);
  }

  .pas {
    display: flex;
    gap: var(--esp-hair);
  }

  .pas button,
  .pas-chance button {
    display: grid;
    place-items: center;
    width: var(--cible);
    height: var(--cible);
    border: 2px solid var(--craie-3);
    border-radius: var(--rayon-round);
  }

  .pas button:disabled,
  .pas-chance button:disabled {
    color: var(--craie-3);
    border-color: var(--trait);
    cursor: default;
  }

  .pas button svg,
  .pas-chance button svg {
    width: 18px;
    height: 18px;
  }

  .total {
    margin: var(--esp-sm) 0 2px;
    text-align: center;
  }

  .total b {
    font-size: 64px;
    font-weight: 800;
    line-height: 1;
  }

  .avant {
    margin-right: 10px;
    font-size: 36px;
    font-weight: 700;
    vertical-align: 0.35em;
    color: var(--rouge);
    text-decoration: line-through;
    text-decoration-thickness: 3px;
  }

  .total small {
    display: block;
    min-height: 1.45em;
    font-size: 14px;
    color: var(--craie-2);
  }

  .ajuster {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 14px 0;
    padding: var(--esp-sm) var(--esp-sm) var(--esp-sm) 14px;
    background: var(--ardoise-2);
    border-radius: var(--r);
  }

  .t {
    font-size: 15px;
  }

  .t small {
    display: block;
    font-size: 13px;
    color: var(--craie-2);
  }

  .pas-chance {
    display: flex;
    align-items: center;
    gap: var(--esp-hair);
  }

  .pas-chance b {
    min-width: var(--cible);
    font-size: 22px;
    text-align: center;
  }

  .boutons {
    display: grid;
    gap: 10px;
    margin-top: var(--esp-xs);
  }

  .valider,
  .secondaire {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    border-radius: var(--r);
  }

  .valider {
    gap: var(--esp-md);
    min-height: 58px;
    background: var(--jaune);
    border: 2px solid var(--jaune);
    color: var(--noir);
    font-size: 20px;
    font-weight: 800;
  }

  .valider svg {
    width: 26px;
    height: 26px;
  }

  .secondaire {
    gap: 10px;
    min-height: 52px;
    border: 2px solid var(--trait);
    font-weight: 700;
    color: var(--craie);
  }

  .lien {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: var(--cible);
    color: var(--craie-2);
    font-weight: 700;
    text-decoration: underline;
    text-decoration-color: var(--craie-3);
    text-underline-offset: 4px;
  }
</style>
