import { render, screen, within } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import App from "../App.svelte";
import {
  commencerUnCombat,
  interrompreLeCombat,
  jouerJusquALaFin,
  jouerUnTour,
  type Camp,
  type Combat,
} from "./combat";
import { desFixes, type De } from "./des";
import { lireAventure } from "./stockage";
import { enregistrerAventure as enregistrer } from "./test/uneAventure";

/** Une fiche de lecteur : DEX 7, 32 PV max, CHANCE 4, bonus de dommage +1. */
const lecteur = (pointsDeVie: number) => ({
  dexterite: 7,
  pointsDeVie,
  pointsDeVieMax: 32,
  chance: 4,
  bonus: 1,
});

function combat(
  chapitre: number,
  {
    pv,
    adversaires = 1,
    premier = "lecteur",
    vous = 28,
  }: { pv: number; adversaires?: number; premier?: Camp; vous?: number },
  des: number[],
  fin: "finir" | "quitter" = "finir",
): Combat {
  const commence = commencerUnCombat(
    {
      chapitre,
      adversaires,
      ennemi: { dexterite: 7, pointsDeVie: pv, bonus: 0 },
      premier,
    },
    lecteur(vous),
  );
  const de = desFixes(...des);
  return fin === "finir"
    ? jouerJusquALaFin(commence, de)
    : interrompreLeCombat(jouerUnTour(commence, de));
}

// § 112, gagné en 3 tours, 7 adversaires : l'ennemi (12 PV) rate toujours
// (6 + 6), le lecteur touche pour 5, 5 puis 3. Six jets, aucun PV perdu.
const long = combat(
  112,
  { pv: 12, adversaires: 7, premier: "ennemi" },
  [6, 6, 2, 3, 3, 6, 6, 2, 3, 3, 6, 6, 2, 3, 1],
);
// § 98, gagné en 1 tour : le lecteur touche pour 5, l'ennemi de 5 PV tombe.
const gagne = combat(98, { pv: 5 }, [2, 3, 3]);
// § 61, perdu : l'ennemi touche pour 7 (d6 = 6), le lecteur de 6 PV tombe.
const perdu = combat(61, { pv: 30, premier: "ennemi", vous: 6 }, [1, 1, 6]);
// § 40, quitté après un tour : l'ennemi touche pour 5, le lecteur riposte pour 5.
const interrompu = combat(
  40,
  { pv: 30, premier: "ennemi" },
  [1, 1, 4, 2, 3, 3],
  "quitter",
);

/** Du plus ancien au plus récent : § 112, 98, 61, 40. */
function enregistrerAventure(combats: Combat[]) {
  enregistrer({ armes: [{ nom: "Épée courte", bonus: 1 }], combats });
}

function ouvrirLApp(de: De = desFixes(6, 6)) {
  render(App, { props: { de } });
  return userEvent.setup();
}

const bouton = (nom: string | RegExp) =>
  screen.getByRole("button", { name: nom });
const sectionDeLaFeuille = () =>
  within(screen.getByRole("region", { name: "Combats" }));
const ligne = (chapitre: number) => bouton(new RegExp(`§\\s${chapitre}\\b`));

