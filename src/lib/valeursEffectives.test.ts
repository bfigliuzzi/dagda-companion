import { describe, expect, it } from "vitest";
import type { Aventure, Personnage } from "./aventure";
import {
  baseApres,
  decrireUnEffet,
  explication,
  retirerUnEffet,
  valeurEffective,
  valeursEffectives,
  type Cible,
  type Effet,
} from "./valeursEffectives";

const effet = (nom: string, cible: Cible, valeur: number): Effet => ({
  nom,
  duree: "",
  cible,
  valeur,
});
const rappel = (nom: string): Effet => ({
  nom,
  duree: "",
  cible: null,
  valeur: 0,
});

const potion: Effet = {
  nom: "Potion d'agilité",
  duree: "24 h",
  cible: "dexterite",
  valeur: 1,
};

describe("valeurs effectives : base + effets", () => {
  it("ajoute la potion d'agilité à la DEXTÉRITÉ : base 7, potion +1, DEX 8", () => {
    expect(valeurEffective("dexterite", 7, [potion])).toBe(8);
  });

  it("choix par défaut : un bonus de PV (la bague +2) monte les PV et le maximum", () => {
    const bague = effet("Bague de vigueur", "pointsDeVie", 2);
    expect(valeurEffective("pointsDeVie", 28, [bague])).toBe(30);
    expect(valeurEffective("pointsDeVieMax", 32, [bague])).toBe(34);
  });

  it("un bonus de PV max monte le maximum seulement", () => {
    const bague = effet("Bague de vigueur", "pointsDeVieMax", 2);
    expect(valeurEffective("pointsDeVie", 28, [bague])).toBe(28);
    expect(valeurEffective("pointsDeVieMax", 32, [bague])).toBe(34);
  });

  it("ajoute un effet de CHANCE à la CHANCE", () => {
    const trefle = effet("Trèfle", "chance", 2);
    expect(valeurEffective("chance", 4, [trefle])).toBe(6);
  });

  it("additionne le bonus des armes (la base) et les effets de dégâts", () => {
    const rage = effet("Rage du berserker", "degats", 2);
    expect(valeurEffective("degats", 1, [rage])).toBe(3);
  });

  it("additionne plusieurs effets sur la même valeur, malus compris", () => {
    const effets = [
      potion,
      effet("Élixir", "dexterite", 2),
      effet("Poison", "dexterite", -1),
    ];
    expect(valeurEffective("dexterite", 7, effets)).toBe(9);
  });

  it("ignore les effets qui visent une autre valeur et les simples rappels", () => {
    const effets = [
      potion,
      effet("Trèfle", "chance", 2),
      effet("Rage", "degats", 1),
      rappel("retourner voir l'herboriste"),
    ];
    expect(valeurEffective("pointsDeVie", 28, effets)).toBe(28);
    expect(valeurEffective("pointsDeVieMax", 32, effets)).toBe(32);
    expect(valeurEffective("dexterite", 7, effets)).toBe(8);
  });

  it("rend la base telle quelle sans effet", () => {
    expect(valeurEffective("dexterite", 7, [])).toBe(7);
    expect(valeurEffective("degats", 0, [])).toBe(0);
  });

  it("ne descend pas sous 0 PV, 1 PV max ni 0 CHANCE", () => {
    const malus = (cible: Cible) => effet("Malédiction", cible, -50);
    expect(valeurEffective("pointsDeVie", 28, [malus("pointsDeVie")])).toBe(0);
    expect(
      valeurEffective("pointsDeVieMax", 32, [malus("pointsDeVieMax")]),
    ).toBe(1);
    expect(valeurEffective("chance", 4, [malus("chance")])).toBe(0);
  });

  it("laisse la DEXTÉRITÉ et les dégâts descendre sous 0 avec un malus", () => {
    expect(
      valeurEffective("dexterite", 7, [effet("Poison", "dexterite", -8)]),
    ).toBe(-1);
    expect(
      valeurEffective("degats", 0, [effet("Faiblesse", "degats", -1)]),
    ).toBe(-1);
  });
});

