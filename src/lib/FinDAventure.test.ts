import { cleanup, render, screen, within } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App from "../App.svelte";
import type { Mode } from "./aventure";
import { combatNarratif } from "./combat";
import { desFixes, type De } from "./des";
import { CLE_STOCKAGE, lireAventure } from "./stockage";
import {
  enregistrerAventure as enregistrer,
  type Surcharges,
} from "./test/uneAventure";

type Lecteur = ReturnType<typeof userEvent.setup>;

/**
 * Une aventure au § 112, avec ce qu'un lecteur y a mis : l'épée courte, une
 * corde et une bourse bien garnie, la potion d'agilité, des notes, un combat
 * dans l'historique. Les PV sont réglables.
 */
function enregistrerAventure(
  mode: Mode = "mortel",
  pointsDeVie = 28,
  changement: Surcharges = {},
) {
  enregistrer({
    mode,
    notes: "Piège au 74.",
    armes: [{ nom: "Épée courte", bonus: 1 }],
    besace: {
      objets: ["Corde de chanvre"],
      bourse: true,
      boulons: 12,
      boulonsForces: false,
    },
    effets: [
      { nom: "Potion d'agilité", duree: "24 h", cible: "dexterite", valeur: 1 },
    ],
    combats: [combatNarratif(98, 1, "gagne")],
    personnage: { pointsDeVie },
    ...changement,
  });
}

function ouvrirLApp(de: De = desFixes(6, 6)) {
  render(App, { props: { de } });
  return userEvent.setup();
}

const bouton = (nom: string | RegExp) =>
  screen.getByRole("button", { name: nom });
const sansBouton = (nom: string | RegExp) =>
  expect(screen.queryByRole("button", { name: nom })).not.toBeInTheDocument();
const groupe = (nom: string) => screen.getByRole("group", { name: nom });
const section = () => within(screen.getByRole("region", { name: "Aventure" }));
const dialogue = () => within(screen.getByRole("dialog"));
const proposition = /Vos PV sont à 0/;
const nouvelApprenti = () =>
  screen.getByRole("heading", { name: "Nouvel apprenti" });

