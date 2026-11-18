import { render, screen, within } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "../App.svelte";
import type { Arme, Personnage } from "./aventure";
import type { Combat } from "./combat";
import { desFixes, type De } from "./des";
import { ecrireAventure, lireAventure } from "./stockage";
import type { Effet } from "./valeursEffectives";

const epeeCourte: Arme = { nom: "Épée courte", bonus: 1 };
const potion: Effet = {
  nom: "Potion d'agilité",
  duree: "24 h",
  cible: "dexterite",
  valeur: 1,
};

/** Une aventure au § 112 : PV 28 / 32, CHANCE 4, DEX 7, l'épée courte (+1). */
function enregistrerAventure({
  armes = [epeeCourte],
  effets = [],
  personnage = {},
}: {
  armes?: Arme[];
  effets?: Effet[];
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

const bouton = (nom: string | RegExp) =>
  screen.getByRole("button", { name: nom });
const champ = (nom: string) => screen.getByLabelText(nom) as HTMLInputElement;
const commencer = () => bouton(/Commencer le combat|d'abord|Corrigez/);
const camp = (nom: string | RegExp) =>
  within(screen.getByRole("group", { name: nom }));
const journal = () => within(screen.getByRole("list", { name: "Journal" }));
const lignesDuJournal = () =>
  screen.getByRole("list", { name: "Journal" }).querySelectorAll("li");

function ouvrirLApp(de: De = desFixes(6, 6)) {
  render(App, { props: { de } });
  return userEvent.setup();
}

/** Le lecteur recopie la fiche de l'ennemi (DEX 7, 50 PV par défaut) et commence. */
async function mener(
  lecteur: ReturnType<typeof userEvent.setup>,
  {
    dexterite = "7",
    pointsDeVie = "50",
    bonus,
    ennemiEnPremier = false,
  }: {
    dexterite?: string;
    pointsDeVie?: string;
    bonus?: string;
    ennemiEnPremier?: boolean;
  } = {},
) {
  await lecteur.click(bouton("Combattre"));
  await lecteur.type(champ("Dextérité"), dexterite);
  await lecteur.type(champ("Points de vie"), pointsDeVie);
  if (bonus !== undefined) {
    await lecteur.clear(champ("Bonus de dégâts"));
    await lecteur.type(champ("Bonus de dégâts"), bonus);
  }
  if (ennemiEnPremier) {
    await lecteur.click(
      screen.getByRole("switch", { name: "L'ennemi frappe en premier" }),
    );
  }
  await lecteur.click(commencer());
}

describe("« Nouveau combat »", () => {
  beforeEach(() => enregistrerAventure());

  it("s'ouvre depuis « Combattre » : chapitre prérempli, bonus 0, un adversaire, le lecteur frappe en premier", async () => {
    const lecteur = ouvrirLApp();
    await lecteur.click(bouton("Combattre"));

    expect(
      screen.getByRole("heading", { name: "Nouveau combat" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Recopiez la fiche de l'ennemi donnée par le livre."),
    ).toBeInTheDocument();
    expect(champ("Chapitre du combat")).toHaveValue(112);
    expect(champ("Dextérité")).toHaveValue(null);
    expect(champ("Points de vie")).toHaveValue(null);
    expect(champ("Adversaires")).toHaveValue(1);
    expect(champ("Bonus de dégâts")).toHaveValue(0);
    expect(
      screen.getByRole("switch", { name: "L'ennemi frappe en premier" }),
    ).not.toBeChecked();
  });

  it("dit ce qui manque tant que la fiche de l'ennemi n'est pas recopiée, sans rien commencer", async () => {
    const lecteur = ouvrirLApp();
    await lecteur.click(bouton("Combattre"));

    expect(commencer()).toHaveTextContent(
      "Saisissez d'abord la DEX de l'ennemi",
    );
    await lecteur.click(commencer());
    expect(
      screen.getByRole("heading", { name: "Nouveau combat" }),
    ).toBeInTheDocument();

    await lecteur.type(champ("Dextérité"), "7");
    expect(commencer()).toHaveTextContent(
      "Saisissez d'abord les PV de l'ennemi",
    );
    await lecteur.type(champ("Points de vie"), "50");
    expect(commencer()).toHaveTextContent("Commencer le combat");
    expect(commencer()).toHaveAttribute("aria-disabled", "false");
  });

  it("rappelle les chiffres du lecteur : DEX et dégâts effectifs, armes et effets compris", async () => {
    enregistrerAventure({
      effets: [potion, { nom: "Rage", duree: "", cible: "degats", valeur: 2 }],
    });
    const lecteur = ouvrirLApp();
    await lecteur.click(bouton("Combattre"));

    const indice = screen.getByText(/Plusieurs adversaires/);
    expect(indice).toHaveTextContent(
      "Vous : DEX 8, dégâts 1 + 1 dé + 3. Plusieurs adversaires comptent comme un seul.",
    );
  });

  it("revient à la feuille par la flèche, sans rien commencer ni enregistrer", async () => {
    const lecteur = ouvrirLApp();
    await lecteur.click(bouton("Combattre"));
    await lecteur.click(bouton("Annuler le combat"));

    expect(bouton("Combattre")).toBeInTheDocument();
    expect(lireAventure(localStorage)?.combat).toBeNull();
    expect(lireAventure(localStorage)?.combats).toEqual([]);
  });
});

describe("le combat, tour par tour", () => {
  beforeEach(() => enregistrerAventure());

  it("met les deux camps face à face : PV en gros chiffres sur leur maximum, l'ennemi repéré par son chapitre", async () => {
    const lecteur = ouvrirLApp();
    await mener(lecteur);

    expect(camp("Vous").getByText("28")).toBeInTheDocument();
    expect(camp("Vous").getByText("/ 32")).toBeInTheDocument();
    expect(camp("Vous").getByText("CHANCE 4 · DEX 7")).toBeInTheDocument();
    expect(camp(/^Ennemi · §\s112$/).getByText("50")).toBeInTheDocument();
    expect(camp(/^Ennemi · §\s112$/).getByText("/ 50")).toBeInTheDocument();
    expect(camp(/^Ennemi · §\s112$/).getByText("DEX 7")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Tour 1" })).toBeInTheDocument();
    expect(screen.getByText("vous frappez en premier")).toBeInTheDocument();
  });

  it("joue un tour dans l'ordre : toucher, dégâts si touché, riposte (exemple du livre : 5 dégâts)", async () => {
    // Lecteur : 2 + 3 = 5, touché, d6 = 3 → 1 + 3 + 1 = 5. Ennemi : 1 + 1, touché, d6 = 4.
    const lecteur = ouvrirLApp(desFixes(2, 3, 3, 1, 1, 4));
    await mener(lecteur);
    await lecteur.click(bouton("Tour suivant"));

    const [riposte, attaque] = lignesDuJournal();
    expect(attaque).toHaveTextContent(
      "VOUS ATTAQUEZ 2 dés = 5, touché. Dégâts 1 + 3 + 1 = 5.",
    );
    expect(riposte).toHaveTextContent(
      "L'ENNEMI RIPOSTE 2 dés = 2, touché. Dégâts 1 + 4 = −5 PV",
    );
    expect(camp(/^Ennemi · §\s112$/).getByText("45")).toBeInTheDocument();
    expect(camp("Vous").getByText("23")).toBeInTheDocument();
  });

  it("note un coup raté sans dégâts", async () => {
    const lecteur = ouvrirLApp(desFixes(6, 5, 4, 4));
    await mener(lecteur);
    await lecteur.click(bouton("Tour suivant"));

    expect(journal().getByText("2 dés = 11, raté.")).toHaveClass("rate");
    expect(journal().getByText("2 dés = 8, raté.")).toBeInTheDocument();
    expect(camp("Vous").getByText("28")).toBeInTheDocument();
  });

  it("fait frapper l'ennemi en premier quand le lecteur l'a indiqué", async () => {
    const lecteur = ouvrirLApp(desFixes(6, 6));
    await mener(lecteur, { ennemiEnPremier: true });
    expect(screen.getByText("l'ennemi frappe en premier")).toBeInTheDocument();
    await lecteur.click(bouton("Tour suivant"));

    const [riposte, attaque] = lignesDuJournal();
    expect(attaque).toHaveTextContent("L'ENNEMI ATTAQUE");
    expect(riposte).toHaveTextContent("VOUS RIPOSTEZ");
  });

  it("ajoute le bonus de dégâts de l'ennemi", async () => {
    const lecteur = ouvrirLApp(desFixes(6, 6, 1, 1, 4));
    await mener(lecteur, { bonus: "2" });
    await lecteur.click(bouton("Tour suivant"));

    expect(lignesDuJournal()[0]).toHaveTextContent("Dégâts 1 + 4 + 2 = −7 PV");
  });

  it("se bat avec la DEX et le bonus de dommage effectifs : potion (DEX 8) et rage (+2)", async () => {
    enregistrerAventure({
      effets: [potion, { nom: "Rage", duree: "", cible: "degats", valeur: 2 }],
    });
    // 4 + 4 = 8 : touché grâce à la potion ; d6 = 3 → 1 + 3 + 3.
    const lecteur = ouvrirLApp(desFixes(4, 4, 3, 6, 6));
    await mener(lecteur);
    expect(camp("Vous").getByText("CHANCE 4 · DEX 8")).toBeInTheDocument();
    await lecteur.click(bouton("Tour suivant"));

    expect(lignesDuJournal()[1]).toHaveTextContent(
      "2 dés = 8, touché. Dégâts 1 + 3 + 3 = 7.",
    );
    expect(camp(/^Ennemi · §\s112$/).getByText("43")).toBeInTheDocument();
  });

  it("montre le tour en cours en clair, les tours passés en craie grise et les dégâts subis en rouge", async () => {
    // Tour 1 : lecteur raté, ennemi touche (d6 = 4). Tour 2 : les deux ratent.
    const lecteur = ouvrirLApp(desFixes(6, 6, 1, 1, 4, 6, 6, 6, 6));
    await mener(lecteur);
    await lecteur.click(bouton("Tour suivant"));
    await lecteur.click(bouton("Tour suivant"));

    expect(screen.getByRole("heading", { name: "Tour 2" })).toBeInTheDocument();
    const lignes = lignesDuJournal();
    expect(lignes).toHaveLength(4);
    expect(lignes[0]).toHaveTextContent("L'ENNEMI RIPOSTE");
    expect(lignes[0]).not.toHaveClass("passe");
    expect(lignes[1]).not.toHaveClass("passe");
    expect(lignes[2]).toHaveTextContent("TOUR 1 · L'ENNEMI RIPOSTE");
    expect(lignes[2]).toHaveClass("passe");
    expect(lignes[3]).toHaveTextContent("TOUR 1 · VOUS ATTAQUEZ");
    expect(lignes[3]).toHaveClass("passe");
    expect(within(lignes[2]).getByText("−5 PV")).toHaveClass("subis");
  });

  it("affiche le bandeau rouge encadré en état critique (moins de 7 PV)", async () => {
    enregistrerAventure({ personnage: { pointsDeVie: 9 } });
    const lecteur = ouvrirLApp(desFixes(6, 6, 1, 1, 2));
    await mener(lecteur);
    expect(screen.queryByText(/État critique/)).not.toBeInTheDocument();

    await lecteur.click(bouton("Tour suivant"));
    expect(screen.getByRole("alert")).toHaveTextContent("État critique");
    expect(camp("Vous").getByText("6").closest("b")).toHaveClass("critique");
  });
});

describe("la fin du combat", () => {
  beforeEach(() => enregistrerAventure());

  it("ennemi à 0 PV : « Gagné », avec le bilan des PV", async () => {
    // Tour 1 : lecteur 5 dégâts, ennemi 5 dégâts. Tour 2 : lecteur 5 dégâts, l'ennemi tombe.
    const lecteur = ouvrirLApp(desFixes(2, 3, 3, 1, 1, 4));
    await mener(lecteur, { pointsDeVie: "10" });
    await lecteur.click(bouton("Tour suivant"));
    await lecteur.click(bouton("Tour suivant"));

    expect(screen.getByRole("heading", { name: "Gagné" })).toBeInTheDocument();
    expect(
      screen.getByText(
        "Ennemi du § 112 vaincu en 2 tours. Reprenez la lecture au chapitre indiqué par le livre.",
      ),
    ).toBeInTheDocument();
    const pv = screen.getByText("Points de vie").closest("li")!;
    expect(pv).toHaveTextContent(/Points de vie\s*avant : 28\s*23/);
    expect(within(pv).getByText(/avant/).closest("s")).toHaveClass("ancienne");
    expect(screen.queryByText("Chance")).not.toBeInTheDocument();
  });

  it("lecteur à 0 PV : « Perdu », et rappel que le livre indique la suite, sans rien décider", async () => {
    enregistrerAventure({ personnage: { pointsDeVie: 3 } });
    const lecteur = ouvrirLApp(desFixes(6, 6, 1, 1, 6));
    await mener(lecteur);
    await lecteur.click(bouton("Tour suivant"));

    expect(screen.getByRole("heading", { name: "Perdu" })).toBeInTheDocument();
    expect(
      screen.getByText(
        "Vos points de vie sont à 0. Suivez ce qu'indique le livre. L'app ne décide rien à votre place.",
      ),
    ).toBeInTheDocument();

    await lecteur.click(bouton("Le livre me laisse continuer"));
    expect(
      screen.getByRole("group", { name: "Points de vie" }),
    ).toHaveTextContent("avant : 3 0 / 32");
    const aventure = lireAventure(localStorage)!;
    expect(aventure.personnage.pointsDeVie).toBe(0);
    expect(aventure.chapitre).toBe(112);
  });

  it("« Finir » joue le reste du combat d'un coup", async () => {
    // Chaque tour : le lecteur touche (1 + 1, d6 = 6 : 8 dégâts), l'ennemi rate.
    const lecteur = ouvrirLApp(desFixes(1, 1, 6, 6, 6));
    await mener(lecteur);
    await lecteur.click(bouton("Finir"));

    expect(screen.getByRole("heading", { name: "Gagné" })).toBeInTheDocument();
    expect(screen.getByText(/vaincu en 7 tours/)).toBeInTheDocument();
  });

  it("enregistre le combat terminé : chapitre, issue, PV perdus, déroulé", async () => {
    const lecteur = ouvrirLApp(desFixes(2, 3, 3, 1, 1, 4));
    await mener(lecteur, { pointsDeVie: "10" });
    await lecteur.click(bouton("Finir"));

    const aventure = lireAventure(localStorage)!;
    expect(aventure.combat).toBeNull();
    expect(aventure.combats).toHaveLength(1);
    const [combat] = aventure.combats as Combat[];
    expect(combat).toMatchObject({ chapitre: 112, issue: "gagne" });
    expect(combat.depart.lecteur.pointsDeVie - combat.pointsDeVie.lecteur).toBe(
      5,
    );
    expect(combat.jets).toHaveLength(3);
  });
});

describe("les PV de la feuille suivent le combat", () => {
  beforeEach(() => {
    enregistrerAventure();
  });
  afterEach(() => vi.useRealTimers());

  it("baissent avec chaque dégât reçu, enregistrés aussitôt", async () => {
    const lecteur = ouvrirLApp(desFixes(6, 6, 1, 1, 4));
    await mener(lecteur);
    await lecteur.click(bouton("Tour suivant"));

    expect(lireAventure(localStorage)?.personnage.pointsDeVie).toBe(23);
  });

  it("enregistrent la perte dans la base quand un effet soutient les PV", async () => {
    enregistrerAventure({
      effets: [{ nom: "Bague", duree: "", cible: "pointsDeVie", valeur: 2 }],
    });
    const lecteur = ouvrirLApp(desFixes(6, 6, 1, 1, 4));
    await mener(lecteur);
    expect(camp("Vous").getByText("30")).toBeInTheDocument();
    await lecteur.click(bouton("Tour suivant"));

    expect(camp("Vous").getByText("25")).toBeInTheDocument();
    expect(lireAventure(localStorage)?.personnage.pointsDeVie).toBe(23);
  });

  it("montrent la trace de craie sur la feuille au retour du combat", async () => {
    vi.useFakeTimers();
    render(App, { props: { de: desFixes(2, 3, 3, 1, 1, 4) } });
    const lecteur = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    // Tour 1 : chacun touche pour 5. Tour 2 : l'ennemi (10 PV) tombe.
    await mener(lecteur, { pointsDeVie: "10" });
    await lecteur.click(bouton("Finir"));
    await lecteur.click(bouton("Retour à la feuille"));

    const pv = screen.getByRole("group", { name: "Points de vie" });
    expect(pv).toHaveTextContent("avant : 28 23 / 32");
    vi.advanceTimersByTime(1200);
    await vi.waitFor(() =>
      expect(within(pv).queryByText("28", { selector: "s" })).toBeNull(),
    );
  });
});

describe("quitter un combat en cours", () => {
  beforeEach(() => enregistrerAventure());

  it("ramène à la feuille avec les PV déjà perdus, et note le combat comme interrompu", async () => {
    const lecteur = ouvrirLApp(desFixes(6, 6, 1, 1, 4));
    await mener(lecteur);
    await lecteur.click(bouton("Tour suivant"));
    await lecteur.click(bouton("Quitter le combat"));

    expect(bouton("Combattre")).toBeInTheDocument();
    const pv = screen.getByRole("group", { name: "Points de vie" });
    expect(pv).toHaveTextContent("23 / 32");
    const aventure = lireAventure(localStorage)!;
    expect(aventure.combat).toBeNull();
    expect(aventure.personnage.pointsDeVie).toBe(23);
    expect(aventure.combats).toHaveLength(1);
    expect(aventure.combats[0].issue).toBe("interrompu");
  });

  it("ne note rien si aucun tour n'a été joué", async () => {
    const lecteur = ouvrirLApp();
    await mener(lecteur);
    await lecteur.click(bouton("Quitter le combat"));

    expect(lireAventure(localStorage)?.combats).toEqual([]);
  });

  it("retrouve le combat en cours après avoir fermé et rouvert l'app", async () => {
    const { unmount } = render(App, {
      props: { de: desFixes(6, 6, 1, 1, 4) },
    });
    const lecteur = userEvent.setup();
    await mener(lecteur);
    await lecteur.click(bouton("Tour suivant"));
    unmount();

    render(App, { props: { de: desFixes(6, 6) } });
    expect(camp("Vous").getByText("23")).toBeInTheDocument();
    expect(lignesDuJournal()).toHaveLength(2);
  });
});

describe("la CHANCE automatique en combat", () => {
  /** L'apprenti en état critique : 6 PV, CHANCE 4, DEX 7, épée courte (+1). */
  beforeEach(() => enregistrerAventure({ personnage: { pointsDeVie: 6 } }));
  afterEach(() => vi.useRealTimers());

  it("annonce dans le bandeau critique que la CHANCE sera dépensée seule", async () => {
    const lecteur = ouvrirLApp();
    await mener(lecteur);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "État critique. La CHANCE sera dépensée seule si un coup peut achever l'ennemi.",
    );
  });

  it("signale la dépense dans le journal : ancien total barré, badge, CHANCE baissée", async () => {
    // Ennemi à 8 PV ≤ 1 + 6 + 1. Lecteur : 5 + 3 = 8 → 7 pour 1 point ;
    // d6 = 1 : il faudrait 5 points pour achever, il en reste 3 : rien. Ennemi : raté.
    const lecteur = ouvrirLApp(desFixes(5, 3, 1, 6, 6));
    await mener(lecteur, { pointsDeVie: "8" });
    await lecteur.click(bouton("Tour suivant"));

    const attaque = lignesDuJournal()[1];
    expect(attaque).toHaveTextContent(
      "VOUS ATTAQUEZ 2 dés = avant : 8 7, touché. Dégâts 1 + 1 + 1 = 3. Ennemi achevable. 1 CHANCE dépensée automatiquement",
    );
    expect(within(attaque).getByText(/avant/).closest("s")).toHaveClass(
      "ancienne",
    );
    expect(
      within(attaque).getByText("1 CHANCE dépensée automatiquement"),
    ).toHaveClass("auto");
    expect(camp("Vous").getByText("CHANCE 3 · DEX 7")).toBeInTheDocument();
    expect(lireAventure(localStorage)?.personnage.chance).toBe(3);
  });

  it("dit « Ennemi achevable. » quand le coup laisse l'ennemi à portée d'un seul coup", async () => {
    // Ennemi à 12 PV. Lecteur : 1 + 1, touché, d6 = 2 → 4 dégâts : 8 PV ≤ 1 + 6 + 1.
    const lecteur = ouvrirLApp(desFixes(1, 1, 2, 6, 6));
    await mener(lecteur, { pointsDeVie: "12" });
    await lecteur.click(bouton("Tour suivant"));

    expect(lignesDuJournal()[1]).toHaveTextContent(
      "2 dés = 2, touché. Dégâts 1 + 2 + 1 = 4. Ennemi achevable.",
    );
  });

  it("ne dit pas « Ennemi achevable. » tant que l'ennemi est hors de portée", async () => {
    // Ennemi à 13 PV : 4 dégâts le laissent à 9 PV, au-dessus de 1 + 6 + 1.
    const lecteur = ouvrirLApp(desFixes(1, 1, 2, 6, 6));
    await mener(lecteur, { pointsDeVie: "13" });
    await lecteur.click(bouton("Tour suivant"));

    expect(lignesDuJournal()[1]).toHaveTextContent(
      "2 dés = 2, touché. Dégâts 1 + 2 + 1 = 4.",
    );
    expect(screen.queryByText(/achevable/)).not.toBeInTheDocument();
  });

  it("ne montre ni badge ni total barré quand rien n'est dépensé", async () => {
    // Ennemi à 9 PV : hors de portée d'un seul coup (1 + 6 + 1 = 8).
    const lecteur = ouvrirLApp(desFixes(5, 3, 6, 6));
    await mener(lecteur, { pointsDeVie: "9" });
    await lecteur.click(bouton("Tour suivant"));

    expect(lignesDuJournal()[1]).toHaveTextContent("2 dés = 8, raté.");
    expect(screen.queryByText(/automatiquement/)).not.toBeInTheDocument();
    expect(journal().queryByText(/avant/)).not.toBeInTheDocument();
    expect(lireAventure(localStorage)?.personnage.chance).toBe(4);
  });

  it("retire la dépense de la base quand un effet soutient la CHANCE (4 + 2, dépenser 2 : base 2)", async () => {
    enregistrerAventure({
      personnage: { pointsDeVie: 6 },
      effets: [{ nom: "Trèfle", duree: "", cible: "chance", valeur: 2 }],
    });
    // Lecteur : 5 + 4 = 9 → 7 pour 2 points ; d6 = 1, l'ennemi (8 PV) survit. Ennemi : raté.
    const lecteur = ouvrirLApp(desFixes(5, 4, 1, 6, 6));
    await mener(lecteur, { pointsDeVie: "8" });
    expect(camp("Vous").getByText("CHANCE 6 · DEX 7")).toBeInTheDocument();
    await lecteur.click(bouton("Tour suivant"));

    expect(
      within(lignesDuJournal()[1]).getByText(
        "2 CHANCE dépensées automatiquement",
      ),
    ).toBeInTheDocument();
    expect(camp("Vous").getByText("CHANCE 4 · DEX 7")).toBeInTheDocument();
    expect(lireAventure(localStorage)?.personnage.chance).toBe(2);
  });

  it("achève l'ennemi avec la CHANCE : bilan « Chance » barré, puis la CHANCE baissée sur la feuille", async () => {
    vi.useFakeTimers();
    render(App, { props: { de: desFixes(5, 3, 4) } });
    const lecteur = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    // Ennemi à 8 PV. 5 + 3 = 8 → 7 pour 1 point ; d6 = 4 → 6 pour 2 points : 1 + 6 + 1 = 8.
    await mener(lecteur, { pointsDeVie: "8" });
    await lecteur.click(bouton("Tour suivant"));

    expect(screen.getByRole("heading", { name: "Gagné" })).toBeInTheDocument();
    const chance = screen.getByText("Chance").closest("li")!;
    expect(chance).toHaveTextContent(/Chance\s*avant : 4\s*1/);
    expect(
      screen.getByText("Dont 3 points dépensés automatiquement"),
    ).toBeInTheDocument();

    await lecteur.click(bouton("Retour à la feuille"));
    const feuille = within(screen.getByRole("group", { name: "Chance" }));
    expect(feuille.getByText("1")).toBeInTheDocument();
    expect(feuille.getByText(/avant/).closest("s")).toHaveTextContent("4");
    expect(lireAventure(localStorage)?.personnage.chance).toBe(1);
  });
});
