import { beforeEach, describe, expect, it } from "vitest";
import type { Aventure } from "./aventure";
import { CLE_STOCKAGE, ecrireAventure, lireAventure } from "./stockage";

const herboriste: Aventure = {
  chapitre: 112,
  mode: "simplifie",
  sauvegardesUtilisees: 1,
  notes: "",
  armes: [],
  personnage: {
    talent: "Herbologie",
    pointsDeVieMax: 32,
    pointsDeVie: 28,
    chance: 4,
    dexterite: 7,
  },
};

describe("stockage de l'aventure", () => {
  beforeEach(() => localStorage.clear());

  it("ne trouve aucune aventure quand rien n'est enregistré", () => {
    expect(lireAventure(localStorage)).toBeNull();
  });

  it("relit l'aventure qui a été écrite", () => {
    ecrireAventure(localStorage, herboriste);
    expect(lireAventure(localStorage)).toEqual(herboriste);
  });

  it("enregistre l'aventure avec le numéro de version 5", () => {
    ecrireAventure(localStorage, herboriste);
    expect(JSON.parse(localStorage.getItem(CLE_STOCKAGE)!)).toEqual({
      version: 5,
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
        JSON.stringify({ version: 5, aventure: { ...herboriste, armes } }),
      );
      expect(lireAventure(localStorage)).toBeNull();
    }
  });

  it("ne trouve aucune aventure si les notes ne sont pas du texte", () => {
    localStorage.setItem(
      CLE_STOCKAGE,
      JSON.stringify({ version: 5, aventure: { ...herboriste, notes: 12 } }),
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
