import { render, screen, within } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import App from "../App.svelte";
import { desFixes } from "./des";
import { CLE_STOCKAGE, ecrireAventure } from "./stockage";

function enregistrerAventure(chance = 4) {
  localStorage.clear();
  ecrireAventure(localStorage, {
    chapitre: 112,
    mode: "simplifie",
    sauvegardesUtilisees: 0,
    notes: "",
    armes: [],
    besace: { objets: [], bourse: false, boulons: 0, boulonsForces: false },
    effets: [],
    personnage: {
      talent: "Herbologie",
      pointsDeVieMax: 32,
      pointsDeVie: 28,
      chance,
      dexterite: 7,
    },
  });
}

const chanceEnregistree = () =>
  JSON.parse(localStorage.getItem(CLE_STOCKAGE)!).aventure.personnage.chance;

const boutonDuDock = () =>
  screen.getByRole("button", { name: "Lancer les dés" });
const panneau = () => screen.getByRole("dialog", { name: "Lancer les dés" });
const dansPanneau = () => within(panneau());
const bouton = (nom: string | RegExp) =>
  dansPanneau().getByRole("button", { name: nom });
const total = () => dansPanneau().getByRole("status");
const ancienTotal = () => panneau().querySelector("s");

/** Ouvre le panneau et lance `nombre` dés (2 par défaut, comme le panneau). */
async function ouvrirEtLancer(
  lecteur: ReturnType<typeof userEvent.setup>,
  nombre: 1 | 2 = 2,
) {
  await lecteur.click(boutonDuDock());
  if (nombre === 1) {
    await lecteur.click(dansPanneau().getByRole("radio", { name: "1 dé" }));
  }
  await lecteur.click(bouton("Lancer"));
}