describe("ligne d'explication sous une valeur modifiée", () => {
  it("écrit « base 7 · potion +1 » sous la DEXTÉRITÉ de la maquette", () => {
    expect(explication("dexterite", 7, [potion])).toBe("base 7 · potion +1");
  });

  it("ne dit rien quand aucun effet ne vise la valeur", () => {
    expect(explication("dexterite", 7, [])).toBeNull();
    expect(
      explication("chance", 4, [
        potion,
        rappel("les gardes vous reconnaissent"),
      ]),
    ).toBeNull();
  });

  it("nomme chaque effet par son premier mot, en minuscules, dans l'ordre d'ajout", () => {
    const effets = [potion, effet("Élixir de vif-argent", "dexterite", 2)];
    expect(explication("dexterite", 7, effets)).toBe(
      "base 7 · potion +1 · élixir +2",
    );
  });

  it("écrit un malus avec le signe moins", () => {
    expect(
      explication("dexterite", 7, [effet("Poison", "dexterite", -1)]),
    ).toBe("base 7 · poison −1");
  });

  it("écrit la base des dégâts, le bonus des armes, avec son signe", () => {
    expect(explication("degats", 1, [effet("Rage", "degats", 2)])).toBe(
      "base +1 · rage +2",
    );
  });

  it("explique le maximum monté par un bonus de PV", () => {
    const bague = effet("Bague de vigueur", "pointsDeVie", 2);
    expect(explication("pointsDeVieMax", 32, [bague])).toBe(
      "base 32 · bague +2",
    );
    expect(explication("pointsDeVie", 28, [bague])).toBe("base 28 · bague +2");
  });
});

describe("ligne d'un effet dans la liste", () => {
  it("écrit le nom, la valeur visée et le bonus : « Potion d'agilité · DEX +1 »", () => {
    expect(decrireUnEffet(potion)).toBe("Potion d'agilité · DEX +1");
    expect(decrireUnEffet(effet("Bague", "pointsDeVieMax", 2))).toBe(
      "Bague · PV max +2",
    );
    expect(decrireUnEffet(effet("Trèfle", "chance", 1))).toBe(
      "Trèfle · CHANCE +1",
    );
    expect(decrireUnEffet(effet("Faiblesse", "degats", -1))).toBe(
      "Faiblesse · dégâts −1",
    );
  });

  it("garde le seul nom d'un simple rappel", () => {
    expect(decrireUnEffet(rappel("retourner voir l'herboriste"))).toBe(
      "retourner voir l'herboriste",
    );
  });
});

describe("changer une valeur effective : les dépenses et les pertes portent sur la base", () => {
  const trefle = effet("Trèfle", "chance", 2);

  it("dépenser 2 CHANCE sur 6 (base 4 · trèfle +2) laisse une base de 2", () => {
    expect(baseApres("chance", 6 - 2, [trefle])).toBe(2);
  });

  it("perdre 1 PV sur 30 (base 28 · bague +2) laisse une base de 27", () => {
    const bague = effet("Bague de vigueur", "pointsDeVie", 2);
    expect(baseApres("pointsDeVie", 29, [bague])).toBe(27);
  });

  it("corriger à la main la DEX affichée 8 en 9 (potion +1) met la base à 8", () => {
    expect(baseApres("dexterite", 9, [potion])).toBe(8);
  });

  it("corriger le maximum affiché tient compte d'un bonus de PV", () => {
    const bague = effet("Bague de vigueur", "pointsDeVie", 2);
    expect(baseApres("pointsDeVieMax", 36, [bague])).toBe(34);
  });

  it("sans effet, la base est la valeur affichée", () => {
    expect(baseApres("chance", 3, [])).toBe(3);
  });
});

const herboriste: Personnage = {
  talent: "Herbologie",
  pointsDeVieMax: 32,
  pointsDeVie: 28,
  chance: 4,
  dexterite: 7,
};

/** La feuille vue avec ses valeurs effectives, pour lire les tests comme l'écran. */
function affiche({
  personnage,
  effets,
}: Pick<Aventure, "personnage" | "effets">) {
  const valeurs = valeursEffectives({ personnage, armes: [], effets });
  return {
    pv: valeurs.pointsDeVie,
    max: valeurs.pointsDeVieMax,
    chance: valeurs.chance,
    dex: valeurs.dexterite,
  };
}

