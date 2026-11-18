import { describe, expect, it } from "vitest";
import {
  ajusterLeTotal,
  changerLAjustement,
  formaterUnAjustement,
} from "./chance";

describe("ajuster un total avec la CHANCE", () => {
  it("exemple du livre : il faut 5, le dé donne 3, 2 points de CHANCE règlent le total sur 5", () => {
    expect(ajusterLeTotal(3, 2, 6)).toEqual({
      ajustement: 2,
      total: 5,
      cout: 2,
    });
  });

  it("ne change rien sans ajustement : total d'origine, aucun coût", () => {
    expect(ajusterLeTotal(9, 0, 4)).toEqual({
      ajustement: 0,
      total: 9,
      cout: 0,
    });
  });

  it("baisse le total d'autant de points que dépensés (9 → 7 pour 2 points)", () => {
    expect(ajusterLeTotal(9, -2, 4)).toEqual({
      ajustement: -2,
      total: 7,
      cout: 2,
    });
  });

  it("coûte 1 CHANCE par point, dans les deux sens", () => {
    expect(ajusterLeTotal(7, 3, 5).cout).toBe(3);
    expect(ajusterLeTotal(7, -3, 5).cout).toBe(3);
  });

  it("peut dépenser toute la CHANCE disponible", () => {
    expect(ajusterLeTotal(7, 4, 4)).toEqual({
      ajustement: 4,
      total: 11,
      cout: 4,
    });
  });

  it("ne dépense jamais plus que la CHANCE disponible, vers le haut", () => {
    expect(ajusterLeTotal(7, 5, 4)).toEqual({
      ajustement: 4,
      total: 11,
      cout: 4,
    });
  });

  it("ne dépense jamais plus que la CHANCE disponible, vers le bas", () => {
    expect(ajusterLeTotal(7, -9, 4)).toEqual({
      ajustement: -4,
      total: 3,
      cout: 4,
    });
  });

  it("ne dépense rien sans CHANCE", () => {
    expect(ajusterLeTotal(7, 2, 0)).toEqual({
      ajustement: 0,
      total: 7,
      cout: 0,
    });
  });

  it("traite une CHANCE négative (saisie à la main) comme une CHANCE nulle", () => {
    expect(ajusterLeTotal(7, 2, -1).cout).toBe(0);
  });
});

describe("pas à pas de l'ajustement", () => {
  it("monte de 1 point", () => {
    expect(changerLAjustement(0, 1, 4)).toBe(1);
  });

  it("baisse de 1 point", () => {
    expect(changerLAjustement(0, -1, 4)).toBe(-1);
  });

  it("revient vers zéro en repartant dans l'autre sens, sans coût double", () => {
    expect(changerLAjustement(2, -1, 4)).toBe(1);
    expect(changerLAjustement(-2, 1, 4)).toBe(-1);
  });

  it("s'arrête quand la CHANCE disponible est atteinte, dans les deux sens", () => {
    expect(changerLAjustement(4, 1, 4)).toBe(4);
    expect(changerLAjustement(-4, -1, 4)).toBe(-4);
  });

  it("ne bouge pas sans CHANCE", () => {
    expect(changerLAjustement(0, 1, 0)).toBe(0);
    expect(changerLAjustement(0, -1, 0)).toBe(0);
  });
});

describe("écrire un ajustement", () => {
  it("met le signe : « +1 », « −2 », et « 0 » sans ajustement", () => {
    expect(formaterUnAjustement(1)).toBe("+1");
    expect(formaterUnAjustement(-2)).toBe("−2");
    expect(formaterUnAjustement(0)).toBe("0");
  });
});