describe("dock « Lancer les dés »", () => {
  beforeEach(() => enregistrerAventure());

  it("offre le bouton « Lancer les dés » sur la feuille, panneau fermé", () => {
    render(App);
    expect(boutonDuDock()).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("garde le bouton dans un seul dock, sans autre élément fixe sur la feuille", () => {
    render(App);
    expect(document.querySelectorAll(".dock")).toHaveLength(1);
    expect(boutonDuDock().closest(".dock")).not.toBeNull();
  });
});

describe("panneau de dés : ouverture et fermeture", () => {
  beforeEach(() => enregistrerAventure());

  it("s'ouvre en dialogue modal intitulé « Lancer les dés »", async () => {
    render(App);
    await userEvent.setup().click(boutonDuDock());
    expect(panneau()).toHaveAttribute("aria-modal", "true");
    expect(
      dansPanneau().getByRole("heading", { name: "Lancer les dés" }),
    ).toBeInTheDocument();
  });

  it("met le focus dans le panneau à l'ouverture", async () => {
    render(App);
    await userEvent.setup().click(boutonDuDock());
    expect(panneau().contains(document.activeElement)).toBe(true);
  });

  it("se ferme avec son bouton de fermeture et rend le focus au dock", async () => {
    render(App);
    const lecteur = userEvent.setup();
    await lecteur.click(boutonDuDock());
    await lecteur.click(bouton("Fermer"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(boutonDuDock()).toHaveFocus();
  });

  it("se ferme d'un appui sur le voile", async () => {
    render(App);
    const lecteur = userEvent.setup();
    await lecteur.click(boutonDuDock());
    await lecteur.click(document.querySelector(".voile")!);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("ne se ferme pas d'un appui dans le panneau", async () => {
    render(App);
    const lecteur = userEvent.setup();
    await lecteur.click(boutonDuDock());
    await lecteur.click(
      dansPanneau().getByRole("heading", { name: "Lancer les dés" }),
    );
    expect(panneau()).toBeInTheDocument();
  });

  it("se ferme avec Échap", async () => {
    render(App);
    const lecteur = userEvent.setup();
    await lecteur.click(boutonDuDock());
    await lecteur.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("garde le focus dans le panneau avec Tab et Maj+Tab", async () => {
    render(App);
    const lecteur = userEvent.setup();
    await lecteur.click(boutonDuDock());
    for (let i = 0; i < 12; i++) {
      await lecteur.tab();
      expect(panneau().contains(document.activeElement)).toBe(true);
    }
    for (let i = 0; i < 12; i++) {
      await lecteur.tab({ shift: true });
      expect(panneau().contains(document.activeElement)).toBe(true);
    }
  });

  it("laisse les PV visibles sur la feuille, sous le voile", async () => {
    render(App);
    await userEvent.setup().click(boutonDuDock());
    expect(screen.getByText("Points de vie")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Retirer un point de vie" }),
    ).toBeInTheDocument();
  });
});

describe("panneau de dés : 1 dé ou 2 dés", () => {
  beforeEach(() => enregistrerAventure());

  it("propose « 1 dé » et « 2 dés », 2 dés choisi au départ", async () => {
    render(App);
    await userEvent.setup().click(boutonDuDock());
    expect(dansPanneau().getByRole("radio", { name: "2 dés" })).toBeChecked();
    expect(
      dansPanneau().getByRole("radio", { name: "1 dé" }),
    ).not.toBeChecked();
  });

  it("montre deux dés dessinés en SVG et leur total après un lancer de 2 dés (4 et 5)", async () => {
    render(App, { de: desFixes(4, 5) });
    await ouvrirEtLancer(userEvent.setup());
    const des = dansPanneau().getByRole("img", { name: "Dés : 4 et 5" });
    const dessins = des.querySelectorAll("svg");
    expect(dessins).toHaveLength(2);
    expect(
      Array.from(dessins).map((d) => d.querySelectorAll("circle").length),
    ).toEqual([4, 5]);
    expect(total()).toHaveTextContent("9");
    expect(bouton("Garder 9")).toBeInTheDocument();
  });

  it("montre un seul dé et son total après un lancer de 1 dé (6)", async () => {
    render(App, { de: desFixes(6) });
    await ouvrirEtLancer(userEvent.setup(), 1);
    const des = dansPanneau().getByRole("img", { name: "Dé : 6" });
    expect(des.querySelectorAll("svg")).toHaveLength(1);
    expect(des.querySelectorAll("circle")).toHaveLength(6);
    expect(total()).toHaveTextContent("6");
  });

  it("dessine chaque face de 1 à 6 avec autant de points", async () => {
    render(App, { de: desFixes(1, 2, 3, 4, 5, 6) });
    const lecteur = userEvent.setup();
    await ouvrirEtLancer(lecteur);
    const premier = dansPanneau().getByRole("img");
    expect(
      Array.from(premier.querySelectorAll("svg")).map(
        (d) => d.querySelectorAll("circle").length,
      ),
    ).toEqual([1, 2]);
    await lecteur.click(bouton("Relancer"));
    expect(
      Array.from(dansPanneau().getByRole("img").querySelectorAll("svg")).map(
        (d) => d.querySelectorAll("circle").length,
      ),
    ).toEqual([3, 4]);
    await lecteur.click(bouton("Relancer"));
    expect(
      Array.from(dansPanneau().getByRole("img").querySelectorAll("svg")).map(
        (d) => d.querySelectorAll("circle").length,
      ),
    ).toEqual([5, 6]);
  });

  it("relance avec de nouveaux dés", async () => {
    render(App, { de: desFixes(4, 5, 1, 2) });
    const lecteur = userEvent.setup();
    await ouvrirEtLancer(lecteur);
    await lecteur.click(bouton("Relancer"));
    expect(
      dansPanneau().getByRole("img", { name: "Dés : 1 et 2" }),
    ).toBeInTheDocument();
    expect(total()).toHaveTextContent("3");
  });

  it("efface le jet quand on change le nombre de dés", async () => {
    render(App, { de: desFixes(4, 5) });
    const lecteur = userEvent.setup();
    await ouvrirEtLancer(lecteur);
    await lecteur.click(dansPanneau().getByRole("radio", { name: "1 dé" }));
    expect(dansPanneau().queryByRole("status")).not.toBeInTheDocument();
    expect(bouton("Lancer")).toBeInTheDocument();
  });

  it("accepte les dés lancés par le lecteur : « J'ai lancé mes propres dés »", async () => {
    render(App, { de: desFixes(4, 5) });
    const lecteur = userEvent.setup();
    await lecteur.click(boutonDuDock());
    await lecteur.click(bouton("J'ai lancé mes propres dés"));
    expect(
      dansPanneau().getByRole("img", { name: "Dés : 1 et 1" }),
    ).toBeInTheDocument();
    await lecteur.click(bouton("Monter le dé 1"));
    await lecteur.click(bouton("Monter le dé 1"));
    await lecteur.click(bouton("Monter le dé 1"));
    await lecteur.click(bouton("Monter le dé 2"));
    await lecteur.click(bouton("Monter le dé 2"));
    await lecteur.click(bouton("Monter le dé 2"));
    await lecteur.click(bouton("Monter le dé 2"));
    expect(
      dansPanneau().getByRole("img", { name: "Dés : 4 et 5" }),
    ).toBeInTheDocument();
    expect(total()).toHaveTextContent("9");
  });

  it("garde les dés du lecteur entre 1 et 6", async () => {
    render(App);
    const lecteur = userEvent.setup();
    await lecteur.click(boutonDuDock());
    await lecteur.click(bouton("J'ai lancé mes propres dés"));
    expect(bouton("Baisser le dé 1")).toBeDisabled();
    for (let i = 0; i < 6; i++) await lecteur.click(bouton("Monter le dé 1"));
    expect(bouton("Monter le dé 1")).toBeDisabled();
    expect(
      dansPanneau().getByRole("img", { name: "Dés : 6 et 1" }),
    ).toBeInTheDocument();
  });
});

describe("panneau de dés : ajuster avec la CHANCE", () => {
  beforeEach(() => enregistrerAventure(4));

  it("dit combien de points de CHANCE il reste, avant tout ajustement", async () => {
    render(App, { de: desFixes(4, 5) });
    await ouvrirEtLancer(userEvent.setup());
    expect(dansPanneau().getByText(/Il vous reste 4 points/)).toBeVisible();
    expect(ancienTotal()).toBeNull();
  });

  it("baisse le total : 9 devient 7, l'ancien total 9 reste barré avant le nouveau", async () => {
    render(App, { de: desFixes(4, 5) });
    const lecteur = userEvent.setup();
    await ouvrirEtLancer(lecteur);
    await lecteur.click(bouton("Baisser le total"));
    await lecteur.click(bouton("Baisser le total"));
    expect(ancienTotal()).toHaveTextContent("9");
    expect(total()).toHaveTextContent(/avant : 9 maintenant 7/);
    expect(total()).toHaveTextContent("total ajusté avec 2 points de CHANCE");
    expect(
      dansPanneau().getByText(/Il vous reste 4 points · 2 seront dépensés/),
    ).toBeVisible();
    expect(dansPanneau().getByText("−2")).toBeVisible();
    expect(bouton("Garder 7")).toBeInTheDocument();
  });

  it("monte le total : 3 devient 5 pour 2 points", async () => {
    render(App, { de: desFixes(3) });
    const lecteur = userEvent.setup();
    await ouvrirEtLancer(lecteur, 1);
    await lecteur.click(bouton("Monter le total"));
    await lecteur.click(bouton("Monter le total"));
    expect(ancienTotal()).toHaveTextContent("3");
    expect(total()).toHaveTextContent("total ajusté avec 2 points de CHANCE");
    expect(dansPanneau().getByText("+2")).toBeVisible();
    expect(bouton("Garder 5")).toBeInTheDocument();
  });

  it("écrit « 1 point » au singulier", async () => {
    render(App, { de: desFixes(3) });
    const lecteur = userEvent.setup();
    await ouvrirEtLancer(lecteur, 1);
    await lecteur.click(bouton("Monter le total"));
    expect(total()).toHaveTextContent("total ajusté avec 1 point de CHANCE");
    expect(dansPanneau().getByText(/1 sera dépensé/)).toBeVisible();
  });

  it("n'affiche plus l'ancien total quand l'ajustement revient à zéro", async () => {
    render(App, { de: desFixes(3) });
    const lecteur = userEvent.setup();
    await ouvrirEtLancer(lecteur, 1);
    await lecteur.click(bouton("Monter le total"));
    await lecteur.click(bouton("Baisser le total"));
    expect(ancienTotal()).toBeNull();
    expect(bouton("Garder 3")).toBeInTheDocument();
  });

  it("ne laisse pas dépenser plus que la CHANCE disponible, vers le haut", async () => {
    render(App, { de: desFixes(3) });
    const lecteur = userEvent.setup();
    await ouvrirEtLancer(lecteur, 1);
    for (let i = 0; i < 4; i++) await lecteur.click(bouton("Monter le total"));
    expect(bouton("Monter le total")).toBeDisabled();
    await lecteur.click(bouton("Monter le total"));
    expect(bouton("Garder 7")).toBeInTheDocument();
    expect(dansPanneau().getByText(/4 seront dépensés/)).toBeVisible();
  });

  it("ne laisse pas dépenser plus que la CHANCE disponible, vers le bas", async () => {
    render(App, { de: desFixes(6, 6) });
    const lecteur = userEvent.setup();
    await ouvrirEtLancer(lecteur);
    for (let i = 0; i < 4; i++) await lecteur.click(bouton("Baisser le total"));
    expect(bouton("Baisser le total")).toBeDisabled();
    expect(bouton("Garder 8")).toBeInTheDocument();
  });

  it("revient d'un cran avec l'autre bouton, même au maximum de CHANCE", async () => {
    render(App, { de: desFixes(3) });
    const lecteur = userEvent.setup();
    await ouvrirEtLancer(lecteur, 1);
    for (let i = 0; i < 4; i++) await lecteur.click(bouton("Monter le total"));
    await lecteur.click(bouton("Baisser le total"));
    expect(bouton("Garder 6")).toBeInTheDocument();
  });

  it("remet l'ajustement à zéro quand on relance", async () => {
    render(App, { de: desFixes(3, 4) });
    const lecteur = userEvent.setup();
    await ouvrirEtLancer(lecteur, 1);
    await lecteur.click(bouton("Monter le total"));
    await lecteur.click(bouton("Relancer"));
    expect(ancienTotal()).toBeNull();
    expect(bouton("Garder 4")).toBeInTheDocument();
  });

  it("garde l'ajustement quand le lecteur corrige un de ses dés", async () => {
    render(App);
    const lecteur = userEvent.setup();
    await lecteur.click(boutonDuDock());
    await lecteur.click(bouton("J'ai lancé mes propres dés"));
    await lecteur.click(bouton("Monter le total"));
    await lecteur.click(bouton("Monter le dé 1"));
    // dés 2 et 1 = 3, plus 1 point de CHANCE
    expect(bouton("Garder 4")).toBeInTheDocument();
    expect(ancienTotal()).toHaveTextContent("3");
  });
});

describe("panneau de dés : sans CHANCE", () => {
  beforeEach(() => enregistrerAventure(0));

  it("le pas à pas est éteint et le panneau le dit", async () => {
    render(App, { de: desFixes(4, 5) });
    await ouvrirEtLancer(userEvent.setup());
    expect(bouton("Baisser le total")).toBeDisabled();
    expect(bouton("Monter le total")).toBeDisabled();
    expect(
      dansPanneau().getByText(/Il ne vous reste aucun point/),
    ).toBeVisible();
    expect(bouton("Garder 9")).toBeInTheDocument();
  });
});

describe("panneau de dés : valider ou fermer", () => {
  beforeEach(() => enregistrerAventure(4));

  it("retire de la CHANCE exactement les points dépensés, en baissant", async () => {
    render(App, { de: desFixes(4, 5) });
    const lecteur = userEvent.setup();
    await ouvrirEtLancer(lecteur);
    await lecteur.click(bouton("Baisser le total"));
    await lecteur.click(bouton("Baisser le total"));
    await lecteur.click(bouton("Garder 7"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(chanceEnregistree()).toBe(2);
    expect(
      within(screen.getByRole("group", { name: "Chance" })).getByRole(
        "button",
        { name: /Chance/ },
      ),
    ).toHaveTextContent("2");
  });

  it("retire aussi 1 CHANCE par point en montant", async () => {
    render(App, { de: desFixes(3) });
    const lecteur = userEvent.setup();
    await ouvrirEtLancer(lecteur, 1);
    await lecteur.click(bouton("Monter le total"));
    await lecteur.click(bouton("Monter le total"));
    await lecteur.click(bouton("Monter le total"));
    await lecteur.click(bouton("Garder 6"));
    expect(chanceEnregistree()).toBe(1);
  });

  it("ne retire rien quand le total n'est pas ajusté", async () => {
    render(App, { de: desFixes(4, 5) });
    const lecteur = userEvent.setup();
    await ouvrirEtLancer(lecteur);
    await lecteur.click(bouton("Garder 9"));
    expect(chanceEnregistree()).toBe(4);
  });

  it("peut dépenser toute la CHANCE, jusqu'à 0", async () => {
    render(App, { de: desFixes(3) });
    const lecteur = userEvent.setup();
    await ouvrirEtLancer(lecteur, 1);
    for (let i = 0; i < 6; i++) await lecteur.click(bouton("Monter le total"));
    await lecteur.click(bouton("Garder 7"));
    expect(chanceEnregistree()).toBe(0);
  });

  it("laisse la trace de craie sur la CHANCE de la feuille une fois validé", async () => {
    render(App, { de: desFixes(4, 5) });
    const lecteur = userEvent.setup();
    await ouvrirEtLancer(lecteur);
    await lecteur.click(bouton("Baisser le total"));
    await lecteur.click(bouton("Garder 8"));
    expect(
      within(screen.getByRole("group", { name: "Chance" }))
        .getByText(/avant/)
        .closest("s"),
    ).toHaveTextContent("4");
  });

  it("ne retire rien en fermant par le bouton de fermeture", async () => {
    render(App, { de: desFixes(4, 5) });
    const lecteur = userEvent.setup();
    await ouvrirEtLancer(lecteur);
    await lecteur.click(bouton("Baisser le total"));
    await lecteur.click(bouton("Fermer"));
    expect(chanceEnregistree()).toBe(4);
  });

  it("ne retire rien en fermant par le voile", async () => {
    render(App, { de: desFixes(4, 5) });
    const lecteur = userEvent.setup();
    await ouvrirEtLancer(lecteur);
    await lecteur.click(bouton("Baisser le total"));
    await lecteur.click(document.querySelector(".voile")!);
    expect(chanceEnregistree()).toBe(4);
  });

  it("ne retire rien en fermant avec Échap", async () => {
    render(App, { de: desFixes(4, 5) });
    const lecteur = userEvent.setup();
    await ouvrirEtLancer(lecteur);
    await lecteur.click(bouton("Baisser le total"));
    await lecteur.keyboard("{Escape}");
    expect(chanceEnregistree()).toBe(4);
  });

  it("rouvre un panneau neuf : 2 dés, rien lancé, aucun ajustement", async () => {
    render(App, { de: desFixes(4, 5) });
    const lecteur = userEvent.setup();
    await ouvrirEtLancer(lecteur);
    await lecteur.click(bouton("Baisser le total"));
    await lecteur.click(bouton("Fermer"));
    await lecteur.click(boutonDuDock());
    expect(dansPanneau().queryByRole("status")).not.toBeInTheDocument();
    expect(bouton("Lancer")).toBeInTheDocument();
  });

  it("retrouve la CHANCE dépensée après avoir fermé et rouvert l'app", async () => {
    const { unmount } = render(App, { de: desFixes(4, 5) });
    const lecteur = userEvent.setup();
    await ouvrirEtLancer(lecteur);
    await lecteur.click(bouton("Baisser le total"));
    await lecteur.click(bouton("Garder 8"));
    unmount();

    render(App);
    expect(
      within(screen.getByRole("group", { name: "Chance" })).getByRole(
        "button",
        { name: /Chance/ },
      ),
    ).toHaveTextContent("3");
  });
});
