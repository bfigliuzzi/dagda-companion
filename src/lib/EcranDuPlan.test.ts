import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "../App.svelte";
import type { Case } from "./cases";
import type { Bord } from "./murs";
import { unNouveauPlan, type Plan } from "./plans";
import { lireAventure } from "./stockage";
import { enregistrerAventure } from "./test/uneAventure";

/**
 * Le lecteur trace au doigt sur la grille. Dans jsdom, la grille est collée en
 * haut à gauche de l'écran (0, 0) : le point (c, l) de la grille est à
 * c × 44 px, l × 44 px, en comptant depuis son coin en haut à gauche. Les
 * positions des tests sont en cases. Les murs, eux, sont dessinés dans les
 * coordonnées du plan, qui ne changent pas quand la grille grandit.
 */
const COTE = 44;

const horizontal = (colonne: number, ligne: number): Bord => ({
  sens: "horizontal",
  colonne,
  ligne,
});

function unPlan(murs: Bord[] = []): Plan {
  return { ...unNouveauPlan("Souterrains", []), murs };
}

async function ouvrirLePlan() {
  render(App);
  const lecteur = userEvent.setup();
  await lecteur.click(
    within(screen.getByRole("region", { name: "Plans" })).getByRole("button", {
      name: "Souterrains",
    }),
  );
  return lecteur;
}

const grille = () => screen.getByRole("img", { name: /Grille du plan/ });

/** Un trait du doigt passant par chaque position, en cases. */
async function glisser(...positions: [number, number][]) {
  const [depart, ...suite] = positions;
  const doigt = (x: number, y: number) => ({
    pointerId: 1,
    pointerType: "touch",
    isPrimary: true,
    clientX: x * COTE,
    clientY: y * COTE,
  });
  await fireEvent.pointerDown(grille(), doigt(...depart));
  for (const position of suite) {
    await fireEvent.pointerMove(grille(), doigt(...position));
  }
  const fin = suite.at(-1) ?? depart;
  await fireEvent.pointerUp(grille(), doigt(...fin));
}

/** Les murs dessinés, en px : « x1,y1 x2,y2 ». */
function mursDessines(etat = "mur") {
  return Array.from(
    grille().querySelectorAll(`line[data-etat="${etat}"]`),
    (ligne) =>
      `${ligne.getAttribute("x1")},${ligne.getAttribute("y1")} ${ligne.getAttribute("x2")},${ligne.getAttribute("y2")}`,
  );
}

const mursEnregistres = () => lireAventure(localStorage)!.plans[0].murs;
const annuler = () => screen.getByRole("button", { name: "Annuler" });
const indice = () =>
  screen.queryByText("Glissez le doigt le long des points pour tracer un mur.");

describe("tracer des murs", () => {
  it("un glissé le long des points pose un mur sur chaque bord parcouru, sans viser juste, et l'enregistre", async () => {
    enregistrerAventure({ plans: [unPlan()] });
    await ouvrirLePlan();
    expect(indice()).toBeInTheDocument();

    await glisser([1.1, 2.2], [2, 2.1], [3.05, 1.85], [3.95, 2.1]);

    expect(mursDessines()).toEqual([
      "44,88 88,88",
      "88,88 132,88",
      "132,88 176,88",
    ]);
    expect(mursEnregistres()).toEqual([
      horizontal(1, 2),
      horizontal(2, 2),
      horizontal(3, 2),
    ]);
    // Le plan n'est plus vide : l'indice a fait son office.
    expect(indice()).not.toBeInTheDocument();
  });

  it("un glissé qui commence sur un mur efface les murs parcourus", async () => {
    enregistrerAventure({
      plans: [unPlan([horizontal(0, 0), horizontal(1, 0), horizontal(5, 5)])],
    });
    await ouvrirLePlan();

    await glisser([0, 0], [1, 0.1], [3, 0]);

    expect(mursDessines()).toEqual(["220,220 264,220"]);
    expect(mursEnregistres()).toEqual([horizontal(5, 5)]);
  });

  it("un appui sur un bord pose un mur s'il n'y en a pas, et le retire s'il y en a un", async () => {
    enregistrerAventure({ plans: [unPlan()] });
    await ouvrirLePlan();

    await glisser([2.5, 3.2]);
    expect(mursDessines()).toEqual(["88,132 132,132"]);

    await glisser([2.4, 2.9]);
    expect(mursDessines()).toEqual([]);
    expect(mursEnregistres()).toEqual([]);
  });

  it("un appui au milieu d'une case ne pose rien", async () => {
    enregistrerAventure({ plans: [unPlan()] });
    await ouvrirLePlan();
    await glisser([2.5, 3.5]);
    expect(mursDessines()).toEqual([]);
  });
});

