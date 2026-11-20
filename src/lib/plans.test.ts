import { cleanup, render, screen, within } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import App from "../App.svelte";
import { unNouveauPlan } from "./plans";
import { CLE_STOCKAGE, lireAventure } from "./stockage";
import { enregistrerAventure } from "./test/uneAventure";

const souterrains = unNouveauPlan("Souterrains", []);
const tour = unNouveauPlan("Tour du mage", [souterrains]);

function ouvrirLApp() {
  render(App);
  return userEvent.setup();
}

const section = () => within(screen.getByRole("region", { name: "Plans" }));
const bouton = (nom: string | RegExp) =>
  screen.getByRole("button", { name: nom });
const dialogue = () => within(screen.getByRole("dialog"));
const plansEnregistres = () => lireAventure(localStorage)!.plans;

/** Crée un plan depuis la section « Plans » de la feuille. */
async function creerUnPlan(
  lecteur: ReturnType<typeof userEvent.setup>,
  nom: string,
) {
  await lecteur.click(section().getByRole("button", { name: "Nouveau plan" }));
  await lecteur.type(screen.getByLabelText("Nom du plan"), nom);
  await lecteur.click(bouton("Créer le plan"));
}

describe("la section « Plans » de la feuille", () => {
  beforeEach(() => enregistrerAventure());

  it("suit « Notes » : c'est la section d'avant « Aventure »", () => {
    ouvrirLApp();
    const titres = Array.from(
      screen.getByRole("main").querySelectorAll("section h2"),
    ).map((titre) => titre.textContent);
    expect(titres.indexOf("Plans")).toBe(titres.indexOf("Notes") + 1);
    expect(titres.indexOf("Aventure")).toBe(titres.indexOf("Plans") + 1);
  });

  it("sans plan, seul « Nouveau plan » s'affiche", () => {
    ouvrirLApp();
    expect(section().queryAllByRole("listitem")).toHaveLength(0);
    expect(section().getAllByRole("button")).toHaveLength(1);
    expect(
      section().getByRole("button", { name: "Nouveau plan" }),
    ).toBeInTheDocument();
  });

  it("montre une ligne par plan, avec son nom, dans l'ordre de création", () => {
    enregistrerAventure({ plans: [souterrains, tour] });
    ouvrirLApp();
    const lignes = section().getAllByRole("listitem");
    expect(lignes.map((ligne) => ligne.textContent?.trim())).toEqual([
      "Souterrains",
      "Tour du mage",
    ]);
    expect(
      section().getByRole("button", { name: "Souterrains" }),
    ).toBeInTheDocument();
  });
});

