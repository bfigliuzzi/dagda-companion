import { describe, expect, it } from "vitest";
import {
  formaterUnAjustement,
  formaterUnBonus,
  formaterUnNombre,
} from "./signes";

describe("écrire un nombre avec son signe", () => {
  it("un nombre : vrai signe moins, pas de plus", () => {
    expect(formaterUnNombre(7)).toBe("7");
    expect(formaterUnNombre(0)).toBe("0");
    expect(formaterUnNombre(-2)).toBe("−2");
  });

  it("un bonus : le signe toujours, même pour zéro", () => {
    expect(formaterUnBonus(1)).toBe("+1");
    expect(formaterUnBonus(0)).toBe("+0");
    expect(formaterUnBonus(-2)).toBe("−2");
  });

  it("un ajustement : le signe, et « 0 » sans ajustement", () => {
    expect(formaterUnAjustement(1)).toBe("+1");
    expect(formaterUnAjustement(-2)).toBe("−2");
    expect(formaterUnAjustement(0)).toBe("0");
  });
});
