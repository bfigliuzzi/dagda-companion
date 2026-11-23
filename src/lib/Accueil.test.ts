import { cleanup, render, screen, within } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import App from "../App.svelte";
import { commencerUnCombat, ficheDuLecteur } from "./combat";
import { desFixes, type De } from "./des";
import { enregistrerAventure, uneAventure } from "./test/uneAventure";
import { valeursEffectives } from "./valeursEffectives";

function ouvrirLApp(de: De = desFixes(6, 6)) {
  render(App, { props: { de } });
  return userEvent.setup();
}

const accueil = () =>
  screen.queryByRole("heading", {
    level: 1,
    name: "Compagnon de La Saga de Dagda",
  });
const nouvelApprenti = () =>
  screen.queryByRole("heading", { name: "Nouvel apprenti" });
const bouton = (nom: string | RegExp) =>
  screen.getByRole("button", { name: nom });
const dialogue = () => within(screen.getByRole("dialog"));

beforeEach(() => localStorage.clear());

describe("l'Accueil, à l'ouverture de l'app sans aventure enregistrée", () => {
  it("dit ce qu'est l'app, et qu'elle est un projet de fan non officiel", () => {
    ouvrirLApp();
    expect(accueil()).toBeVisible();
    expect(
      screen.getByText(
        "La feuille d'aventure du livre-jeu, sur le téléphone posé à côté du livre. Vous lisez, l'app tient les comptes.",
      ),
    ).toBeVisible();
    expect(
      screen.getByText(
        "Projet de fan non officiel · tout reste sur votre téléphone",
      ),
    ).toBeVisible();
    expect(nouvelApprenti()).not.toBeInTheDocument();
  });

  it("montre une feuille d'exemple comme une seule image décrite, sans rien à toucher", () => {
    ouvrirLApp();
    const exemple = screen.getByRole("img", { name: /^Exemple de feuille/ });
    expect(exemple).toHaveAccessibleName(
      "Exemple de feuille : 28 points de vie sur 32 (avant : 31), CHANCE 4, DEXTÉRITÉ 8 grâce à une potion, une épée courte et une dague, 9 objets sur 24 dans la besace.",
    );
    expect(
      screen.getByText("Une feuille d'exemple. La vôtre commence vierge."),
    ).toBeVisible();
    // La feuille dessinée n'est pas une feuille : ni titre de section, ni
    // bouton, ni champ pour les lecteurs d'écran.
    expect(screen.queryByRole("heading", { name: "Armes" })).toBeNull();
    expect(exemple.querySelectorAll("a, button, input, textarea")).toHaveLength(
      0,
    );
  });

  it("« Commencer » ouvre « Nouvel apprenti » avec ses choix habituels", async () => {
    const lecteur = ouvrirLApp();
    await lecteur.click(bouton("Commencer"));

    expect(nouvelApprenti()).toBeVisible();
    expect(accueil()).not.toBeInTheDocument();
    expect(
      screen.getByRole("radio", { name: "Nouvelle aventure" }),
    ).toBeChecked();
    await lecteur.click(screen.getByRole("radio", { name: "Déjà en route" }));
    expect(screen.getByLabelText("Dernier chapitre lu")).toBeVisible();
  });

  it("finit par le pied de page, après « Commencer »", () => {
    ouvrirLApp();
    const pied = screen.getByRole("contentinfo");
    expect(
      within(pied).getByRole("link", { name: "Mentions légales" }),
    ).toBeVisible();
    expect(
      bouton("Commencer").compareDocumentPosition(pied) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});

describe("avec une aventure enregistrée, l'app s'ouvre comme avant", () => {
  it("sur la feuille", () => {
    enregistrerAventure();
    ouvrirLApp();
    expect(
      screen.getByRole("button", { name: /^Dernier chapitre lu/ }),
    ).toHaveTextContent("§ 112");
    expect(accueil()).not.toBeInTheDocument();
  });

  it("sur le combat en cours", () => {
    enregistrerAventure({
      combat: commencerUnCombat(
        {
          chapitre: 98,
          adversaires: 1,
          ennemi: { dexterite: 7, pointsDeVie: 10, bonus: 0 },
          premier: "lecteur",
        },
        ficheDuLecteur(valeursEffectives(uneAventure())),
      ),
    });
    ouvrirLApp();
    expect(bouton(/Tour suivant/)).toBeVisible();
    expect(accueil()).not.toBeInTheDocument();
  });
});

describe("recommencer mène droit à « Nouvel apprenti », sans Accueil", () => {
  it("après « Recommencer une aventure »", async () => {
    enregistrerAventure();
    const lecteur = ouvrirLApp();
    await lecteur.click(
      within(screen.getByRole("region", { name: "Aventure" })).getByRole(
        "button",
        { name: /Recommencer/ },
      ),
    );
    await lecteur.click(
      dialogue().getByRole("button", { name: "Effacer et recommencer" }),
    );

    expect(nouvelApprenti()).toBeVisible();
    expect(accueil()).not.toBeInTheDocument();

    // L'aventure est effacée : fermer l'app à ce moment fait revoir l'Accueil.
    cleanup();
    ouvrirLApp();
    expect(accueil()).toBeVisible();
  });

  it("après une mort en mode mortel", async () => {
    enregistrerAventure({ mode: "mortel", personnage: { pointsDeVie: 0 } });
    const lecteur = ouvrirLApp();
    await lecteur.click(bouton("Recommencer au chapitre 1"));
    await lecteur.click(
      dialogue().getByRole("button", { name: "Créer un nouveau personnage" }),
    );

    expect(nouvelApprenti()).toBeVisible();
    expect(screen.getByRole("radio", { name: /^Mortel/ })).toBeChecked();
    expect(accueil()).not.toBeInTheDocument();
  });
});
