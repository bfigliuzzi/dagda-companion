/**
 * Pour les tests : une aventure complète, et son enregistrement dans le
 * `localStorage` de jsdom. Par défaut : § 112, mode simplifié, PV 28 / 32,
 * CHANCE 4, DEX 7, sans arme, sans objet, sans effet, sans combat.
 * `surcharges` remplace ce qu'un test veut changer ; `personnage` se fond dans
 * celui par défaut au lieu de le remplacer.
 */
import { besaceVide, type Aventure, type Personnage } from "../aventure";
import { ecrireAventure } from "../stockage";

export type Surcharges = Partial<Omit<Aventure, "personnage">> & {
  personnage?: Partial<Personnage>;
};

export function uneAventure({
  personnage,
  ...surcharges
}: Surcharges = {}): Aventure {
  return {
    chapitre: 112,
    mode: "simplifie",
    sauvegardesUtilisees: 0,
    sauvegarde: null,
    notes: "",
    armes: [],
    besace: besaceVide(),
    effets: [],
    combat: null,
    combats: [],
    ...surcharges,
    personnage: {
      talent: "Herbologie",
      pointsDeVieMax: 32,
      pointsDeVie: 28,
      chance: 4,
      dexterite: 7,
      ...personnage,
    },
  };
}

/** Repart d'un `localStorage` vide, puis y enregistre l'aventure. */
export function enregistrerAventure(surcharges: Surcharges = {}) {
  localStorage.clear();
  ecrireAventure(localStorage, uneAventure(surcharges));
}
