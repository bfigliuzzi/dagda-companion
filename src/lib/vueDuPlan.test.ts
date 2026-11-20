import { describe, expect, it } from "vitest";
import type { Grille } from "./plans";
import {
  deplacerLaVue,
  vueCentreeSur,
  vueDOuverture,
  vueDOuvertureSur,
  vueQuiDegageLaCase,
} from "./vueDuPlan";

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

describe("la vue à l'ouverture d'un plan qui a un repère", () => {
  /**
   * Un téléphone de 412 px de large : 8 cases (352 px) y tiennent, mais pas
   * avec leurs marges d'une case (440 px).
   */
  const telephone = { largeur: 412, hauteur: 600 };

  it("un plan neuf tient dans la largeur : centré, quel que soit le coin du repère", () => {
    // 352 px centrés dans 412 px : 30 px de chaque côté ; en haut, à une case.
    const centre = { x: 176 - 206, y: -44 };
    expect(vueDOuvertureSur({ x: 0.5, y: 0.5 }, neuf, telephone)).toEqual(
      centre,
    );
    expect(vueDOuvertureSur({ x: 7.5, y: 7.5 }, neuf, telephone)).toEqual(
      centre,
    );
  });

  it("une petite grille qui tient sur les deux axes s'ouvre comme sans repère", () => {
    const petite: Grille = { colonne: 0, ligne: 0, colonnes: 3, lignes: 3 };
    expect(vueDOuvertureSur({ x: 2.5, y: 2.5 }, petite, telephone)).toEqual(
      vueDOuverture(petite, telephone),
    );
  });

  it("au milieu d'un grand plan : centrée sur le repère", () => {
    expect(vueDOuvertureSur({ x: 10.5, y: 10.5 }, grand, cadre)).toEqual(
      vueCentreeSur({ x: 10.5, y: 10.5 }, cadre),
    );
  });

  it("près du bord d'un grand plan : centrée puis bornée à une case au-delà du bord", () => {
    // Centrer sur (18,5 ; 1,5) donnerait (614, -184) : la vue s'arrête à
    // 924 - 400 en largeur et à -44 en hauteur, comme quand on fait défiler.
    expect(vueDOuvertureSur({ x: 18.5, y: 1.5 }, grand, cadre)).toEqual({
      x: 924 - 400,
      y: -44,
    });
  });

  it("un axe tient, l'autre non : chacun suit sa règle", () => {
    // 4 colonnes (264 px avec marges) tiennent en largeur : centrées ;
    // 20 lignes ne tiennent pas en hauteur : centrées sur le repère, bornées.
    const haute: Grille = { colonne: 0, ligne: 0, colonnes: 4, lignes: 20 };
    expect(vueDOuvertureSur({ x: 0.5, y: 10.5 }, haute, cadre)).toEqual({
      x: 88 - 200,
      y: 462 - 250,
    });
  });
});

describe("le panneau d'une case s'ouvre par-dessus la grille", () => {
  // Le cadre montre 500 px ; le panneau en couvre le bas à partir de 300 px.
  const bande = { haut: 0, bas: 300 };

  it("une case bien au-dessus du panneau : la vue ne bouge pas", () => {
    // Case de la ligne 4 : de 176 à 220 px, 80 px au-dessus du panneau.
    const vue = { x: -30, y: 0 };
    expect(vueQuiDegageLaCase(vue, 4, bande)).toBe(vue);
  });

  it("une case à moins de 12 px du haut du panneau : elle vient au milieu de la bande visible", () => {
    // Case de la ligne 6 : de 264 à 308 px, sous le haut du panneau.
    // Son milieu (286 px du plan) va à 150 px du haut du cadre.
    expect(vueQuiDegageLaCase({ x: -30, y: 0 }, 6, bande)).toEqual({
      x: -30,
      y: 286 - 150,
    });
  });

  it("la vue peut alors sortir de ses limites", () => {
    // Ligne 7 d'un plan neuf, sous le panneau : la vue descend au-delà du bas de la grille.
    const vue = vueQuiDegageLaCase({ x: -30, y: -44 }, 7, bande);
    expect(vue.y).toBe(330 - 150);
  });

  it("le haut de la bande peut être sous le haut du cadre", () => {
    expect(
      vueQuiDegageLaCase({ x: 0, y: 0 }, 6, { haut: 100, bas: 300 }),
    ).toEqual({
      x: 0,
      y: 286 - 200,
    });
  });

  it("sans bande visible (rien de mesuré) : la vue ne bouge pas", () => {
    const vue = { x: 0, y: 0 };
    expect(vueQuiDegageLaCase(vue, 6, { haut: 0, bas: 0 })).toBe(vue);
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
