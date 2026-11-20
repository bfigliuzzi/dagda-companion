import { describe, expect, it } from "vitest";
import { commencerUnCombat, type Combat } from "./combat";
import {
  apresLeTour,
  ecranDeDepart,
  fermerLHistorique,
  laFeuille,
  ouvrirLHistorique,
  retourDuCombat,
} from "./ecrans";
import { uneAventure } from "./test/uneAventure";

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

describe("l'écran à l'ouverture de l'app", () => {
  it("sans aventure, « Nouvel apprenti »", () => {
    expect(ecranDeDepart(null)).toEqual({
      nom: "nouvelApprenti",
      apresLaMort: null,
    });
  });

  it("avec une aventure, la feuille, sans trace de craie", () => {
    expect(ecranDeDepart(uneAventure())).toEqual(laFeuille());
    expect(laFeuille()).toEqual({ nom: "feuille", avant: {} });
  });

  it("avec un combat en cours, le combat", () => {
    expect(ecranDeDepart(uneAventure({ combat: auChapitre61 }))).toEqual({
      nom: "combat",
    });
  });
});

describe("après un tour de combat", () => {
  it("le combat continue tant qu'il n'a pas d'issue", () => {
    expect(apresLeTour(auChapitre61)).toEqual({ nom: "combat" });
  });

  it("fini, son résultat s'affiche", () => {
    const gagne: Combat = { ...auChapitre61, issue: "gagne" };
    expect(apresLeTour(gagne)).toEqual({ nom: "resultat", combat: gagne });
  });
});

describe("retour sur la feuille et écran « Combats »", () => {
  it("après un combat, la feuille part des PV et de la CHANCE d'avant lui", () => {
    expect(retourDuCombat(auChapitre61)).toEqual(
      laFeuille({ pointsDeVie: 28, chance: 4 }),
    );
  });

  it("l'écran « Combats » rend la feuille avec la trace qu'elle attendait", () => {
    const feuille = retourDuCombat(auChapitre61);
    const historique = ouvrirLHistorique(feuille, 3);
    expect(historique).toEqual({
      nom: "historique",
      deplie: 3,
      avant: { pointsDeVie: 28, chance: 4 },
    });
    expect(fermerLHistorique(historique)).toEqual(feuille);
  });

  it("ouvert depuis la feuille, sans combat déplié", () => {
    expect(ouvrirLHistorique(laFeuille())).toEqual({
      nom: "historique",
      deplie: null,
      avant: {},
    });
  });
});
