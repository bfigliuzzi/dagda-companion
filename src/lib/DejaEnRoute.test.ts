import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import App from "../App.svelte";
import { desFixes } from "./des";

const bouton = (nom: string | RegExp) =>
  screen.getByRole("button", { name: nom });

async function ouvrirDejaEnRoute() {
  const lecteur = userEvent.setup();
  await lecteur.click(screen.getByRole("radio", { name: "Déjà en route" }));
  return lecteur;
}

async function saisir(
  lecteur: ReturnType<typeof userEvent.setup>,
  nom: string,
  valeur: string,
) {
  const champ = screen.getByLabelText(nom);
  await lecteur.clear(champ);
  await lecteur.type(champ, valeur);
}

/** Recopie la feuille papier : Herbologie, simplifié, § 112, PV 28/32, CHANCE 4, DEX 7. */
async function recopierHerboriste(lecteur: ReturnType<typeof userEvent.setup>) {
  await lecteur.click(screen.getByRole("radio", { name: "Herbologie" }));
  await lecteur.click(screen.getByRole("radio", { name: "Simplifié" }));
  await saisir(lecteur, "Dernier chapitre lu", "112");
  await saisir(lecteur, "PV maximum", "32");
  await saisir(lecteur, "PV actuels", "28");
  await saisir(lecteur, "Chance", "4");
}

