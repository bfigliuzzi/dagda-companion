import { render, screen, within } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import App from "../App.svelte";

import { desFixes } from "./des";
import type { Effet } from "./valeursEffectives";
import { CLE_STOCKAGE } from "./stockage";
import { enregistrerAventure } from "./test/uneAventure";

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
const elixir = (valeur = 2): Effet => ({
  nom: valeur < 0 ? "Poison" : "Élixir de vigueur",
  duree: "",
  cible: "pointsDeVie",
  valeur,
});
const bague: Effet = {
  nom: "Bague de vigueur",
  duree: "",
  cible: "pointsDeVieMax",
  valeur: 2,
};
const indiceDeDepassement = () =>
  screen.queryByText(/Vos PV dépassent le maximum/);
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
    expect(
      dansSection().getByText("Potion d'agilité · DEX +1"),
    ).toHaveAttribute("data-etat", "actif");
    const rappel = dansSection().getByText("retourner voir l'herboriste", {
      exact: false,
    });
    expect(rappel).toHaveAttribute("data-etat", "rappel");
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

  it("annonce un effet sur les PV sans toucher au maximum : « PV passeront de 28 à 30 »", async () => {
    render(App);
    const lecteur = userEvent.setup();
    await lecteur.click(
      dansSection().getByRole("button", { name: "Ajouter un effet" }),
    );
    await lecteur.click(dansPanneau().getByRole("radio", { name: "PV" }));
    await lecteur.click(
      dansPanneau().getByRole("button", { name: "Augmenter De combien" }),
    );
    expect(panneau()).toHaveTextContent(
      "PV passeront de 28 à 30. Vous retirerez l'effet quand le livre le dira.",
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
    expect(valeurDe("Dextérité").closest("b")).toHaveAttribute(
      "data-etat",
      "modifie",
    );
    expect(
      within(bloc("Dextérité").parentElement!).getByText("base 7 · potion +1"),
    ).toHaveAttribute("data-etat", "modifie");
  });

  it("garde la DEXTÉRITÉ en craie sans effet, sans ligne d'explication", () => {
    enregistrerAventure({ effets: [herboriste] });
    render(App);
    expect(valeurDe("Dextérité").closest("b")).not.toHaveAttribute(
      "data-etat",
      "modifie",
    );
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
    expect(valeurDe("Chance").closest("b")).toHaveAttribute(
      "data-etat",
      "modifie",
    );
    expect(screen.getByText("base 4 · trèfle +2")).toHaveAttribute(
      "data-etat",
      "modifie",
    );
  });

  it("PV : un effet sur les PV ne change que les PV, écrits « 36 (34 + 2) / 34 » avec la décomposition en vert", () => {
    enregistrerAventure({
      personnage: { pointsDeVie: 34, pointsDeVieMax: 34 },
      effets: [elixir(2)],
    });
    render(App);
    expect(pointsDeVie()).toHaveTextContent("36 (34 + 2) / 34");
    expect(valeurDe("Points de vie").closest("b")).toHaveAttribute(
      "data-etat",
      "modifie",
    );
    expect(within(pointsDeVie()).getByText("(34 + 2)")).toHaveAttribute(
      "data-etat",
      "modifie",
    );
    expect(screen.getByText("base 34 · élixir +2")).toBeInTheDocument();
    // Le maximum ne bouge pas : ni vert, ni ligne « max : ».
    expect(
      within(pointsDeVie()).getByRole("button", {
        name: /^Points de vie maximum, modifier/,
      }).parentElement,
    ).not.toHaveAttribute("data-etat", "modifie");
    expect(screen.queryByText(/^max :/)).not.toBeInTheDocument();
    // Le dépassement vient de l'effet : pas d'indice.
    expect(indiceDeDepassement()).not.toBeInTheDocument();
  });

  it("PV : un malus s'écrit avec le vrai signe moins, « 30 (34 − 4) / 34 »", () => {
    enregistrerAventure({
      personnage: { pointsDeVie: 34, pointsDeVieMax: 34 },
      effets: [elixir(-4)],
    });
    render(App);
    expect(pointsDeVie()).toHaveTextContent("30 (34 − 4) / 34");
  });

  it("PV : plusieurs effets s'additionnent en un terme, et la ligne les nomme un à un", () => {
    enregistrerAventure({
      personnage: { pointsDeVie: 34, pointsDeVieMax: 34 },
      effets: [elixir(2), elixir(-1)],
    });
    render(App);
    expect(pointsDeVie()).toHaveTextContent("35 (34 + 1) / 34");
    expect(
      screen.getByText("base 34 · élixir +2 · poison −1"),
    ).toBeInTheDocument();
  });

  it("PV : l'état critique garde le rouge sur le gros chiffre, la décomposition reste verte", () => {
    enregistrerAventure({
      personnage: { pointsDeVie: 3 },
      effets: [elixir(2)],
    });
    render(App);
    expect(pointsDeVie()).toHaveTextContent("5 (3 + 2) / 32");
    expect(valeurDe("Points de vie").closest("b")).toHaveAttribute(
      "data-etat",
      "critique",
    );
    expect(within(pointsDeVie()).getByText("(3 + 2)")).toHaveAttribute(
      "data-etat",
      "modifie",
    );
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
    expect(valeurDe("Points de vie").closest("b")).not.toHaveAttribute(
      "data-etat",
      "modifie",
    );
    expect(
      within(pointsDeVie()).getByRole("button", {
        name: /^Points de vie maximum, modifier/,
      }).parentElement,
    ).toHaveAttribute("data-etat", "modifie");
    expect(screen.getByText("max : base 32 · bague +2")).toBeInTheDocument();
    expect(within(pointsDeVie()).queryByText(/^\(/)).not.toBeInTheDocument();
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
    expect(armes.getByText("+3 aux dégâts")).toHaveAttribute(
      "data-etat",
      "modifie",
    );
    expect(armes.getByText("base +1 · rage +2")).toHaveAttribute(
      "data-etat",
      "modifie",
    );
  });

  it("« − » et « + » changent les PV affichés, et la perte reste après le retrait de l'effet", async () => {
    enregistrerAventure({ effets: [elixir(2)] });
    render(App);
    const lecteur = userEvent.setup();
    expect(pointsDeVie()).toHaveTextContent("30 (28 + 2) / 32");
    await lecteur.click(
      screen.getByRole("button", { name: "Retirer un point de vie" }),
    );
    expect(pointsDeVie()).toHaveTextContent("29 (27 + 2) / 32");
    expect(personnageEnregistre().pointsDeVie).toBe(27);

    await lecteur.click(
      dansSection().getByRole("button", {
        name: "Retirer l'effet Élixir de vigueur",
      }),
    );
    expect(pvAffiches()).toBe("27 / 32");
  });

  it("« + » s'arrête au maximum effectif", async () => {
    enregistrerAventure({
      personnage: { pointsDeVie: 32 },
      effets: [bague],
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

  it("choix par défaut : avec un effet sur les PV, « + » s'arrête au maximum plus l'effet (36 (34 + 2) / 34 : « + » ne fait rien, « − » donne 35)", async () => {
    enregistrerAventure({
      personnage: { pointsDeVie: 34, pointsDeVieMax: 34 },
      effets: [elixir(2)],
    });
    render(App);
    const lecteur = userEvent.setup();
    const plus = screen.getByRole("button", {
      name: "Ajouter un point de vie",
    });
    await lecteur.click(plus);
    expect(pointsDeVie()).toHaveTextContent("36 (34 + 2) / 34");
    await lecteur.click(
      screen.getByRole("button", { name: "Retirer un point de vie" }),
    );
    expect(pointsDeVie()).toHaveTextContent("35 (33 + 2) / 34");
    await lecteur.click(plus);
    await lecteur.click(plus);
    expect(pointsDeVie()).toHaveTextContent("36 (34 + 2) / 34");
  });

  it("choix par défaut : avec un malus sur les PV, « + » s'arrête au maximum moins le malus (30 (34 − 4) / 34)", async () => {
    enregistrerAventure({
      personnage: { pointsDeVie: 33, pointsDeVieMax: 34 },
      effets: [elixir(-4)],
    });
    render(App);
    const lecteur = userEvent.setup();
    const plus = screen.getByRole("button", {
      name: "Ajouter un point de vie",
    });
    await lecteur.click(plus);
    await lecteur.click(plus);
    expect(pointsDeVie()).toHaveTextContent("30 (34 − 4) / 34");
  });

  it("choix par défaut : l'indice de dépassement revient quand la base elle-même dépasse le maximum (saisie à la main)", async () => {
    enregistrerAventure({
      personnage: { pointsDeVie: 34, pointsDeVieMax: 34 },
      effets: [elixir(2)],
    });
    render(App);
    const lecteur = userEvent.setup();
    await lecteur.click(valeurDe("Points de vie"));
    const saisie = screen.getByLabelText("Points de vie actuels");
    await lecteur.clear(saisie);
    await lecteur.type(saisie, "38{Enter}");
    expect(pointsDeVie()).toHaveTextContent("38 (36 + 2) / 34");
    expect(indiceDeDepassement()).toHaveTextContent(
      "Vos PV dépassent le maximum de 34",
    );
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
    expect(valeurDe("Dextérité").closest("b")).not.toHaveAttribute(
      "data-etat",
      "modifie",
    );
    expect(
      within(bloc("Dextérité")).getByText("8", { selector: "s" }),
    ).toHaveTextContent("avant : 8");
    expect(screen.queryByText("base 7 · potion +1")).not.toBeInTheDocument();
  });

  it("retirer un bonus de PV max ramène le maximum à sa base", async () => {
    enregistrerAventure({ effets: [bague] });
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

  it("choix par défaut : retirer un bonus de PV max à 34 / 34 laisse les PV à 34, avec l'indice de dépassement", async () => {
    enregistrerAventure({ personnage: { pointsDeVie: 34 }, effets: [bague] });
    render(App);
    expect(indiceDeDepassement()).not.toBeInTheDocument();
    await userEvent.setup().click(
      dansSection().getByRole("button", {
        name: "Retirer l'effet Bague de vigueur",
      }),
    );
    expect(pvAffiches()).toBe("34 / 32");
    expect(personnageEnregistre().pointsDeVie).toBe(34);
    expect(indiceDeDepassement()).toHaveTextContent(
      "Vos PV dépassent le maximum de 32",
    );
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
    expect(armes.getByText("+1 aux dégâts")).not.toHaveAttribute(
      "data-etat",
      "modifie",
    );
    expect(armes.getByText("+3", { selector: "s" })).toBeInTheDocument();
  });
});
