import { cleanup, render, screen, within } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import App from "../App.svelte";
import { besaceVide, type Mode } from "./aventure";
import { combatNarratif } from "./combat";
import { desFixes, type De } from "./des";
import { lireAventure } from "./stockage";
import {
  enregistrerAventure as enregistrer,
  type Surcharges,
} from "./test/uneAventure";

type Lecteur = ReturnType<typeof userEvent.setup>;

/**
 * Une aventure au § 112 : PV 28 / 32, CHANCE 4, DEX 7, l'épée courte, une
 * corde dans la besace, la potion d'agilité (DEX +1).
 */
function enregistrerAventure(changement: Surcharges = {}) {
  enregistrer({
    sauvegardesUtilisees: 1,
    armes: [{ nom: "Épée courte", bonus: 1 }],
    besace: { ...besaceVide(), objets: ["Corde de chanvre"] },
    effets: [
      { nom: "Potion d'agilité", duree: "24 h", cible: "dexterite", valeur: 1 },
    ],
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
const traits = (nom: string | RegExp) => bouton(nom);

const sauvegarder = () => bouton(/^Sauvegarder ici/);
const reprendre = (chapitre: number) =>
  bouton(`Reprendre la sauvegarde · § ${chapitre}`);

/** Pose une sauvegarde, puis fait bouger toute la feuille. */
async function poserPuisChanger(lecteur: Lecteur) {
  await lecteur.click(sauvegarder());
  await lecteur.click(bouton("Retirer un point de vie"));
  await lecteur.click(bouton("Retirer Épée courte"));
  await lecteur.click(bouton("Retirer Corde de chanvre"));
  await lecteur.click(bouton("Retirer l'effet Potion d'agilité"));
  await lecteur.click(bouton(/^Dernier chapitre lu, modifier/));
  const chapitre = screen.getByLabelText("Dernier chapitre lu");
  await lecteur.clear(chapitre);
  await lecteur.type(chapitre, "140{Enter}");
}

describe("les sauvegardes selon le mode de jeu", () => {
  it("en mode simplifié : trois traits dans le bloc vital et la section « Aventure »", () => {
    enregistrerAventure();
    ouvrirLApp();

    expect(
      within(groupe("Sauvegardes")).getByRole("button", {
        name: "2 sauvegardes restantes sur 3",
      }),
    ).toBeInTheDocument();
    expect(section().getByRole("heading", { name: "Aventure" })).toBeVisible();
    expect(sauvegarder()).toHaveTextContent("Sauvegarder ici");
    expect(sauvegarder()).toHaveTextContent("2 restantes");
  });

  it.each<Mode>(["narratif", "mortel"])(
    "en mode %s : ni traits, ni « Sauvegarder ici », ni reprise",
    (mode) => {
      enregistrerAventure({ mode, sauvegardesUtilisees: 0 });
      ouvrirLApp();

      expect(screen.queryByText("Sauvegardes")).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /sauvegardes? restantes?/ }),
      ).not.toBeInTheDocument();
      sansBouton(/Sauvegarder ici/);
      sansBouton(/Reprendre la sauvegarde/);
    },
  );
});

