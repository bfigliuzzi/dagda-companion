import { describe, expect, it } from "vitest";
import {
  ajouterUnBoulon,
  ajouterUnPointDeVie,
  apresLaMort,
  proposeDeRecommencer,
  ARMES_MAX,
  besaceVide,
  bonusDeDegatsDesArmes,
  EMPLACEMENTS_MAX,
  emplacementsOccupes,
  estUnNombreDeBoulons,
  formaterLesBoulons,
  objetsEnTrop,
  peutCompterLesBoulons,
  retirerUnBoulon,
  portePlusDObjetsQueLaBesace,
  type Besace,
  estUnBonusDeDegats,
  formaterUnBonus,
  portePlusDArmesQueLesRegles,
  ceQuiManqueEnRoute,
  commencerAventure,
  depasseLeMaximum,
  estCritique,
  recopierAventure,
  retirerUnPointDeVie,
  type Recopie,
} from "./aventure";

const feuillePapier: Recopie = {
  talent: "Herbologie",
  mode: "simplifie",
  chapitre: 112,
  pointsDeVie: 28,
  pointsDeVieMax: 32,
  chance: 4,
  dexterite: 7,
  sauvegardesUtilisees: 1,
};

describe("recopier un personnage déjà en route", () => {
  it("reprend exactement les valeurs recopiées, sauvegardes utilisées comprises", () => {
    expect(recopierAventure(feuillePapier)).toEqual({
      chapitre: 112,
      mode: "simplifie",
      sauvegardesUtilisees: 1,
      sauvegarde: null,
      notes: "",
      armes: [],
      besace: { objets: [], bourse: false, boulons: 0, boulonsForces: false },
      effets: [],
      combat: null,
      combats: [],
      personnage: {
        talent: "Herbologie",
        pointsDeVieMax: 32,
        pointsDeVie: 28,
        chance: 4,
        dexterite: 7,
      },
    });
  });

  it("ne compte aucune sauvegarde utilisée hors du mode simplifié", () => {
    const aventure = recopierAventure({ ...feuillePapier, mode: "mortel" });
    expect(aventure.sauvegardesUtilisees).toBe(0);
  });

  it("commence une nouvelle aventure sans sauvegarde utilisée", () => {
    const aventure = commencerAventure({
      talent: "Instinct",
      mode: "simplifie",
      pointsDeVieMax: 32,
      chance: 4,
    });
    expect(aventure.sauvegardesUtilisees).toBe(0);
  });

  it("commence une aventure, nouvelle ou recopiée, avec des notes vides", () => {
    expect(recopierAventure(feuillePapier).notes).toBe("");
    expect(
      commencerAventure({
        talent: "Instinct",
        mode: "narratif",
        pointsDeVieMax: 24,
        chance: 3,
      }).notes,
    ).toBe("");
  });

  it("accepte des PV actuels au-dessus du maximum", () => {
    const recopie = { ...feuillePapier, pointsDeVie: 40 };
    expect(ceQuiManqueEnRoute(recopie)).toBeNull();
    expect(recopierAventure(recopie).personnage.pointsDeVie).toBe(40);
  });

  it("dit ce qui manque, dans l'ordre de l'écran", () => {
    expect(ceQuiManqueEnRoute(feuillePapier)).toBeNull();
    expect(ceQuiManqueEnRoute({ ...feuillePapier, talent: null })).toBe(
      "Choisissez d'abord un TALENT",
    );
    expect(ceQuiManqueEnRoute({ ...feuillePapier, mode: null })).toBe(
      "Choisissez d'abord le mode de jeu",
    );
    expect(ceQuiManqueEnRoute({ ...feuillePapier, chapitre: 0 })).toBe(
      "Corrigez le dernier chapitre lu",
    );
    expect(ceQuiManqueEnRoute({ ...feuillePapier, pointsDeVieMax: null })).toBe(
      "Saisissez d'abord les PV maximum",
    );
    expect(ceQuiManqueEnRoute({ ...feuillePapier, pointsDeVie: null })).toBe(
      "Saisissez d'abord les PV actuels",
    );
    expect(ceQuiManqueEnRoute({ ...feuillePapier, chance: null })).toBe(
      "Saisissez d'abord la CHANCE",
    );
    expect(ceQuiManqueEnRoute({ ...feuillePapier, dexterite: null })).toBe(
      "Saisissez d'abord la DEXTÉRITÉ",
    );
    expect(ceQuiManqueEnRoute({ ...feuillePapier, chance: 2.5 })).toBe(
      "Corrigez la CHANCE",
    );
  });
});

