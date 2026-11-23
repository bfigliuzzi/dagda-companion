import { render, screen, within } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import App from "../App.svelte";
import { desFixes } from "./des";
import { ouvrirNouvelApprenti } from "./test/ouvrirNouvelApprenti";

const bouton = (nom: string | RegExp) =>
  screen.getByRole("button", { name: nom });

describe("nouvel apprenti", () => {
  beforeEach(() => localStorage.clear());

  it("s'ouvre par « Commencer » sur l'Accueil, en « Nouvelle aventure », sans feuille", async () => {
    await ouvrirNouvelApprenti(desFixes(3));
    expect(
      screen.getByRole("heading", { name: "Nouvel apprenti" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /dernier chapitre lu/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("radio", { name: "Nouvelle aventure" }),
    ).toBeChecked();
    expect(
      screen.getByRole("radio", { name: "Déjà en route" }),
    ).toBeInTheDocument();
  });

  it("propose les 7 TALENTS du livre, un seul à la fois", async () => {
    await ouvrirNouvelApprenti(desFixes(3));
    const talents = within(screen.getByRole("radiogroup", { name: "Talent" }));
    const noms = [
      "Instinct",
      "Herbologie",
      "Discrétion",
      "Persuasion",
      "Observation",
      "Doigts agiles",
      "Empratique",
    ];
    expect(talents.getAllByRole("radio")).toEqual(
      noms.map((nom) => talents.getByRole("radio", { name: nom })),
    );

    const lecteur = userEvent.setup();
    await lecteur.click(screen.getByRole("radio", { name: "Instinct" }));
    await lecteur.click(screen.getByRole("radio", { name: "Herbologie" }));
    expect(screen.getByRole("radio", { name: "Herbologie" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Instinct" })).not.toBeChecked();
  });

  it("tire les POINTS DE VIE max (2d6 × 4) et la CHANCE (1d6) avec « Lancer »", async () => {
    await ouvrirNouvelApprenti(desFixes(3, 5, 4));
    const lecteur = userEvent.setup();

    await lecteur.click(
      screen.getByRole("button", { name: "Lancer les points de vie" }),
    );
    expect(screen.getByLabelText("Points de vie maximum")).toHaveValue(32);
    expect(screen.getByText("2 dés × 4 · obtenu 8")).toBeInTheDocument();

    await lecteur.click(
      screen.getByRole("button", { name: "Lancer la chance" }),
    );
    expect(screen.getByLabelText("Chance")).toHaveValue(4);
  });

  it("relance les POINTS DE VIE max et remplace la valeur", async () => {
    await ouvrirNouvelApprenti(desFixes(3, 5, 6, 6));
    const lecteur = userEvent.setup();

    await lecteur.click(
      screen.getByRole("button", { name: "Lancer les points de vie" }),
    );
    await lecteur.click(
      screen.getByRole("button", { name: "Relancer les points de vie" }),
    );
    expect(screen.getByLabelText("Points de vie maximum")).toHaveValue(48);
  });

  it("affiche la DEXTÉRITÉ fixée à 7", async () => {
    await ouvrirNouvelApprenti(desFixes(3));
    expect(
      screen.getByText("Fixée à 7 pour tous les apprentis"),
    ).toBeInTheDocument();
  });

  it("propose les 3 modes de jeu, chacun avec une courte description", async () => {
    await ouvrirNouvelApprenti(desFixes(3));
    const modes = within(
      screen.getByRole("radiogroup", { name: "Mode de jeu" }),
    );
    expect(modes.getAllByRole("radio")).toEqual(
      ["Narratif", "Simplifié", "Mortel"].map((nom) =>
        modes.getByRole("radio", { name: nom }),
      ),
    );
    expect(
      screen.getByRole("radio", { name: "Simplifié" }),
    ).toHaveAccessibleDescription(
      "Toutes les règles, avec 3 sauvegardes pour tout le livre.",
    );
    expect(
      screen.getByRole("radio", { name: "Narratif" }),
    ).toHaveAccessibleDescription(/issue des combats/);
    expect(
      screen.getByRole("radio", { name: "Mortel" }),
    ).toHaveAccessibleDescription(/recommencer au chapitre 1/);
  });

  it("garde la validation éteinte en disant ce qui manque, jusqu'à ce que tout soit rempli", async () => {
    await ouvrirNouvelApprenti(desFixes(3, 5, 4));
    const lecteur = userEvent.setup();

    expect(bouton("Choisissez d'abord un TALENT")).toBeDisabled();
    await lecteur.click(screen.getByRole("radio", { name: "Herbologie" }));
    expect(bouton("Choisissez d'abord le mode de jeu")).toBeDisabled();
    await lecteur.click(screen.getByRole("radio", { name: "Simplifié" }));
    expect(bouton("Lancez d'abord les POINTS DE VIE")).toBeDisabled();
    await lecteur.click(bouton("Lancer les points de vie"));
    expect(bouton("Lancez d'abord la CHANCE")).toBeDisabled();
    await lecteur.click(bouton("Lancer la chance"));
    expect(bouton("Commencer l'aventure")).toBeEnabled();

    await lecteur.clear(screen.getByLabelText("Points de vie maximum"));
    expect(bouton("Lancez d'abord les POINTS DE VIE")).toBeDisabled();
  });

  it("demande de corriger une valeur saisie à la main qui n'est pas valable", async () => {
    await ouvrirNouvelApprenti(desFixes(3, 5, 4));
    const lecteur = userEvent.setup();
    await lecteur.click(screen.getByRole("radio", { name: "Herbologie" }));
    await lecteur.click(screen.getByRole("radio", { name: "Mortel" }));
    await lecteur.type(screen.getByLabelText("Points de vie maximum"), "0");
    expect(bouton("Corrigez les POINTS DE VIE")).toBeDisabled();

    await lecteur.click(bouton("Relancer les points de vie"));
    await lecteur.type(screen.getByLabelText("Chance"), "2.5");
    expect(bouton("Corrigez la CHANCE")).toBeDisabled();
  });

  it("ouvre la feuille avec les PV pleins, la CHANCE tirée, DEX 7 et le chapitre 1", async () => {
    await ouvrirNouvelApprenti(desFixes(3, 5, 4));
    await creerHerboriste();

    expect(
      screen.queryByRole("heading", { name: "Nouvel apprenti" }),
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText("Points de vie")).toHaveTextContent("32 / 32");
    expect(screen.getByLabelText("Chance")).toHaveTextContent("4");
    expect(screen.getByLabelText("Dextérité")).toHaveTextContent("7");
    expect(bouton(/dernier chapitre lu/i)).toHaveTextContent("§ 1");
    expect(screen.getByText("Herbologie · Mode simplifié")).toBeInTheDocument();
  });

  it("garde la valeur corrigée à la main", async () => {
    await ouvrirNouvelApprenti(desFixes(3, 5, 4));
    const lecteur = userEvent.setup();
    await lecteur.click(bouton("Lancer les points de vie"));
    const champ = screen.getByLabelText("Points de vie maximum");
    await lecteur.clear(champ);
    await lecteur.type(champ, "30");
    expect(screen.getByText("2 dés × 4")).toBeInTheDocument();

    await creerHerboriste();
    expect(screen.getByLabelText("Points de vie")).toHaveTextContent("30 / 30");
  });

  it("retrouve le personnage et le mode après avoir fermé et rouvert l'app", async () => {
    const { unmount } = await ouvrirNouvelApprenti(desFixes(6, 6, 2));
    await creerHerboriste("Mortel");
    unmount();

    render(App, { de: desFixes(1) });
    expect(screen.getByText("Herbologie · Mode mortel")).toBeInTheDocument();
    expect(screen.getByLabelText("Points de vie")).toHaveTextContent("48 / 48");
    expect(screen.getByLabelText("Chance")).toHaveTextContent("2");
    expect(screen.getByLabelText("Dextérité")).toHaveTextContent("7");
  });
});

/** Remplit l'écran « Nouvel apprenti » et valide ; lance ce qui n'est pas encore tiré. */
async function creerHerboriste(mode = "Simplifié") {
  const lecteur = userEvent.setup();
  await lecteur.click(screen.getByRole("radio", { name: "Herbologie" }));
  await lecteur.click(screen.getByRole("radio", { name: mode }));
  const lancerPv = screen.queryByRole("button", {
    name: "Lancer les points de vie",
  });
  if (lancerPv) await lecteur.click(lancerPv);
  await lecteur.click(bouton("Lancer la chance"));
  await lecteur.click(bouton("Commencer l'aventure"));
}
