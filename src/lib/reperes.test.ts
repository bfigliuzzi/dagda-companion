import { describe, expect, it } from "vitest";
import type { Case } from "./cases";
import {
  chapitreAbsentAAnnoncer,
  estUnRepere,
  numeroDuRepere,
  poserLeRepere,
  repereAffiche,
  repereApres,
  type Repere,
} from "./reperes";

const uneCase = (
  colonne: number,
  ligne: number,
  chapitre: number | null,
  ordre = 1,
): Case => ({ colonne, ligne, chapitre, note: "", ordre });

const repere = (
  colonne: number,
  ligne: number,
  chapitre: number,
  manuel = false,
): Repere => ({ colonne, ligne, chapitre, manuel });

describe("où est le repère", () => {
  it("sans repère et sans case pour le chapitre : nulle part", () => {
    expect(repereApres(null, [uneCase(1, 1, 47)], 203)).toBeNull();
  });

  it("se place sur la case dont le numéro est le dernier chapitre lu", () => {
    const cases = [uneCase(1, 1, 47), uneCase(3, 2, 203)];
    expect(repereApres(null, cases, 203)).toEqual(repere(3, 2, 203));
  });

  it("changer le chapitre le déplace", () => {
    const cases = [uneCase(1, 1, 47), uneCase(3, 2, 203)];
    const sur203 = repereApres(null, cases, 203);
    expect(repereApres(sur203, cases, 47)).toEqual(repere(1, 1, 47));
  });

  it("deux cases au même numéro : la dernière numérotée", () => {
    const cases = [
      uneCase(1, 1, 47, 3),
      uneCase(4, 4, 47, 5),
      uneCase(2, 2, 47, 4),
    ];
    expect(repereApres(null, cases, 47)).toEqual(repere(4, 4, 47));
  });

  it("chapitre absent : le repère reste où il était, et n'est plus à jour du chapitre", () => {
    const cases = [uneCase(3, 2, 203)];
    const sur203 = repereApres(null, cases, 203);
    expect(repereApres(sur203, cases, 205)).toEqual(repere(3, 2, 203));
  });

  it("chapitre absent, plusieurs fois de suite : il reste toujours au même endroit", () => {
    const cases = [uneCase(3, 2, 203)];
    let r = repereApres(null, cases, 203);
    r = repereApres(r, cases, 205);
    r = repereApres(r, cases, 206);
    expect(r).toEqual(repere(3, 2, 203));
  });

  it("revient sur une case dès que le chapitre y est de nouveau", () => {
    const cases = [uneCase(3, 2, 203)];
    let r = repereApres(null, cases, 203);
    r = repereApres(r, cases, 205);
    expect(repereApres(r, cases, 203)).toEqual(repere(3, 2, 203));
  });

  it("écrire le chapitre courant dans une case y amène le repère", () => {
    const avant = [uneCase(3, 2, 203)];
    const r = repereApres(repereApres(null, avant, 203), avant, 205);
    const apres = [...avant, uneCase(5, 5, 205, 2)];
    expect(repereApres(r, apres, 205)).toEqual(repere(5, 5, 205));
  });

  it("vider la case du repère le laisse en place", () => {
    const r = repereApres(null, [uneCase(3, 2, 203)], 203);
    expect(repereApres(r, [], 203)).toEqual(repere(3, 2, 203));
  });
});

describe("poser le repère à la main", () => {
  it("le repère va sur la case choisie, pour le chapitre courant", () => {
    expect(poserLeRepere(4, 1, 203)).toEqual(repere(4, 1, 203, true));
  });

  it("il y reste tant que le chapitre ne change pas, même si une case porte ce numéro", () => {
    const cases = [uneCase(3, 2, 203)];
    const pose = poserLeRepere(4, 1, 203);
    expect(repereApres(pose, cases, 203)).toEqual(pose);
  });

  it("au prochain changement de chapitre, le repère suit de nouveau le chapitre", () => {
    const cases = [uneCase(3, 2, 203), uneCase(1, 1, 47)];
    const pose = poserLeRepere(4, 1, 203);
    expect(repereApres(pose, cases, 47)).toEqual(repere(1, 1, 47));
  });

  it("chapitre absent après une pose à la main : il reste là, et la pose ne revient pas avec le chapitre d'avant", () => {
    const cases = [uneCase(3, 2, 203)];
    let r: Repere | null = poserLeRepere(4, 1, 203);
    r = repereApres(r, cases, 205);
    expect(r).toEqual(repere(4, 1, 203));
    // De retour au 203 : la case du 203 reprend le repère.
    expect(repereApres(r, cases, 203)).toEqual(repere(3, 2, 203));
  });
});

