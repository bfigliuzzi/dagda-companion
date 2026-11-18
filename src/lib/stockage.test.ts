import { beforeEach, describe, expect, it } from "vitest";
import { CLE_STOCKAGE, ecrireAventure, lireAventure } from "./stockage";

describe("stockage de l'aventure", () => {
  beforeEach(() => localStorage.clear());

  it("commence au chapitre 1 quand rien n'est enregistré", () => {
    expect(lireAventure(localStorage)).toEqual({ chapitre: 1 });
  });

  it("relit le dernier chapitre lu qui a été écrit", () => {
    ecrireAventure(localStorage, { chapitre: 112 });
    expect(lireAventure(localStorage)).toEqual({ chapitre: 112 });
  });

  it("enregistre l'aventure avec le numéro de version 1", () => {
    ecrireAventure(localStorage, { chapitre: 112 });
    expect(JSON.parse(localStorage.getItem(CLE_STOCKAGE)!)).toEqual({
      version: 1,
      aventure: { chapitre: 112 },
    });
  });

  it("repart d'une aventure neuve si l'enregistrement est illisible", () => {
    localStorage.setItem(CLE_STOCKAGE, "{pas du json");
    expect(lireAventure(localStorage)).toEqual({ chapitre: 1 });
  });

  it("repart d'une aventure neuve si la version est inconnue", () => {
    localStorage.setItem(
      CLE_STOCKAGE,
      JSON.stringify({ version: 99, aventure: { chapitre: 5 } }),
    );
    expect(lireAventure(localStorage)).toEqual({ chapitre: 1 });
  });

  it("n'écrase pas l'enregistrement d'une version plus récente de l'app", () => {
    const plusRecent = JSON.stringify({ version: 99, aventure: { page: 5 } });
    localStorage.setItem(CLE_STOCKAGE, plusRecent);
    ecrireAventure(localStorage, { chapitre: 1 });
    expect(localStorage.getItem(CLE_STOCKAGE)).toBe(plusRecent);
  });
});
