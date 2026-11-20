import { describe, expect, it } from "vitest";
import type { Aventure } from "./aventure";
import { combatNarratif, commencerUnCombat, type Combat } from "./combat";
import { unNouveauPlan } from "./plans";
import {
  peutReprendre,
  peutSauvegarder,
  poserUneSauvegarde,
  reprendreLaSauvegarde,
  sauvegardesRestantes,
} from "./sauvegardes";

/** Une aventure simplifiée au § 112, une sauvegarde déjà utilisée sur les 3. */
const herboriste: Aventure = {
  chapitre: 112,
  mode: "simplifie",
  sauvegardesUtilisees: 1,
  sauvegarde: null,
  notes: "Piège au 74.",
  plans: [],
  armes: [{ nom: "Épée courte", bonus: 1 }],
  besace: {
    objets: ["Corde de chanvre", "Pain rassis"],
    bourse: true,
    boulons: 12,
    boulonsForces: false,
  },
  effets: [
    { nom: "Potion d'agilité", duree: "24 h", cible: "dexterite", valeur: 1 },
  ],
  combat: null,
  combats: [combatNarratif(98, 1, "gagne")],
  personnage: {
    talent: "Herbologie",
    pointsDeVieMax: 32,
    pointsDeVie: 28,
    chance: 4,
    dexterite: 7,
  },
};

/** Le combat du § 61, perdu : le lecteur est tombé à 0 PV. */
function combatPerduAu61(): Combat {
  const combat = commencerUnCombat(
    {
      chapitre: 61,
      adversaires: 1,
      ennemi: { dexterite: 7, pointsDeVie: 50, bonus: 0 },
      premier: "lecteur",
    },
    { dexterite: 7, bonus: 1, pointsDeVie: 28, pointsDeVieMax: 32, chance: 4 },
  );
  return {
    ...combat,
    pointsDeVie: { lecteur: 0, ennemi: 30 },
    issue: "perdu",
  };
}

/** Le lecteur a posé une sauvegarde au § 112, puis a continué sa lecture. */
function apresLaSauvegarde(): Aventure {
  const posee = poserUneSauvegarde(herboriste);
  return {
    ...posee,
    chapitre: 140,
    notes: "Piège au 74. La porte s'ouvre en hiver.",
    plans: [unNouveauPlan("Souterrains", [])],
    armes: [],
    besace: { ...posee.besace, objets: ["Clé de bronze"], boulons: 3 },
    effets: [],
    combats: [...posee.combats, combatNarratif(131, 2, "gagne")],
    personnage: {
      ...posee.personnage,
      pointsDeVie: 9,
      chance: 1,
      dexterite: 6,
    },
  };
}

describe("les sauvegardes restantes", () => {
  it("en mode simplifié, il en reste 3 moins celles déjà utilisées", () => {
    expect(
      sauvegardesRestantes({ ...herboriste, sauvegardesUtilisees: 0 }),
    ).toBe(3);
    expect(sauvegardesRestantes(herboriste)).toBe(2);
    expect(
      sauvegardesRestantes({ ...herboriste, sauvegardesUtilisees: 3 }),
    ).toBe(0);
  });

  it("n'existent pas en mode narratif ni en mode mortel", () => {
    for (const mode of ["narratif", "mortel"] as const) {
      const aventure = { ...herboriste, mode, sauvegardesUtilisees: 0 };
      expect(sauvegardesRestantes(aventure)).toBe(0);
      expect(peutSauvegarder(aventure)).toBe(false);
    }
  });

  it("peut-on sauvegarder : oui tant qu'il en reste, non quand les 3 sont utilisées", () => {
    expect(peutSauvegarder(herboriste)).toBe(true);
    expect(peutSauvegarder({ ...herboriste, sauvegardesUtilisees: 2 })).toBe(
      true,
    );
    expect(peutSauvegarder({ ...herboriste, sauvegardesUtilisees: 3 })).toBe(
      false,
    );
  });
});

describe("poser une sauvegarde", () => {
  it("consomme une sauvegarde", () => {
    expect(poserUneSauvegarde(herboriste).sauvegardesUtilisees).toBe(2);
  });

  it("garde le chapitre en cours et l'état complet du personnage", () => {
    const { sauvegarde } = poserUneSauvegarde(herboriste);
    expect(sauvegarde).toEqual({
      chapitre: 112,
      personnage: herboriste.personnage,
      armes: herboriste.armes,
      besace: herboriste.besace,
      effets: herboriste.effets,
    });
  });

  it("ne garde ni les notes, ni les plans, ni l'historique des combats, ni le mode", () => {
    const { sauvegarde } = poserUneSauvegarde(herboriste);
    expect(Object.keys(sauvegarde!).sort()).toEqual([
      "armes",
      "besace",
      "chapitre",
      "effets",
      "personnage",
    ]);
  });

  it("garde une copie : ce que le lecteur fait ensuite ne change pas la sauvegarde", () => {
    const posee = poserUneSauvegarde(herboriste);
    const copie = structuredClone(posee.sauvegarde);
    posee.personnage.pointsDeVie = 1;
    posee.armes.push({ nom: "Bâton", bonus: 0 });
    posee.besace.objets.push("Fiole vide");
    posee.effets.pop();
    expect(posee.sauvegarde).toEqual(copie);
  });

  it("ne modifie pas l'aventure qu'on lui donne", () => {
    const avant = structuredClone(herboriste);
    poserUneSauvegarde(herboriste);
    expect(herboriste).toEqual(avant);
  });

  it("remplace la sauvegarde précédente : seule la plus récente compte", () => {
    const premiere = poserUneSauvegarde(herboriste);
    const seconde = poserUneSauvegarde({ ...premiere, chapitre: 140 });
    expect(seconde.sauvegarde!.chapitre).toBe(140);
    expect(seconde.sauvegardesUtilisees).toBe(3);
  });

  it("refuse quand les 3 sauvegardes sont utilisées", () => {
    expect(() =>
      poserUneSauvegarde({ ...herboriste, sauvegardesUtilisees: 3 }),
    ).toThrow();
  });

  it("refuse en mode narratif et en mode mortel", () => {
    for (const mode of ["narratif", "mortel"] as const) {
      expect(() => poserUneSauvegarde({ ...herboriste, mode })).toThrow();
    }
  });
});

