import { render, screen, within } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import App from "../App.svelte";
import { besaceVide, type Besace } from "./aventure";
import { CLE_STOCKAGE, ecrireAventure } from "./stockage";

function enregistrerAventure(partiel: Partial<Besace> = {}) {
  localStorage.clear();
  ecrireAventure(localStorage, {
    chapitre: 112,
    mode: "simplifie",
    sauvegardesUtilisees: 0,
    sauvegarde: null,
    notes: "",
    armes: [],
    besace: { ...besaceVide(), ...partiel },
    effets: [],
    combat: null,
    combats: [],
    personnage: {
      talent: "Herbologie",
      pointsDeVieMax: 32,
      pointsDeVie: 28,
      chance: 4,
      dexterite: 7,
    },
  });
}

const objets = (n: number) => Array.from({ length: n }, (_, i) => `Objet ${i}`);

const section = () => screen.getByRole("region", { name: "Besace" });
const dansSection = () => within(section());
const bouton = (nom: string | RegExp) =>
  dansSection().getByRole("button", { name: nom });
const lignes = () => dansSection().queryAllByRole("listitem");
const besaceEnregistree = () =>
  JSON.parse(localStorage.getItem(CLE_STOCKAGE)!).aventure.besace;
const traits = () => dansSection().getByRole("img").querySelectorAll("i");
const traitsRouges = () =>
  dansSection().getByRole("img").querySelectorAll("i.over");
const traitsDeCraie = () =>
  dansSection().getByRole("img").querySelectorAll("i.f");

async function ajouter(
  lecteur: ReturnType<typeof userEvent.setup>,
  nom: string,
) {
  await lecteur.click(bouton("Ajouter un objet"));
  await lecteur.type(dansSection().getByLabelText("Nom de l'objet"), nom);
  await lecteur.click(bouton("Ajouter l'objet"));
}

