import { describe, expect, it } from "vitest";
import type { Grille } from "./plans";
import { deplacerLaVue, vueCentreeSur, vueDOuverture } from "./vueDuPlan";

/** Un plan neuf : 8 × 8 cases de 44 px, points de 0 à 352 px. */
const neuf: Grille = { colonne: 0, ligne: 0, colonnes: 8, lignes: 8 };
/** Un grand plan : 20 × 20 cases, 880 px de côté. */
const grand: Grille = { colonne: 0, ligne: 0, colonnes: 20, lignes: 20 };
/** La place laissée au plan sur un téléphone de 400 px de large. */
const cadre = { largeur: 400, hauteur: 500 };

describe("centrer la vue", () => {
  it("met le milieu de la case (3, 2) au milieu du cadre", () => {
    // Le milieu de la case est à (154, 110) px ; le cadre fait 400 × 500.
    expect(vueCentreeSur({ x: 3.5, y: 2.5 }, cadre)).toEqual({
      x: 154 - 200,
      y: 110 - 250,
    });
  });
});

describe("la vue à l'ouverture d'un plan", () => {
  it("une grille qui tient en hauteur est en haut du cadre, à une case du bord ; trop large, elle est centrée en largeur", () => {
    // 8 cases et deux marges : 440 px, plus que les 400 px de large.
    expect(vueDOuverture(neuf, cadre)).toEqual({ x: 176 - 200, y: -44 });
  });

  it("une grille plus grande que le cadre est centrée", () => {
    expect(vueDOuverture(grand, cadre)).toEqual({ x: 240, y: 190 });
  });

  it("une grille agrandie vers le haut et la gauche, en coordonnées négatives", () => {
    expect(
      vueDOuverture({ colonne: -2, ligne: -1, colonnes: 10, lignes: 9 }, cadre),
    ).toEqual({ x: 132 - 200, y: -44 - 44 });
  });
});

describe("faire défiler la vue", () => {
  it("le plan suit les doigts : glisser de 100 px vers la gauche montre ce qui est à droite", () => {
    expect(
      deplacerLaVue({ x: 100, y: 100 }, { x: -100, y: 40 }, grand, cadre),
    ).toEqual({ x: 200, y: 60 });
  });

  it("s'arrête une case au-delà du bord de la grille", () => {
    // Bord droit à 880 px, plus une case : 924 px au bord droit du cadre.
    expect(
      deplacerLaVue({ x: 400, y: 100 }, { x: -500, y: 0 }, grand, cadre),
    ).toEqual({ x: 924 - 400, y: 100 });
    // Bord haut à 0 px, moins une case : -44 px en haut du cadre.
    expect(
      deplacerLaVue({ x: 100, y: 100 }, { x: 0, y: 900 }, grand, cadre),
    ).toEqual({ x: 100, y: -44 });
  });

  it("garde en entier dans le cadre une grille plus petite que lui", () => {
    // La grille et ses marges vont de -44 à 396 px en hauteur : 440 px dans 500.
    expect(
      deplacerLaVue({ x: -24, y: -44 }, { x: 0, y: 300 }, neuf, cadre),
    ).toEqual({ x: -24, y: 396 - 500 });
  });

  it("ne saute pas quand la vue est déjà au-delà de la limite : elle ne revient que du chemin des doigts", () => {
    // Après un agrandissement, la vue peut se trouver hors des limites.
    const loin = { x: 700, y: 100 };
    expect(deplacerLaVue(loin, { x: 30, y: 0 }, grand, cadre)).toEqual({
      x: 670,
      y: 100,
    });
    expect(deplacerLaVue(loin, { x: -30, y: 0 }, grand, cadre)).toEqual(loin);
  });
});