describe("la section « Combats » de la feuille", () => {
  it("n'apparaît pas tant qu'aucun combat n'est terminé", () => {
    enregistrerAventure([]);
    ouvrirLApp();

    expect(
      screen.queryByRole("region", { name: "Combats" }),
    ).not.toBeInTheDocument();
  });

  it("montre les deux combats les plus récents, le plus récent en tête, entre la Besace et les Notes", () => {
    enregistrerAventure([long, gagne, perdu, interrompu]);
    ouvrirLApp();

    const section = sectionDeLaFeuille();
    const lignes = section.getAllByRole("listitem");
    expect(lignes).toHaveLength(2);
    expect(lignes[0]).toHaveTextContent("§ 40");
    expect(lignes[0]).toHaveTextContent("Interrompu");
    expect(lignes[1]).toHaveTextContent("§ 61");
    expect(screen.queryByText("§ 98")).not.toBeInTheDocument();
    // Compteur à droite du titre : tous les combats livrés.
    expect(section.getByText("4 livrés")).toBeInTheDocument();

    const titres = screen
      .getAllByRole("heading", { level: 2 })
      .map((titre) => titre.textContent);
    expect(titres.indexOf("Combats")).toBe(titres.indexOf("Besace") + 1);
    expect(titres.indexOf("Notes")).toBe(titres.indexOf("Combats") + 1);
  });

  it("résume chaque combat : chapitre, issue, tours et adversaires, PV perdus", () => {
    enregistrerAventure([long, gagne, perdu]);
    ouvrirLApp();

    const [recent, ancien] = sectionDeLaFeuille().getAllByRole("listitem");
    expect(recent).toHaveTextContent("§ 61");
    expect(recent).toHaveTextContent("Perdu");
    expect(recent).toHaveTextContent("1 tour · 1 adversaire");
    expect(recent).toHaveTextContent("−6 PV");
    expect(ancien).toHaveTextContent("§ 98");
    expect(ancien).toHaveTextContent("Gagné");
    // Aucun PV perdu : rien à droite.
    expect(ancien).not.toHaveTextContent("PV");
  });

  it("garde un compteur au singulier pour un seul combat", () => {
    enregistrerAventure([gagne]);
    ouvrirLApp();

    expect(sectionDeLaFeuille().getByText("1 livré")).toBeInTheDocument();
  });

  it("montre en tête un combat qui vient de se terminer", async () => {
    enregistrerAventure([gagne]);
    // Dés : l'ennemi (5 PV) est touché pour 5 au premier tour.
    const lecteurQuiJoue = ouvrirLApp(desFixes(2, 3, 3));
    await lecteurQuiJoue.click(bouton("Combattre"));
    await lecteurQuiJoue.clear(screen.getByLabelText("Chapitre du combat"));
    await lecteurQuiJoue.type(
      screen.getByLabelText("Chapitre du combat"),
      "77",
    );
    await lecteurQuiJoue.type(screen.getByLabelText("Dextérité"), "7");
    await lecteurQuiJoue.type(screen.getByLabelText("Points de vie"), "5");
    await lecteurQuiJoue.click(bouton("Commencer le combat"));
    await lecteurQuiJoue.click(bouton("Finir"));
    await lecteurQuiJoue.click(bouton("Retour à la feuille"));

    const lignes = sectionDeLaFeuille().getAllByRole("listitem");
    expect(lignes[0]).toHaveTextContent("§ 77");
    expect(lignes[0]).toHaveTextContent("Gagné");
    expect(lignes[1]).toHaveTextContent("§ 98");
  });
});