describe("section Besace", () => {
  beforeEach(() => enregistrerAventure());

  it("s'ouvre vide : « 0 / 24 », 24 traits discrets, bouton d'ajout", () => {
    render(App);
    expect(
      dansSection().getByRole("heading", { name: "Besace" }),
    ).toBeInTheDocument();
    expect(section()).toHaveTextContent("0 / 24");
    expect(traits()).toHaveLength(24);
    expect(traitsDeCraie()).toHaveLength(0);
    expect(traitsRouges()).toHaveLength(0);
    expect(bouton("Ajouter un objet")).toBeInTheDocument();
  });

  it("vient après les Armes et avant les Notes", () => {
    render(App);
    const armes = screen.getByRole("region", { name: "Armes" });
    const notes = screen.getByRole("heading", { name: "Notes" });
    expect(
      armes.compareDocumentPosition(section()) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      section().compareDocumentPosition(notes) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("ajoute un objet, enregistré tout de suite, retrouvé après rechargement", async () => {
    const { unmount } = render(App);
    const lecteur = userEvent.setup();
    await ajouter(lecteur, "Corde de chanvre");
    expect(
      lignes().some((l) => l.textContent?.includes("Corde de chanvre")),
    ).toBe(true);
    expect(section()).toHaveTextContent("1 / 24");
    expect(besaceEnregistree().objets).toEqual(["Corde de chanvre"]);
    expect(
      dansSection().queryByLabelText("Nom de l'objet"),
    ).not.toBeInTheDocument();

    unmount();
    render(App);
    expect(bouton("Corde de chanvre")).toBeInTheDocument();
    expect(section()).toHaveTextContent("1 / 24");
  });

  it("garde le bouton d'ajout éteint tant que l'objet n'a pas de nom, et dit pourquoi", async () => {
    render(App);
    const lecteur = userEvent.setup();
    await lecteur.click(bouton("Ajouter un objet"));
    expect(bouton("Nommez d'abord l'objet")).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    await lecteur.click(bouton("Nommez d'abord l'objet"));
    expect(besaceEnregistree().objets).toEqual([]);
    await lecteur.type(dansSection().getByLabelText("Nom de l'objet"), "  ");
    expect(bouton("Nommez d'abord l'objet")).toBeInTheDocument();
  });

  it("annule l'ajout sans rien enregistrer", async () => {
    render(App);
    const lecteur = userEvent.setup();
    await lecteur.click(bouton("Ajouter un objet"));
    await lecteur.type(dansSection().getByLabelText("Nom de l'objet"), "Clé");
    await lecteur.click(bouton("Annuler"));
    expect(besaceEnregistree().objets).toEqual([]);
    expect(bouton("Ajouter un objet")).toBeInTheDocument();
  });
});

describe("renommer et retirer un objet", () => {
  beforeEach(() =>
    enregistrerAventure({ objets: ["Pain rassis", "Fiole vide"] }),
  );

  it("renomme d'un appui, enregistré à la frappe", async () => {
    render(App);
    const lecteur = userEvent.setup();
    await lecteur.click(bouton("Pain rassis"));
    const champ = dansSection().getByLabelText("Nom de Pain rassis");
    await lecteur.clear(champ);
    await lecteur.type(champ, "Pain frais");
    expect(besaceEnregistree().objets).toEqual(["Pain frais", "Fiole vide"]);
    await lecteur.keyboard("{Enter}");
    expect(bouton("Pain frais")).toBeInTheDocument();
  });

  it("garde l'ancien nom tant que le champ est vide", async () => {
    render(App);
    const lecteur = userEvent.setup();
    await lecteur.click(bouton("Pain rassis"));
    await lecteur.clear(dansSection().getByLabelText("Nom de Pain rassis"));
    expect(besaceEnregistree().objets[0]).toBe("Pain rassis");
  });

  it("retire un objet d'un appui sur sa croix, enregistré aussitôt", async () => {
    render(App);
    const lecteur = userEvent.setup();
    await lecteur.click(bouton("Retirer Pain rassis"));
    expect(besaceEnregistree().objets).toEqual(["Fiole vide"]);
    expect(section()).toHaveTextContent("1 / 24");
    expect(
      dansSection().queryByRole("button", { name: "Pain rassis" }),
    ).not.toBeInTheDocument();
  });
});

describe("les 24 traits de comptage", () => {
  it("noircissent à la craie autant de traits que d'emplacements pris", () => {
    enregistrerAventure({ objets: objets(7) });
    render(App);
    expect(section()).toHaveTextContent("7 / 24");
    expect(dansSection().getByRole("img")).toHaveAccessibleName(
      "7 emplacements utilisés sur 24",
    );
    expect(traits()).toHaveLength(24);
    expect(traitsDeCraie()).toHaveLength(7);
    expect(traitsRouges()).toHaveLength(0);
  });

  it("à 24 objets, tout est à la craie, sans rouge ni indice", () => {
    enregistrerAventure({ objets: objets(24) });
    render(App);
    expect(traitsDeCraie()).toHaveLength(24);
    expect(traitsRouges()).toHaveLength(0);
    expect(dansSection().queryByRole("note")).not.toBeInTheDocument();
    expect(dansSection().getByText("24 / 24")).not.toHaveClass("depasse");
  });

  it("chaque objet en trop ajoute un trait rouge au-delà des 24", () => {
    enregistrerAventure({ objets: objets(26) });
    render(App);
    expect(traits()).toHaveLength(26);
    expect(traitsDeCraie()).toHaveLength(24);
    expect(traitsRouges()).toHaveLength(2);
    expect(dansSection().getByText("26 / 24")).toHaveClass("depasse");
  });
});

describe("au-delà de 24 objets", () => {
  beforeEach(() => enregistrerAventure({ objets: objets(24) }));

  it("un indice rouge prévient, sans empêcher l'ajout", async () => {
    render(App);
    const lecteur = userEvent.setup();
    await ajouter(lecteur, "Objet de trop");

    expect(besaceEnregistree().objets).toHaveLength(25);
    expect(traitsRouges()).toHaveLength(1);
    expect(dansSection().getByRole("note")).toHaveTextContent(
      "La besace a 24 emplacements. Gardez l'objet si le livre l'autorise, sinon retirez-en un.",
    );
    // On peut encore en ajouter.
    await ajouter(lecteur, "Encore un");
    expect(besaceEnregistree().objets).toHaveLength(26);
  });

  it("retirer l'objet en trop fait disparaître le rouge et l'indice", async () => {
    enregistrerAventure({ objets: objets(25) });
    render(App);
    const lecteur = userEvent.setup();
    expect(dansSection().getByRole("note")).toBeInTheDocument();
    await lecteur.click(bouton("Retirer Objet 24"));
    expect(dansSection().queryByRole("note")).not.toBeInTheDocument();
    expect(traitsRouges()).toHaveLength(0);
  });
});

describe("la bourse et les boulons", () => {
  it("avec une bourse : un emplacement, et le compteur de boulons actif", () => {
    enregistrerAventure({ bourse: true, boulons: 12 });
    render(App);
    expect(section()).toHaveTextContent("1 / 24");
    expect(traitsDeCraie()).toHaveLength(1);
    expect(dansSection().getByText("Bourse")).toBeInTheDocument();
    expect(bouton("Boulons, modifier : 12")).toHaveTextContent("12 boulons");
    expect(bouton("Retirer un boulon")).not.toHaveAttribute("aria-disabled");
  });

  it("les boulons n'occupent aucun emplacement, même par centaines", async () => {
    enregistrerAventure({ bourse: true, boulons: 0, objets: objets(2) });
    render(App);
    const lecteur = userEvent.setup();
    expect(section()).toHaveTextContent("3 / 24");
    for (let i = 0; i < 5; i++)
      await lecteur.click(bouton("Ajouter un boulon"));
    expect(section()).toHaveTextContent("3 / 24");
    expect(besaceEnregistree().boulons).toBe(5);
  });

  it("« + » et « − » comptent un boulon, enregistré aussitôt, sans descendre sous 0", async () => {
    enregistrerAventure({ bourse: true, boulons: 1 });
    render(App);
    const lecteur = userEvent.setup();
    await lecteur.click(bouton("Ajouter un boulon"));
    expect(bouton("Boulons, modifier : 2")).toHaveTextContent("2 boulons");
    expect(besaceEnregistree().boulons).toBe(2);
    await lecteur.click(bouton("Retirer un boulon"));
    await lecteur.click(bouton("Retirer un boulon"));
    await lecteur.click(bouton("Retirer un boulon"));
    expect(bouton("Boulons, modifier : 0")).toHaveTextContent("0 boulon");
    expect(besaceEnregistree().boulons).toBe(0);
  });

  it("corrige le nombre de boulons d'un appui, enregistré à la frappe", async () => {
    enregistrerAventure({ bourse: true, boulons: 12 });
    render(App);
    const lecteur = userEvent.setup();
    await lecteur.click(bouton("Boulons, modifier : 12"));
    const champ = dansSection().getByLabelText("Boulons");
    await lecteur.clear(champ);
    await lecteur.type(champ, "130");
    expect(besaceEnregistree().boulons).toBe(130);
    await lecteur.keyboard("{Enter}");
    expect(bouton("Boulons, modifier : 130")).toHaveTextContent("130 boulons");
  });

  it("retirer la bourse libère l'emplacement, désactive le compteur et garde les boulons", async () => {
    enregistrerAventure({ bourse: true, boulons: 12 });
    render(App);
    const lecteur = userEvent.setup();
    await lecteur.click(bouton("Retirer la bourse"));
    expect(section()).toHaveTextContent("0 / 24");
    expect(besaceEnregistree()).toMatchObject({ bourse: false, boulons: 12 });
    await lecteur.click(bouton("Ajouter une bourse"));
    expect(section()).toHaveTextContent("1 / 24");
    expect(bouton("Boulons, modifier : 12")).toBeInTheDocument();
  });

  it("la bourse peut faire dépasser les 24 emplacements, sans rien bloquer", async () => {
    enregistrerAventure({ objets: objets(24) });
    render(App);
    const lecteur = userEvent.setup();
    await lecteur.click(bouton("Ajouter une bourse"));
    expect(section()).toHaveTextContent("25 / 24");
    expect(traitsRouges()).toHaveLength(1);
  });
});

describe("sans bourse", () => {
  beforeEach(() => enregistrerAventure({ boulons: 0 }));

  it("le compteur de boulons est désactivé, avec l'explication", () => {
    render(App);
    expect(bouton("Retirer un boulon")).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    expect(bouton("Ajouter un boulon")).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    expect(
      dansSection().queryByRole("button", { name: /Boulons, modifier/ }),
    ).not.toBeInTheDocument();
    expect(section()).toHaveTextContent(
      "Il faut une bourse pour transporter des boulons.",
    );
  });

  it("un appui sur le « + » éteint ne compte rien", async () => {
    render(App);
    const lecteur = userEvent.setup();
    await lecteur.click(bouton("Ajouter un boulon"));
    expect(besaceEnregistree().boulons).toBe(0);
  });

  it("le lecteur peut forcer le compteur, sans que la bourse prenne un emplacement", async () => {
    render(App);
    const lecteur = userEvent.setup();
    await lecteur.click(bouton("Forcer le compteur"));
    expect(besaceEnregistree().boulonsForces).toBe(true);
    expect(bouton("Ajouter un boulon")).not.toHaveAttribute("aria-disabled");
    await lecteur.click(bouton("Ajouter un boulon"));
    await lecteur.click(bouton("Ajouter un boulon"));
    expect(bouton("Boulons, modifier : 2")).toHaveTextContent("2 boulons");
    expect(besaceEnregistree().boulons).toBe(2);
    expect(section()).toHaveTextContent("0 / 24");
  });

  it("le compteur forcé peut se désactiver de nouveau", async () => {
    enregistrerAventure({ boulonsForces: true, boulons: 3 });
    render(App);
    const lecteur = userEvent.setup();
    await lecteur.click(bouton("Désactiver le compteur"));
    expect(besaceEnregistree().boulonsForces).toBe(false);
    expect(bouton("Ajouter un boulon")).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });
});
