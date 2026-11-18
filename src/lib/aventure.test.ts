import { describe, expect, it } from "vitest";
import {
  ajouterUnPointDeVie,
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
      notes: "",
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
