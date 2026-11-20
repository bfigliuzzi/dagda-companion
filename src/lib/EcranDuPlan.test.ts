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

  it("en mode Cases, un glissé ne trace rien (les cases arrivent avec leur ticket)", async () => {
    enregistrerAventure({ plans: [unPlan()] });
    const lecteur = await ouvrirLePlan();
    await lecteur.click(screen.getByRole("radio", { name: "Cases" }));
    expect(screen.getByRole("radio", { name: "Cases" })).toBeChecked();

    await glisser([0, 0], [3, 0]);
    expect(mursDessines()).toEqual([]);

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
