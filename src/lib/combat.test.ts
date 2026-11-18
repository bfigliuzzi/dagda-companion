import { describe, expect, it } from "vitest";
import {
  bilanDuCombat,
  commencerUnCombat,
  ficheDuLecteur,
  interrompreLeCombat,
  jouerJusquALaFin,
  jouerUnTour,
  type FicheDuLecteur,
  type NouveauCombat,
} from "./combat";
import { desFixes } from "./des";
import { valeursEffectives } from "./valeursEffectives";

/** L'apprenti de l'exemple du livre : DEX 7, épée courte +1. */
const apprenti: FicheDuLecteur = {
  dexterite: 7,
  bonus: 1,
  pointsDeVie: 28,
  pointsDeVieMax: 32,
  chance: 4,
};

/** Les gobelins de l'exemple du livre : DEX 7, 50 PV, pas de bonus. */
const gobelins: NouveauCombat = {
  chapitre: 112,
  adversaires: 7,
  ennemi: { dexterite: 7, pointsDeVie: 50, bonus: 0 },
  premier: "lecteur",
};

describe("un tour de combat", () => {
  it("retire 5 PV quand l'épée courte touche avec 2d6 = 5 et 1d6 = 3 (exemple du livre)", () => {
    const combat = jouerUnTour(
      commencerUnCombat(gobelins, apprenti),
      // Lecteur : 2 + 3 = 5 ≤ 7, touché ; d6 = 3. Ennemi : 6 + 6, raté.
      desFixes(2, 3, 3, 6, 6),
    );
    expect(combat.jets[0]).toEqual({
      tour: 1,
      attaquant: "lecteur",
      des: [2, 3],
      chance: 0,
      total: 5,
      touche: true,
      degats: { de: 3, chance: 0, bonus: 1, total: 5 },
      pointsDeVie: 45,
    });
    expect(combat.pointsDeVie.ennemi).toBe(45);
  });
});

describe("l'ordre d'un tour", () => {
  it("fait toucher, puis infliger les dégâts, puis riposter l'ennemi", () => {
    // Lecteur : 3 + 4 = 7, touché (≤ DEX), d6 = 2. Ennemi : 1 + 2, touché, d6 = 5.
    const combat = jouerUnTour(
      commencerUnCombat(gobelins, apprenti),
      desFixes(3, 4, 2, 1, 2, 5),
    );
    expect(
      combat.jets.map(({ tour, attaquant, total, touche, degats }) => ({
        tour,
        attaquant,
        total,
        touche,
        degats: degats?.total ?? null,
      })),
    ).toEqual([
      { tour: 1, attaquant: "lecteur", total: 7, touche: true, degats: 4 },
      { tour: 1, attaquant: "ennemi", total: 3, touche: true, degats: 6 },
    ]);
    expect(combat.pointsDeVie).toEqual({ lecteur: 22, ennemi: 46 });
    expect(combat.jets[1].pointsDeVie).toBe(22);
    expect(combat.issue).toBeNull();
  });

  it("ne lance pas le dé de dégâts quand le coup est raté (2d6 au-dessus de la DEX)", () => {
    // Lecteur : 4 + 4 = 8 > 7, raté. Ennemi : 1 + 1, touché, d6 = 1.
    const combat = jouerUnTour(
      commencerUnCombat(gobelins, apprenti),
      desFixes(4, 4, 1, 1, 1),
    );
    expect(combat.jets[0]).toMatchObject({
      des: [4, 4],
      total: 8,
      touche: false,
      degats: null,
      pointsDeVie: 50,
    });
    expect(combat.jets[1].degats).toEqual({
      de: 1,
      chance: 0,
      bonus: 0,
      total: 2,
    });
    expect(combat.pointsDeVie.lecteur).toBe(26);
  });

  it("fait frapper l'ennemi d'abord quand le livre le demande", () => {
    const combat = jouerUnTour(
      commencerUnCombat({ ...gobelins, premier: "ennemi" }, apprenti),
      desFixes(6, 6, 6, 6),
    );
    expect(combat.jets.map((jet) => jet.attaquant)).toEqual([
      "ennemi",
      "lecteur",
    ]);
  });

  it("numérote les tours : deux jets par tour", () => {
    const combat = jouerUnTour(
      jouerUnTour(commencerUnCombat(gobelins, apprenti), desFixes(6, 6)),
      desFixes(6, 6),
    );
    expect(combat.jets.map((jet) => jet.tour)).toEqual([1, 1, 2, 2]);
  });

  it("ajoute le bonus de dommage de l'ennemi à ses dégâts", () => {
    const combat = jouerUnTour(
      commencerUnCombat(
        { ...gobelins, ennemi: { ...gobelins.ennemi, bonus: 2 } },
        apprenti,
      ),
      desFixes(6, 6, 1, 1, 3),
    );
    expect(combat.jets[1].degats?.total).toBe(6);
    expect(combat.pointsDeVie.lecteur).toBe(22);
  });

  it("ne fait jamais de dégâts négatifs : un malus ne soigne pas (choix par défaut)", () => {
    const combat = jouerUnTour(
      commencerUnCombat(gobelins, { ...apprenti, bonus: -5 }),
      desFixes(1, 1, 2, 6, 6),
    );
    expect(combat.jets[0].degats?.total).toBe(0);
    expect(combat.pointsDeVie.ennemi).toBe(50);
  });
});

