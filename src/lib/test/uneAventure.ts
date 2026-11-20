/**
 * Pour les tests : une aventure complète, et son enregistrement dans le
 * `localStorage` de jsdom. Par défaut : § 112, mode simplifié, PV 28 / 32,
 * CHANCE 4, DEX 7, sans arme, sans objet, sans effet, sans combat.
 * `surcharges` remplace ce qu'un test veut changer ; `personnage` et `besace`
 * se fondent dans ceux par défaut au lieu de les remplacer.
 */
import {
  besaceVide,
  type Aventure,
  type Besace,
  type Personnage,
} from "../aventure";
import { ecrireAventure } from "../stockage";

export type Surcharges = Partial<Omit<Aventure, "personnage" | "besace">> & {
  personnage?: Partial<Personnage>;
  besace?: Partial<Besace>;
};

export function uneAventure({
  personnage,
  besace,
  ...surcharges
}: Surcharges = {}): Aventure {
  return {
    chapitre: 112,
    mode: "simplifie",
    sauvegardesUtilisees: 0,
    sauvegarde: null,
    notes: "",
    armes: [],
    effets: [],
    combat: null,
    combats: [],
    ...surcharges,
    besace: { ...besaceVide(), ...besace },
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