describe("déjà en route", () => {
  beforeEach(() => localStorage.clear());

  it("bascule le formulaire avec le contrôle segmenté, sans changer de page", async () => {
    render(App, { de: desFixes(3) });
    const lecteur = await ouvrirDejaEnRoute();

    expect(screen.getByRole("radio", { name: "Déjà en route" })).toBeChecked();
    expect(
      screen.getByRole("heading", { name: "Nouvel apprenti" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Dernier chapitre lu")).toBeInTheDocument();
    expect(screen.getByLabelText("PV actuels")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /^Lancer/ }),
    ).not.toBeInTheDocument();

    await lecteur.click(
      screen.getByRole("radio", { name: "Nouvelle aventure" }),
    );
    expect(
      screen.getByRole("button", { name: "Lancer les points de vie" }),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText("PV actuels")).not.toBeInTheDocument();
  });

  it("garde le TALENT et le mode choisis quand on change d'onglet", async () => {
    render(App, { de: desFixes(3) });
    const lecteur = userEvent.setup();
    await lecteur.click(screen.getByRole("radio", { name: "Herbologie" }));
    await lecteur.click(screen.getByRole("radio", { name: "Mortel" }));
    await lecteur.click(screen.getByRole("radio", { name: "Déjà en route" }));
    expect(screen.getByRole("radio", { name: "Herbologie" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Mortel" })).toBeChecked();
  });

  it("saisit chaque valeur chiffrée par un champ numérique avec pas à pas", async () => {
    render(App, { de: desFixes(3) });
    const lecteur = await ouvrirDejaEnRoute();

    for (const [champ, depart] of [
      ["Dernier chapitre lu", 1],
      ["PV actuels", null],
      ["PV maximum", null],
      ["Chance", null],
      ["Dextérité", 7],
    ] as const) {
      const input = screen.getByLabelText(champ);
      expect(input).toHaveAttribute("type", "number");
      if (depart !== null) expect(input).toHaveValue(depart);
    }

    await lecteur.click(bouton("Augmenter PV maximum"));
    await lecteur.click(bouton("Augmenter PV maximum"));
    expect(screen.getByLabelText("PV maximum")).toHaveValue(2);
    await lecteur.click(bouton("Diminuer PV maximum"));
    expect(screen.getByLabelText("PV maximum")).toHaveValue(1);
    await lecteur.click(bouton("Diminuer PV maximum"));
    expect(screen.getByLabelText("PV maximum")).toHaveValue(1);

    await lecteur.click(bouton("Augmenter Dextérité"));
    expect(screen.getByLabelText("Dextérité")).toHaveValue(8);
    await lecteur.click(bouton("Augmenter Dernier chapitre lu"));
    expect(screen.getByLabelText("Dernier chapitre lu")).toHaveValue(2);
  });

  it("n'affiche les sauvegardes utilisées qu'en mode simplifié", async () => {
    render(App, { de: desFixes(3) });
    const lecteur = await ouvrirDejaEnRoute();
    const nom = "Sauvegardes déjà utilisées";

    expect(
      screen.queryByRole("radiogroup", { name: nom }),
    ).not.toBeInTheDocument();
    await lecteur.click(screen.getByRole("radio", { name: "Narratif" }));
    expect(
      screen.queryByRole("radiogroup", { name: nom }),
    ).not.toBeInTheDocument();

    await lecteur.click(screen.getByRole("radio", { name: "Simplifié" }));
    expect(screen.getByRole("radiogroup", { name: nom })).toBeInTheDocument();
    expect(
      ["0", "1", "2", "3"].map((n) => screen.getByRole("radio", { name: n })),
    ).toHaveLength(4);
    expect(screen.getByRole("radio", { name: "0" })).toBeChecked();

    await lecteur.click(screen.getByRole("radio", { name: "Mortel" }));
    expect(
      screen.queryByRole("radiogroup", { name: nom }),
    ).not.toBeInTheDocument();
  });

  it("garde le bouton éteint en disant ce qui manque", async () => {
    render(App, { de: desFixes(3) });
    const lecteur = await ouvrirDejaEnRoute();
    expect(bouton("Choisissez d'abord un TALENT")).toBeDisabled();
    await lecteur.click(screen.getByRole("radio", { name: "Herbologie" }));
    await lecteur.click(screen.getByRole("radio", { name: "Mortel" }));
    expect(bouton("Saisissez d'abord les PV maximum")).toBeDisabled();
    await saisir(lecteur, "PV maximum", "32");
    expect(bouton("Saisissez d'abord les PV actuels")).toBeDisabled();
    await saisir(lecteur, "PV actuels", "28");
    expect(bouton("Saisissez d'abord la CHANCE")).toBeDisabled();
    await saisir(lecteur, "Chance", "4");
    expect(bouton("Ouvrir ma feuille")).toBeEnabled();
  });

  it("donne un indice, sans bloquer, quand les PV actuels dépassent le maximum", async () => {
    render(App, { de: desFixes(3) });
    const lecteur = await ouvrirDejaEnRoute();
    await recopierHerboriste(lecteur);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();

    await saisir(lecteur, "PV actuels", "40");
    expect(screen.getByRole("status")).toHaveTextContent(
      "Les PV actuels dépassent le maximum",
    );
    expect(bouton("Ouvrir ma feuille")).toBeEnabled();

    await saisir(lecteur, "PV actuels", "32");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("ouvre la feuille avec exactement les valeurs saisies, chapitre compris", async () => {
    render(App, { de: desFixes(3) });
    const lecteur = await ouvrirDejaEnRoute();
    await recopierHerboriste(lecteur);
    await lecteur.click(bouton("Ouvrir ma feuille"));

    expect(
      screen.queryByRole("heading", { name: "Nouvel apprenti" }),
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText("Points de vie")).toHaveTextContent("28 / 32");
    expect(screen.getByLabelText("Chance")).toHaveTextContent("4");
    expect(screen.getByLabelText("Dextérité")).toHaveTextContent("7");
    expect(bouton(/dernier chapitre lu/i)).toHaveTextContent("§ 112");
    expect(screen.getByText("Herbologie · Mode simplifié")).toBeInTheDocument();
  });

  it("ouvre la feuille avec des PV actuels au-dessus du maximum, tels que saisis", async () => {
    render(App, { de: desFixes(3) });
    const lecteur = await ouvrirDejaEnRoute();
    await recopierHerboriste(lecteur);
    await saisir(lecteur, "PV actuels", "40");
    await lecteur.click(bouton("Ouvrir ma feuille"));
    expect(screen.getByLabelText("Points de vie")).toHaveTextContent("40 / 32");
  });

  it("retrouve le personnage recopié, et ses sauvegardes utilisées, après avoir fermé et rouvert l'app", async () => {
    const { unmount } = render(App, { de: desFixes(3) });
    const lecteur = await ouvrirDejaEnRoute();
    await recopierHerboriste(lecteur);
    await lecteur.click(screen.getByRole("radio", { name: "2" }));
    await lecteur.click(bouton("Ouvrir ma feuille"));
    unmount();

    render(App, { de: desFixes(1) });
    expect(screen.getByLabelText("Points de vie")).toHaveTextContent("28 / 32");
    expect(bouton(/dernier chapitre lu/i)).toHaveTextContent("§ 112");
    const enregistre = JSON.parse(localStorage.getItem("dagda-compagnon")!);
    expect(enregistre.aventure.sauvegardesUtilisees).toBe(2);
  });
});