describe("la fin du combat", () => {
  const ennemiA5PV: NouveauCombat = {
    ...gobelins,
    ennemi: { ...gobelins.ennemi, pointsDeVie: 5 },
  };

  it("est gagnée quand l'ennemi tombe à 0 PV, sans riposte", () => {
    const combat = jouerUnTour(
      commencerUnCombat(ennemiA5PV, apprenti),
      desFixes(2, 3, 6),
    );
    expect(combat.issue).toBe("gagne");
    expect(combat.jets).toHaveLength(1);
    expect(combat.pointsDeVie.ennemi).toBe(0);
  });

  it("est perdue quand le lecteur tombe à 0 PV, sans descendre plus bas", () => {
    const combat = jouerUnTour(
      commencerUnCombat(gobelins, { ...apprenti, pointsDeVie: 3 }),
      desFixes(6, 6, 1, 1, 6),
    );
    expect(combat.issue).toBe("perdu");
    expect(combat.pointsDeVie.lecteur).toBe(0);
  });

  it("ne bouge plus une fois terminé", () => {
    const fini = jouerUnTour(
      commencerUnCombat(ennemiA5PV, apprenti),
      desFixes(2, 3, 6),
    );
    expect(jouerUnTour(fini, desFixes(1))).toBe(fini);
  });

  it("est perdu d'emblée si le lecteur commence à 0 PV : le livre dit la suite", () => {
    const combat = commencerUnCombat(gobelins, { ...apprenti, pointsDeVie: 0 });
    expect(combat.issue).toBe("perdu");
  });

  it("« Finir » joue tous les tours jusqu'à l'issue", () => {
    // Chaque tour : le lecteur touche (1 + 1, d6 = 6 : 8 dégâts), l'ennemi rate (6 + 6).
    const combat = jouerJusquALaFin(
      commencerUnCombat(gobelins, apprenti),
      desFixes(1, 1, 6, 6, 6),
    );
    expect(combat.issue).toBe("gagne");
    expect(combat.jets.at(-1)?.tour).toBe(7);
    expect(combat.pointsDeVie.ennemi).toBe(0);
  });

  it("« Finir » rend la main si personne ne peut toucher", () => {
    const combat = jouerJusquALaFin(
      commencerUnCombat(
        { ...gobelins, ennemi: { ...gobelins.ennemi, dexterite: 1 } },
        { ...apprenti, dexterite: 1 },
      ),
      desFixes(1, 1),
    );
    expect(combat.issue).toBeNull();
  });

  it("garde ce qui a été joué quand le lecteur quitte en cours", () => {
    const enCours = jouerUnTour(
      commencerUnCombat(gobelins, apprenti),
      desFixes(6, 6, 1, 1, 4),
    );
    const quitte = interrompreLeCombat(enCours);
    expect(quitte.issue).toBe("interrompu");
    expect(quitte.pointsDeVie.lecteur).toBe(23);
    expect(quitte.jets).toEqual(enCours.jets);
  });
});