describe("poser une sauvegarde", () => {
  beforeEach(() => enregistrerAventure());

  it("consomme un trait et propose de reprendre au chapitre en cours", async () => {
    const lecteur = ouvrirLApp();
    sansBouton(/Reprendre la sauvegarde/);

    await lecteur.click(sauvegarder());

    expect(bouton("1 sauvegarde restante sur 3")).toBeInTheDocument();
    expect(sauvegarder()).toHaveTextContent("1 restante");
    expect(reprendre(112)).toBeInTheDocument();
    const aventure = lireAventure(localStorage)!;
    expect(aventure.sauvegardesUtilisees).toBe(2);
    expect(aventure.sauvegarde?.chapitre).toBe(112);
  });

  it("garde le chapitre et tout l'état du personnage, mais ni les notes ni les combats", async () => {
    enregistrerAventure({
      notes: "Piège au 74.",
      combats: [combatNarratif(98, 1, "gagne")],
    });
    const lecteur = ouvrirLApp();
    await lecteur.click(sauvegarder());

    const { sauvegarde } = lireAventure(localStorage)!;
    expect(sauvegarde).toEqual({
      chapitre: 112,
      personnage: {
        talent: "Herbologie",
        pointsDeVieMax: 32,
        pointsDeVie: 28,
        chance: 4,
        dexterite: 7,
      },
      armes: [{ nom: "Épée courte", bonus: 1 }],
      besace: {
        objets: ["Corde de chanvre"],
        bourse: false,
        boulons: 0,
        boulonsForces: false,
      },
      effets: [
        {
          nom: "Potion d'agilité",
          duree: "24 h",
          cible: "dexterite",
          valeur: 1,
        },
      ],
    });
  });

  it("une nouvelle sauvegarde remplace la précédente : seule la plus récente se reprend", async () => {
    const lecteur = ouvrirLApp();
    await lecteur.click(sauvegarder());
    await lecteur.click(bouton("Retirer un point de vie"));
    await lecteur.click(bouton(/^Dernier chapitre lu, modifier/));
    const chapitre = screen.getByLabelText("Dernier chapitre lu");
    await lecteur.clear(chapitre);
    await lecteur.type(chapitre, "140{Enter}");
    await lecteur.click(sauvegarder());

    expect(reprendre(140)).toBeInTheDocument();
    sansBouton("Reprendre la sauvegarde · § 112");
    expect(lireAventure(localStorage)!.sauvegarde?.personnage.pointsDeVie).toBe(
      27,
    );
  });

  it("une fois les 3 utilisées, le bouton est désactivé et son libellé le dit", async () => {
    enregistrerAventure({ sauvegardesUtilisees: 2 });
    const lecteur = ouvrirLApp();
    await lecteur.click(sauvegarder());

    expect(bouton("0 sauvegarde restante sur 3")).toBeInTheDocument();
    const epuise = bouton("Plus aucune sauvegarde");
    expect(epuise).toHaveAttribute("aria-disabled", "true");
    sansBouton(/^Sauvegarder ici/);

    // Un appui sur le bouton désactivé ne pose rien et ne consomme rien.
    await lecteur.click(epuise);
    const aventure = lireAventure(localStorage)!;
    expect(aventure.sauvegardesUtilisees).toBe(3);
    expect(aventure.sauvegarde?.chapitre).toBe(112);
  });
});

describe("reprendre la sauvegarde", () => {
  beforeEach(() => enregistrerAventure());

  it("demande une confirmation, et « Annuler » ne change rien", async () => {
    const lecteur = ouvrirLApp();
    await poserPuisChanger(lecteur);

    await lecteur.click(reprendre(112));
    const confirmation = dialogue();
    expect(
      confirmation.getByRole("heading", { name: "Reprendre la sauvegarde" }),
    ).toBeInTheDocument();
    expect(
      confirmation.getByText(/La feuille revient au § 112/),
    ).toBeInTheDocument();
    // Rien n'a encore changé derrière le panneau.
    expect(lireAventure(localStorage)!.chapitre).toBe(140);

    await lecteur.click(confirmation.getByRole("button", { name: "Annuler" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(lireAventure(localStorage)!.chapitre).toBe(140);
    expect(groupe("Points de vie")).toHaveTextContent("27");
  });

  it("la touche Échap ferme la confirmation sans rien reprendre", async () => {
    const lecteur = ouvrirLApp();
    await poserPuisChanger(lecteur);
    await lecteur.click(reprendre(112));
    await lecteur.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(lireAventure(localStorage)!.chapitre).toBe(140);
  });

  it("confirmée, elle rend le chapitre et tout l'état du personnage", async () => {
    const lecteur = ouvrirLApp();
    await poserPuisChanger(lecteur);
    expect(screen.queryByText("Épée courte")).not.toBeInTheDocument();

    await lecteur.click(reprendre(112));
    await lecteur.click(
      dialogue().getByRole("button", { name: "Reprendre au § 112" }),
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^Dernier chapitre lu, modifier/ }),
    ).toHaveTextContent("§ 112");
    expect(groupe("Points de vie")).toHaveTextContent("28");
    expect(groupe("Points de vie")).toHaveTextContent("32");
    expect(screen.getByText("Épée courte")).toBeInTheDocument();
    expect(screen.getByText("Corde de chanvre")).toBeInTheDocument();
    expect(screen.getByText("Potion d'agilité · DEX +1")).toBeInTheDocument();
    expect(groupe("Dextérité")).toHaveTextContent("8");
    const aventure = lireAventure(localStorage)!;
    expect(aventure.chapitre).toBe(112);
    expect(aventure.personnage.pointsDeVie).toBe(28);
    expect(aventure.armes).toEqual([{ nom: "Épée courte", bonus: 1 }]);
    expect(aventure.besace.objets).toEqual(["Corde de chanvre"]);
    expect(aventure.effets).toHaveLength(1);
  });

  it("ne rend ni les sauvegardes utilisées, ni les notes, ni l'historique des combats", async () => {
    const lecteur = ouvrirLApp();
    await lecteur.click(sauvegarder());
    await lecteur.type(
      screen.getByRole("textbox", { name: "Notes" }),
      "La porte s'ouvre en hiver.",
    );
    await lecteur.click(reprendre(112));
    await lecteur.click(
      dialogue().getByRole("button", { name: "Reprendre au § 112" }),
    );

    expect(bouton("1 sauvegarde restante sur 3")).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Notes" })).toHaveValue(
      "La porte s'ouvre en hiver.",
    );
    const aventure = lireAventure(localStorage)!;
    expect(aventure.sauvegardesUtilisees).toBe(2);
    expect(aventure.notes).toBe("La porte s'ouvre en hiver.");
  });

  it("la sauvegarde reste la plus récente : on peut y revenir encore", async () => {
    const lecteur = ouvrirLApp();
    await poserPuisChanger(lecteur);
    for (let fois = 0; fois < 2; fois++) {
      await lecteur.click(reprendre(112));
      await lecteur.click(
        dialogue().getByRole("button", { name: "Reprendre au § 112" }),
      );
      await lecteur.click(bouton("Retirer un point de vie"));
      expect(groupe("Points de vie")).toHaveTextContent("27");
    }
    await lecteur.click(reprendre(112));
    await lecteur.click(
      dialogue().getByRole("button", { name: "Reprendre au § 112" }),
    );
    expect(groupe("Points de vie")).toHaveTextContent("28");
  });

  it("ne propose rien tant qu'aucune sauvegarde n'est posée", () => {
    sansBouton(/Reprendre la sauvegarde/);
  });
});

