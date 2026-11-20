import { describe, expect, it } from "vitest";
import { doigtsSurLePlan, type Pointeur } from "./doigtsSurLePlan";

/** Un doigt (tactile) numéro `id`, à (x, y) px de l'écran. */
const doigt = (id: number, x: number, y: number): Pointeur => ({
  pointerId: id,
  clientX: x,
  clientY: y,
  pointerType: "touch",
  button: 0,
});

const MODE_MURS = true;
const MODE_CASES = false;

describe("les doigts en mode Murs", () => {
  it("un doigt seul trace : il commence, prolonge puis finit le trait", () => {
    const doigts = doigtsSurLePlan();
    expect(doigts.poser(doigt(1, 0, 0), MODE_MURS)).toEqual({
      intention: { quoi: "commencer le trait" },
      capturer: [1],
    });
    expect(doigts.glisser(doigt(1, 30, 0))).toEqual({
      quoi: "prolonger le trait",
    });
    expect(doigts.lever(doigt(1, 44, 0))).toEqual({ quoi: "finir le trait" });
  });

  it("un second doigt abandonne le trait, et les deux font défiler du chemin de leur milieu", () => {
    const doigts = doigtsSurLePlan();
    doigts.poser(doigt(1, 0, 0), MODE_MURS);
    expect(doigts.poser(doigt(2, 100, 0), MODE_MURS)).toEqual({
      intention: { quoi: "abandonner le trait" },
      capturer: [1, 2],
    });
    expect(doigts.glisser(doigt(2, 100, 40))).toEqual({
      quoi: "defiler",
      glisse: { x: 0, y: 20 },
    });
    // Le premier doigt n'est plus celui d'un trait : le lever ne finit rien.
    expect(doigts.lever(doigt(1, 0, 0))).toEqual({ quoi: "rien" });
  });

  it("tant qu'un doigt du défilement reste posé, un doigt seul ne trace pas", () => {
    const doigts = doigtsSurLePlan();
    doigts.poser(doigt(1, 0, 0), MODE_MURS);
    doigts.poser(doigt(2, 100, 0), MODE_MURS);
    doigts.lever(doigt(1, 0, 0));
    expect(doigts.glisser(doigt(2, 120, 0))).toEqual({ quoi: "rien" });
    doigts.lever(doigt(2, 120, 0));
    // Tous levés : le doigt suivant trace de nouveau.
    expect(doigts.poser(doigt(3, 0, 0), MODE_MURS).intention).toEqual({
      quoi: "commencer le trait",
    });
  });

  it("quand le navigateur reprend le doigt du trait, le trait est abandonné", () => {
    const doigts = doigtsSurLePlan();
    doigts.poser(doigt(1, 0, 0), MODE_MURS);
    expect(doigts.abandonner(doigt(1, 0, 0))).toEqual({
      quoi: "abandonner le trait",
    });
    expect(doigts.glisser(doigt(1, 30, 0))).toEqual({ quoi: "rien" });
  });

  it("un autre bouton de la souris que le gauche ne fait rien", () => {
    const doigts = doigtsSurLePlan();
    const clicDroit = { ...doigt(1, 0, 0), pointerType: "mouse", button: 2 };
    expect(doigts.poser(clicDroit, MODE_MURS)).toEqual({
      intention: { quoi: "rien" },
      capturer: [],
    });
    expect(doigts.glisser(clicDroit)).toEqual({ quoi: "rien" });
  });
});

describe("les doigts en mode Cases", () => {
  it("un doigt seul n'est pas capturé, pour que le click arrive au bouton touché", () => {
    const doigts = doigtsSurLePlan();
    expect(doigts.poser(doigt(1, 0, 0), MODE_CASES)).toEqual({
      intention: { quoi: "rien" },
      capturer: [],
    });
    expect(doigts.poser(doigt(2, 50, 0), MODE_CASES).capturer).toEqual([1, 2]);
  });

  it("un doigt qui se lève sans avoir bougé de plus de 10 px ouvre la case", () => {
    const doigts = doigtsSurLePlan();
    doigts.poser(doigt(1, 0, 0), MODE_CASES);
    doigts.glisser(doigt(1, 6, 8));
    doigts.lever(doigt(1, 6, 8));
    expect(doigts.cliquer(1)).toEqual({ quoi: "ouvrir la case" });
  });

  it("un doigt qui glisse de plus de 10 px n'ouvre rien", () => {
    const doigts = doigtsSurLePlan();
    doigts.poser(doigt(1, 0, 0), MODE_CASES);
    doigts.glisser(doigt(1, 8, 8));
    doigts.lever(doigt(1, 0, 0));
    expect(doigts.cliquer(1)).toEqual({ quoi: "rien" });
  });

  it("deux doigts n'ouvrent rien, mais font défiler", () => {
    const doigts = doigtsSurLePlan();
    doigts.poser(doigt(1, 0, 0), MODE_CASES);
    doigts.poser(doigt(2, 100, 0), MODE_CASES);
    expect(doigts.glisser(doigt(1, -20, 0))).toEqual({
      quoi: "defiler",
      glisse: { x: -10, y: 0 },
    });
    expect(doigts.cliquer(1)).toEqual({ quoi: "rien" });
  });

  it("un doigt repris par le navigateur n'ouvre rien", () => {
    const doigts = doigtsSurLePlan();
    doigts.poser(doigt(1, 0, 0), MODE_CASES);
    doigts.abandonner(doigt(1, 0, 0));
    expect(doigts.cliquer(1)).toEqual({ quoi: "rien" });
  });

  it("le clavier et les lecteurs d'écran, qui cliquent sans doigt, ouvrent toujours", () => {
    const doigts = doigtsSurLePlan();
    doigts.poser(doigt(1, 0, 0), MODE_CASES);
    doigts.glisser(doigt(1, 50, 0));
    expect(doigts.cliquer(0)).toEqual({ quoi: "ouvrir la case" });
  });
});