describe("le bilan d'un combat", () => {
  it("compte les tours, les PV perdus et la CHANCE dépensée", () => {
    const combat = jouerUnTour(
      jouerUnTour(
        commencerUnCombat(gobelins, apprenti),
        desFixes(6, 6, 1, 1, 4),
      ),
      desFixes(6, 6, 1, 1, 1),
    );
    expect(bilanDuCombat(combat)).toEqual({
      tours: 2,
      pointsDeViePerdus: 7,
      chanceDepensee: 0,
    });
  });

  it("garde les fiches de départ des deux camps", () => {
    const combat = jouerUnTour(
      commencerUnCombat(gobelins, apprenti),
      desFixes(2, 3, 3, 1, 1, 6),
    );
    expect(combat.depart).toEqual({
      lecteur: apprenti,
      ennemi: gobelins.ennemi,
    });
    expect(combat.chapitre).toBe(112);
    expect(combat.adversaires).toBe(7);
  });
});

describe("le lecteur se bat avec ses valeurs effectives", () => {
  it("prend la DEX et le bonus de dommage des armes et des effets", () => {
    const fiche = ficheDuLecteur(
      valeursEffectives({
        personnage: {
          talent: "Herbologie",
          pointsDeVieMax: 32,
          pointsDeVie: 28,
          chance: 4,
          dexterite: 7,
        },
        armes: [{ nom: "Épée courte", bonus: 1 }],
        effets: [
          {
            nom: "Potion d'agilité",
            duree: "24 h",
            cible: "dexterite",
            valeur: 1,
          },
          { nom: "Rage", duree: "", cible: "degats", valeur: 2 },
        ],
      }),
    );
    expect(fiche).toEqual({
      dexterite: 8,
      bonus: 3,
      pointsDeVie: 28,
      pointsDeVieMax: 32,
      chance: 4,
    });
    // Avec DEX 8, 2d6 = 8 touche ; dégâts 1 + 3 + 3.
    const combat = jouerUnTour(
      commencerUnCombat(gobelins, fiche),
      desFixes(4, 4, 3, 6, 6),
    );
    expect(combat.jets[0]).toMatchObject({ touche: true, pointsDeVie: 43 });
  });
});