describe("créer un plan", () => {
  beforeEach(() => enregistrerAventure());

  it("« Nouveau plan » demande un nom, puis crée le plan et l'enregistre", async () => {
    const lecteur = ouvrirLApp();
    await creerUnPlan(lecteur, "  Souterrains ");

    expect(
      section().getByRole("button", { name: "Souterrains" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("form", { name: "Nouveau plan" }),
    ).not.toBeInTheDocument();
    expect(plansEnregistres()).toEqual([souterrains]);
  });

  it("un nom vide n'est pas accepté et le bouton dit ce qui manque", async () => {
    const lecteur = ouvrirLApp();
    await lecteur.click(
      section().getByRole("button", { name: "Nouveau plan" }),
    );

    const valider = bouton("Nommez d'abord le plan");
    expect(valider).toHaveAttribute("aria-disabled", "true");
    await lecteur.click(valider);
    expect(plansEnregistres()).toEqual([]);

    await lecteur.type(screen.getByLabelText("Nom du plan"), "   ");
    await lecteur.click(bouton("Nommez d'abord le plan"));
    expect(plansEnregistres()).toEqual([]);

    await lecteur.type(screen.getByLabelText("Nom du plan"), "Tour");
    expect(bouton("Créer le plan")).not.toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });

  it("« Annuler » ne crée rien", async () => {
    const lecteur = ouvrirLApp();
    await lecteur.click(
      section().getByRole("button", { name: "Nouveau plan" }),
    );
    await lecteur.type(screen.getByLabelText("Nom du plan"), "Tour");
    await lecteur.click(bouton("Annuler"));
    expect(section().queryAllByRole("listitem")).toHaveLength(0);
    expect(plansEnregistres()).toEqual([]);
  });

  it("deux plans peuvent se suivre, chacun avec son numéro", async () => {
    const lecteur = ouvrirLApp();
    await creerUnPlan(lecteur, "Souterrains");
    await creerUnPlan(lecteur, "Tour du mage");
    expect(plansEnregistres()).toEqual([souterrains, tour]);
  });
});

describe("l'écran d'un plan", () => {
  beforeEach(() => enregistrerAventure({ plans: [souterrains, tour] }));

  it("s'ouvre d'un appui sur la ligne, et le bouton retour ramène à la feuille", async () => {
    const lecteur = ouvrirLApp();
    await lecteur.click(
      section().getByRole("button", { name: "Tour du mage" }),
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "Tour du mage" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Notes" }),
    ).not.toBeInTheDocument();

    await lecteur.click(bouton("Retour à la feuille"));
    expect(screen.getByRole("heading", { name: "Notes" })).toBeInTheDocument();
    expect(
      section().getByRole("button", { name: "Tour du mage" }),
    ).toBeInTheDocument();
  });

  it("montre, pour un plan neuf, une grille de 8 × 8 cases de 44 px, un « N » au bord haut et l'indice du mur", async () => {
    const lecteur = ouvrirLApp();
    await lecteur.click(section().getByRole("button", { name: "Souterrains" }));

    const grille = screen.getByRole("img", {
      name: /8 colonnes sur 8 lignes.*nord en haut/,
    });
    expect(grille).toHaveAttribute("width", String(8 * 44));
    expect(grille).toHaveAttribute("height", String(8 * 44));
    expect(screen.getByText("N")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Glissez le doigt le long des points pour tracer un mur.",
      ),
    ).toBeInTheDocument();
  });

  it("le nom se modifie dans l'en-tête, et la feuille et l'enregistrement le suivent", async () => {
    const lecteur = ouvrirLApp();
    await lecteur.click(section().getByRole("button", { name: "Souterrains" }));

    await lecteur.click(screen.getByRole("button", { name: "Souterrains" }));
    const champ = screen.getByLabelText("Nom de Souterrains");
    await lecteur.clear(champ);
    await lecteur.type(champ, "Catacombes{Enter}");

    expect(
      screen.getByRole("heading", { level: 1, name: "Catacombes" }),
    ).toBeInTheDocument();
    expect(plansEnregistres().map((plan) => plan.nom)).toEqual([
      "Catacombes",
      "Tour du mage",
    ]);

    await lecteur.click(bouton("Retour à la feuille"));
    expect(
      section().getByRole("button", { name: "Catacombes" }),
    ).toBeInTheDocument();
  });

  it("un nom vidé n'est pas gardé : l'ancien nom reste", async () => {
    const lecteur = ouvrirLApp();
    await lecteur.click(section().getByRole("button", { name: "Souterrains" }));
    await lecteur.click(screen.getByRole("button", { name: "Souterrains" }));
    await lecteur.clear(screen.getByLabelText("Nom de Souterrains"));
    await lecteur.keyboard("{Enter}");
    expect(
      screen.getByRole("heading", { level: 1, name: "Souterrains" }),
    ).toBeInTheDocument();
  });
});

describe("supprimer un plan", () => {
  beforeEach(() => enregistrerAventure({ plans: [souterrains, tour] }));

  async function ouvrirEtDemander(lecteur: ReturnType<typeof userEvent.setup>) {
    await lecteur.click(section().getByRole("button", { name: "Souterrains" }));
    await lecteur.click(bouton("Supprimer ce plan"));
  }

  it("demande une confirmation avant d'effacer, et « Annuler » laisse tout comme avant", async () => {
    const lecteur = ouvrirLApp();
    await ouvrirEtDemander(lecteur);

    const panneau = dialogue();
    expect(
      panneau.getByRole("heading", { name: "Supprimer ce plan" }),
    ).toBeInTheDocument();
    expect(panneau.getByText(/Souterrains/)).toBeInTheDocument();
    expect(plansEnregistres()).toHaveLength(2);

    await lecteur.click(panneau.getByRole("button", { name: "Annuler" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1, name: "Souterrains" }),
    ).toBeInTheDocument();
    expect(plansEnregistres()).toHaveLength(2);
  });

  it("après confirmation, le plan disparaît et la feuille s'ouvre", async () => {
    const lecteur = ouvrirLApp();
    await ouvrirEtDemander(lecteur);
    await lecteur.click(
      dialogue().getByRole("button", { name: "Supprimer le plan" }),
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Notes" })).toBeInTheDocument();
    expect(
      section().queryByRole("button", { name: "Souterrains" }),
    ).not.toBeInTheDocument();
    expect(
      section().getByRole("button", { name: "Tour du mage" }),
    ).toBeInTheDocument();
    expect(plansEnregistres()).toEqual([tour]);
  });
});

describe("retrouver ses plans", () => {
  beforeEach(() => enregistrerAventure());

  it("après avoir fermé puis rouvert l'app, les plans et leur nom sont là", async () => {
    const lecteur = ouvrirLApp();
    await creerUnPlan(lecteur, "Souterrains");
    await lecteur.click(section().getByRole("button", { name: "Souterrains" }));
    await lecteur.click(screen.getByRole("button", { name: "Souterrains" }));
    await lecteur.type(
      screen.getByLabelText("Nom de Souterrains"),
      " bas{Enter}",
    );
    cleanup();

    ouvrirLApp();
    expect(
      section().getByRole("button", { name: "Souterrains bas" }),
    ).toBeInTheDocument();
  });

  it("une aventure enregistrée avant les plans s'ouvre sans erreur, avec une liste vide", () => {
    enregistrerAventure();
    const { aventure } = JSON.parse(localStorage.getItem(CLE_STOCKAGE)!);
    delete aventure.plans;
    localStorage.setItem(
      CLE_STOCKAGE,
      JSON.stringify({ version: 10, aventure }),
    );

    ouvrirLApp();
    expect(section().queryAllByRole("listitem")).toHaveLength(0);
    expect(
      section().getByRole("button", { name: "Nouveau plan" }),
    ).toBeInTheDocument();
  });
});
