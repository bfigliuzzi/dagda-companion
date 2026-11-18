import { render, screen, within } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import App from "../App.svelte";
import type { Arme, Personnage } from "./aventure";
import { desFixes } from "./des";
import type { Effet } from "./valeursEffectives";
import { CLE_STOCKAGE, ecrireAventure } from "./stockage";

/** Une aventure en cours : PV 28 / 32, CHANCE 4, DEX 7, sans arme ni effet. */
function enregistrerAventure({
  effets = [],
  armes = [],
  personnage = {},
}: {
  effets?: Effet[];
  armes?: Arme[];
  personnage?: Partial<Personnage>;
} = {}) {
  localStorage.clear();
  ecrireAventure(localStorage, {
    chapitre: 112,
    mode: "simplifie",
    sauvegardesUtilisees: 0,
    sauvegarde: null,
    notes: "",
    armes,
    besace: { objets: [], bourse: false, boulons: 0, boulonsForces: false },
    effets,
    combat: null,
    combats: [],
    personnage: {
      talent: "Herbologie",
      pointsDeVieMax: 32,
      pointsDeVie: 28,
      chance: 4,
      dexterite: 7,
      ...personnage,
    },
  });
}

const potion: Effet = {
  nom: "Potion d'agilité",
  duree: "24 h",
  cible: "dexterite",
  valeur: 1,
};
const herboriste: Effet = {
  nom: "retourner voir l'herboriste",
  duree: "",
  cible: null,
  valeur: 0,
};

type Lecteur = ReturnType<typeof userEvent.setup>;

const section = () => screen.getByRole("region", { name: "Effets" });
const dansSection = () => within(section());
const lignes = () => dansSection().queryAllByRole("listitem");
const panneau = () => screen.getByRole("dialog", { name: "Nouvel effet" });
const dansPanneau = () => within(panneau());
const bloc = (nom: string) => screen.getByRole("group", { name: nom });
const valeurDe = (nom: string) =>
  within(bloc(nom)).getByRole("button", {
    name: new RegExp(`^${nom}, modifier`),
  });
const pointsDeVie = () => bloc("Points de vie");
/** « 28 / 32 », lu sur les deux valeurs, sans la trace de craie de l'ancienne. */
const pvAffiches = () =>
  `${valeurDe("Points de vie").textContent!.trim()} / ${within(pointsDeVie())
    .getByRole("button", { name: /^Points de vie maximum, modifier/ })
    .textContent!.trim()}`;
const effetsEnregistres = () =>
  JSON.parse(localStorage.getItem(CLE_STOCKAGE)!).aventure.effets;
const personnageEnregistre = () =>
  JSON.parse(localStorage.getItem(CLE_STOCKAGE)!).aventure.personnage;

/** Le lecteur remplit le panneau « Nouvel effet » et valide. */
async function ajouterUnEffet(
  lecteur: Lecteur,
  {
    nom,
    cible,
    valeur,
    duree,
  }: { nom: string; cible?: string; valeur?: string; duree?: string },
) {
  await lecteur.click(
    dansSection().getByRole("button", { name: "Ajouter un effet" }),
  );
  await lecteur.type(dansPanneau().getByLabelText("Nom"), nom);
  if (cible === undefined) {
    await lecteur.click(
      dansPanneau().getByRole("radio", { name: "Simple rappel" }),
    );
  } else {
    await lecteur.click(dansPanneau().getByRole("radio", { name: cible }));
  }
  if (valeur !== undefined) {
    const champ = dansPanneau().getByLabelText("De combien");
    await lecteur.clear(champ);
    await lecteur.type(champ, valeur);
  }
  if (duree !== undefined) {
    await lecteur.type(
      dansPanneau().getByLabelText("Durée (facultatif)"),
      duree,
    );
  }
  await lecteur.click(
    dansPanneau().getByRole("button", {
      name: cible === undefined ? "Ajouter le rappel" : "Ajouter l'effet",
    }),
  );
}

