import { cleanup, render, screen, within } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import App from "../App.svelte";
import type { Mode } from "./aventure";
import { combatNarratif, type CombatDeLHistorique } from "./combat";
import { desFixes, type De } from "./des";
import { ecrireAventure, lireAventure } from "./stockage";

/** Une aventure au § 112 : PV 28 / 32, CHANCE 4, DEX 7, l'épée courte (+1). */
function enregistrerAventure(
  mode: Mode = "narratif",
  combats: CombatDeLHistorique[] = [],
) {
  localStorage.clear();
  ecrireAventure(localStorage, {
    chapitre: 112,
    mode,
    sauvegardesUtilisees: 0,
    notes: "",
    armes: [{ nom: "Épée courte", bonus: 1 }],
    besace: { objets: [], bourse: false, boulons: 0, boulonsForces: false },
    effets: [],
    combat: null,
    combats,
    personnage: {
      talent: "Herbologie",
      pointsDeVieMax: 32,
      pointsDeVie: 28,
      chance: 4,
      dexterite: 7,
    },
  });
}

function ouvrirLApp(de: De = desFixes(6, 6)) {
  render(App, { props: { de } });
  return userEvent.setup();
}

const bouton = (nom: string | RegExp) =>
  screen.getByRole("button", { name: nom });
const champ = (nom: string) => screen.getByLabelText(nom) as HTMLInputElement;
const sansChamp = (nom: string) =>
  expect(screen.queryByLabelText(nom)).not.toBeInTheDocument();
const sectionDeLaFeuille = () =>
  within(screen.getByRole("region", { name: "Combats" }));

/** Combattre, avec le nombre d'adversaires du livre. */
async function ouvrirLaFiche(
  lecteur: ReturnType<typeof userEvent.setup>,
  adversaires: string,
) {
  await lecteur.click(bouton("Combattre"));
  await lecteur.clear(champ("Adversaires"));
  await lecteur.type(champ("Adversaires"), adversaires);
}

