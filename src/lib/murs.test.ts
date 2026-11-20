import { describe, expect, it } from "vitest";
import {
  agrandirLaGrille,
  appliquerLeTrait,
  bordLePlusProche,
  commencerUnTrait,
  defaireLeTrait,
  finirLeTrait,
  prolongerLeTrait,
  type Bord,
  type Position,
} from "./murs";
import type { Grille } from "./plans";

/** La grille d'un plan neuf : 8 × 8 cases, points de 0 à 8. */
const grille: Grille = { colonne: 0, ligne: 0, colonnes: 8, lignes: 8 };

const horizontal = (colonne: number, ligne: number): Bord => ({
  sens: "horizontal",
  colonne,
  ligne,
});
const vertical = (colonne: number, ligne: number): Bord => ({
  sens: "vertical",
  colonne,
  ligne,
});

/** Un trait du doigt, passant par chaque position (en cases), sur des murs donnés. */
function tracer(murs: Bord[], ...positions: Position[]) {
  const [premiere, ...suite] = positions;
  let trait = commencerUnTrait(murs, grille, premiere);
  for (const position of suite) trait = prolongerLeTrait(trait, position);
  return finirLeTrait(trait);
}

describe("caler un appui sur un bord", () => {
  it("prend le bord le plus proche, même à 12 px à côté (0,27 case)", () => {
    expect(bordLePlusProche({ x: 2.5, y: 3.27 }, grille)).toEqual(
      horizontal(2, 3),
    );
    expect(bordLePlusProche({ x: 4.8, y: 0.4 }, grille)).toEqual(
      vertical(5, 0),
    );
  });

  it("ne prend rien au milieu d'une case", () => {
    expect(bordLePlusProche({ x: 2.5, y: 3.5 }, grille)).toBeNull();
  });

  it("ne prend rien hors de la grille, mais prend son bord extérieur", () => {
    expect(bordLePlusProche({ x: -1, y: 2.5 }, grille)).toBeNull();
    expect(bordLePlusProche({ x: 8.1, y: 2.5 }, grille)).toEqual(
      vertical(8, 2),
    );
  });

  it("marche avec des coordonnées négatives, quand la grille a grandi vers le haut et la gauche", () => {
    const agrandie: Grille = {
      colonne: -2,
      ligne: -1,
      colonnes: 10,
      lignes: 9,
    };
    expect(bordLePlusProche({ x: -1.5, y: -0.9 }, agrandie)).toEqual(
      horizontal(-2, -1),
    );
  });
});

describe("un glissé le long des points", () => {
  it("pose un mur sur chaque bord parcouru, sans viser juste", () => {
    const changement = tracer(
      [],
      { x: 1.1, y: 2.2 },
      { x: 2, y: 2.1 },
      { x: 3.05, y: 1.8 },
      { x: 3.9, y: 2.15 },
    );
    expect(changement).toEqual({
      mode: "pose",
      bords: [horizontal(1, 2), horizontal(2, 2), horizontal(3, 2)],
    });
  });

  it("ne saute aucun bord quand le doigt va vite (deux positions éloignées)", () => {
    expect(tracer([], { x: 0, y: 0 }, { x: 0, y: 3 })?.bords).toEqual([
      vertical(0, 0),
      vertical(0, 1),
      vertical(0, 2),
    ]);
  });

  it("tourne au coin : le trait suit le bord du haut, puis celui de droite", () => {
    expect(
      tracer([], { x: 0, y: 0 }, { x: 2, y: 0 }, { x: 2, y: 1 })?.bords,
    ).toEqual([horizontal(0, 0), horizontal(1, 0), vertical(2, 0)]);
  });

  it("ne pose pas de mur parasite en passant près d'un coin", () => {
    expect(
      tracer([], { x: 0, y: 0.1 }, { x: 1.05, y: 0.12 }, { x: 2, y: 0.1 })
        ?.bords,
    ).toEqual([horizontal(0, 0), horizontal(1, 0)]);
  });

  it("ne pose rien en travers d'une case, d'un coin au coin opposé", () => {
    expect(tracer([], { x: 1, y: 1 }, { x: 2, y: 2 })).toBeNull();
  });

  it("prend le bord où il commence et celui où il finit, s'ils sont parcourus à moitié", () => {
    expect(
      tracer([], { x: 0.5, y: 4 }, { x: 1, y: 4 }, { x: 2.6, y: 4 })?.bords,
    ).toEqual([horizontal(0, 4), horizontal(1, 4), horizontal(2, 4)]);
  });

  it("ne compte qu'une fois un bord parcouru en aller-retour", () => {
    expect(
      tracer([], { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 0 })?.bords,
    ).toEqual([horizontal(0, 0)]);
  });

  it("ne garde, dans le trait, que les bords qu'il change", () => {
    expect(tracer([horizontal(1, 0)], { x: 0, y: 0 }, { x: 3, y: 0 })).toEqual({
      mode: "pose",
      bords: [horizontal(0, 0), horizontal(2, 0)],
    });
  });
});