describe("section Effets", () => {
  beforeEach(() => enregistrerAventure());

  it("vient entre les Armes et la Besace, vide, avec « Ajouter un effet »", () => {
    render(App);
    const titres = screen
      .getAllByRole("heading", { level: 2 })
      .map((titre) => titre.textContent);
    expect(titres.indexOf("Effets")).toBe(titres.indexOf("Armes") + 1);
    expect(titres.indexOf("Besace")).toBe(titres.indexOf("Effets") + 1);
    expect(lignes()).toHaveLength(0);
    expect(
      dansSection().getByRole("button", { name: "Ajouter un effet" }),
    ).toBeInTheDocument();
  });

  it("montre chaque effet avec sa cible, sa valeur et sa durée, et compte les actifs", () => {
    enregistrerAventure({ effets: [potion, herboriste] });
    render(App);
    expect(dansSection().getByText("2 actifs")).toBeInTheDocument();
    const [effet, rappel] = lignes();
    expect(effet).toHaveTextContent("Potion d'agilité · DEX +1");
    expect(effet).toHaveTextContent("24 h");
    expect(rappel).toHaveTextContent("Rappel · retourner voir l'herboriste");
  });

  it("écrit « 1 actif » au singulier", () => {
    enregistrerAventure({ effets: [potion] });
    render(App);
    expect(dansSection().getByText("1 actif")).toBeInTheDocument();
  });

  it("écrit les noms d'effets actifs en vert et les rappels en craie grise", () => {
    enregistrerAventure({ effets: [potion, herboriste] });
    render(App);
    expect(dansSection().getByText("Potion d'agilité · DEX +1")).toHaveClass(
      "vert",
    );
    const rappel = dansSection().getByText("retourner voir l'herboriste", {
      exact: false,
    });
    expect(rappel).toHaveClass("gris");
    expect(rappel).not.toHaveClass("vert");
  });
});

