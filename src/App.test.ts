import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App.svelte";
import { ecrireAventure } from "./lib/stockage";

/** Une aventure déjà commencée : l'app ouvre directement la feuille. */
function enregistrerAventure() {
  localStorage.clear();
  ecrireAventure(localStorage, {
    chapitre: 1,
    mode: "narratif",
    sauvegardesUtilisees: 0,
    notes: "",
    armes: [],
    personnage: {
      talent: "Instinct",
      pointsDeVieMax: 24,
      pointsDeVie: 24,
      chance: 3,
      dexterite: 7,
    },
  });
}

const boutonChapitre = () =>
  screen.getByRole("button", { name: /dernier chapitre lu/i });

async function changerChapitre(valeur: string, valider = true) {
  const lecteur = userEvent.setup();
  await lecteur.click(boutonChapitre());
  const champ = screen.getByLabelText("Dernier chapitre lu");
  await lecteur.clear(champ);
  await lecteur.type(champ, valider ? `${valeur}{Enter}` : valeur);
}

describe("en-tête de la feuille", () => {
  beforeEach(enregistrerAventure);

  it("affiche le chapitre 1 au début de l'aventure", () => {
    render(App);
    expect(boutonChapitre()).toHaveTextContent("§ 1");
  });

  it("affiche le nouveau chapitre une fois modifié", async () => {
    render(App);
    await changerChapitre("112");
    expect(boutonChapitre()).toHaveTextContent("§ 112");
  });

  it("retrouve le chapitre modifié après avoir fermé et rouvert l'app", async () => {
    const { unmount } = render(App);
    await changerChapitre("112");
    unmount();

    render(App);
    expect(boutonChapitre()).toHaveTextContent("§ 112");
  });

  it("enregistre le chapitre dès la saisie, sans attendre la validation", async () => {
    const { unmount } = render(App);
    await changerChapitre("47", false);
    unmount();

    render(App);
    expect(boutonChapitre()).toHaveTextContent("§ 47");
  });

  it("garde l'ancien chapitre si le champ est laissé vide", async () => {
    render(App);
    await changerChapitre("112");
    await changerChapitre("");
    expect(boutonChapitre()).toHaveTextContent("§ 112");
  });
});

describe("écran allumé pendant la lecture", () => {
  const navigateur = navigator as { wakeLock?: unknown };

  function simulerWakeLock(request: () => Promise<unknown>) {
    const demande = vi.fn(request);
    Object.defineProperty(navigator, "wakeLock", {
      value: { request: demande },
      configurable: true,
    });
    return demande;
  }

  function revenirAuPremierPlan() {
    Object.defineProperty(document, "visibilityState", {
      value: "visible",
      configurable: true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  }

  beforeEach(enregistrerAventure);
  afterEach(() => {
    delete navigateur.wakeLock;
    delete (document as { visibilityState?: unknown }).visibilityState;
  });

  it("demande à garder l'écran allumé à l'ouverture", () => {
    const demande = simulerWakeLock(async () => ({}));
    render(App);
    expect(demande).toHaveBeenCalledWith("screen");
  });

  it("redemande l'écran allumé quand l'app revient au premier plan", () => {
    const demande = simulerWakeLock(async () => ({}));
    render(App);
    revenirAuPremierPlan();
    expect(demande).toHaveBeenCalledTimes(2);
  });

  it("fonctionne quand le navigateur ne connaît pas le Wake Lock", () => {
    delete navigateur.wakeLock;
    render(App);
    expect(boutonChapitre()).toHaveTextContent("§ 1");
  });

  it("fonctionne quand le navigateur refuse le Wake Lock", async () => {
    const demande = simulerWakeLock(() =>
      Promise.reject(new DOMException("refusé", "NotAllowedError")),
    );
    render(App);
    await vi.waitFor(() => expect(demande).toHaveBeenCalled());
    await changerChapitre("12");
    expect(boutonChapitre()).toHaveTextContent("§ 12");
  });
});