describe("le mur effacé", () => {
  beforeEach(() =>
    enregistrerAventure({ plans: [unPlan([horizontal(0, 0)])] }),
  );
  afterEach(() => vi.useRealTimers());

  it("reste en craie rouge, puis disparaît au bout de 1,2 s", async () => {
    await ouvrirLePlan();
    expect(mursDessines("efface")).toEqual([]);
    vi.useFakeTimers();

    await glisser([0.5, 0]);
    expect(mursDessines()).toEqual([]);
    expect(mursDessines("efface")).toEqual(["0,0 44,0"]);

    vi.advanceTimersByTime(1199);
    await vi.waitFor(() => expect(mursDessines("efface")).toHaveLength(1));
    vi.advanceTimersByTime(1);
    await vi.waitFor(() => expect(mursDessines("efface")).toEqual([]));
  });
});

describe("annuler", () => {
  it("est désactivé tant qu'il n'y a rien à défaire", async () => {
    enregistrerAventure({ plans: [unPlan()] });
    await ouvrirLePlan();
    expect(annuler()).toBeDisabled();
  });

  it("défait le dernier trait entier, puis celui d'avant", async () => {
    enregistrerAventure({ plans: [unPlan()] });
    const lecteur = await ouvrirLePlan();

    await glisser([0, 0], [0, 2]);
    await glisser([3, 3], [6, 3]);
    expect(mursDessines()).toHaveLength(5);
    expect(annuler()).toBeEnabled();

    await lecteur.click(annuler());
    expect(mursDessines()).toEqual(["0,0 0,44", "0,44 0,88"]);
    expect(mursEnregistres()).toHaveLength(2);

    await lecteur.click(annuler());
    expect(mursDessines()).toEqual([]);
    expect(annuler()).toBeDisabled();
  });

  it("défait un effacement : les murs effacés reviennent", async () => {
    enregistrerAventure({
      plans: [unPlan([horizontal(0, 0), horizontal(1, 0)])],
    });
    const lecteur = await ouvrirLePlan();

    await glisser([0, 0], [2, 0]);
    expect(mursDessines()).toEqual([]);

    await lecteur.click(annuler());
    expect(mursDessines()).toEqual(["0,0 44,0", "44,0 88,0"]);
    expect(mursEnregistres()).toEqual([horizontal(0, 0), horizontal(1, 0)]);
  });
});

describe("la barre du bas", () => {
  it("porte le contrôle « Murs / Cases », sur Murs à l'ouverture, et « Annuler »", async () => {
    enregistrerAventure({ plans: [unPlan()] });
    await ouvrirLePlan();
    const barre = within(screen.getByTestId("dock"));
    const outil = barre.getByRole("radiogroup", { name: "Outil" });
    expect(within(outil).getByRole("radio", { name: "Murs" })).toBeChecked();
    expect(
      within(outil).getByRole("radio", { name: "Cases" }),
    ).not.toBeChecked();
    expect(barre.getByRole("button", { name: "Annuler" })).toBeInTheDocument();
  });

  it("en mode Cases, un glissé ne trace rien ", async () => {
    enregistrerAventure({ plans: [unPlan()] });
    const lecteur = await ouvrirLePlan();
    await lecteur.click(screen.getByRole("radio", { name: "Cases" }));
    expect(screen.getByRole("radio", { name: "Cases" })).toBeChecked();

    await glisser([0, 0], [3, 0]);
    expect(mursDessines()).toEqual([]);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await lecteur.click(screen.getByRole("radio", { name: "Murs" }));
    await glisser([0, 0], [3, 0]);
    expect(mursDessines()).toHaveLength(3);
  });
});