describe("plein ou pâle", () => {
  it("plein sur la case qui porte le chapitre lu", () => {
    const cases = [uneCase(3, 2, 47)];
    expect(repereAffiche(repere(3, 2, 47), cases, 47)).toEqual({
      colonne: 3,
      ligne: 2,
      pale: false,
    });
  });

  it("pâle quand le chapitre lu a changé et n'est sur aucune case", () => {
    const cases = [uneCase(3, 2, 47)];
    expect(repereAffiche(repere(3, 2, 47), cases, 48)?.pale).toBe(true);
  });

  it("pâle quand sa case a été vidée, même si le chapitre lu n'a pas changé", () => {
    expect(repereAffiche(repere(3, 2, 47), [], 47)?.pale).toBe(true);
  });

  it("pâle quand le numéro de sa case a été remplacé", () => {
    const cases = [uneCase(3, 2, 48)];
    expect(repereAffiche(repere(3, 2, 47), cases, 47)?.pale).toBe(true);
  });

  it("posé à la main pour le chapitre lu : plein, même sur une case vide", () => {
    expect(repereAffiche(repere(3, 2, 47, true), [], 47)?.pale).toBe(false);
  });

  it("posé à la main pour un autre chapitre : pâle", () => {
    expect(repereAffiche(repere(3, 2, 47, true), [], 48)?.pale).toBe(true);
  });

  it("pas de repère : rien à montrer", () => {
    expect(repereAffiche(null, [uneCase(3, 2, 47)], 47)).toBeNull();
  });
});

describe("le numéro de la ligne du plan (« ici § N »)", () => {
  it("le numéro de la case du repère plein", () => {
    expect(numeroDuRepere(repere(3, 2, 47), [uneCase(3, 2, 47)], 47)).toBe(47);
  });

  it("rien quand le repère est pâle, même sur une case numérotée", () => {
    expect(
      numeroDuRepere(repere(3, 2, 47), [uneCase(3, 2, 47)], 48),
    ).toBeNull();
  });

  it("rien quand le repère plein est sur une case sans numéro", () => {
    expect(numeroDuRepere(repere(3, 2, 47, true), [], 47)).toBeNull();
  });

  it("rien sans repère", () => {
    expect(numeroDuRepere(null, [uneCase(3, 2, 47)], 47)).toBeNull();
  });
});

describe("l'indice « § N n'est pas sur ce plan »", () => {
  it("quand le repère est pâle", () => {
    expect(chapitreAbsentAAnnoncer(repere(3, 2, 47), [], 47)).toBe(true);
  });

  it("pas quand le repère est plein", () => {
    const cases = [uneCase(3, 2, 47)];
    expect(chapitreAbsentAAnnoncer(repere(3, 2, 47), cases, 47)).toBe(false);
  });

  it("sans repère : seulement si une case est numérotée", () => {
    expect(chapitreAbsentAAnnoncer(null, [uneCase(1, 1, 12)], 47)).toBe(true);
    const note = { ...uneCase(1, 1, null), note: "clé" };
    expect(chapitreAbsentAAnnoncer(null, [note], 47)).toBe(false);
    expect(chapitreAbsentAAnnoncer(null, [], 47)).toBe(false);
  });
});

describe("relire un repère", () => {
  it("accepte un repère bien formé et null", () => {
    expect(estUnRepere(null)).toBe(true);
    expect(estUnRepere(repere(-1, 2, 47, true))).toBe(true);
  });

  it("refuse le reste", () => {
    expect(estUnRepere(undefined)).toBe(false);
    expect(estUnRepere({ colonne: 1, ligne: 2 })).toBe(false);
    expect(estUnRepere({ ...repere(1, 2, 3), manuel: "oui" })).toBe(false);
    expect(estUnRepere({ ...repere(1.5, 2, 3) })).toBe(false);
  });
});
