import { describe, expect, it } from "vitest";
import { deAuHasard, desFixes, tirerChance, tirerPointsDeVieMax } from "./des";

describe("dés de création", () => {
  it("donne 32 POINTS DE VIE max quand les 2d6 font 3 et 5", () => {
    expect(tirerPointsDeVieMax(desFixes(3, 5))).toEqual({
      obtenu: 8,
      valeur: 32,
    });
  });

  it("donne au moins 8 POINTS DE VIE max (double 1)", () => {
    expect(tirerPointsDeVieMax(desFixes(1, 1)).valeur).toBe(8);
  });

  it("donne au plus 48 POINTS DE VIE max (double 6)", () => {
    expect(tirerPointsDeVieMax(desFixes(6, 6)).valeur).toBe(48);
  });

  it("donne la CHANCE du d6 tiré", () => {
    expect(tirerChance(desFixes(1))).toBe(1);
    expect(tirerChance(desFixes(6))).toBe(6);
  });

  it("tire au hasard un entier de 1 à 6", () => {
    const tirages = Array.from({ length: 2000 }, deAuHasard);
    expect(tirages.every(Number.isInteger)).toBe(true);
    expect(new Set(tirages)).toEqual(new Set([1, 2, 3, 4, 5, 6]));
  });

  it("garde les POINTS DE VIE max entre 8 et 48 avec des dés au hasard", () => {
    const valeurs = Array.from(
      { length: 2000 },
      () => tirerPointsDeVieMax(deAuHasard).valeur,
    );
    expect(Math.min(...valeurs)).toBeGreaterThanOrEqual(8);
    expect(Math.max(...valeurs)).toBeLessThanOrEqual(48);
    expect(valeurs.every((v) => v % 4 === 0)).toBe(true);
  });
});