describe("retrouver ses murs", () => {
  it("après avoir fermé puis rouvert l'app, les murs tracés sont là", async () => {
    enregistrerAventure({ plans: [unPlan()] });
    await ouvrirLePlan();
    await glisser([1, 1], [1, 3]);
    cleanup();

    await ouvrirLePlan();
    expect(mursDessines()).toEqual(["44,44 44,88", "44,88 44,132"]);
    // Rien à défaire en rouvrant : l'historique tient à l'écran ouvert.
    expect(annuler()).toBeDisabled();
  });
});

const nomDeLaGrille = () => grille().getAttribute("aria-label");
const grilleEnregistree = () => lireAventure(localStorage)!.plans[0].grille;

describe("la grille grandit", () => {
  it("un mur tracé sur le bord du haut ajoute une rangée en haut ; les murs gardent leur place dans le plan", async () => {
    enregistrerAventure({ plans: [unPlan([horizontal(2, 3)])] });
    await ouvrirLePlan();

    await glisser([0, 0], [3, 0]);

    expect(nomDeLaGrille()).toMatch(/8 colonnes sur 9 lignes/);
    expect(grilleEnregistree()).toEqual({
      colonne: 0,
      ligne: -1,
      colonnes: 8,
      lignes: 9,
    });
    expect(mursDessines()).toEqual([
      "88,132 132,132",
      "0,0 44,0",
      "44,0 88,0",
      "88,0 132,0",
    ]);

    // La nouvelle rangée se trace : son bord du haut est le nouveau bord extérieur.
    await glisser([0, 0], [0, 1]);
    expect(nomDeLaGrille()).toMatch(/9 colonnes sur 9 lignes/);
    expect(mursEnregistres()).toContainEqual({
      sens: "vertical",
      colonne: 0,
      ligne: -1,
    });
  });

  it("un mur tracé à l'intérieur ne change pas la taille", async () => {
    enregistrerAventure({ plans: [unPlan()] });
    await ouvrirLePlan();
    await glisser([1, 1], [3, 1]);
    expect(nomDeLaGrille()).toMatch(/8 colonnes sur 8 lignes/);
  });

  it("« Annuler » retire le mur mais garde la rangée ajoutée", async () => {
    enregistrerAventure({ plans: [unPlan()] });
    const lecteur = await ouvrirLePlan();
    await glisser([8, 2], [8, 4]);
    expect(nomDeLaGrille()).toMatch(/9 colonnes sur 8 lignes/);

    await lecteur.click(annuler());
    expect(mursDessines()).toEqual([]);
    expect(nomDeLaGrille()).toMatch(/9 colonnes sur 8 lignes/);
  });

  it("la taille de la grille est retrouvée après avoir fermé puis rouvert l'app", async () => {
    enregistrerAventure({ plans: [unPlan()] });
    await ouvrirLePlan();
    await glisser([0, 3], [0, 5]);
    cleanup();

    await ouvrirLePlan();
    expect(nomDeLaGrille()).toMatch(/9 colonnes sur 8 lignes/);
    expect(mursDessines()).toEqual(["0,132 0,176", "0,176 0,220"]);
  });
});