describe("l'écran « Combats »", () => {
  beforeEach(() => enregistrerAventure([long, gagne, perdu, interrompu]));

  async function ouvrirLHistorique() {
    const lecteurQuiLit = ouvrirLApp();
    await lecteurQuiLit.click(bouton("Tout l'historique"));
    return lecteurQuiLit;
  }

  it("s'ouvre par « Tout l'historique » et montre tous les combats, du plus récent au plus ancien", async () => {
    await ouvrirLHistorique();

    expect(
      screen.getByRole("heading", { level: 1, name: "Combats" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("4 combats · 2 gagnés · 11 PV perdus en tout"),
    ).toBeInTheDocument();
    const chapitres = screen
      .getAllByRole("button", { name: /^§/ })
      .map(
        (ligneDuCombat) => ligneDuCombat.textContent?.match(/§\s(\d+)/)?.[1],
      );
    expect(chapitres).toEqual(["40", "61", "98", "112"]);
  });

  it("a un bouton retour qui ramène à la feuille", async () => {
    const lecteurQuiLit = await ouvrirLHistorique();
    await lecteurQuiLit.click(bouton("Retour à la feuille"));

    expect(bouton("Combattre")).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { level: 1, name: "Combats" }),
    ).not.toBeInTheDocument();
  });

  it("note l'issue de chaque combat, y compris un combat quitté en cours", async () => {
    await ouvrirLHistorique();

    expect(ligne(40)).toHaveTextContent(
      "Interrompu1 tour · 1 adversaire · quitté en cours −5 PV",
    );
    expect(ligne(61)).toHaveTextContent("Perdu1 tour · 1 adversaire −6 PV");
    expect(ligne(98)).toHaveTextContent("Gagné1 tour · 1 adversaire");
    expect(ligne(112)).toHaveTextContent("Gagné3 tours · 7 adversaires");
  });

  it("déplie et replie le détail d'un combat d'un appui", async () => {
    const lecteurQuiLit = await ouvrirLHistorique();
    const ligneDe40 = ligne(40);
    expect(ligneDe40).toHaveAttribute("aria-expanded", "false");

    await lecteurQuiLit.click(ligneDe40);
    expect(ligneDe40).toHaveAttribute("aria-expanded", "true");
    const detail = screen.getByRole("region", { name: "Détail du § 40" });
    // Départ et arrivée, CHANCE, fiches de départ, puis les jets, le plus récent en premier.
    expect(detail).toHaveTextContent("PV 28 → 23 · CHANCE 4, aucune dépensée");
    expect(detail).toHaveTextContent(
      "Vous : DEX 7, dégâts 1 + 1 dé + 1 · Ennemi : DEX 7, 30 PV, dégâts 1 + 1 dé",
    );
    const lignesDeJets = within(detail).getAllByRole("listitem");
    expect(lignesDeJets).toHaveLength(2);
    expect(lignesDeJets[0]).toHaveTextContent(
      "Tour 1 · vous : 2 dés = 5, touché, 5 dégâts.",
    );
    expect(lignesDeJets[1]).toHaveTextContent(
      "Tour 1 · ennemi : 2 dés = 2, touché, −5 PV",
    );

    await lecteurQuiLit.click(ligneDe40);
    expect(ligneDe40).toHaveAttribute("aria-expanded", "false");
    expect(
      screen.queryByRole("region", { name: "Détail du § 40" }),
    ).not.toBeInTheDocument();
  });

  it("n'ouvre qu'un détail à la fois", async () => {
    const lecteurQuiLit = await ouvrirLHistorique();
    await lecteurQuiLit.click(ligne(40));
    await lecteurQuiLit.click(ligne(61));

    expect(
      screen.queryByRole("region", { name: "Détail du § 40" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "Détail du § 61" }),
    ).toHaveTextContent("PV 6 → 0");
  });

  it("ne montre que les trois derniers jets d'un long combat, puis tous sur demande", async () => {
    const lecteurQuiLit = await ouvrirLHistorique();
    await lecteurQuiLit.click(ligne(112));

    const detail = screen.getByRole("region", { name: "Détail du § 112" });
    expect(detail).toHaveTextContent("PV 28 → 28 · CHANCE 4, aucune dépensée");
    let lignesDeJets = within(detail).getAllByRole("listitem");
    expect(lignesDeJets).toHaveLength(3);
    expect(lignesDeJets[0]).toHaveTextContent(
      "Tour 3 · vous : 2 dés = 5, touché, 3 dégâts. Ennemi achevé.",
    );
    expect(lignesDeJets[1]).toHaveTextContent(
      "Tour 3 · ennemi : 2 dés = 12, raté.",
    );
    expect(lignesDeJets[2]).toHaveTextContent(
      "Tour 2 · vous : 2 dés = 5, touché, 5 dégâts.",
    );

    await lecteurQuiLit.click(bouton("Les 3 lignes précédentes"));
    lignesDeJets = within(detail).getAllByRole("listitem");
    expect(lignesDeJets).toHaveLength(6);
    expect(lignesDeJets[5]).toHaveTextContent(
      "Tour 1 · ennemi : 2 dés = 12, raté.",
    );
    expect(
      screen.queryByRole("button", { name: /lignes précédentes/ }),
    ).not.toBeInTheDocument();
  });

  it("montre la CHANCE dépensée automatiquement", async () => {
    const avecChance: Combat = {
      ...gagne,
      chance: 3,
      jets: gagne.jets.map((jet) => ({ ...jet, chance: 1, total: 4 })),
    };
    enregistrerAventure([avecChance]);
    const lecteurQuiLit = ouvrirLApp();
    await lecteurQuiLit.click(bouton("Tout l'historique"));
    await lecteurQuiLit.click(ligne(98));

    const detail = screen.getByRole("region", { name: "Détail du § 98" });
    expect(detail).toHaveTextContent("CHANCE 4 → 3 (1 automatique)");
    expect(detail).toHaveTextContent(
      "Tour 1 · vous : 2 dés = 5 → 4, touché, 5 dégâts. Ennemi achevé.",
    );
  });
});