describe("mettre à jour les POINTS DE VIE", () => {
  it("retire 1 PV à chaque appui sur « − »", () => {
    expect(retirerUnPointDeVie(28)).toBe(27);
  });

  it("ne descend pas sous 0 PV : le lecteur seul décide de la suite", () => {
    expect(retirerUnPointDeVie(0)).toBe(0);
  });

  it("ajoute 1 PV à chaque appui sur « + »", () => {
    expect(ajouterUnPointDeVie(28, 32)).toBe(29);
  });

  it("s'arrête au maximum : « + » ne le dépasse pas", () => {
    expect(ajouterUnPointDeVie(31, 32)).toBe(32);
    expect(ajouterUnPointDeVie(32, 32)).toBe(32);
  });

  it("laisse tels quels des PV saisis au-dessus du maximum (le livre peut déroger)", () => {
    expect(ajouterUnPointDeVie(35, 32)).toBe(35);
    expect(retirerUnPointDeVie(35)).toBe(34);
  });

  it("est en état critique sous 7 PV, pas à 7 (choix du livre : moins de 7)", () => {
    expect(estCritique(6)).toBe(true);
    expect(estCritique(0)).toBe(true);
    expect(estCritique(7)).toBe(false);
    expect(estCritique(28)).toBe(false);
  });

  it("dit qu'une saisie dépasse le maximum seulement quand elle le dépasse", () => {
    expect(depasseLeMaximum({ pointsDeVie: 33, pointsDeVieMax: 32 })).toBe(
      true,
    );
    expect(depasseLeMaximum({ pointsDeVie: 32, pointsDeVieMax: 32 })).toBe(
      false,
    );
  });
});

describe("effets", () => {
  it("commence une aventure, nouvelle ou recopiée, sans effet", () => {
    expect(recopierAventure(feuillePapier).effets).toEqual([]);
    expect(
      commencerAventure({
        talent: "Instinct",
        mode: "narratif",
        pointsDeVieMax: 24,
        chance: 3,
      }).effets,
    ).toEqual([]);
  });
});

describe("armes", () => {
  const epeeCourte = { nom: "Épée courte", bonus: 1 };
  const baton = { nom: "Bâton de l'Académie", bonus: 0 };
  const dague = { nom: "Dague d'os", bonus: 1 };

  it("commence une aventure, nouvelle ou recopiée, sans arme", () => {
    expect(recopierAventure(feuillePapier).armes).toEqual([]);
    expect(
      commencerAventure({
        talent: "Instinct",
        mode: "narratif",
        pointsDeVieMax: 24,
        chance: 3,
      }).armes,
    ).toEqual([]);
  });

  it("n'ajoute aucun bonus sans arme", () => {
    expect(bonusDeDegatsDesArmes([])).toBe(0);
  });

  it("retrouve le +1 de l'épée courte seule", () => {
    expect(bonusDeDegatsDesArmes([epeeCourte])).toBe(1);
  });

  it("choix par défaut : les bonus des armes portées s'additionnent", () => {
    expect(
      bonusDeDegatsDesArmes([epeeCourte, { nom: "Dague d'os", bonus: 2 }]),
    ).toBe(3);
    expect(bonusDeDegatsDesArmes([epeeCourte, baton])).toBe(1);
  });

  it("additionne aussi un bonus négatif", () => {
    expect(
      bonusDeDegatsDesArmes([epeeCourte, { nom: "Masse", bonus: -3 }]),
    ).toBe(-2);
  });

  it("compte au-delà de 2 armes sans rien retirer", () => {
    expect(bonusDeDegatsDesArmes([epeeCourte, baton, dague])).toBe(2);
  });

  it("ne dépasse pas les règles jusqu'à 2 armes, les dépasse à partir de 3", () => {
    expect(ARMES_MAX).toBe(2);
    expect(portePlusDArmesQueLesRegles([epeeCourte, baton])).toBe(false);
    expect(portePlusDArmesQueLesRegles([epeeCourte, baton, dague])).toBe(true);
  });

  it("accepte tout bonus entier, positif, nul ou négatif, mais ni virgule ni texte", () => {
    expect(estUnBonusDeDegats(0)).toBe(true);
    expect(estUnBonusDeDegats(2)).toBe(true);
    expect(estUnBonusDeDegats(-1)).toBe(true);
    expect(estUnBonusDeDegats(1.5)).toBe(false);
    expect(estUnBonusDeDegats("1")).toBe(false);
  });

  it("écrit un bonus avec son signe", () => {
    expect(formaterUnBonus(1)).toBe("+1");
    expect(formaterUnBonus(0)).toBe("+0");
    expect(formaterUnBonus(-2)).toBe("−2");
  });
});

const objets = (n: number) => Array.from({ length: n }, (_, i) => `Objet ${i}`);
const besace = (partiel: Partial<Besace> = {}): Besace => ({
  ...besaceVide(),
  ...partiel,
});