describe("le formulaire « Nouveau combat » en mode narratif", () => {
  beforeEach(() => enregistrerAventure());

  it("demande le chapitre et le nombre d'adversaires, sans les statistiques de l'ennemi", async () => {
    const lecteur = ouvrirLApp();
    await lecteur.click(bouton("Combattre"));

    expect(
      screen.getByRole("heading", { name: "Nouveau combat" }),
    ).toBeInTheDocument();
    expect(champ("Chapitre du combat")).toHaveValue(112);
    expect(champ("Adversaires")).toHaveValue(1);
    sansChamp("Dextérité");
    sansChamp("Points de vie");
    sansChamp("Bonus de dégâts");
    expect(
      screen.queryByRole("switch", { name: "L'ennemi frappe en premier" }),
    ).not.toBeInTheDocument();
    expect(bouton("Continuer")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Au-delà de 5 adversaires, le combat se joue aux dés, même en mode narratif.",
      ),
    ).toBeInTheDocument();
  });

  it("dit quoi corriger quand le nombre d'adversaires manque, sans rien ouvrir", async () => {
    const lecteur = ouvrirLApp();
    await lecteur.click(bouton("Combattre"));
    await lecteur.clear(champ("Adversaires"));

    expect(bouton(/Corrigez/)).toHaveTextContent(
      "Corrigez le nombre d'adversaires",
    );
    await lecteur.click(bouton(/Corrigez/));
    expect(
      screen.getByRole("heading", { name: "Nouveau combat" }),
    ).toBeInTheDocument();
  });

  it("demande les statistiques de l'ennemi dès que le groupe dépasse 5 adversaires", async () => {
    const lecteur = ouvrirLApp();
    await ouvrirLaFiche(lecteur, "6");

    expect(champ("Dextérité")).toHaveValue(null);
    expect(champ("Points de vie")).toHaveValue(null);
    expect(champ("Bonus de dégâts")).toHaveValue(0);
    expect(
      screen.getByRole("switch", { name: "L'ennemi frappe en premier" }),
    ).toBeInTheDocument();
    expect(bouton(/Saisissez d'abord la DEX/)).toBeInTheDocument();

    // Revenu à 5, le groupe se règle de nouveau en deux choix.
    await lecteur.clear(champ("Adversaires"));
    await lecteur.type(champ("Adversaires"), "5");
    sansChamp("Dextérité");
    expect(bouton("Continuer")).toBeInTheDocument();
  });
});

describe("l'écran « Gagné » / « Perdu » du mode narratif", () => {
  beforeEach(() => enregistrerAventure());

  async function ouvrirLesChoix(
    lecteur: ReturnType<typeof userEvent.setup>,
    adversaires = "1",
  ) {
    await ouvrirLaFiche(lecteur, adversaires);
    await lecteur.click(bouton("Continuer"));
  }

  it("s'ouvre avec 1 adversaire et rappelle le chapitre et le nombre d'adversaires", async () => {
    const lecteur = ouvrirLApp();
    await ouvrirLesChoix(lecteur);

    expect(
      screen.getByRole("heading", { level: 1, name: "Combat" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Mode narratif · § 112 · 1 adversaire"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: /^Comment s'est terminé ce combat\s\?$/,
      }),
    ).toBeInTheDocument();
    expect(bouton("Gagné")).toBeInTheDocument();
    expect(bouton("Perdu")).toBeInTheDocument();
    expect(bouton("Jouer le combat aux dés")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Au-delà de 5 adversaires, le combat se joue aux dés, même en mode narratif.",
      ),
    ).toBeInTheDocument();
  });

  it("met « adversaires » au pluriel et accepte 5 adversaires", async () => {
    const lecteur = ouvrirLApp();
    await ouvrirLesChoix(lecteur, "5");

    expect(
      screen.getByText("Mode narratif · § 112 · 5 adversaires"),
    ).toBeInTheDocument();
    expect(bouton("Gagné")).toBeInTheDocument();
  });

  it("note « Gagné » dans l'historique, sans PV perdus, et revient à la feuille", async () => {
    const lecteur = ouvrirLApp();
    await ouvrirLesChoix(lecteur);
    await lecteur.click(bouton("Gagné"));

    expect(bouton("Combattre")).toBeInTheDocument();
    const [ligne] = sectionDeLaFeuille().getAllByRole("listitem");
    expect(ligne).toHaveTextContent("§ 112");
    expect(ligne).toHaveTextContent("Gagné");
    expect(ligne).toHaveTextContent("Narratif");
    expect(ligne).not.toHaveTextContent("PV");
    expect(sectionDeLaFeuille().getByText("1 livré")).toBeInTheDocument();
    expect(lireAventure(localStorage)).toMatchObject({
      combat: null,
      combats: [combatNarratif(112, 1, "gagne")],
      personnage: { pointsDeVie: 28, chance: 4 },
    });
  });

  it("note « Perdu » sans rien décider à la place du lecteur : PV, CHANCE et feuille inchangés", async () => {
    const lecteur = ouvrirLApp();
    await ouvrirLaFiche(lecteur, "3");
    await lecteur.click(bouton("Continuer"));
    await lecteur.click(bouton("Perdu"));

    // Aucun écran « Perdu » ni proposition de recommencer : la feuille, c'est tout.
    expect(bouton("Combattre")).toBeInTheDocument();
    expect(
      screen.queryByText(/Vos points de vie sont à 0/),
    ).not.toBeInTheDocument();
    const [ligne] = sectionDeLaFeuille().getAllByRole("listitem");
    expect(ligne).toHaveTextContent("Perdu");
    expect(ligne).toHaveTextContent("Narratif");
    expect(ligne).not.toHaveTextContent("PV");
    expect(lireAventure(localStorage)).toMatchObject({
      combats: [combatNarratif(112, 3, "perdu")],
      personnage: { pointsDeVie: 28, chance: 4 },
    });
  });

  it("retrouve le combat narratif après rechargement", async () => {
    const lecteur = ouvrirLApp();
    await ouvrirLesChoix(lecteur);
    await lecteur.click(bouton("Gagné"));

    cleanup();
    ouvrirLApp();
    expect(sectionDeLaFeuille().getByText("Narratif")).toBeInTheDocument();
  });

  it("annule sans rien noter avec la flèche « Annuler »", async () => {
    const lecteur = ouvrirLApp();
    await ouvrirLesChoix(lecteur);
    await lecteur.click(bouton("Annuler"));

    expect(bouton("Combattre")).toBeInTheDocument();
    expect(
      screen.queryByRole("region", { name: "Combats" }),
    ).not.toBeInTheDocument();
    expect(lireAventure(localStorage)?.combats).toEqual([]);
  });

  it("laisse choisir de jouer le combat : la fiche de l'ennemi s'ouvre, chapitre et adversaires gardés", async () => {
    const lecteur = ouvrirLApp(desFixes(2, 3, 3, 6, 6));
    await ouvrirLesChoix(lecteur, "2");
    await lecteur.click(bouton("Jouer le combat aux dés"));

    expect(
      screen.getByRole("heading", { name: "Nouveau combat" }),
    ).toBeInTheDocument();
    expect(champ("Chapitre du combat")).toHaveValue(112);
    expect(champ("Adversaires")).toHaveValue(2);
    expect(champ("Dextérité")).toHaveValue(null);
    expect(champ("Points de vie")).toHaveValue(null);
    expect(bouton(/Saisissez d'abord la DEX/)).toBeInTheDocument();

    await lecteur.type(champ("Dextérité"), "7");
    await lecteur.type(champ("Points de vie"), "5");
    await lecteur.click(bouton("Commencer le combat"));

    // Le combat se joue normalement : écran de combat, tour par tour.
    expect(screen.getByText("Ennemi · § 112")).toBeInTheDocument();
    await lecteur.click(bouton("Finir"));
    expect(screen.getByRole("heading", { name: "Gagné" })).toBeInTheDocument();
  });
});

describe("au-delà de 5 adversaires, en mode narratif", () => {
  beforeEach(() => enregistrerAventure());

  it("saute l'écran « Gagné » / « Perdu » : le combat automatique se lance après la fiche de l'ennemi", async () => {
    const lecteur = ouvrirLApp(desFixes(2, 3, 3, 6, 6));
    await ouvrirLaFiche(lecteur, "7");
    await lecteur.type(champ("Dextérité"), "7");
    await lecteur.type(champ("Points de vie"), "5");
    await lecteur.click(bouton("Commencer le combat"));

    expect(screen.queryByRole("button", { name: "Perdu" })).toBeNull();
    expect(screen.getByText("Ennemi · § 112")).toBeInTheDocument();
    await lecteur.click(bouton("Finir"));
    await lecteur.click(bouton("Retour à la feuille"));

    const [ligne] = sectionDeLaFeuille().getAllByRole("listitem");
    expect(ligne).toHaveTextContent("Gagné");
    // Un combat joué, pas un combat narratif : ses tours et ses adversaires.
    expect(ligne).toHaveTextContent("1 tour · 7 adversaires");
    expect(ligne).not.toHaveTextContent("Narratif");
  });
});

describe("dans les autres modes, rien ne change", () => {
  it.each<Mode>(["simplifie", "mortel"])(
    "en mode %s, la fiche complète est demandée dès 1 adversaire, sans écran « Gagné » / « Perdu »",
    async (mode) => {
      enregistrerAventure(mode);
      const lecteur = ouvrirLApp();
      await lecteur.click(bouton("Combattre"));

      expect(champ("Dextérité")).toHaveValue(null);
      expect(champ("Points de vie")).toHaveValue(null);
      expect(champ("Adversaires")).toHaveValue(1);
      expect(champ("Bonus de dégâts")).toHaveValue(0);
      expect(
        screen.getByRole("switch", { name: "L'ennemi frappe en premier" }),
      ).toBeInTheDocument();
      expect(bouton(/Saisissez d'abord la DEX/)).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "Continuer" }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText(/le combat se joue aux dés, même en mode narratif/),
      ).not.toBeInTheDocument();
    },
  );

  it("en mode simplifié, 3 adversaires se jouent aux dés", async () => {
    enregistrerAventure("simplifie");
    const lecteur = ouvrirLApp();
    await ouvrirLaFiche(lecteur, "3");
    await lecteur.type(champ("Dextérité"), "7");
    await lecteur.type(champ("Points de vie"), "50");
    await lecteur.click(bouton("Commencer le combat"));

    expect(screen.getByText("Ennemi · § 112")).toBeInTheDocument();
  });
});

describe("un combat narratif dans l'historique", () => {
  beforeEach(() =>
    enregistrerAventure("narratif", [
      combatNarratif(98, 1, "gagne"),
      combatNarratif(61, 3, "perdu"),
    ]),
  );

  async function ouvrirLHistorique() {
    const lecteur = ouvrirLApp();
    await lecteur.click(bouton("Tout l'historique"));
    return lecteur;
  }

  it("figure dans l'écran « Combats » avec son issue, sans PV perdus", async () => {
    await ouvrirLHistorique();

    // Aucun PV perdu : le résumé n'en invente pas.
    expect(
      screen.getByText("2 combats · 1 gagné · 0 PV perdu en tout"),
    ).toBeInTheDocument();
    const perdu = bouton(/§\s61/);
    expect(perdu).toHaveTextContent("Perdu");
    expect(perdu).toHaveTextContent("Narratif");
    expect(perdu).not.toHaveTextContent("−");
    expect(bouton(/§\s98/)).toHaveTextContent("Gagné");
  });

  it("déplie un détail sans jets : issue indiquée, adversaires, rien de joué", async () => {
    const lecteur = await ouvrirLHistorique();
    await lecteur.click(bouton(/§\s61/));

    const detail = within(
      screen.getByRole("region", { name: "Détail du § 61" }),
    );
    expect(detail.getByText(/3 adversaires/)).toBeInTheDocument();
    expect(detail.getByText(/Vous avez indiqué l'issue/)).toBeInTheDocument();
    expect(detail.getByText(/aucun jet/)).toBeInTheDocument();
    // Ni PV, ni CHANCE, ni fiches de départ, ni journal à montrer.
    expect(detail.queryByText(/CHANCE/)).not.toBeInTheDocument();
    expect(detail.queryByText(/DEX/)).not.toBeInTheDocument();
    expect(detail.queryByRole("list")).not.toBeInTheDocument();
    expect(
      detail.queryByRole("button", { name: /ligne/ }),
    ).not.toBeInTheDocument();
  });
});
