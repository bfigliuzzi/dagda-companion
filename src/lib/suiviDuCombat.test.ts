import { describe, expect, it } from "vitest";
import { commencerUnCombat, jouerUnTour, type Combat } from "./combat";
import { desFixes } from "./des";
import { quitterLeCombat, suivreLeCombat } from "./suiviDuCombat";
import { uneAventure } from "./test/uneAventure";
import type { Effet } from "./valeursEffectives";

/** Un combat au § 61, commencé à 28 PV et 4 de CHANCE. */
const auChapitre61: Combat = commencerUnCombat(
  {
    chapitre: 61,
    adversaires: 1,
    ennemi: { dexterite: 7, pointsDeVie: 10, bonus: 0 },
    premier: "lecteur",
  },
  { dexterite: 7, bonus: 1, pointsDeVie: 28, pointsDeVieMax: 32, chance: 4 },
);

/** Le même combat après un tour : le lecteur est à 23 PV et a dépensé 1 CHANCE. */
const apresUnTour: Combat = {
  ...auChapitre61,
  pointsDeVie: { lecteur: 23, ennemi: 6 },
  chance: 3,
};

const elixir: Effet = {
  nom: "Élixir de vigueur",
  duree: "",
  cible: "pointsDeVie",
  valeur: 2,
};

describe("la feuille suit le combat en cours", () => {
  it("prend les PV et la CHANCE du combat, et garde le combat en cours", () => {
    const apres = suivreLeCombat(uneAventure(), apresUnTour);
    expect(apres.personnage.pointsDeVie).toBe(23);
    expect(apres.personnage.chance).toBe(3);
    expect(apres.combat).toEqual(apresUnTour);
    expect(apres.combats).toEqual([]);
  });

  it("enregistre la base : avec un élixir +2, 23 PV affichés donnent une base de 21", () => {
    const apres = suivreLeCombat(
      uneAventure({ effets: [elixir] }),
      apresUnTour,
    );
    expect(apres.personnage.pointsDeVie).toBe(21);
  });

  it("fini, le combat quitte l'aventure en cours et rejoint l'historique", () => {
    const perdu: Combat = {
      ...apresUnTour,
      pointsDeVie: { lecteur: 0, ennemi: 6 },
      issue: "perdu",
    };
    const apres = suivreLeCombat(uneAventure(), perdu);
    expect(apres.combat).toBeNull();
    expect(apres.combats).toEqual([perdu]);
    expect(apres.personnage.pointsDeVie).toBe(0);
  });

  it("ne modifie pas l'aventure qu'on lui donne", () => {
    const aventure = uneAventure();
    const copie = structuredClone(aventure);
    suivreLeCombat(aventure, apresUnTour);
    expect(aventure).toEqual(copie);
  });
});

describe("quitter le combat en cours", () => {
  it("sans aucun jet, rien n'est noté dans l'historique", () => {
    const apres = quitterLeCombat(
      uneAventure({ combat: auChapitre61 }),
      auChapitre61,
    );
    expect(apres.combat).toBeNull();
    expect(apres.combats).toEqual([]);
  });

  it("après des jets, le combat interrompu rejoint l'historique", () => {
    // 2d6 = 12 : chaque camp manque son coup.
    const joue = jouerUnTour(auChapitre61, desFixes(6, 6));
    const apres = quitterLeCombat(uneAventure({ combat: joue }), joue);
    expect(apres.combat).toBeNull();
    expect(apres.combats).toHaveLength(1);
    expect(apres.combats[0]).toMatchObject({ issue: "interrompu" });
  });
});
