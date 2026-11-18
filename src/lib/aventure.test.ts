import { describe, expect, it } from "vitest";
import {
  ceQuiManqueEnRoute,
  commencerAventure,
  recopierAventure,
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