describe("la CHANCE automatique en combat", () => {
  /** L'apprenti en état critique : 6 PV, DEX 7, épée courte +1, CHANCE 4. */
  const enDanger: FicheDuLecteur = { ...apprenti, pointsDeVie: 6 };
  /** Un ennemi qu'un seul coup peut achever : 8 PV ≤ 1 + 6 + 1. */
  const presqueVaincu: NouveauCombat = {
    ...gobelins,
    ennemi: { ...gobelins.ennemi, pointsDeVie: 8 },
  };

  it("baisse un toucher raté exactement jusqu'à la DEX : 9 → 7 pour 2 points", () => {
    // Lecteur : 5 + 4 = 9 > 7 ; 2 points le ramènent à 7. d6 = 6 : 1 + 6 + 1 = 8.
    const combat = jouerUnTour(
      commencerUnCombat(presqueVaincu, enDanger),
      desFixes(5, 4, 6),
    );
    expect(combat.jets[0]).toMatchObject({
      des: [5, 4],
      chance: 2,
      total: 7,
      touche: true,
      degats: { de: 6, chance: 0, bonus: 1, total: 8 },
    });
    expect(combat.chance).toBe(2);
    expect(combat.issue).toBe("gagne");
  });

  describe("ne dépense rien quand une condition manque", () => {
    it("lecteur à 7 PV : pas en état critique", () => {
      const combat = jouerUnTour(
        commencerUnCombat(presqueVaincu, { ...enDanger, pointsDeVie: 7 }),
        desFixes(5, 4, 6, 6),
      );
      expect(combat.jets[0]).toMatchObject({
        chance: 0,
        total: 9,
        touche: false,
      });
      expect(combat.chance).toBe(4);
    });

    it("ennemi à 9 PV : au-dessus de 1 + 6 + 1, aucun coup ne peut l'achever", () => {
      const combat = jouerUnTour(
        commencerUnCombat(
          { ...gobelins, ennemi: { ...gobelins.ennemi, pointsDeVie: 9 } },
          enDanger,
        ),
        desFixes(5, 4, 6, 6),
      );
      expect(combat.jets[0]).toMatchObject({
        chance: 0,
        total: 9,
        touche: false,
      });
      expect(combat.chance).toBe(4);
    });

    it("CHANCE 1 pour un toucher qui en demande 2 : le coup reste raté", () => {
      const combat = jouerUnTour(
        commencerUnCombat(presqueVaincu, { ...enDanger, chance: 1 }),
        desFixes(5, 4, 6, 6),
      );
      expect(combat.jets[0]).toMatchObject({
        chance: 0,
        total: 9,
        touche: false,
        degats: null,
      });
      expect(combat.chance).toBe(1);
    });

    it("CHANCE 0 : rien à dépenser", () => {
      const combat = jouerUnTour(
        commencerUnCombat(presqueVaincu, { ...enDanger, chance: 0 }),
        desFixes(4, 4, 6, 6),
      );
      expect(combat.jets[0]).toMatchObject({ chance: 0, touche: false });
      expect(combat.chance).toBe(0);
    });
  });

  it("dépense la CHANCE dès que les PV du lecteur passent sous 7 pendant le tour", () => {
    // L'ennemi frappe d'abord : 1 + 1, d6 = 1 → 2 dégâts, le lecteur passe de 8 à 6 PV.
    // Le lecteur riposte : 5 + 3 = 8, ramené à 7 pour 1 point ; d6 = 6 → 8, l'ennemi tombe.
    const combat = jouerUnTour(
      commencerUnCombat(
        { ...presqueVaincu, premier: "ennemi" },
        { ...enDanger, pointsDeVie: 8 },
      ),
      desFixes(1, 1, 1, 5, 3, 6),
    );
    expect(combat.jets[1]).toMatchObject({
      attaquant: "lecteur",
      chance: 1,
      total: 7,
    });
    expect(combat.issue).toBe("gagne");
  });

  describe("étape dégâts", () => {
    it("monte le d6 juste assez pour achever l'ennemi : 3 → 5 contre 7 PV", () => {
      // 3 + 3 = 6, touché sans CHANCE ; d6 = 3 : 1 + 3 + 1 = 5 < 7, il faut un 5.
      const combat = jouerUnTour(
        commencerUnCombat(
          { ...gobelins, ennemi: { ...gobelins.ennemi, pointsDeVie: 7 } },
          enDanger,
        ),
        desFixes(3, 3, 3),
      );
      expect(combat.jets[0]).toMatchObject({
        chance: 0,
        degats: { de: 3, chance: 2, bonus: 1, total: 7 },
        pointsDeVie: 0,
      });
      expect(combat.chance).toBe(2);
      expect(combat.issue).toBe("gagne");
    });

    it("ne monte jamais le d6 au-delà de 6 : contre 8 PV, un 3 coûte 3 points et pas 4", () => {
      const combat = jouerUnTour(
        commencerUnCombat(presqueVaincu, enDanger),
        desFixes(3, 3, 3),
      );
      expect(combat.jets[0].degats).toEqual({
        de: 3,
        chance: 3,
        bonus: 1,
        total: 8,
      });
      expect(combat.chance).toBe(1);
    });

    it("ne dépense rien quand le d6 suffit déjà", () => {
      const combat = jouerUnTour(
        commencerUnCombat(presqueVaincu, enDanger),
        desFixes(3, 3, 6),
      );
      expect(combat.jets[0].degats).toEqual({
        de: 6,
        chance: 0,
        bonus: 1,
        total: 8,
      });
      expect(combat.chance).toBe(4);
    });

    it("CHANCE 4 pour un d6 qui en demande 5 : rien n'est dépensé, les dégâts restent", () => {
      // d6 = 1 : 1 + 1 + 1 = 3 ; il faudrait un 6, soit 5 points.
      const combat = jouerUnTour(
        commencerUnCombat(presqueVaincu, enDanger),
        desFixes(3, 3, 1, 6, 6),
      );
      expect(combat.jets[0]).toMatchObject({
        degats: { de: 1, chance: 0, bonus: 1, total: 3 },
        pointsDeVie: 5,
      });
      expect(combat.chance).toBe(4);
    });
  });

  describe("les deux étapes dans le même coup", () => {
    it("paie le toucher puis les dégâts : 1 + 2 points, l'ennemi tombe", () => {
      // 5 + 3 = 8 → 7 pour 1 point ; d6 = 4 → 6 pour 2 points : 1 + 6 + 1 = 8.
      const combat = jouerUnTour(
        commencerUnCombat(presqueVaincu, enDanger),
        desFixes(5, 3, 4),
      );
      expect(combat.jets[0]).toMatchObject({
        chance: 1,
        total: 7,
        degats: { de: 4, chance: 2, total: 8 },
      });
      expect(combat.chance).toBe(1);
      expect(bilanDuCombat(combat).chanceDepensee).toBe(3);
    });

    it("garde la dépense du toucher quand ce qui reste ne paie pas les dégâts (chaque étape compte seule)", () => {
      // CHANCE 3 : 5 + 3 = 8 → 7 pour 1 point. d6 = 3 : il faudrait 3 points, il n'en reste que 2.
      const combat = jouerUnTour(
        commencerUnCombat(presqueVaincu, { ...enDanger, chance: 3 }),
        desFixes(5, 3, 3, 6, 6),
      );
      expect(combat.jets[0]).toMatchObject({
        chance: 1,
        touche: true,
        degats: { de: 3, chance: 0, bonus: 1, total: 5 },
        pointsDeVie: 3,
      });
      expect(combat.chance).toBe(2);
    });
  });

  it("ne modifie jamais les jets de l'ennemi, même quand le lecteur est en danger", () => {
    // Ennemi à 7 PV, à portée d'un coup du lecteur. L'ennemi frappe d'abord :
    // 4 + 4 = 8 > 7, raté ; puis 1 + 1, touché, d6 = 1. Le lecteur, entre les
    // deux, rate de trop loin (6 + 6) pour sa CHANCE.
    const combat = jouerUnTour(
      jouerUnTour(
        commencerUnCombat(
          {
            ...gobelins,
            premier: "ennemi",
            ennemi: { ...gobelins.ennemi, pointsDeVie: 7 },
          },
          enDanger,
        ),
        desFixes(4, 4, 6, 6),
      ),
      desFixes(1, 1, 1, 6, 6),
    );
    const jetsDeLEnnemi = combat.jets.filter(
      (jet) => jet.attaquant === "ennemi",
    );
    expect(jetsDeLEnnemi).toEqual([
      expect.objectContaining({ chance: 0, total: 8, touche: false }),
      expect.objectContaining({
        chance: 0,
        total: 2,
        degats: { de: 1, chance: 0, bonus: 0, total: 2 },
      }),
    ]);
    expect(combat.chance).toBe(4);
  });

  it("compte le bonus de dommage dans le seuil : 10 PV ≤ 1 + 6 + 3 avec l'épée et la rage", () => {
    const fiche = { ...enDanger, bonus: 3 };
    const ennemiA10PV: NouveauCombat = {
      ...gobelins,
      ennemi: { ...gobelins.ennemi, pointsDeVie: 10 },
    };
    // 5 + 4 = 9 → 7 pour 2 points ; d6 = 4 → 6 pour 2 points : 1 + 6 + 3 = 10.
    const avecBonus = jouerUnTour(
      commencerUnCombat(ennemiA10PV, fiche),
      desFixes(5, 4, 4),
    );
    expect(avecBonus.jets[0]).toMatchObject({
      chance: 2,
      degats: { de: 4, chance: 2, bonus: 3, total: 10 },
    });
    expect(avecBonus.issue).toBe("gagne");

    // Avec le seul +1 de l'épée, 10 PV sont hors d'atteinte : rien n'est dépensé.
    const sansRage = jouerUnTour(
      commencerUnCombat(ennemiA10PV, enDanger),
      desFixes(5, 4, 4, 6, 6),
    );
    expect(sansRage.jets[0]).toMatchObject({ chance: 0, touche: false });
    expect(sansRage.chance).toBe(4);
  });

  it("baisse le toucher jusqu'à la DEX effective : 9 → 8 avec la potion d'agilité", () => {
    const fiche = ficheDuLecteur(
      valeursEffectives({
        personnage: {
          talent: "Herbologie",
          pointsDeVieMax: 32,
          pointsDeVie: 6,
          chance: 4,
          dexterite: 7,
        },
        armes: [{ nom: "Épée courte", bonus: 1 }],
        effets: [
          {
            nom: "Potion d'agilité",
            duree: "24 h",
            cible: "dexterite",
            valeur: 1,
          },
        ],
      }),
    );
    const combat = jouerUnTour(
      commencerUnCombat(presqueVaincu, fiche),
      desFixes(5, 4, 6),
    );
    expect(combat.jets[0]).toMatchObject({ chance: 1, total: 8, touche: true });
    expect(combat.chance).toBe(3);
  });
});