describe("le premier bord décide du trait", () => {
  it("un glissé qui commence sur un mur efface les murs parcourus", () => {
    const murs = [horizontal(0, 0), horizontal(1, 0), vertical(5, 5)];
    expect(tracer(murs, { x: 0, y: 0 }, { x: 3, y: 0 })).toEqual({
      mode: "efface",
      bords: [horizontal(0, 0), horizontal(1, 0)],
    });
  });

  it("un simple appui pose un mur sur un bord vide, et retire celui d'un bord occupé", () => {
    expect(tracer([], { x: 2.5, y: 3.1 })).toEqual({
      mode: "pose",
      bords: [horizontal(2, 3)],
    });
    expect(tracer([horizontal(2, 3)], { x: 2.5, y: 3.1 })).toEqual({
      mode: "efface",
      bords: [horizontal(2, 3)],
    });
  });

  it("un appui au milieu d'une case ne change rien", () => {
    expect(tracer([], { x: 2.5, y: 3.5 })).toBeNull();
  });
});

describe("appliquer et défaire un trait", () => {
  const murs = [horizontal(0, 0), vertical(3, 3)];

  it("un trait qui pose ajoute ses murs ; le défaire les retire", () => {
    const changement = { mode: "pose" as const, bords: [horizontal(1, 0)] };
    const apres = appliquerLeTrait(murs, changement);
    expect(apres).toEqual([...murs, horizontal(1, 0)]);
    expect(defaireLeTrait(apres, changement)).toEqual(murs);
  });

  it("un trait qui efface retire ses murs ; le défaire les remet", () => {
    const changement = { mode: "efface" as const, bords: [horizontal(0, 0)] };
    const apres = appliquerLeTrait(murs, changement);
    expect(apres).toEqual([vertical(3, 3)]);
    expect(defaireLeTrait(apres, changement)).toEqual([
      vertical(3, 3),
      horizontal(0, 0),
    ]);
  });
});

describe("la grille grandit sous un mur tracé sur son bord extérieur", () => {
  const pose = (...bords: Bord[]) => ({ mode: "pose" as const, bords });

  it("un mur sur le bord du haut ajoute une rangée en haut : la ligne de départ passe à -1", () => {
    expect(agrandirLaGrille(grille, pose(horizontal(3, 0)))).toEqual({
      colonne: 0,
      ligne: -1,
      colonnes: 8,
      lignes: 9,
    });
  });

  it("un mur sur le bord de gauche ajoute une colonne à gauche", () => {
    expect(agrandirLaGrille(grille, pose(vertical(0, 5)))).toEqual({
      colonne: -1,
      ligne: 0,
      colonnes: 9,
      lignes: 8,
    });
  });

  it("un mur sur le bord du bas ou de droite ajoute une rangée ou une colonne de ce côté", () => {
    expect(agrandirLaGrille(grille, pose(horizontal(2, 8)))).toEqual({
      ...grille,
      lignes: 9,
    });
    expect(agrandirLaGrille(grille, pose(vertical(8, 2)))).toEqual({
      ...grille,
      colonnes: 9,
    });
  });

  it("un trait le long du bord du haut n'ajoute qu'une rangée, quel que soit le nombre de murs", () => {
    expect(
      agrandirLaGrille(
        grille,
        pose(horizontal(0, 0), horizontal(1, 0), horizontal(2, 0)),
      ),
    ).toEqual({ colonne: 0, ligne: -1, colonnes: 8, lignes: 9 });
  });

  it("un trait qui tourne au coin haut-gauche ajoute une rangée en haut et une colonne à gauche", () => {
    expect(
      agrandirLaGrille(
        grille,
        pose(horizontal(1, 0), horizontal(0, 0), vertical(0, 0)),
      ),
    ).toEqual({ colonne: -1, ligne: -1, colonnes: 9, lignes: 9 });
  });

  it("un mur à l'intérieur, ou un mur horizontal qui touche le bord de gauche par un bout, ne change rien", () => {
    expect(agrandirLaGrille(grille, pose(horizontal(0, 3)))).toBe(grille);
    expect(agrandirLaGrille(grille, pose(vertical(4, 0)))).toBe(grille);
  });

  it("un trait qui efface sur le bord ne fait pas grandir la grille", () => {
    expect(
      agrandirLaGrille(grille, { mode: "efface", bords: [horizontal(3, 0)] }),
    ).toBe(grille);
  });

  it("suit la grille déjà agrandie, en coordonnées négatives", () => {
    const agrandie: Grille = {
      colonne: -2,
      ligne: -1,
      colonnes: 10,
      lignes: 9,
    };
    expect(agrandirLaGrille(agrandie, pose(vertical(-2, 0)))).toEqual({
      colonne: -3,
      ligne: -1,
      colonnes: 11,
      lignes: 9,
    });
    expect(agrandirLaGrille(agrandie, pose(horizontal(0, 8)))).toEqual({
      ...agrandie,
      lignes: 10,
    });
  });

  it("s'arrête à 30 colonnes et 30 lignes : le mur se pose, la grille ne grandit plus de ce côté", () => {
    const pleine: Grille = { colonne: -11, ligne: 0, colonnes: 30, lignes: 29 };
    expect(
      agrandirLaGrille(pleine, pose(vertical(-11, 2), horizontal(-11, 0))),
    ).toEqual({ colonne: -11, ligne: -1, colonnes: 30, lignes: 30 });
    const auMaximum: Grille = { ...pleine, lignes: 30 };
    expect(agrandirLaGrille(auMaximum, pose(horizontal(0, 30)))).toBe(
      auMaximum,
    );
  });
});
