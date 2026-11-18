import { beforeEach, describe, expect, it } from "vitest";
import type { Aventure } from "./aventure";
import { combatNarratif, commencerUnCombat, jouerUnTour } from "./combat";
import { desFixes } from "./des";
import { CLE_STOCKAGE, ecrireAventure, lireAventure } from "./stockage";

const herboriste: Aventure = {
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
};

/** Un combat au § 112 après un tour : le lecteur touche (5 dégâts), l'ennemi aussi (5). */
const unTourAu112 = jouerUnTour(
  commencerUnCombat(
    {
      chapitre: 112,
      adversaires: 7,
      ennemi: { dexterite: 7, pointsDeVie: 50, bonus: 0 },
      premier: "lecteur",
    },
    { dexterite: 7, bonus: 1, pointsDeVie: 28, pointsDeVieMax: 32, chance: 4 },
  ),
  desFixes(2, 3, 3, 1, 1, 4),
);

describe("stockage de l'aventure", () => {
  beforeEach(() => localStorage.clear());

  it("ne trouve aucune aventure quand rien n'est enregistré", () => {
    expect(lireAventure(localStorage)).toBeNull();
  });

  it("relit l'aventure qui a été écrite", () => {
    ecrireAventure(localStorage, herboriste);
    expect(lireAventure(localStorage)).toEqual(herboriste);
  });

  it("enregistre l'aventure avec le numéro de version 10", () => {
    ecrireAventure(localStorage, herboriste);
    expect(JSON.parse(localStorage.getItem(CLE_STOCKAGE)!)).toEqual({
      version: 10,
      aventure: herboriste,
    });
  });

  it("ne trouve aucune aventure si l'enregistrement est illisible", () => {
    localStorage.setItem(CLE_STOCKAGE, "{pas du json");
    expect(lireAventure(localStorage)).toBeNull();
  });

  it("ne trouve aucune aventure si le personnage est incomplet", () => {
    const sansChance: Partial<Aventure["personnage"]> = {
      ...herboriste.personnage,
    };
    delete sansChance.chance;
    localStorage.setItem(
      CLE_STOCKAGE,
      JSON.stringify({
        version: 4,
        aventure: { ...herboriste, personnage: sansChance },
      }),
    );
    expect(lireAventure(localStorage)).toBeNull();
  });

  it("ne garde pas un enregistrement de la version 1, qui n'avait pas de personnage", () => {
    localStorage.setItem(
      CLE_STOCKAGE,
      JSON.stringify({ version: 1, aventure: { chapitre: 5 } }),
    );
    expect(lireAventure(localStorage)).toBeNull();
  });

  it("migre un enregistrement de la version 2 : aucune sauvegarde utilisée", () => {
    const ancienne: Partial<Aventure> = { ...herboriste };
    delete ancienne.sauvegardesUtilisees;
    localStorage.setItem(
      CLE_STOCKAGE,
      JSON.stringify({ version: 2, aventure: ancienne }),
    );
    expect(lireAventure(localStorage)).toEqual({
      ...herboriste,
      sauvegardesUtilisees: 0,
      sauvegarde: null,
      notes: "",
      armes: [],
    });
  });

  it("migre un enregistrement de la version 3 : notes vides", () => {
    const ancienne: Partial<Aventure> = { ...herboriste };
    delete ancienne.notes;
    localStorage.setItem(
      CLE_STOCKAGE,
      JSON.stringify({ version: 3, aventure: ancienne }),
    );
    expect(lireAventure(localStorage)).toEqual({ ...herboriste, notes: "" });
  });

  it("migre un enregistrement de la version 4 : aucune arme", () => {
    const ancienne: Partial<Aventure> = { ...herboriste };
    delete ancienne.armes;
    localStorage.setItem(
      CLE_STOCKAGE,
      JSON.stringify({ version: 4, aventure: ancienne }),
    );
    expect(lireAventure(localStorage)).toEqual({ ...herboriste, armes: [] });
  });

  it("migre un enregistrement de la version 5 : besace vide, sans bourse ni boulons", () => {
    const ancienne: Partial<Aventure> = { ...herboriste };
    delete ancienne.besace;
    localStorage.setItem(
      CLE_STOCKAGE,
      JSON.stringify({ version: 5, aventure: ancienne }),
    );
    expect(lireAventure(localStorage)).toEqual(herboriste);
  });

  it("migre un enregistrement de la version 6 : aucun effet", () => {
    const ancienne: Partial<Aventure> = { ...herboriste };
    delete ancienne.effets;
    localStorage.setItem(
      CLE_STOCKAGE,
      JSON.stringify({ version: 6, aventure: ancienne }),
    );
    expect(lireAventure(localStorage)).toEqual(herboriste);
  });

  it("migre un enregistrement de la version 7 : aucun combat en cours ni terminé", () => {
    const ancienne: Partial<Aventure> = { ...herboriste };
    delete ancienne.combat;
    delete ancienne.combats;
    localStorage.setItem(
      CLE_STOCKAGE,
      JSON.stringify({ version: 7, aventure: ancienne }),
    );
    expect(lireAventure(localStorage)).toEqual(herboriste);
  });

  it("retrouve le combat en cours et les combats terminés", () => {
    const enCombat: Aventure = {
      ...herboriste,
      combat: unTourAu112,
      combats: [{ ...unTourAu112, issue: "gagne" }],
    };
    ecrireAventure(localStorage, enCombat);
    expect(lireAventure(localStorage)).toEqual(enCombat);
  });

  it("migre un enregistrement de la version 8 : ses combats joués restent tels quels", () => {
    const combats = [{ ...unTourAu112, issue: "gagne" as const }];
    localStorage.setItem(
      CLE_STOCKAGE,
      JSON.stringify({ version: 8, aventure: { ...herboriste, combats } }),
    );
    expect(lireAventure(localStorage)).toEqual({ ...herboriste, combats });
  });

  it("migre un enregistrement de la version 9 : aucune sauvegarde posée, celles déjà utilisées restent comptées", () => {
    const ancienne: Partial<Aventure> = { ...herboriste };
    delete ancienne.sauvegarde;
    localStorage.setItem(
      CLE_STOCKAGE,
      JSON.stringify({ version: 9, aventure: ancienne }),
    );
    expect(lireAventure(localStorage)).toEqual({
      ...herboriste,
      sauvegarde: null,
      sauvegardesUtilisees: 1,
    });
  });

  it("retrouve la sauvegarde posée, avec l'état du personnage qu'elle garde", () => {
    const avecSauvegarde: Aventure = {
      ...herboriste,
      sauvegarde: {
        chapitre: 87,
        personnage: herboriste.personnage,
        armes: [{ nom: "Épée courte", bonus: 1 }],
        besace: {
          objets: ["Corde de chanvre"],
          bourse: true,
          boulons: 12,
          boulonsForces: false,
        },
        effets: [
          { nom: "Bague", duree: "", cible: "pointsDeVieMax", valeur: 2 },
        ],
      },
    };
    ecrireAventure(localStorage, avecSauvegarde);
    expect(lireAventure(localStorage)).toEqual(avecSauvegarde);
  });

  it("ne trouve aucune aventure si la sauvegarde est mal formée", () => {
    const bonne = {
      chapitre: 87,
      personnage: herboriste.personnage,
      armes: [],
      besace: herboriste.besace,
      effets: [],
    };
    const { chapitre, ...sansChapitre } = bonne;
    void chapitre;
    for (const sauvegarde of [
      sansChapitre,
      { ...bonne, chapitre: 0 },
      { ...bonne, personnage: { talent: "Herbologie" } },
      { ...bonne, armes: "épée" },
      { ...bonne, besace: null },
      { ...bonne, effets: [{ nom: "Bague" }] },
      "87",
    ]) {
      localStorage.setItem(
        CLE_STOCKAGE,
        JSON.stringify({
          version: 10,
          aventure: { ...herboriste, sauvegarde },
        }),
      );
      expect(lireAventure(localStorage)).toBeNull();
    }
  });

  it("retrouve un combat perdu noté « repris au § 87 »", () => {
    const perdu = {
      ...unTourAu112,
      issue: "perdu" as const,
      repriseAu: 87,
    };
    const aventure: Aventure = { ...herboriste, combats: [perdu] };
    ecrireAventure(localStorage, aventure);
    expect(lireAventure(localStorage)).toEqual(aventure);
    localStorage.setItem(
      CLE_STOCKAGE,
      JSON.stringify({
        version: 10,
        aventure: { ...aventure, combats: [{ ...perdu, repriseAu: 0 }] },
      }),
    );
    expect(lireAventure(localStorage)).toBeNull();
  });

  it("retrouve les combats narratifs, parmi les combats joués", () => {
    const narratif: Aventure = {
      ...herboriste,
      mode: "narratif",
      combats: [combatNarratif(98, 1, "gagne"), combatNarratif(61, 3, "perdu")],
    };
    ecrireAventure(localStorage, narratif);
    expect(lireAventure(localStorage)).toEqual(narratif);
  });

  it("ne trouve aucune aventure si un combat narratif est mal formé", () => {
    for (const combat of [
      { narratif: true, chapitre: 98, adversaires: 1 },
      { narratif: true, chapitre: 98, adversaires: 1, issue: "interrompu" },
      { narratif: true, chapitre: 0, adversaires: 1, issue: "gagne" },
      { narratif: true, chapitre: 98, adversaires: 0, issue: "gagne" },
      { narratif: false, chapitre: 98, adversaires: 1, issue: "gagne" },
    ]) {
      localStorage.setItem(
        CLE_STOCKAGE,
        JSON.stringify({
          version: 10,
          aventure: { ...herboriste, combats: [combat] },
        }),
      );
      expect(lireAventure(localStorage)).toBeNull();
    }
  });

  it("ne trouve aucune aventure si un combat est mal formé", () => {
    const jet = unTourAu112.jets[0];
    for (const combat of [
      "combat",
      { ...unTourAu112, chapitre: 0 },
      { ...unTourAu112, issue: "fui" },
      { ...unTourAu112, premier: "personne" },
      { ...unTourAu112, pointsDeVie: { lecteur: 3 } },
      { ...unTourAu112, depart: { lecteur: null, ennemi: null } },
      { ...unTourAu112, jets: [{ ...jet, des: [2] }] },
      { ...unTourAu112, jets: [{ ...jet, degats: { de: 3 } }] },
    ]) {
      localStorage.setItem(
        CLE_STOCKAGE,
        JSON.stringify({ version: 8, aventure: { ...herboriste, combat } }),
      );
      expect(lireAventure(localStorage)).toBeNull();
      localStorage.setItem(
        CLE_STOCKAGE,
        JSON.stringify({
          version: 8,
          aventure: { ...herboriste, combats: [combat] },
        }),
      );
      expect(lireAventure(localStorage)).toBeNull();
    }
  });

  it("retrouve les effets et les rappels enregistrés", () => {
    const sousEffet: Aventure = {
      ...herboriste,
      effets: [
        {
          nom: "Potion d'agilité",
          duree: "24 h",
          cible: "dexterite",
          valeur: 1,
        },
        {
          nom: "retourner voir l'herboriste",
          duree: "",
          cible: null,
          valeur: 0,
        },
      ],
    };
    ecrireAventure(localStorage, sousEffet);
    expect(lireAventure(localStorage)).toEqual(sousEffet);
  });

  it("retrouve une base de CHANCE sous 0 quand un effet la soutient (sa CHANCE prêtée a été dépensée)", () => {
    const depense: Aventure = {
      ...herboriste,
      effets: [{ nom: "Trèfle", duree: "", cible: "chance", valeur: 2 }],
      personnage: { ...herboriste.personnage, chance: -1 },
    };
    ecrireAventure(localStorage, depense);
    expect(lireAventure(localStorage)).toEqual(depense);
  });

  it("ne trouve aucune aventure si un effet est mal formé", () => {
    const bon = { nom: "Potion", duree: "", cible: "dexterite", valeur: 1 };
    for (const effets of [
      "potion",
      [null],
      [{ ...bon, nom: 3 }],
      [{ ...bon, duree: null }],
      [{ ...bon, cible: "force" }],
      [{ ...bon, valeur: 1.5 }],
    ]) {
      localStorage.setItem(
        CLE_STOCKAGE,
        JSON.stringify({ version: 7, aventure: { ...herboriste, effets } }),
      );
      expect(lireAventure(localStorage)).toBeNull();
    }
  });

  it("retrouve la besace, la bourse et les boulons enregistrés", () => {
    const chargee = {
      ...herboriste,
      besace: {
        objets: ["Corde de chanvre"],
        bourse: true,
        boulons: 12,
        boulonsForces: false,
      },
    };
    ecrireAventure(localStorage, chargee);
    expect(lireAventure(localStorage)).toEqual(chargee);
  });

  it("ne trouve aucune aventure si la besace est mal formée", () => {
    for (const besace of [
      null,
      "sac",
      { objets: "corde", bourse: true, boulons: 0, boulonsForces: false },
      { objets: [3], bourse: true, boulons: 0, boulonsForces: false },
      { objets: [], bourse: "oui", boulons: 0, boulonsForces: false },
      { objets: [], bourse: true, boulons: -2, boulonsForces: false },
      { objets: [], bourse: true, boulons: 1.5, boulonsForces: false },
      { objets: [], bourse: true, boulons: 0, boulonsForces: 1 },
    ]) {
      localStorage.setItem(
        CLE_STOCKAGE,
        JSON.stringify({ version: 6, aventure: { ...herboriste, besace } }),
      );
      expect(lireAventure(localStorage)).toBeNull();
    }
  });

  it("retrouve les armes enregistrées", () => {
    const armee = { ...herboriste, armes: [{ nom: "Épée courte", bonus: 1 }] };
    ecrireAventure(localStorage, armee);
    expect(lireAventure(localStorage)).toEqual(armee);
  });

  it("ne trouve aucune aventure si une arme n'a pas de nom ou un bonus entier", () => {
    for (const armes of [
      "épée",
      [{ nom: 3, bonus: 1 }],
      [{ nom: "Épée", bonus: 1.5 }],
      [null],
    ]) {
      localStorage.setItem(
        CLE_STOCKAGE,
        JSON.stringify({ version: 6, aventure: { ...herboriste, armes } }),
      );
      expect(lireAventure(localStorage)).toBeNull();
    }
  });

  it("ne trouve aucune aventure si les notes ne sont pas du texte", () => {
    localStorage.setItem(
      CLE_STOCKAGE,
      JSON.stringify({ version: 6, aventure: { ...herboriste, notes: 12 } }),
    );
    expect(lireAventure(localStorage)).toBeNull();
  });

  it("ne trouve aucune aventure si les sauvegardes utilisées dépassent 3", () => {
    localStorage.setItem(
      CLE_STOCKAGE,
      JSON.stringify({
        version: 4,
        aventure: { ...herboriste, sauvegardesUtilisees: 4 },
      }),
    );
    expect(lireAventure(localStorage)).toBeNull();
  });

  it("ne trouve aucune aventure si la version est inconnue", () => {
    localStorage.setItem(
      CLE_STOCKAGE,
      JSON.stringify({ version: 99, aventure: herboriste }),
    );
    expect(lireAventure(localStorage)).toBeNull();
  });

  it("n'écrase pas l'enregistrement d'une version plus récente de l'app", () => {
    const plusRecent = JSON.stringify({ version: 99, aventure: { page: 5 } });
    localStorage.setItem(CLE_STOCKAGE, plusRecent);
    ecrireAventure(localStorage, herboriste);
    expect(localStorage.getItem(CLE_STOCKAGE)).toBe(plusRecent);
  });
});