describe("deux doigts", () => {
  const doigt = (pointerId: number, x: number, y: number) => ({
    pointerId,
    pointerType: "touch",
    isPrimary: pointerId === 1,
    clientX: x * COTE,
    clientY: y * COTE,
  });

  it("un second doigt posé pendant un trait l'abandonne : aucun mur, rien à annuler", async () => {
    enregistrerAventure({ plans: [unPlan()] });
    await ouvrirLePlan();

    await fireEvent.pointerDown(grille(), doigt(1, 1, 1));
    await fireEvent.pointerMove(grille(), doigt(1, 3, 1));
    expect(mursDessines()).toHaveLength(2);

    await fireEvent.pointerDown(grille(), doigt(2, 1, 3));
    expect(mursDessines()).toEqual([]);
    await fireEvent.pointerMove(grille(), doigt(1, 3, 2));
    await fireEvent.pointerMove(grille(), doigt(2, 1, 4));
    await fireEvent.pointerUp(grille(), doigt(2, 1, 4));
    // Le premier doigt continue seul : il ne trace plus, le geste est un défilement.
    await fireEvent.pointerMove(grille(), doigt(1, 5, 2));
    await fireEvent.pointerUp(grille(), doigt(1, 5, 2));

    expect(mursDessines()).toEqual([]);
    expect(mursEnregistres()).toEqual([]);
    expect(annuler()).toBeDisabled();

    // Le geste suivant, à un doigt, trace de nouveau.
    await glisser([1, 1], [2, 1]);
    expect(mursDessines()).toHaveLength(1);
  });
});

