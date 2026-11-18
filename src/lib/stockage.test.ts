import { beforeEach, describe, expect, it } from "vitest";
import { CLE_STOCKAGE, ecrirePartie, lirePartie } from "./stockage";

describe("stockage de la partie", () => {
  beforeEach(() => localStorage.clear());

  it("commence au chapitre 1 quand rien n'est enregistré", () => {
    expect(lirePartie(localStorage)).toEqual({ chapitre: 1 });
  });

  it("relit le dernier chapitre lu qui a été écrit", () => {
    ecrirePartie(localStorage, { chapitre: 112 });
    expect(lirePartie(localStorage)).toEqual({ chapitre: 112 });
  });

  it("enregistre la partie avec le numéro de version 1", () => {
    ecrirePartie(localStorage, { chapitre: 112 });
    expect(JSON.parse(localStorage.getItem(CLE_STOCKAGE)!)).toEqual({
      version: 1,
      partie: { chapitre: 112 },
    });
  });

  it("repart d'une partie neuve si l'enregistrement est illisible", () => {
    localStorage.setItem(CLE_STOCKAGE, "{pas du json");
    expect(lirePartie(localStorage)).toEqual({ chapitre: 1 });
  });

  it("repart d'une partie neuve si la version est inconnue", () => {
    localStorage.setItem(
      CLE_STOCKAGE,
      JSON.stringify({ version: 99, partie: { chapitre: 5 } }),
    );
    expect(lirePartie(localStorage)).toEqual({ chapitre: 1 });
  });

  it("n'écrase pas l'enregistrement d'une version plus récente de l'app", () => {
    const plusRecent = JSON.stringify({ version: 99, partie: { page: 5 } });
    localStorage.setItem(CLE_STOCKAGE, plusRecent);
    ecrirePartie(localStorage, { chapitre: 1 });
    expect(localStorage.getItem(CLE_STOCKAGE)).toBe(plusRecent);
  });
});