describe("panneau « Nouvel effet »", () => {
  beforeEach(() => enregistrerAventure());

  it("s'ouvre depuis « Ajouter un effet » et propose la cible en puces, ou un simple rappel", async () => {
    render(App);
    const lecteur = userEvent.setup();
    await lecteur.click(
      dansSection().getByRole("button", { name: "Ajouter un effet" }),
    );
    expect(
      dansPanneau().getByRole("radio", { name: "Change une valeur" }),
    ).toBeChecked();
    const puces = within(
      dansPanneau().getByRole("radiogroup", { name: "Valeur modifiée" }),
    )
      .getAllByRole("radio")
      .map((puce) => puce.closest("label")!.textContent!.trim());
    expect(puces).toEqual(["PV", "PV max", "Chance", "Dextérité", "Dégâts"]);

    await lecteur.click(
      dansPanneau().getByRole("radio", { name: "Simple rappel" }),
    );
    expect(
      dansPanneau().queryByRole("radiogroup", { name: "Valeur modifiée" }),
    ).not.toBeInTheDocument();
    expect(
      dansPanneau().queryByLabelText("De combien"),
    ).not.toBeInTheDocument();
  });

  it("ajoute un effet chiffré, enregistré tout de suite et retrouvé après rechargement", async () => {
    const { unmount } = render(App);
    await ajouterUnEffet(userEvent.setup(), {
      nom: "Potion d'agilité",
      cible: "Dextérité",
      duree: "24 h",
    });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(effetsEnregistres()).toEqual([potion]);
    unmount();

    render(App);
    expect(lignes()[0]).toHaveTextContent("Potion d'agilité · DEX +1");
  });

  it("ajoute un simple rappel, sans valeur ni changement de la feuille", async () => {
    render(App);
    await ajouterUnEffet(userEvent.setup(), {
      nom: "retourner voir l'herboriste",
    });
    expect(effetsEnregistres()).toEqual([herboriste]);
    expect(lignes()[0]).toHaveTextContent(
      "Rappel · retourner voir l'herboriste",
    );
    expect(valeurDe("Dextérité")).toHaveTextContent("7");
  });

  it("part d'un bonus de +1, à régler dans les deux sens, malus compris", async () => {
    render(App);
    await ajouterUnEffet(userEvent.setup(), {
      nom: "Poison",
      cible: "Dextérité",
      valeur: "-2",
    });
    expect(lignes()[0]).toHaveTextContent("Poison · DEX −2");
  });

  it("dit ce qui manque tant que l'effet n'est pas complet, sans rien ajouter", async () => {
    render(App);
    const lecteur = userEvent.setup();
    await lecteur.click(
      dansSection().getByRole("button", { name: "Ajouter un effet" }),
    );
    await lecteur.click(
      dansPanneau().getByRole("button", { name: "Nommez d'abord l'effet" }),
    );
    expect(panneau()).toBeInTheDocument();

    await lecteur.type(dansPanneau().getByLabelText("Nom"), "Potion");
    await lecteur.click(
      dansPanneau().getByRole("button", {
        name: "Choisissez d'abord la valeur modifiée",
      }),
    );
    expect(panneau()).toBeInTheDocument();
    expect(effetsEnregistres()).toEqual([]);
  });

  it("annonce ce qui va changer : « PV max passera de 32 à 34 »", async () => {
    render(App);
    const lecteur = userEvent.setup();
    await lecteur.click(
      dansSection().getByRole("button", { name: "Ajouter un effet" }),
    );
    await lecteur.click(dansPanneau().getByRole("radio", { name: "PV max" }));
    await lecteur.click(
      dansPanneau().getByRole("button", { name: "Augmenter De combien" }),
    );
    expect(panneau()).toHaveTextContent(
      "PV max passera de 32 à 34. Vous retirerez l'effet quand le livre le dira.",
    );
  });

  it("se ferme par la croix sans rien ajouter", async () => {
    render(App);
    const lecteur = userEvent.setup();
    await lecteur.click(
      dansSection().getByRole("button", { name: "Ajouter un effet" }),
    );
    await lecteur.type(dansPanneau().getByLabelText("Nom"), "Potion");
    await lecteur.click(dansPanneau().getByRole("button", { name: "Fermer" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(lignes()).toHaveLength(0);
  });
});

describe("valeurs effectives sur la feuille", () => {
  it("DEXTÉRITÉ : 8 en vert, avec « base 7 · potion +1 »", () => {
    enregistrerAventure({ effets: [potion] });
    render(App);
    expect(valeurDe("Dextérité")).toHaveTextContent("8");
    expect(valeurDe("Dextérité").closest("b")).toHaveClass("vert");
    expect(
      within(bloc("Dextérité").parentElement!).getByText("base 7 · potion +1"),
    ).toHaveClass("vert");
  });

  it("garde la DEXTÉRITÉ en craie sans effet, sans ligne d'explication", () => {
    enregistrerAventure({ effets: [herboriste] });
    render(App);
    expect(valeurDe("Dextérité").closest("b")).not.toHaveClass("vert");
    expect(screen.queryByText(/^base /)).not.toBeInTheDocument();
  });

  it("CHANCE : la valeur effective en vert avec sa ligne", () => {
    enregistrerAventure({
      effets: [
        {
          nom: "Trèfle à quatre feuilles",
          duree: "",
          cible: "chance",
          valeur: 2,
        },
      ],
    });
    render(App);
    expect(valeurDe("Chance")).toHaveTextContent("6");
    expect(valeurDe("Chance").closest("b")).toHaveClass("vert");
    expect(screen.getByText("base 4 · trèfle +2")).toHaveClass("vert");
  });

  it("PV : un bonus de PV monte les PV et le maximum, en vert avec leurs lignes", () => {
    enregistrerAventure({
      effets: [
        { nom: "Bague de vigueur", duree: "", cible: "pointsDeVie", valeur: 2 },
      ],
    });
    render(App);
    expect(pvAffiches()).toBe("30 / 34");
    expect(valeurDe("Points de vie").closest("b")).toHaveClass("vert");
    expect(screen.getByText("base 28 · bague +2")).toBeInTheDocument();
    expect(screen.getByText("max : base 32 · bague +2")).toBeInTheDocument();
  });

  it("PV max : seul le maximum monte, en vert avec sa ligne", () => {
    enregistrerAventure({
      effets: [
        {
          nom: "Bague de vigueur",
          duree: "",
          cible: "pointsDeVieMax",
          valeur: 2,
        },
      ],
    });
    render(App);
    expect(pvAffiches()).toBe("28 / 34");
    expect(valeurDe("Points de vie").closest("b")).not.toHaveClass("vert");
    expect(
      within(pointsDeVie()).getByRole("button", {
        name: /^Points de vie maximum, modifier/,
      }).parentElement,
    ).toHaveClass("vert");
    expect(screen.getByText("max : base 32 · bague +2")).toBeInTheDocument();
  });

  it("dégâts : la valeur effective additionne armes et effets, en vert avec sa ligne", () => {
    enregistrerAventure({
      armes: [{ nom: "Épée courte", bonus: 1 }],
      effets: [
        { nom: "Rage du berserker", duree: "", cible: "degats", valeur: 2 },
      ],
    });
    render(App);
    const armes = within(screen.getByRole("region", { name: "Armes" }));
    expect(armes.getByText("+3 aux dégâts")).toHaveClass("vert");
    expect(armes.getByText("base +1 · rage +2")).toHaveClass("vert");
  });

  it("« − » et « + » changent les PV affichés, et la perte reste après le retrait du bonus", async () => {
    enregistrerAventure({
      effets: [
        { nom: "Bague de vigueur", duree: "", cible: "pointsDeVie", valeur: 2 },
      ],
    });
    render(App);
    const lecteur = userEvent.setup();
    await lecteur.click(
      screen.getByRole("button", { name: "Retirer un point de vie" }),
    );
    expect(pvAffiches()).toBe("29 / 34");
    expect(personnageEnregistre().pointsDeVie).toBe(27);

    await lecteur.click(
      dansSection().getByRole("button", {
        name: "Retirer l'effet Bague de vigueur",
      }),
    );
    expect(pvAffiches()).toBe("27 / 32");
  });

  it("« + » s'arrête au maximum effectif", async () => {
    enregistrerAventure({
      personnage: { pointsDeVie: 32 },
      effets: [
        {
          nom: "Bague de vigueur",
          duree: "",
          cible: "pointsDeVieMax",
          valeur: 2,
        },
      ],
    });
    render(App);
    const lecteur = userEvent.setup();
    const plus = screen.getByRole("button", {
      name: "Ajouter un point de vie",
    });
    await lecteur.click(plus);
    await lecteur.click(plus);
    await lecteur.click(plus);
    expect(pvAffiches()).toBe("34 / 34");
  });

  it("une correction à la main porte sur la valeur affichée", async () => {
    enregistrerAventure({ effets: [potion] });
    render(App);
    const lecteur = userEvent.setup();
    await lecteur.click(valeurDe("Dextérité"));
    const saisie = screen.getByLabelText("DEXTÉRITÉ");
    await lecteur.clear(saisie);
    await lecteur.type(saisie, "9{Enter}");
    expect(valeurDe("Dextérité")).toHaveTextContent("9");
    expect(screen.getByText("base 8 · potion +1")).toBeInTheDocument();
  });

  it("le panneau de dés ajuste avec la CHANCE effective, et la dépense sort de la base", async () => {
    enregistrerAventure({
      personnage: { chance: 1 },
      effets: [{ nom: "Trèfle", duree: "", cible: "chance", valeur: 2 }],
    });
    render(App, { de: desFixes(2, 3) });
    const lecteur = userEvent.setup();
    await lecteur.click(screen.getByRole("button", { name: "Lancer les dés" }));
    const des = within(screen.getByRole("dialog", { name: "Lancer les dés" }));
    await lecteur.click(des.getByRole("button", { name: "Lancer" }));
    const monter = des.getByRole("button", { name: "Monter le total" });
    await lecteur.click(monter);
    await lecteur.click(monter);
    await lecteur.click(monter);
    expect(monter).toBeDisabled();
    await lecteur.click(des.getByRole("button", { name: "Garder 8" }));

    expect(valeurDe("Chance")).toHaveTextContent("0");
    expect(personnageEnregistre().chance).toBe(-2);
    await lecteur.click(
      dansSection().getByRole("button", { name: "Retirer l'effet Trèfle" }),
    );
    expect(valeurDe("Chance")).toHaveTextContent("0");
    expect(personnageEnregistre().chance).toBe(0);
  });
});

describe("retirer un effet", () => {
  it("le fait disparaître, enregistré aussitôt", async () => {
    enregistrerAventure({ effets: [potion, herboriste] });
    render(App);
    const lecteur = userEvent.setup();
    await lecteur.click(
      dansSection().getByRole("button", {
        name: "Retirer le rappel retourner voir l'herboriste",
      }),
    );
    expect(lignes()).toHaveLength(1);
    expect(effetsEnregistres()).toEqual([potion]);
  });

  it("ramène la valeur à sa base, avec la trace de craie sur la valeur qui change", async () => {
    enregistrerAventure({ effets: [potion] });
    render(App);
    await userEvent.setup().click(
      dansSection().getByRole("button", {
        name: "Retirer l'effet Potion d'agilité",
      }),
    );
    expect(lignes()).toHaveLength(0);
    expect(valeurDe("Dextérité")).toHaveTextContent("7");
    expect(valeurDe("Dextérité").closest("b")).not.toHaveClass("vert");
    expect(
      within(bloc("Dextérité")).getByText("8", { selector: "s" }),
    ).toHaveTextContent("avant : 8");
    expect(screen.queryByText("base 7 · potion +1")).not.toBeInTheDocument();
  });

  it("retirer un bonus de PV max ramène le maximum à sa base", async () => {
    enregistrerAventure({
      effets: [
        {
          nom: "Bague de vigueur",
          duree: "",
          cible: "pointsDeVieMax",
          valeur: 2,
        },
      ],
    });
    render(App);
    expect(pvAffiches()).toBe("28 / 34");
    await userEvent.setup().click(
      dansSection().getByRole("button", {
        name: "Retirer l'effet Bague de vigueur",
      }),
    );
    expect(pvAffiches()).toBe("28 / 32");
    expect(
      within(pointsDeVie()).getByText("34", { selector: "s" }),
    ).toBeInTheDocument();
  });

  it("retirer un bonus de dommage ramène les dégâts au bonus des armes, avec la trace", async () => {
    enregistrerAventure({
      armes: [{ nom: "Épée courte", bonus: 1 }],
      effets: [{ nom: "Rage", duree: "", cible: "degats", valeur: 2 }],
    });
    render(App);
    await userEvent
      .setup()
      .click(
        dansSection().getByRole("button", { name: "Retirer l'effet Rage" }),
      );
    const armes = within(screen.getByRole("region", { name: "Armes" }));
    expect(armes.getByText("+1 aux dégâts")).not.toHaveClass("vert");
    expect(armes.getByText("+3", { selector: "s" })).toBeInTheDocument();
  });
});