describe("reprendre la sauvegarde", () => {
  it("rend le chapitre et tout l'état du personnage tels qu'ils étaient à la pose", () => {
    const reprise = reprendreLaSauvegarde(apresLaSauvegarde());
    expect(reprise.chapitre).toBe(112);
    expect(reprise.personnage).toEqual(herboriste.personnage);
    expect(reprise.armes).toEqual(herboriste.armes);
    expect(reprise.besace).toEqual(herboriste.besace);
    expect(reprise.effets).toEqual(herboriste.effets);
  });

  it("ne rend pas les sauvegardes utilisées : elles restent consommées", () => {
    expect(
      reprendreLaSauvegarde(apresLaSauvegarde()).sauvegardesUtilisees,
    ).toBe(2);
  });

  it("garde les notes, les plans, l'historique des combats et le mode", () => {
    const avant = apresLaSauvegarde();
    const reprise = reprendreLaSauvegarde(avant);
    expect(reprise.notes).toBe("Piège au 74. La porte s'ouvre en hiver.");
    expect(reprise.plans).toEqual(avant.plans);
    expect(reprise.plans).toHaveLength(1);
    expect(reprise.combats).toEqual(avant.combats);
    expect(reprise.combats).toHaveLength(2);
    expect(reprise.mode).toBe("simplifie");
  });

  it("laisse la sauvegarde en place : on peut y revenir encore, elle est la plus récente", () => {
    const avant = apresLaSauvegarde();
    const reprise = reprendreLaSauvegarde(avant);
    expect(reprise.sauvegarde).toEqual(avant.sauvegarde);
    expect(peutReprendre(reprise)).toBe(true);
  });

  it("rend une copie : jouer après la reprise ne change pas la sauvegarde", () => {
    const reprise = reprendreLaSauvegarde(apresLaSauvegarde());
    const copie = structuredClone(reprise.sauvegarde);
    reprise.personnage.pointsDeVie = 1;
    reprise.armes.push({ nom: "Bâton", bonus: 0 });
    reprise.besace.objets.push("Fiole vide");
    reprise.effets.pop();
    expect(reprise.sauvegarde).toEqual(copie);
  });

  it("ne reprend que la sauvegarde la plus récente", () => {
    const premiere = poserUneSauvegarde(herboriste);
    const seconde = poserUneSauvegarde({
      ...premiere,
      chapitre: 140,
      personnage: { ...premiere.personnage, pointsDeVie: 20 },
    });
    const reprise = reprendreLaSauvegarde({
      ...seconde,
      chapitre: 170,
      personnage: { ...seconde.personnage, pointsDeVie: 3 },
    });
    expect(reprise.chapitre).toBe(140);
    expect(reprise.personnage.pointsDeVie).toBe(20);
  });

  it("ne modifie pas l'aventure qu'on lui donne", () => {
    const avant = apresLaSauvegarde();
    const copie = structuredClone(avant);
    reprendreLaSauvegarde(avant);
    expect(avant).toEqual(copie);
  });

  it("refuse quand aucune sauvegarde n'a été posée", () => {
    expect(peutReprendre(herboriste)).toBe(false);
    expect(() => reprendreLaSauvegarde(herboriste)).toThrow();
  });

  it("n'existe pas en mode narratif ni en mode mortel", () => {
    for (const mode of ["narratif", "mortel"] as const) {
      const aventure = { ...apresLaSauvegarde(), mode };
      expect(peutReprendre(aventure)).toBe(false);
      expect(() => reprendreLaSauvegarde(aventure)).toThrow();
    }
  });

  it("note « repris au § 112 » sur le combat perdu quand on reprend depuis l'écran « Perdu »", () => {
    const perdu = combatPerduAu61();
    const avant: Aventure = {
      ...apresLaSauvegarde(),
      combats: [combatNarratif(98, 1, "gagne"), perdu],
    };
    const reprise = reprendreLaSauvegarde(avant, { apresUnCombatPerdu: true });
    expect(reprise.combats).toEqual([
      combatNarratif(98, 1, "gagne"),
      { ...perdu, repriseAu: 112 },
    ]);
  });

  it("ne note rien sur le dernier combat s'il n'a pas été perdu", () => {
    const gagne: Combat = { ...combatPerduAu61(), issue: "gagne" };
    const avant: Aventure = { ...apresLaSauvegarde(), combats: [gagne] };
    expect(
      reprendreLaSauvegarde(avant, { apresUnCombatPerdu: true }).combats,
    ).toEqual([gagne]);
  });

  it("ne note rien quand on reprend depuis la feuille", () => {
    const perdu = combatPerduAu61();
    const avant: Aventure = { ...apresLaSauvegarde(), combats: [perdu] };
    expect(reprendreLaSauvegarde(avant).combats).toEqual([perdu]);
  });
});
