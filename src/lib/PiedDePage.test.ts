import { render, screen, within } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import App from "../App.svelte";
import { commencerUnCombat, ficheDuLecteur, jouerJusquALaFin } from "./combat";
import { desFixes } from "./des";
import { unNouveauPlan } from "./plans";
import { ouvrirNouvelApprenti } from "./test/ouvrirNouvelApprenti";
import { enregistrerAventure, uneAventure } from "./test/uneAventure";
import { valeursEffectives } from "./valeursEffectives";
import { version } from "./version";

const piedDePage = () => screen.getByRole("contentinfo");

beforeEach(() => localStorage.clear());

/** Un combat à 1 PV, gagné au premier coup. */
function unCombat() {
  return commencerUnCombat(
    {
      chapitre: 98,
      adversaires: 1,
      ennemi: { dexterite: 7, pointsDeVie: 1, bonus: 0 },
      premier: "lecteur",
    },
    ficheDuLecteur(valeursEffectives(uneAventure())),
  );
}

describe("pied de page de la feuille", () => {
  it("affiche le nom de l'app et le numéro de version", () => {
    enregistrerAventure();
    render(App);
    const pied = within(piedDePage());
    expect(pied.getByText("Compagnon de La Saga de Dagda")).toBeVisible();
    expect(pied.getByText(`Version ${version}`)).toBeVisible();
  });

  it("ouvre l'accueil du dépôt GitHub par une icône qui a un nom", () => {
    enregistrerAventure();
    render(App);
    expect(
      within(piedDePage()).getByRole("link", {
        name: "Code source sur GitHub",
      }),
    ).toHaveAttribute("href", "https://github.com/bfigliuzzi/dagda-companion");
  });

  it("ouvre la page « Mentions légales », à côté de l'app", () => {
    enregistrerAventure();
    render(App);
    expect(
      within(piedDePage()).getByRole("link", { name: "Mentions légales" }),
    ).toHaveAttribute("href", "mentions-legales.html");
  });

  it("vient après le dock de dés, tout en bas de la feuille", () => {
    enregistrerAventure();
    render(App);
    const dock = screen.getByTestId("dock");
    expect(
      dock.compareDocumentPosition(piedDePage()) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});

describe("pas de pied de page", () => {
  it("sur « Nouvel apprenti »", async () => {
    await ouvrirNouvelApprenti(desFixes(3));
    expect(
      screen.getByRole("heading", { name: "Nouvel apprenti" }),
    ).toBeVisible();
    expect(screen.queryByRole("contentinfo")).toBeNull();
  });

  it("sur l'écran d'un combat en cours", () => {
    enregistrerAventure({ combat: unCombat() });
    render(App);
    expect(screen.getByRole("button", { name: /Tour suivant/ })).toBeVisible();
    expect(screen.queryByRole("contentinfo")).toBeNull();
  });

  it("sur « Nouveau combat »", async () => {
    enregistrerAventure();
    render(App);
    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: /Combattre/ }));
    expect(
      screen.getByRole("form", { name: "Fiche de l'ennemi" }),
    ).toBeVisible();
    expect(screen.queryByRole("contentinfo")).toBeNull();
  });

  it("sur l'historique des combats", async () => {
    enregistrerAventure({
      combats: [jouerJusquALaFin(unCombat(), desFixes(6, 6, 1))],
    });
    render(App);
    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: "Tout l'historique" }));
    expect(
      screen.queryByRole("button", { name: "Tout l'historique" }),
    ).toBeNull();
    expect(screen.queryByRole("contentinfo")).toBeNull();
  });

  it("sur l'écran d'un plan", async () => {
    enregistrerAventure({ plans: [unNouveauPlan("Souterrains", [])] });
    render(App);
    await userEvent
      .setup()
      .click(
        within(screen.getByRole("region", { name: "Plans" })).getByRole(
          "button",
          { name: /^Souterrains/ },
        ),
      );
    expect(screen.getByRole("img", { name: /Grille du plan/ })).toBeVisible();
    expect(screen.queryByRole("contentinfo")).toBeNull();
  });
});