describe("rien ne se perd", () => {
  it("la sauvegarde posée se retrouve après avoir fermé puis rouvert l'app", async () => {
    enregistrerAventure();
    const lecteur = ouvrirLApp();
    await poserPuisChanger(lecteur);

    cleanup();
    const apres = ouvrirLApp();

    expect(bouton("1 sauvegarde restante sur 3")).toBeInTheDocument();
    await apres.click(reprendre(112));
    await apres.click(
      dialogue().getByRole("button", { name: "Reprendre au § 112" }),
    );
    expect(groupe("Points de vie")).toHaveTextContent("28");
    expect(screen.getByText("Épée courte")).toBeInTheDocument();
  });
});

describe("corriger le nombre de sauvegardes utilisées à la main", () => {
  beforeEach(() => enregistrerAventure());

  it("un appui sur les traits ouvre un panneau avec les valeurs de 0 à 3", async () => {
    const lecteur = ouvrirLApp();
    await lecteur.click(traits("2 sauvegardes restantes sur 3"));

    const panneau = dialogue();
    expect(
      panneau.getByRole("heading", { name: "Sauvegardes utilisées" }),
    ).toBeInTheDocument();
    const choix = panneau.getAllByRole("radio");
    expect(
      choix.map((c) => (c as HTMLInputElement).labels?.[0].textContent?.trim()),
    ).toEqual(["0", "1", "2", "3"]);
    expect(panneau.getByRole("radio", { name: "1" })).toBeChecked();
  });

  it("changer la valeur met les traits et le bouton à jour, et l'enregistre", async () => {
    const lecteur = ouvrirLApp();
    await lecteur.click(traits("2 sauvegardes restantes sur 3"));
    await lecteur.click(dialogue().getByRole("radio", { name: "0" }));
    await lecteur.click(bouton("Fermer"));

    expect(bouton("3 sauvegardes restantes sur 3")).toBeInTheDocument();
    expect(sauvegarder()).toHaveTextContent("3 restantes");
    expect(lireAventure(localStorage)!.sauvegardesUtilisees).toBe(0);
  });

  it("indiquer 3 désactive le bouton d'enregistrement", async () => {
    const lecteur = ouvrirLApp();
    await lecteur.click(traits("2 sauvegardes restantes sur 3"));
    await lecteur.click(dialogue().getByRole("radio", { name: "3" }));
    await lecteur.click(bouton("Fermer"));

    expect(bouton("0 sauvegarde restante sur 3")).toBeInTheDocument();
    expect(bouton("Plus aucune sauvegarde")).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });

  it("ne touche pas à la sauvegarde déjà posée", async () => {
    const lecteur = ouvrirLApp();
    await lecteur.click(sauvegarder());
    await lecteur.click(traits("1 sauvegarde restante sur 3"));
    await lecteur.click(dialogue().getByRole("radio", { name: "0" }));
    await lecteur.click(bouton("Fermer"));

    expect(reprendre(112)).toBeInTheDocument();
    expect(lireAventure(localStorage)!.sauvegarde?.chapitre).toBe(112);
  });
});