describe("retirer un effet", () => {
  it("ramène la DEXTÉRITÉ à sa base et retire l'effet de la liste", () => {
    const apres = retirerUnEffet(
      { personnage: herboriste, effets: [potion] },
      0,
    );
    expect(apres.effets).toEqual([]);
    expect(affiche(apres).dex).toBe(7);
  });

  it("retire seulement l'effet choisi", () => {
    const note = rappel("retourner voir l'herboriste");
    const apres = retirerUnEffet(
      { personnage: herboriste, effets: [potion, note] },
      1,
    );
    expect(apres.effets).toEqual([potion]);
    expect(affiche(apres).dex).toBe(8);
  });

  it("retirer un bonus de PV ramène les PV et le maximum à leur base", () => {
    const bague = effet("Bague de vigueur", "pointsDeVie", 2);
    const avant = { personnage: herboriste, effets: [bague] };
    expect(affiche(avant)).toMatchObject({ pv: 30, max: 34 });
    expect(affiche(retirerUnEffet(avant, 0))).toMatchObject({
      pv: 28,
      max: 32,
    });
  });

  it("garde les PV perdus pendant l'effet : 30 / 34, −5, puis sans la bague 23 / 32", () => {
    const bague = effet("Bague de vigueur", "pointsDeVie", 2);
    const blesse = {
      personnage: {
        ...herboriste,
        pointsDeVie: baseApres("pointsDeVie", 30 - 5, [bague]),
      },
      effets: [bague],
    };
    expect(affiche(retirerUnEffet(blesse, 0))).toMatchObject({
      pv: 23,
      max: 32,
    });
  });

  it("retirer un bonus de PV max ramène le maximum à sa base, et les PV au maximum s'ils le dépassent alors", () => {
    const bague = effet("Bague de vigueur", "pointsDeVieMax", 2);
    const soigne = {
      personnage: { ...herboriste, pointsDeVie: 34 },
      effets: [bague],
    };
    expect(affiche(soigne)).toMatchObject({ pv: 34, max: 34 });
    expect(affiche(retirerUnEffet(soigne, 0))).toMatchObject({
      pv: 32,
      max: 32,
    });
  });

  it("laisse des PV déjà au-dessus du maximum avant le retrait (le livre peut déroger)", () => {
    const trefle = effet("Trèfle", "chance", 1);
    const deroge = {
      personnage: { ...herboriste, pointsDeVie: 40 },
      effets: [trefle],
    };
    expect(affiche(retirerUnEffet(deroge, 0))).toMatchObject({
      pv: 40,
      max: 32,
    });
  });

  it("choix par défaut : la CHANCE dépensée pendant l'effet sort de la base (4 · trèfle +2, −2, puis sans le trèfle 2)", () => {
    const trefle = effet("Trèfle", "chance", 2);
    const depense = {
      personnage: {
        ...herboriste,
        chance: baseApres("chance", 6 - 2, [trefle]),
      },
      effets: [trefle],
    };
    expect(affiche(depense).chance).toBe(4);
    expect(affiche(retirerUnEffet(depense, 0)).chance).toBe(2);
  });

  it("ne laisse aucune base sous 0 après le retrait, même quand l'effet a été dépensé en entier", () => {
    const trefle = effet("Trèfle", "chance", 2);
    const toutDepense = {
      personnage: { ...herboriste, chance: baseApres("chance", 0, [trefle]) },
      effets: [trefle],
    };
    expect(toutDepense.personnage.chance).toBe(-2);
    const apres = retirerUnEffet(toutDepense, 0);
    expect(apres.personnage.chance).toBe(0);
    // Un nouvel effet repart bien de 0, sans dette cachée.
    expect(valeurEffective("chance", apres.personnage.chance, [trefle])).toBe(
      2,
    );
  });

  it("garde une base sous 0 tant qu'un autre effet la soutient", () => {
    const trefle = effet("Trèfle", "chance", 2);
    const amulette = effet("Amulette", "chance", 3);
    const toutDepense = {
      personnage: {
        ...herboriste,
        chance: baseApres("chance", 0, [trefle, amulette]),
      },
      effets: [trefle, amulette],
    };
    const apres = retirerUnEffet(toutDepense, 0);
    expect(affiche(apres).chance).toBe(0);
    expect(affiche(retirerUnEffet(apres, 0)).chance).toBe(0);
  });

  it("ne change rien aux valeurs en retirant un simple rappel", () => {
    const avant = { personnage: herboriste, effets: [rappel("les gardes")] };
    const apres = retirerUnEffet(avant, 0);
    expect(apres.personnage).toEqual(herboriste);
    expect(apres.effets).toEqual([]);
  });
});

describe("valeurs effectives de toute la feuille, pour le combat et la CHANCE", () => {
  it("donne PV, PV max, CHANCE, DEX et dégâts (armes + effets)", () => {
    expect(
      valeursEffectives({
        personnage: herboriste,
        armes: [
          { nom: "Épée courte", bonus: 1 },
          { nom: "Bâton de l'Académie", bonus: 0 },
        ],
        effets: [
          potion,
          effet("Rage du berserker", "degats", 2),
          effet("Bague de vigueur", "pointsDeVieMax", 2),
          effet("Trèfle", "chance", 1),
        ],
      }),
    ).toEqual({
      pointsDeVie: 28,
      pointsDeVieMax: 34,
      chance: 5,
      dexterite: 8,
      degats: 3,
    });
  });
});
