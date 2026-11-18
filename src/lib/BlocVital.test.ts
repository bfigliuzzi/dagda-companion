import { render, screen, within } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "../App.svelte";
import type { Personnage } from "./aventure";
import { ecrireAventure } from "./stockage";

/** Une aventure déjà commencée : Herbologie, PV 28/32, CHANCE 4, DEX 7. */
function enregistrerPersonnage(changement: Partial<Personnage> = {}) {
  localStorage.clear();
  ecrireAventure(localStorage, {
    chapitre: 112,
    mode: "simplifie",
    sauvegardesUtilisees: 0,
    personnage: {
      talent: "Herbologie",
      pointsDeVieMax: 32,
      pointsDeVie: 28,
      chance: 4,
      dexterite: 7,
      ...changement,
    },
  });
}

const bloc = (nom: string) => within(screen.getByRole("group", { name: nom }));
const bouton = (nom: string | RegExp) =>
  screen.getByRole("button", { name: nom });
const moins = () => bouton("Retirer un point de vie");
const plus = () => bouton("Ajouter un point de vie");
const pointsDeVie = () => screen.getByRole("group", { name: "Points de vie" });
const estCritique = () => screen.queryByText("état critique");
const traceDe = (valeur: string) =>
  screen.queryByText(valeur, { selector: "s" });

/** Le lecteur appuie sur une valeur, la corrige à la main et valide. */
async function corriger(
  lecteur: ReturnType<typeof userEvent.setup>,
  nom: string,
  champ: string,
  valeur: string,
) {
  await lecteur.click(bouton(new RegExp(`^${nom}, modifier`)));
  const saisie = screen.getByLabelText(champ);
  await lecteur.clear(saisie);
  await lecteur.type(saisie, `${valeur}{Enter}`);
}