describe("l'écran « Perdu » en mode simplifié", () => {
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

  it("propose « Reprendre la sauvegarde » en premier, avec l'indice de la maquette", async () => {
    enregistrerAventure({
      sauvegardesUtilisees: 1,
      personnage: {
        talent: "Herbologie",
        pointsDeVieMax: 32,
        pointsDeVie: 3,
        chance: 4,
        dexterite: 7,
      },
      sauvegarde: {
        chapitre: 87,
        personnage: {
          talent: "Herbologie",
          pointsDeVieMax: 32,
          pointsDeVie: 25,
          chance: 5,
          dexterite: 7,
        },
        armes: [],
        besace: { objets: [], bourse: false, boulons: 0, boulonsForces: false },
        effets: [],
      },
    });
    const lecteur = ouvrirLApp(desDuMalheur());
    await perdre(lecteur);

    const boutons = screen.getAllByRole("button");
    expect(boutons.map((b) => b.textContent?.trim())).toEqual([
      "Reprendre la sauvegarde · § 87",
      "Le livre me laisse continuer",
    ]);
    expect(document.body).toHaveTextContent(
      "Mode simplifié : on reprend toujours la sauvegarde la plus récente. Il vous en reste 2.",
    );
  });

  it("confirmée, la reprise revient au chapitre sauvegardé et note « repris au § 87 » sur le combat perdu", async () => {
    enregistrerAventure({
      personnage: {
        talent: "Herbologie",
        pointsDeVieMax: 32,
        pointsDeVie: 3,
        chance: 4,
        dexterite: 7,
      },
      sauvegarde: {
        chapitre: 87,
        personnage: {
          talent: "Herbologie",
          pointsDeVieMax: 32,
          pointsDeVie: 25,
          chance: 5,
          dexterite: 7,
        },
        armes: [],
        besace: { objets: [], bourse: false, boulons: 0, boulonsForces: false },
        effets: [],
      },
    });
    const lecteur = ouvrirLApp(desDuMalheur());
    await perdre(lecteur);

    await lecteur.click(bouton("Reprendre la sauvegarde · § 87"));
    // Annuler laisse l'écran « Perdu » tel quel.
    await lecteur.click(dialogue().getByRole("button", { name: "Annuler" }));
    expect(screen.getByRole("heading", { name: "Perdu" })).toBeInTheDocument();

    await lecteur.click(bouton("Reprendre la sauvegarde · § 87"));
    await lecteur.click(
      dialogue().getByRole("button", { name: "Reprendre au § 87" }),
    );

    expect(
      screen.getByRole("button", { name: /^Dernier chapitre lu, modifier/ }),
    ).toHaveTextContent("§ 87");
    expect(groupe("Points de vie")).toHaveTextContent("25");
    expect(groupe("Chance")).toHaveTextContent("5");
    expect(screen.queryByText("Épée courte")).not.toBeInTheDocument();
    const aventure = lireAventure(localStorage)!;
    expect(aventure.combat).toBeNull();
    expect(aventure.combats).toHaveLength(1);
    expect(aventure.combats[0]).toMatchObject({
      chapitre: 112,
      issue: "perdu",
      repriseAu: 87,
    });
    expect(
      within(screen.getByRole("region", { name: "Combats" })).getByText(
        /repris au § 87/,
      ),
    ).toBeInTheDocument();
  });

  it("sans sauvegarde posée, l'indice le dit et il n'y a rien à reprendre", async () => {
    enregistrerAventure({
      personnage: {
        talent: "Herbologie",
        pointsDeVieMax: 32,
        pointsDeVie: 3,
        chance: 4,
        dexterite: 7,
      },
    });
    const lecteur = ouvrirLApp(desDuMalheur());
    await perdre(lecteur);

    sansBouton(/Reprendre la sauvegarde/);
    expect(document.body).toHaveTextContent(
      "Mode simplifié : aucune sauvegarde posée, il n'y a rien à reprendre. Il vous en reste 2.",
    );
  });

  it("en mode mortel, l'écran « Perdu » ne parle pas de sauvegarde", async () => {
    enregistrerAventure({
      mode: "mortel",
      sauvegardesUtilisees: 0,
      personnage: {
        talent: "Herbologie",
        pointsDeVieMax: 32,
        pointsDeVie: 3,
        chance: 4,
        dexterite: 7,
      },
    });
    const lecteur = ouvrirLApp(desDuMalheur());
    await perdre(lecteur);

    sansBouton(/sauvegarde/i);
    expect(screen.queryByText(/sauvegarde/i)).not.toBeInTheDocument();
  });
});