describe("numéroter et annoter une case", () => {
  const uneCase = (
    colonne: number,
    ligne: number,
    chapitre: number | null,
    note = "",
    ordre = 1,
  ): Case => ({ colonne, ligne, chapitre, note, ordre });

  async function ouvrirEnModeCases(cases: Case[] = []) {
    enregistrerAventure({ plans: [{ ...unPlan(), cases }] });
    const lecteur = await ouvrirLePlan();
    await lecteur.click(screen.getByRole("radio", { name: "Cases" }));
    return lecteur;
  }

  const caseNommee = (nom: string | RegExp) =>
    screen.getByRole("button", { name: nom });
  const panneau = () => screen.getByRole("dialog");
  const cases = () => lireAventure(localStorage)!.plans[0].cases;
  const textes = () =>
    Array.from(grille().querySelectorAll("text"), (t) => t.textContent);

  /** Un appui du doigt, sans bouger, sur l'élément. */
  async function appuyer(element: Element) {
    const doigt = { pointerId: 1, pointerType: "touch", isPrimary: true };
    await fireEvent.pointerDown(element, doigt);
    await fireEvent.pointerUp(element, doigt);
    await fireEvent.click(element, { detail: 1 });
  }

  it("en mode Cases, chaque case est un bouton nommé : colonne-ligne depuis 1, numéro et note", async () => {
    await ouvrirEnModeCases([
      uneCase(2, 4, 47, "clé"),
      uneCase(0, 0, 3),
      uneCase(7, 7, null, "piège"),
    ]);
    expect(caseNommee("Case 3-5, chapitre 47, note : clé")).toBeInTheDocument();
    expect(caseNommee("Case 1-1, chapitre 3")).toBeInTheDocument();
    expect(caseNommee("Case 8-8, note : piège")).toBeInTheDocument();
    expect(caseNommee("Case 2-1")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /^Case / })).toHaveLength(64);
  });

  it("en mode Murs, les cases ne sont pas des boutons", async () => {
    enregistrerAventure({
      plans: [{ ...unPlan(), cases: [uneCase(2, 4, 47)] }],
    });
    await ouvrirLePlan();
    expect(screen.queryByRole("button", { name: /^Case / })).toBeNull();
  });

  it("un appui sur une case ouvre le panneau avec le chapitre, la note et « Vider la case »", async () => {
    await ouvrirEnModeCases();
    await appuyer(caseNommee("Case 3-5"));

    const dialogue = within(panneau());
    expect(panneau()).toHaveAccessibleName("Case 3-5");
    expect(dialogue.getByRole("spinbutton", { name: "Chapitre" })).toHaveValue(
      null,
    );
    expect(dialogue.getByRole("textbox", { name: "Note" })).toHaveValue("");
    expect(
      dialogue.getByRole("button", { name: "Vider la case" }),
    ).toBeInTheDocument();
  });

  it("écrire le chapitre et la note enregistre à chaque modification, et la case les montre", async () => {
    const lecteur = await ouvrirEnModeCases();
    await appuyer(caseNommee("Case 3-5"));

    await lecteur.type(
      screen.getByRole("spinbutton", { name: "Chapitre" }),
      "47",
    );
    expect(cases()).toEqual([uneCase(2, 4, 47, "", 1)]);

    await lecteur.type(screen.getByRole("textbox", { name: "Note" }), "clé");
    expect(cases()).toEqual([uneCase(2, 4, 47, "clé", 1)]);

    await lecteur.click(screen.getByRole("button", { name: "Fermer" }));
    expect(textes()).toEqual(["47"]);
    expect(caseNommee("Case 3-5, chapitre 47, note : clé")).toBeInTheDocument();
    // La note se signale par un petit trait en coin.
    expect(grille().querySelectorAll('[data-etat="note"]')).toHaveLength(1);
  });

  it("le panneau montre la note en entier et les boutons + et - changent le chapitre", async () => {
    const lecteur = await ouvrirEnModeCases([
      uneCase(1, 1, 9, "porte fermée à clé"),
    ]);
    await appuyer(caseNommee(/^Case 2-2/));
    expect(screen.getByRole("textbox", { name: "Note" })).toHaveValue(
      "porte fermée à clé",
    );
    await lecteur.click(
      screen.getByRole("button", { name: "Augmenter Chapitre" }),
    );
    expect(cases()[0].chapitre).toBe(10);
  });

  it("la note est limitée à 60 caractères", async () => {
    await ouvrirEnModeCases();
    await appuyer(caseNommee("Case 1-1"));
    expect(screen.getByRole("textbox", { name: "Note" })).toHaveAttribute(
      "maxlength",
      "60",
    );
  });

  it("effacer le chapitre garde la note, effacer la note garde le chapitre", async () => {
    const lecteur = await ouvrirEnModeCases([uneCase(0, 0, 12, "clé")]);
    await appuyer(caseNommee(/^Case 1-1/));
    await lecteur.clear(screen.getByRole("spinbutton", { name: "Chapitre" }));
    expect(cases()).toEqual([uneCase(0, 0, null, "clé", 1)]);
    await lecteur.clear(screen.getByRole("textbox", { name: "Note" }));
    expect(cases()).toEqual([]);
  });

  it("« Vider la case » retire le numéro et la note, et ferme le panneau", async () => {
    const lecteur = await ouvrirEnModeCases([
      uneCase(2, 4, 47, "clé"),
      uneCase(0, 0, 3),
    ]);
    await appuyer(caseNommee(/^Case 3-5/));
    await lecteur.click(screen.getByRole("button", { name: "Vider la case" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(cases()).toEqual([uneCase(0, 0, 3)]);
    expect(caseNommee("Case 3-5")).toBeInTheDocument();
    expect(textes()).toEqual(["3"]);
  });

  it("un numéro déjà présent dans une autre case affiche un indice, sans rien bloquer", async () => {
    const lecteur = await ouvrirEnModeCases([uneCase(5, 1, 47)]);
    await appuyer(caseNommee("Case 1-1"));
    const champ = screen.getByRole("spinbutton", { name: "Chapitre" });

    await lecteur.type(champ, "12");
    expect(within(panneau()).queryByRole("status")).not.toBeInTheDocument();

    await lecteur.clear(champ);
    await lecteur.type(champ, "47");
    expect(within(panneau()).getByRole("status")).toHaveTextContent(
      "Le § 47 est déjà sur la case 6-2.",
    );
    // Rien n'est bloqué : le numéro est enregistré.
    expect(cases().find((c) => c.colonne === 0)?.chapitre).toBe(47);
  });

  it("un chapitre hors de 1 à 9999 n'est pas enregistré", async () => {
    const lecteur = await ouvrirEnModeCases([uneCase(0, 0, 12)]);
    await appuyer(caseNommee(/^Case 1-1/));
    await lecteur.clear(screen.getByRole("spinbutton", { name: "Chapitre" }));
    await lecteur.type(
      screen.getByRole("spinbutton", { name: "Chapitre" }),
      "0",
    );
    expect(cases()).toEqual([]);
  });

  it("un appui au doigt sur une case ouvre le panneau, un glissé non", async () => {
    await ouvrirEnModeCases();
    const doigt = (x: number, y: number) => ({
      pointerId: 1,
      pointerType: "touch",
      isPrimary: true,
      clientX: x,
      clientY: y,
    });
    const bouton = caseNommee("Case 4-2");
    const clic = { detail: 1 };
    await fireEvent.pointerDown(bouton, doigt(150, 60));
    await fireEvent.pointerMove(bouton, doigt(190, 60));
    await fireEvent.pointerUp(bouton, doigt(190, 60));
    await fireEvent.click(bouton, clic);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await fireEvent.pointerDown(bouton, doigt(150, 60));
    await fireEvent.pointerUp(bouton, doigt(152, 61));
    await fireEvent.click(bouton, clic);
    expect(panneau()).toHaveAccessibleName("Case 4-2");
  });

  it("deux doigts qui défilent sur les cases n'ouvrent rien", async () => {
    await ouvrirEnModeCases();
    const doigt = (pointerId: number, x: number, y: number) => ({
      pointerId,
      pointerType: "touch",
      isPrimary: pointerId === 1,
      clientX: x,
      clientY: y,
    });
    const bouton = caseNommee("Case 4-2");
    await fireEvent.pointerDown(bouton, doigt(1, 150, 60));
    await fireEvent.pointerDown(bouton, doigt(2, 250, 60));
    await fireEvent.pointerUp(bouton, doigt(2, 250, 60));
    await fireEvent.pointerUp(bouton, doigt(1, 150, 60));
    await fireEvent.click(bouton, { detail: 1 });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("numéros et notes sont retrouvés après avoir fermé puis rouvert l'app", async () => {
    const lecteur = await ouvrirEnModeCases();
    await appuyer(caseNommee("Case 3-5"));
    await lecteur.type(
      screen.getByRole("spinbutton", { name: "Chapitre" }),
      "47",
    );
    await lecteur.type(screen.getByRole("textbox", { name: "Note" }), "clé");
    cleanup();

    const relecteur = await ouvrirLePlan();
    expect(textes()).toEqual(["47"]);
    await relecteur.click(screen.getByRole("radio", { name: "Cases" }));
    expect(caseNommee("Case 3-5, chapitre 47, note : clé")).toBeInTheDocument();
  });

  it("une case notée garde ses coordonnées quand la grille grandit par le haut", async () => {
    const lecteur = await ouvrirEnModeCases();
    await appuyer(caseNommee("Case 1-1"));
    await lecteur.type(
      screen.getByRole("spinbutton", { name: "Chapitre" }),
      "5",
    );
    await lecteur.click(screen.getByRole("button", { name: "Fermer" }));
    await lecteur.click(screen.getByRole("radio", { name: "Murs" }));
    await glisser([2, 0], [4, 0]);

    expect(cases()).toEqual([uneCase(0, 0, 5)]);
    await lecteur.click(screen.getByRole("radio", { name: "Cases" }));
    expect(caseNommee("Case 1-2, chapitre 5")).toBeInTheDocument();
  });
});