describe("bloc vital : « − » et « + »", () => {
  beforeEach(() => enregistrerPersonnage());

  it("retire 1 PV avec « − » et en ajoute 1 avec « + »", async () => {
    render(App);
    const lecteur = userEvent.setup();
    expect(pointsDeVie()).toHaveTextContent("28 / 32");

    await lecteur.click(moins());
    expect(pointsDeVie()).toHaveTextContent("27 / 32");
    await lecteur.click(plus());
    await lecteur.click(plus());
    expect(pointsDeVie()).toHaveTextContent("29 / 32");
  });

  it("enregistre chaque changement tout de suite : l'app fermée et rouverte, les PV sont là", async () => {
    const { unmount } = render(App);
    await userEvent.setup().click(moins());
    unmount();

    render(App);
    expect(pointsDeVie()).toHaveTextContent("27 / 32");
  });

  it("arrête « + » au maximum", async () => {
    enregistrerPersonnage({ pointsDeVie: 31 });
    render(App);
    const lecteur = userEvent.setup();
    await lecteur.click(plus());
    await lecteur.click(plus());
    expect(pointsDeVie()).toHaveTextContent("32 / 32");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("rend les boutons « − » et « + » faciles à trouver au pouce : deux boutons, « − » d'abord", () => {
    render(App);
    const boutons = within(pointsDeVie().parentElement!).getAllByRole("button");
    const noms = boutons.map((b) => b.getAttribute("aria-label"));
    expect(noms.indexOf("Retirer un point de vie")).toBeLessThan(
      noms.indexOf("Ajouter un point de vie"),
    );
  });
});

describe("bloc vital : corriger une valeur à la main", () => {
  beforeEach(() => enregistrerPersonnage());

  it("un appui sur les PV ouvre un champ qui porte la valeur", async () => {
    render(App);
    await userEvent.setup().click(bouton("Points de vie, modifier : 28"));
    expect(screen.getByLabelText("Points de vie actuels")).toHaveValue(28);
  });

  it.each([
    ["PV", "Points de vie", "Points de vie actuels", "19", "19"],
    [
      "PV maximum",
      "Points de vie maximum",
      "Points de vie maximum",
      "40",
      "40",
    ],
  ])("corrige %s à la main", async (_nom, nom, champ, valeur, attendu) => {
    render(App);
    await corriger(userEvent.setup(), nom, champ, valeur);
    expect(bouton(`${nom}, modifier : ${attendu}`)).toBeInTheDocument();
    expect(screen.queryByLabelText(champ)).not.toBeInTheDocument();
  });

  it("corrige la CHANCE à la main", async () => {
    render(App);
    await corriger(userEvent.setup(), "Chance", "CHANCE", "2");
    expect(bloc("Chance").getByText("2")).toBeInTheDocument();
  });

  it("corrige la DEXTÉRITÉ à la main", async () => {
    render(App);
    await corriger(userEvent.setup(), "Dextérité", "DEXTÉRITÉ", "9");
    expect(bloc("Dextérité").getByText("9")).toBeInTheDocument();
  });

  it("enregistre une correction faite à la main", async () => {
    const { unmount } = render(App);
    const lecteur = userEvent.setup();
    await corriger(
      lecteur,
      "Points de vie maximum",
      "Points de vie maximum",
      "36",
    );
    await corriger(lecteur, "Chance", "CHANCE", "6");
    await corriger(lecteur, "Dextérité", "DEXTÉRITÉ", "8");
    unmount();

    render(App);
    expect(bouton("Points de vie maximum, modifier : 36")).toBeInTheDocument();
    expect(bloc("Chance").getByText("6")).toBeInTheDocument();
    expect(bloc("Dextérité").getByText("8")).toBeInTheDocument();
  });

  it("garde l'ancienne valeur si la saisie n'est pas valable", async () => {
    render(App);
    const lecteur = userEvent.setup();
    await corriger(
      lecteur,
      "Points de vie maximum",
      "Points de vie maximum",
      "0",
    );
    await corriger(lecteur, "Points de vie", "Points de vie actuels", "-3");
    await corriger(lecteur, "Chance", "CHANCE", "2.5");
    await corriger(lecteur, "Dextérité", "DEXTÉRITÉ", "");
    expect(pointsDeVie()).toHaveTextContent("28 / 32");
    expect(bloc("Chance").getByText("4")).toBeInTheDocument();
    expect(bloc("Dextérité").getByText("7")).toBeInTheDocument();
  });

  it("accepte une saisie au-dessus du maximum, avec un indice qui n'empêche rien", async () => {
    render(App);
    const lecteur = userEvent.setup();
    await corriger(lecteur, "Points de vie", "Points de vie actuels", "35");

    expect(pointsDeVie()).toHaveTextContent("35 / 32");
    expect(screen.getByRole("status")).toHaveTextContent(
      "Vos PV dépassent le maximum de 32",
    );
    // Rien n'est bloqué : « − » marche, et l'indice s'en va sous le maximum.
    await lecteur.click(moins());
    expect(pointsDeVie()).toHaveTextContent("34 / 32");
    await corriger(lecteur, "Points de vie", "Points de vie actuels", "30");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("laisse « + » sans effet quand les PV saisis dépassent déjà le maximum", async () => {
    enregistrerPersonnage({ pointsDeVie: 35 });
    render(App);
    await userEvent.setup().click(plus());
    expect(pointsDeVie()).toHaveTextContent("35 / 32");
  });
});

describe("bloc vital : la trace de craie", () => {
  beforeEach(() => {
    enregistrerPersonnage();
    vi.useFakeTimers();
  });
  afterEach(() => vi.useRealTimers());

  const lecteur = () =>
    userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

  it("barre l'ancien nombre de PV juste avant le nouveau, puis l'efface en 1,2 s", async () => {
    render(App);
    expect(traceDe("28")).not.toBeInTheDocument();

    await lecteur().click(moins());
    expect(pointsDeVie()).toHaveTextContent("avant : 28 27 / 32");
    expect(traceDe("28")).toBeInTheDocument();

    vi.advanceTimersByTime(1199);
    expect(traceDe("28")).toBeInTheDocument();
    vi.advanceTimersByTime(1);
    await vi.waitFor(() => expect(traceDe("28")).not.toBeInTheDocument());
  });

  it("barre l'ancien PV maximum, la CHANCE et la DEXTÉRITÉ corrigés à la main", async () => {
    render(App);
    const l = lecteur();
    await corriger(l, "Points de vie maximum", "Points de vie maximum", "34");
    expect(traceDe("32")).toBeInTheDocument();
    await corriger(l, "Chance", "CHANCE", "3");
    expect(
      bloc("Chance").getByText("4", { selector: "s" }),
    ).toBeInTheDocument();
    await corriger(l, "Dextérité", "DEXTÉRITÉ", "8");
    expect(
      bloc("Dextérité").getByText("7", { selector: "s" }),
    ).toBeInTheDocument();
  });

  it("ne barre rien à l'ouverture de la feuille, ni quand « + » est arrêté au maximum", async () => {
    enregistrerPersonnage({ pointsDeVie: 32 });
    render(App);
    expect(document.querySelector("s")).toBeNull();
    await lecteur().click(plus());
    expect(document.querySelector("s")).toBeNull();
  });
});

describe("bloc vital : état critique", () => {
  it("garde les PV en craie à 7 PV", () => {
    enregistrerPersonnage({ pointsDeVie: 7 });
    render(App);
    expect(estCritique()).not.toBeInTheDocument();
  });

  it("passe en état critique sous 7 PV, et le dit sans la couleur", async () => {
    enregistrerPersonnage({ pointsDeVie: 7 });
    render(App);
    await userEvent.setup().click(moins());
    expect(pointsDeVie()).toHaveTextContent("6 / 32");
    expect(estCritique()).toBeInTheDocument();
  });

  it("sort de l'état critique quand les PV remontent à 7", async () => {
    enregistrerPersonnage({ pointsDeVie: 6 });
    render(App);
    expect(estCritique()).toBeInTheDocument();
    await userEvent.setup().click(plus());
    expect(estCritique()).not.toBeInTheDocument();
  });
});

describe("bloc vital : à 0 PV", () => {
  beforeEach(() => enregistrerPersonnage({ pointsDeVie: 1 }));

  it("n'affiche aucune fin d'aventure et laisse tout modifiable", async () => {
    render(App);
    const lecteur = userEvent.setup();
    await lecteur.click(moins());
    await lecteur.click(moins());

    expect(pointsDeVie()).toHaveTextContent("0 / 32");
    expect(estCritique()).toBeInTheDocument();
    expect(
      screen.queryByText(/mort|mourir|perdu|fin de/i),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await lecteur.click(plus());
    expect(pointsDeVie()).toHaveTextContent("1 / 32");
  });

  it("garde l'aventure enregistrée à 0 PV", async () => {
    const { unmount } = render(App);
    await userEvent.setup().click(moins());
    unmount();

    render(App);
    expect(pointsDeVie()).toHaveTextContent("0 / 32");
  });
});
