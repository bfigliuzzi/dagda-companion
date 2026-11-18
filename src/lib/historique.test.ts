import { describe, expect, it } from "vitest";
import {
  commencerUnCombat,
  interrompreLeCombat,
  jouerJusquALaFin,
  jouerUnTour,
  type Camp,
  type Combat,
  type FicheDuLecteur,
} from "./combat";
import { desFixes } from "./des";
import { resumeDeLHistorique, sousTexteDUnCombat } from "./historique";

const lecteur = (pointsDeVie: number): FicheDuLecteur => ({
  dexterite: 7,
  pointsDeVie,
  pointsDeVieMax: 32,
  chance: 4,
  bonus: 1,
});

function combat(
  chapitre: number,
  {
    pv,
    adversaires = 1,
    premier = "lecteur",
    vous = 28,
  }: { pv: number; adversaires?: number; premier?: Camp; vous?: number },
  des: number[],
  fin: "finir" | "quitter" = "finir",
): Combat {
  const commence = commencerUnCombat(
    {
      chapitre,
      adversaires,
      ennemi: { dexterite: 7, pointsDeVie: pv, bonus: 0 },
      premier,
    },
    lecteur(vous),
  );
  const de = desFixes(...des);
  return fin === "finir"
    ? jouerJusquALaFin(commence, de)
    : interrompreLeCombat(jouerUnTour(commence, de));
}

// Le lecteur touche (2 + 3 = 5 ≤ 7), d6 = 3 : 1 + 3 + 1 = 5 dégâts, l'ennemi de 5 PV tombe.
const gagne = combat(98, { pv: 5 }, [2, 3, 3]);
// L'ennemi touche (1 + 1), d6 = 6 : 7 dégâts, le lecteur de 6 PV tombe.
const perdu = combat(61, { pv: 30, premier: "ennemi", vous: 6 }, [1, 1, 6]);
// Tour 1 : l'ennemi touche pour 5 (d6 = 4), le lecteur riposte pour 5 ; le lecteur quitte.
const interrompu = combat(
  40,
  { pv: 30, premier: "ennemi" },
  [1, 1, 4, 2, 3, 3],
  "quitter",
);

describe("sousTexteDUnCombat", () => {
  it("donne les tours et les adversaires d'un combat gagné", () => {
    expect(sousTexteDUnCombat(gagne)).toBe("1 tour · 1 adversaire");
  });

  it("met au pluriel les tours et les adversaires", () => {
    // Trois tours : l'ennemi rate toujours (6 + 6), le lecteur touche.
    const long = combat(
      112,
      { pv: 12, adversaires: 7, premier: "ennemi" },
      [6, 6, 2, 3, 3, 6, 6, 2, 3, 3, 6, 6, 2, 3, 1],
    );
    expect(sousTexteDUnCombat(long)).toBe("3 tours · 7 adversaires");
  });

  it("dit d'un combat quitté en cours qu'il a été quitté", () => {
    expect(sousTexteDUnCombat(interrompu)).toBe(
      "1 tour · 1 adversaire · quitté en cours",
    );
  });
});

describe("resumeDeLHistorique", () => {
  it("compte les combats, les gagnés et les PV perdus en tout", () => {
    // Gagné : 0 PV perdu ; perdu : 6 ; interrompu : 5.
    expect(resumeDeLHistorique([gagne, perdu, interrompu])).toBe(
      "3 combats · 1 gagné · 11 PV perdus en tout",
    );
  });

  it("reste au singulier pour un seul combat", () => {
    expect(resumeDeLHistorique([gagne])).toBe(
      "1 combat · 1 gagné · 0 PV perdu en tout",
    );
  });
});