describe("depuis la fin d'un combat", () => {
  beforeEach(() => enregistrerAventure([gagne]));

  async function gagnerUnCombat() {
    // Tour 1 : chacun touche. Tour 2 : l'ennemi (10 PV) tombe. Trois tours si PV 14.
    const lecteurQuiJoue = ouvrirLApp(desFixes(2, 3, 3, 1, 1, 4, 2, 3, 3));
    await lecteurQuiJoue.click(bouton("Combattre"));
    await lecteurQuiJoue.type(screen.getByLabelText("Dextérité"), "7");
    await lecteurQuiJoue.type(screen.getByLabelText("Points de vie"), "10");
    await lecteurQuiJoue.click(bouton("Commencer le combat"));
    await lecteurQuiJoue.click(bouton("Finir"));
    return lecteurQuiJoue;
  }

  it("« Voir le détail des 2 tours » ouvre l'historique avec ce combat déplié", async () => {
    const lecteurQuiJoue = await gagnerUnCombat();
    await lecteurQuiJoue.click(bouton("Voir le détail des 2 tours"));

    expect(
      screen.getByRole("heading", { level: 1, name: "Combats" }),
    ).toBeInTheDocument();
    expect(ligne(112)).toHaveAttribute("aria-expanded", "true");
    expect(
      screen.getByRole("region", { name: "Détail du § 112" }),
    ).toBeInTheDocument();
    expect(ligne(98)).toHaveAttribute("aria-expanded", "false");

    await lecteurQuiJoue.click(bouton("Retour à la feuille"));
    expect(bouton("Combattre")).toBeInTheDocument();
  });

  it("n'est pas proposé après une défaite", async () => {
    enregistrerAventure([]);
    const lecteurQuiJoue = ouvrirLApp(desFixes(1, 1, 6));
    await lecteurQuiJoue.click(bouton("Combattre"));
    await lecteurQuiJoue.type(screen.getByLabelText("Dextérité"), "7");
    await lecteurQuiJoue.type(screen.getByLabelText("Points de vie"), "30");
    await lecteurQuiJoue.click(
      screen.getByRole("switch", { name: "L'ennemi frappe en premier" }),
    );
    // Les dés se répètent : chacun touche à chaque tour (7 et 8 dégâts), le lecteur tombe le premier.
    await lecteurQuiJoue.click(bouton("Commencer le combat"));
    await lecteurQuiJoue.click(bouton("Finir"));

    expect(
      screen.queryByRole("button", { name: /Voir le détail/ }),
    ).not.toBeInTheDocument();
  });
});

describe("rien ne se perd", () => {
  it("retrouve l'historique, dans l'ordre, après avoir fermé et rouvert l'app", async () => {
    enregistrerAventure([gagne]);
    const premiere = render(App, { props: { de: desFixes(2, 3, 3) } });
    const lecteurQuiJoue = userEvent.setup();
    await lecteurQuiJoue.click(bouton("Combattre"));
    await lecteurQuiJoue.clear(screen.getByLabelText("Chapitre du combat"));
    await lecteurQuiJoue.type(
      screen.getByLabelText("Chapitre du combat"),
      "77",
    );
    await lecteurQuiJoue.type(screen.getByLabelText("Dextérité"), "7");
    await lecteurQuiJoue.type(screen.getByLabelText("Points de vie"), "5");
    await lecteurQuiJoue.click(bouton("Commencer le combat"));
    await lecteurQuiJoue.click(bouton("Finir"));
    await lecteurQuiJoue.click(bouton("Retour à la feuille"));
    premiere.unmount();

    expect(lireAventure(localStorage)?.combats).toHaveLength(2);
    const lecteurQuiRevient = ouvrirLApp();
    await lecteurQuiRevient.click(bouton("Tout l'historique"));
    const chapitres = screen
      .getAllByRole("button", { name: /^§/ })
      .map(
        (ligneDuCombat) => ligneDuCombat.textContent?.match(/§\s(\d+)/)?.[1],
      );
    expect(chapitres).toEqual(["77", "98"]);
  });
});