describe("emplacements de la besace", () => {
  it("la besace a 24 emplacements", () => {
    expect(EMPLACEMENTS_MAX).toBe(24);
  });

  it("une besace neuve est vide, sans bourse ni boulons", () => {
    expect(besaceVide()).toEqual({
      objets: [],
      bourse: false,
      boulons: 0,
      boulonsForces: false,
    });
    expect(emplacementsOccupes(besaceVide())).toBe(0);
  });

  it("chaque objet occupe un emplacement", () => {
    expect(emplacementsOccupes(besace({ objets: objets(7) }))).toBe(7);
  });

  it("choix par défaut : la bourse occupe un emplacement, les boulons aucun", () => {
    expect(emplacementsOccupes(besace({ bourse: true }))).toBe(1);
    expect(
      emplacementsOccupes(
        besace({ objets: objets(6), bourse: true, boulons: 120 }),
      ),
    ).toBe(7);
    expect(
      emplacementsOccupes(besace({ boulons: 50, boulonsForces: true })),
    ).toBe(0);
  });

  it("compte les objets en trop au-delà de 24, jamais en dessous de 0", () => {
    expect(objetsEnTrop(besace({ objets: objets(24) }))).toBe(0);
    expect(objetsEnTrop(besace({ objets: objets(3) }))).toBe(0);
    expect(objetsEnTrop(besace({ objets: objets(25) }))).toBe(1);
    expect(objetsEnTrop(besace({ objets: objets(24), bourse: true }))).toBe(1);
    expect(objetsEnTrop(besace({ objets: objets(27), bourse: true }))).toBe(4);
  });

  it("avertit au-delà de 24 seulement", () => {
    expect(portePlusDObjetsQueLaBesace(besace({ objets: objets(24) }))).toBe(
      false,
    );
    expect(portePlusDObjetsQueLaBesace(besace({ objets: objets(25) }))).toBe(
      true,
    );
  });
});

describe("boulons et bourse", () => {
  it("le compteur est actif avec une bourse", () => {
    expect(peutCompterLesBoulons(besace({ bourse: true }))).toBe(true);
  });

  it("choix par défaut : sans bourse le compteur est désactivé, sauf si le lecteur le force", () => {
    expect(peutCompterLesBoulons(besace())).toBe(false);
    expect(peutCompterLesBoulons(besace({ boulonsForces: true }))).toBe(true);
  });

  it("un nombre de boulons est un entier à partir de 0", () => {
    expect(estUnNombreDeBoulons(0)).toBe(true);
    expect(estUnNombreDeBoulons(12)).toBe(true);
    expect(estUnNombreDeBoulons(-1)).toBe(false);
    expect(estUnNombreDeBoulons(1.5)).toBe(false);
  });

  it("ajoute et retire un boulon, sans descendre sous 0", () => {
    expect(ajouterUnBoulon(12)).toBe(13);
    expect(retirerUnBoulon(12)).toBe(11);
    expect(retirerUnBoulon(0)).toBe(0);
  });

  it("écrit « 1 boulon », « 12 boulons », « 0 boulon »", () => {
    expect(formaterLesBoulons(0)).toBe("0 boulon");
    expect(formaterLesBoulons(1)).toBe("1 boulon");
    expect(formaterLesBoulons(12)).toBe("12 boulons");
  });
});

describe("fin d'aventure : recommencer au chapitre 1 en mode mortel", () => {
  it("propose de recommencer à 0 PV en mode mortel seulement", () => {
    expect(proposeDeRecommencer("mortel", 0)).toBe(true);
    expect(proposeDeRecommencer("mortel", 1)).toBe(false);
    expect(proposeDeRecommencer("simplifie", 0)).toBe(false);
    expect(proposeDeRecommencer("narratif", 0)).toBe(false);
  });

  it("choix par défaut : un nouveau personnage repart de zéro, sans armes ni équipement, mais garde les notes du lecteur", () => {
    const morte = {
      ...commencerAventure({
        talent: "Herbologie",
        mode: "mortel",
        pointsDeVieMax: 32,
        chance: 4,
      }),
      notes: "Piège au 74.",
      armes: [{ nom: "Épée courte", bonus: 1 }],
      besace: {
        objets: ["Corde"],
        bourse: true,
        boulons: 12,
        boulonsForces: false,
      },
      effets: [
        {
          nom: "Potion",
          duree: "24 h",
          cible: "dexterite" as const,
          valeur: 1,
        },
      ],
      chapitre: 112,
    };
    const nouvelle = commencerAventure({
      talent: "Instinct",
      mode: "mortel",
      pointsDeVieMax: 40,
      chance: 6,
    });

    const reprise = apresLaMort(nouvelle, morte);

    expect(reprise).toEqual({ ...nouvelle, notes: "Piège au 74." });
    expect(reprise.chapitre).toBe(1);
    expect(reprise.armes).toEqual([]);
    expect(reprise.besace).toEqual(besaceVide());
    expect(reprise.effets).toEqual([]);
    expect(reprise.combats).toEqual([]);
  });
});
