import { describe, expect, it } from "vitest";
import {
  autresCasesDuChapitre,
  definirLaCase,
  derniereCaseNumerotee,
  estUneCase,
  laCase,
  LONGUEUR_MAX_DE_LA_NOTE,
  nomAccessible,
  nomDeLaCase,
  type Case,
} from "./cases";
import type { Grille } from "./plans";

const grille: Grille = { colonne: 0, ligne: 0, colonnes: 8, lignes: 8 };

describe("definirLaCase", () => {
  it("crée une case avec son numéro et sa note", () => {
    const cases = definirLaCase([], 2, 4, { chapitre: 47, note: "clé" });
    expect(cases).toEqual([
      { colonne: 2, ligne: 4, chapitre: 47, note: "clé", ordre: 1 },
    ]);
  });

  it("garde la même liste quand rien ne change", () => {
    const cases = definirLaCase([], 2, 4, { chapitre: 47, note: "clé" });
    expect(definirLaCase(cases, 2, 4, { chapitre: 47, note: "clé" })).toBe(
      cases,
    );
    expect(definirLaCase(cases, 0, 0, { chapitre: null, note: "" })).toBe(
      cases,
    );
  });

  it("retire la case quand il n'y a ni numéro ni note", () => {
    const cases = definirLaCase([], 2, 4, { chapitre: 47, note: "clé" });
    expect(definirLaCase(cases, 2, 4, { chapitre: null, note: "" })).toEqual(
      [],
    );
  });

  it("garde une case qui n'a qu'une note, ou qu'un numéro", () => {
    const note = definirLaCase([], 0, 0, { chapitre: null, note: "piège" });
    expect(note).toHaveLength(1);
    expect(note[0].chapitre).toBeNull();
    expect(definirLaCase([], 0, 0, { chapitre: 3, note: "" })).toHaveLength(1);
  });

  it("numérote l'ordre d'écriture : chaque nouveau numéro passe devant les autres", () => {
    let cases = definirLaCase([], 0, 0, { chapitre: 10, note: "" });
    cases = definirLaCase(cases, 1, 0, { chapitre: 20, note: "" });
    cases = definirLaCase(cases, 0, 0, { chapitre: 11, note: "" });
    expect(laCase(cases, 0, 0)?.ordre).toBe(3);
    expect(laCase(cases, 1, 0)?.ordre).toBe(2);
  });

  it("garde le rang d'une case déjà la dernière écrite quand on corrige son numéro", () => {
    let cases = definirLaCase([], 0, 0, { chapitre: 10, note: "" });
    cases = definirLaCase(cases, 1, 0, { chapitre: 4, note: "" });
    cases = definirLaCase(cases, 1, 0, { chapitre: 47, note: "" });
    expect(laCase(cases, 1, 0)?.ordre).toBe(2);
  });

  it("ne change pas l'ordre quand seule la note change", () => {
    let cases = definirLaCase([], 0, 0, { chapitre: 10, note: "" });
    cases = definirLaCase(cases, 1, 0, { chapitre: 20, note: "" });
    cases = definirLaCase(cases, 0, 0, { chapitre: 10, note: "porte" });
    expect(laCase(cases, 0, 0)?.ordre).toBe(1);
  });

  it("coupe la note à la longueur maximale", () => {
    const cases = definirLaCase([], 0, 0, {
      chapitre: null,
      note: "a".repeat(LONGUEUR_MAX_DE_LA_NOTE + 10),
    });
    expect(cases[0].note).toHaveLength(LONGUEUR_MAX_DE_LA_NOTE);
  });

  it("accepte des coordonnées négatives", () => {
    const cases = definirLaCase([], -2, -1, { chapitre: 5, note: "" });
    expect(laCase(cases, -2, -1)?.chapitre).toBe(5);
  });
});

describe("noms des cases", () => {
  it("compte colonne-ligne à partir de 1 depuis le coin haut-gauche de la grille", () => {
    expect(nomDeLaCase(grille, 2, 4)).toBe("3-5");
  });

  it("suit le coin de la grille quand elle a grandi vers le haut et la gauche", () => {
    const grandie: Grille = { colonne: -2, ligne: -1, colonnes: 10, lignes: 9 };
    expect(nomDeLaCase(grandie, -2, -1)).toBe("1-1");
    expect(nomDeLaCase(grandie, 0, 0)).toBe("3-2");
  });

  it("dit le numéro et la note dans le nom lu par les lecteurs d'écran", () => {
    const pleine: Case = {
      colonne: 2,
      ligne: 4,
      chapitre: 47,
      note: "clé",
      ordre: 1,
    };
    expect(nomAccessible(grille, 2, 4, pleine)).toBe(
      "Case 3-5, chapitre 47, note : clé",
    );
    expect(nomAccessible(grille, 2, 4, { ...pleine, note: "" })).toBe(
      "Case 3-5, chapitre 47",
    );
    expect(nomAccessible(grille, 2, 4, { ...pleine, chapitre: null })).toBe(
      "Case 3-5, note : clé",
    );
    expect(nomAccessible(grille, 2, 4, undefined)).toBe("Case 3-5");
  });
});

describe("numéros en double", () => {
  const cases = definirLaCase(
    definirLaCase(definirLaCase([], 0, 0, { chapitre: 47, note: "" }), 3, 3, {
      chapitre: 12,
      note: "",
    }),
    5,
    1,
    { chapitre: 47, note: "" },
  );

  it("liste les autres cases qui portent le même numéro", () => {
    expect(
      autresCasesDuChapitre(cases, 47, 0, 0).map((c) => c.colonne),
    ).toEqual([5]);
    expect(autresCasesDuChapitre(cases, 12, 3, 3)).toEqual([]);
  });

  it("retrouve la dernière case numérotée avec un numéro", () => {
    expect(derniereCaseNumerotee(cases, 47)).toMatchObject({
      colonne: 5,
      ligne: 1,
    });
    expect(derniereCaseNumerotee(cases, 99)).toBeUndefined();
  });
});

describe("estUneCase", () => {
  const bonne = { colonne: -1, ligne: 2, chapitre: 4, note: "x", ordre: 3 };
  it("reconnaît une case enregistrée", () => {
    expect(estUneCase(bonne)).toBe(true);
    expect(estUneCase({ ...bonne, chapitre: null })).toBe(true);
  });
  it("refuse une case abîmée", () => {
    expect(estUneCase({ ...bonne, chapitre: 0 })).toBe(false);
    expect(estUneCase({ ...bonne, note: 3 })).toBe(false);
    expect(estUneCase({ ...bonne, colonne: 1.5 })).toBe(false);
    expect(estUneCase(null)).toBe(false);
  });
});