describe("« Recommencer une aventure » (tous les modes)", () => {
  it.each<Mode>(["narratif", "simplifie", "mortel"])(
    "en mode %s : la section « Aventure » est tout en bas, « Recommencer une aventure » en dernière ligne",
    (mode) => {
      enregistrerAventure(mode);
      ouvrirLApp();

      const lignes = section().getAllByRole("button");
      expect(lignes.at(-1)).toHaveTextContent("Recommencer une aventure");
      const feuille = screen.getByRole("main");
      const sections = Array.from(feuille.querySelectorAll("section")).map(
        (s) => s.querySelector("h2")?.textContent,
      );
      expect(sections.at(-1)).toBe("Aventure");
    },
  );

  it("en mode narratif ou mortel, c'est la seule ligne de la section", () => {
    enregistrerAventure("narratif");
    ouvrirLApp();
    expect(
      section()
        .getAllByRole("button")
        .map((b) => b.textContent?.trim()),
    ).toEqual(["Recommencer une aventure"]);
  });

  it("en mode simplifié, il vient après les lignes de sauvegarde", () => {
    enregistrerAventure("simplifie");
    ouvrirLApp();
    expect(
      section()
        .getAllByRole("button")
        .map((b) => b.textContent?.replace(/\s+/g, " ").trim()),
    ).toEqual(["Sauvegarder ici 3 restantes", "Recommencer une aventure"]);
  });

  it("demande une confirmation explicite et n'efface rien avant", async () => {
    enregistrerAventure("narratif");
    const lecteur = ouvrirLApp();
    const avant = localStorage.getItem(CLE_STOCKAGE);

    await lecteur.click(section().getByRole("button", { name: /Recommencer/ }));

    const panneau = dialogue();
    expect(
      panneau.getByRole("heading", { name: "Recommencer une aventure" }),
    ).toBeInTheDocument();
    expect(panneau.getByText(/effacée de cet appareil/)).toBeInTheDocument();
    expect(panneau.getByText(/ne peut pas être annulé/)).toBeInTheDocument();
    expect(localStorage.getItem(CLE_STOCKAGE)).toBe(avant);

    // Annuler, croix ou Échap : l'aventure reste telle quelle.
    await lecteur.click(panneau.getByRole("button", { name: "Annuler" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await lecteur.click(section().getByRole("button", { name: /Recommencer/ }));
    await lecteur.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(localStorage.getItem(CLE_STOCKAGE)).toBe(avant);
    expect(groupe("Points de vie")).toHaveTextContent("28");
  });

  it.each<Mode>(["narratif", "simplifie", "mortel"])(
    "confirmé, en mode %s : toute l'aventure est effacée de l'appareil et « Nouvel apprenti » s'ouvre",
    async (mode) => {
      enregistrerAventure(mode);
      const lecteur = ouvrirLApp();

      await lecteur.click(
        section().getByRole("button", { name: /Recommencer/ }),
      );
      await lecteur.click(
        dialogue().getByRole("button", { name: "Effacer et recommencer" }),
      );

      expect(nouvelApprenti()).toBeInTheDocument();
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(localStorage.getItem(CLE_STOCKAGE)).toBeNull();
      // Pas de mode préchoisi : c'est une aventure toute neuve.
      for (const radio of screen.getAllByRole("radio", {
        name: /^(Narratif|Simplifié|Mortel)/,
      })) {
        expect(radio).not.toBeChecked();
      }
    },
  );

  it("après l'effacement, une nouvelle aventure commence au chapitre 1 sans rien de l'ancienne", async () => {
    enregistrerAventure("narratif");
    const lecteur = ouvrirLApp(desFixes(4, 4, 3));
    await lecteur.click(section().getByRole("button", { name: /Recommencer/ }));
    await lecteur.click(
      dialogue().getByRole("button", { name: "Effacer et recommencer" }),
    );

    await lecteur.click(screen.getByRole("radio", { name: "Instinct" }));
    await lecteur.click(screen.getByRole("radio", { name: /^Simplifié/ }));
    await lecteur.click(bouton("Lancer les points de vie"));
    await lecteur.click(bouton("Lancer la chance"));
    await lecteur.click(bouton("Commencer l'aventure"));

    const aventure = lireAventure(localStorage)!;
    expect(aventure).toMatchObject({
      chapitre: 1,
      mode: "simplifie",
      notes: "",
      armes: [],
      effets: [],
      combats: [],
    });
    expect(aventure.besace.objets).toEqual([]);
  });
});

describe("0 PV sur la feuille : la proposition du mode mortel", () => {
  it("en mode mortel, un indice propose de recommencer au chapitre 1 sans rien décider", () => {
    enregistrerAventure("mortel", 0);
    const avant = localStorage.getItem(CLE_STOCKAGE);
    ouvrirLApp();

    expect(screen.getByText(proposition)).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(/chapitre 1/);
    expect(bouton("Recommencer au chapitre 1")).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(localStorage.getItem(CLE_STOCKAGE)).toBe(avant);
  });

  it("n'apparaît pas tant que le lecteur a au moins 1 PV", () => {
    enregistrerAventure("mortel", 1);
    ouvrirLApp();
    expect(screen.queryByText(proposition)).not.toBeInTheDocument();
    sansBouton("Recommencer au chapitre 1");
  });

  it("apparaît quand le lecteur descend à 0 PV avec le « − »", async () => {
    enregistrerAventure("mortel", 1);
    const lecteur = ouvrirLApp();
    await lecteur.click(bouton("Retirer un point de vie"));
    expect(screen.getByText(proposition)).toBeInTheDocument();
  });

  it.each<Mode>(["simplifie", "narratif"])(
    "en mode %s, 0 PV ne propose rien de tel",
    async (mode) => {
      enregistrerAventure(mode, 1);
      const lecteur = ouvrirLApp();
      await lecteur.click(bouton("Retirer un point de vie"));

      expect(groupe("Points de vie")).toHaveTextContent("0");
      expect(screen.queryByText(proposition)).not.toBeInTheDocument();
      expect(screen.queryByText(/chapitre 1/)).not.toBeInTheDocument();
      sansBouton("Recommencer au chapitre 1");
      sansBouton("Ignorer");
    },
  );

  it("« Ignorer » laisse l'aventure intacte et cache la proposition", async () => {
    enregistrerAventure("mortel", 0);
    const avant = localStorage.getItem(CLE_STOCKAGE);
    const lecteur = ouvrirLApp();

    await lecteur.click(bouton("Ignorer"));

    expect(screen.queryByText(proposition)).not.toBeInTheDocument();
    sansBouton("Recommencer au chapitre 1");
    expect(localStorage.getItem(CLE_STOCKAGE)).toBe(avant);
    expect(groupe("Points de vie")).toHaveTextContent("0");
    expect(screen.getByText("Épée courte")).toBeInTheDocument();
  });

  it("ne harcèle pas : ignorée, elle ne revient que si les PV remontent puis retombent à 0", async () => {
    enregistrerAventure("mortel", 0);
    const lecteur = ouvrirLApp();
    await lecteur.click(bouton("Ignorer"));

    // Les autres gestes sur la feuille ne la rappellent pas.
    await lecteur.click(bouton("Retirer un point de vie"));
    await lecteur.click(bouton("Retirer Corde de chanvre"));
    expect(screen.queryByText(proposition)).not.toBeInTheDocument();

    // Les PV remontent à 1, puis retombent à 0 : c'est une nouvelle chute.
    await lecteur.click(bouton("Ajouter un point de vie"));
    expect(screen.queryByText(proposition)).not.toBeInTheDocument();
    await lecteur.click(bouton("Retirer un point de vie"));
    expect(screen.getByText(proposition)).toBeInTheDocument();
  });

  it("l'ignorance n'est pas enregistrée : au prochain lancement de l'app, elle est de nouveau proposée", async () => {
    enregistrerAventure("mortel", 0);
    const lecteur = ouvrirLApp();
    await lecteur.click(bouton("Ignorer"));
    cleanup();

    ouvrirLApp();
    expect(screen.getByText(proposition)).toBeInTheDocument();
  });

  it("accepter demande confirmation et rappelle la perte des armes et de l'équipement", async () => {
    enregistrerAventure("mortel", 0);
    const avant = localStorage.getItem(CLE_STOCKAGE);
    const lecteur = ouvrirLApp();

    await lecteur.click(bouton("Recommencer au chapitre 1"));

    const panneau = dialogue();
    expect(
      panneau.getByRole("heading", { name: "Recommencer au chapitre 1" }),
    ).toBeInTheDocument();
    expect(
      panneau.getByText(/vous perdez vos armes et votre équipement/i),
    ).toBeInTheDocument();
    expect(panneau.getByText(/vos notes restent/i)).toBeInTheDocument();

    // Annuler laisse la feuille et l'enregistrement tels quels.
    await lecteur.click(panneau.getByRole("button", { name: "Annuler" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByText(proposition)).toBeInTheDocument();
    expect(localStorage.getItem(CLE_STOCKAGE)).toBe(avant);
  });

  it("accepter ouvre « Nouvel apprenti » en mode mortel, sans « Déjà en route », et l'ancienne aventure reste enregistrée jusqu'à la création", async () => {
    enregistrerAventure("mortel", 0);
    const avant = localStorage.getItem(CLE_STOCKAGE);
    const lecteur = ouvrirLApp();
    await lecteur.click(bouton("Recommencer au chapitre 1"));
    await lecteur.click(
      dialogue().getByRole("button", { name: "Créer un nouveau personnage" }),
    );

    expect(nouvelApprenti()).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /^Mortel/ })).toBeChecked();
    expect(
      screen.queryByRole("radio", { name: "Déjà en route" }),
    ).not.toBeInTheDocument();
    expect(localStorage.getItem(CLE_STOCKAGE)).toBe(avant);
  });

  it("le nouveau personnage commence au chapitre 1 sans armes, équipement, effets ni combats, avec les notes du lecteur", async () => {
    enregistrerAventure("mortel", 0);
    const lecteur = ouvrirLApp(desFixes(4, 4, 3));
    await lecteur.click(bouton("Recommencer au chapitre 1"));
    await lecteur.click(
      dialogue().getByRole("button", { name: "Créer un nouveau personnage" }),
    );

    await lecteur.click(screen.getByRole("radio", { name: "Instinct" }));
    await lecteur.click(bouton("Lancer les points de vie"));
    await lecteur.click(bouton("Lancer la chance"));
    await lecteur.click(bouton("Commencer l'aventure"));

    expect(
      screen.getByRole("button", { name: /^Dernier chapitre lu, modifier/ }),
    ).toHaveTextContent("§ 1");
    expect(groupe("Points de vie")).toHaveTextContent("32");
    expect(screen.queryByText("Épée courte")).not.toBeInTheDocument();
    expect(screen.queryByText("Corde de chanvre")).not.toBeInTheDocument();
    expect(screen.queryByText("Potion d'agilité")).not.toBeInTheDocument();
    expect(screen.queryByText(proposition)).not.toBeInTheDocument();
    expect(
      screen.queryByRole("region", { name: "Combats" }),
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText("Notes")).toHaveValue("Piège au 74.");
    expect(lireAventure(localStorage)).toMatchObject({
      chapitre: 1,
      mode: "mortel",
      armes: [],
      effets: [],
      combats: [],
      notes: "Piège au 74.",
      besace: { objets: [], bourse: false, boulons: 0 },
      personnage: { talent: "Instinct", pointsDeVie: 32, pointsDeVieMax: 32 },
    });
  });
});

describe("l'écran « Perdu » du combat en mode mortel", () => {
  /** Le lecteur n'a plus que 3 PV : l'ennemi (DEX 7, 50 PV) le tue au premier tour. */
  async function perdre(lecteur: Lecteur) {
    await lecteur.click(bouton("Combattre"));
    await lecteur.type(screen.getByLabelText("Dextérité"), "7");
    await lecteur.type(screen.getByLabelText("Points de vie"), "50");
    await lecteur.click(bouton("Commencer le combat"));
    await lecteur.click(bouton("Tour suivant"));
    expect(screen.getByRole("heading", { name: "Perdu" })).toBeInTheDocument();
  }
  // Le lecteur rate (6 + 6), l'ennemi touche (1 + 1) pour 1 + 6 = 7 dégâts.
  const desDuMalheur = () => desFixes(6, 6, 1, 1, 6);

  it("propose « Recommencer au chapitre 1 » après « Le livre me laisse continuer », sans reprise de sauvegarde", async () => {
    enregistrerAventure("mortel", 3);
    const lecteur = ouvrirLApp(desDuMalheur());
    await perdre(lecteur);

    expect(
      screen.getAllByRole("button").map((b) => b.textContent?.trim()),
    ).toEqual(["Le livre me laisse continuer", "Recommencer au chapitre 1"]);
    expect(screen.queryByText(/sauvegarde/i)).not.toBeInTheDocument();
  });

  it("accepter, puis confirmer, mène à « Nouvel apprenti » en mode mortel", async () => {
    enregistrerAventure("mortel", 3);
    const lecteur = ouvrirLApp(desDuMalheur());
    await perdre(lecteur);

    await lecteur.click(bouton("Recommencer au chapitre 1"));
    expect(
      dialogue().getByText(/vous perdez vos armes et votre équipement/i),
    ).toBeInTheDocument();
    await lecteur.click(
      dialogue().getByRole("button", { name: "Créer un nouveau personnage" }),
    );

    expect(nouvelApprenti()).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /^Mortel/ })).toBeChecked();
  });

  it("l'ignorer (« Le livre me laisse continuer ») laisse l'aventure intacte et ne ré-insiste pas sur la feuille", async () => {
    enregistrerAventure("mortel", 3);
    const lecteur = ouvrirLApp(desDuMalheur());
    await perdre(lecteur);

    await lecteur.click(bouton("Le livre me laisse continuer"));

    expect(groupe("Points de vie")).toHaveTextContent("0");
    expect(screen.queryByText(proposition)).not.toBeInTheDocument();
    expect(screen.getByText("Épée courte")).toBeInTheDocument();
    const aventure = lireAventure(localStorage)!;
    expect(aventure.armes).toHaveLength(1);
    expect(aventure.chapitre).toBe(112);
    expect(aventure.combats.at(-1)).toMatchObject({ issue: "perdu" });
  });

  // Le mode narratif ne joue pas ce combat aux dés (sauf au-delà de 5
  // adversaires) : son 0 PV se vérifie sur la feuille, plus haut.
  it("en mode simplifié, l'écran « Perdu » ne propose pas de recommencer", async () => {
    enregistrerAventure("simplifie", 3);
    const lecteur = ouvrirLApp(desDuMalheur());
    await perdre(lecteur);

    sansBouton("Recommencer au chapitre 1");
    expect(screen.queryByText(/chapitre 1/)).not.toBeInTheDocument();
  });
});
