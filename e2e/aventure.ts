import type { Aventure } from "../src/lib/aventure";
import { VERSION } from "../src/lib/stockage";

/**
 * Un enregistrement complet, à la version courante, pour poser une aventure
 * dans le `localStorage` avant le chargement de la page : au § 112, mode
 * simplifié, PV 28 / 32, CHANCE 4, DEX 7, sans arme ni objet.
 */
export function enregistrementDeTest(surcharges: Partial<Aventure> = {}) {
  const aventure: Aventure = {
    chapitre: 112,
    mode: "simplifie",
    sauvegardesUtilisees: 0,
    sauvegarde: null,
    notes: "",
    plans: [],
    armes: [],
    besace: { objets: [], bourse: false, boulons: 0, boulonsForces: false },
    effets: [],
    combat: null,
    combats: [],
    personnage: {
      talent: "Herbologie",
      pointsDeVieMax: 32,
      pointsDeVie: 28,
      chance: 4,
      dexterite: 7,
    },
    ...surcharges,
  };
  return { version: VERSION, aventure };
}
