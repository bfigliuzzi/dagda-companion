/**
 * Effets temporaires et bonus d'objets (docs/regles-livre-1.md), et les
 * VALEURS EFFECTIVES qu'ils donnent : base + effets.
 *
 * L'aventure enregistre les bases (`Aventure.personnage`, et le bonus des
 * armes pour les dégâts). Tout ce qui lit une valeur pour jouer (la feuille,
 * le panneau de dés, le combat, la CHANCE automatique) lit la valeur
 * effective : `valeursEffectives(aventure)`, ou `valeurEffective(cible, base,
 * effets)` pour une seule.
 *
 * Règles retenues (docs/regles-livre-1.md, « Effets temporaires ») :
 * - un bonus de PV monte les PV et le maximum (la bague +2 : 28 / 32 devient
 *   30 / 34) ; un bonus de PV max ne monte que le maximum ;
 * - une perte, une dépense ou une correction à la main porte sur la valeur
 *   affichée et s'enregistre dans la base (`baseApres`) : l'effet garde sa
 *   valeur, et son retrait retire exactement cette valeur ;
 * - une réserve ne descend pas sous 0 (PV, CHANCE), le maximum sous 1 ; la
 *   DEXTÉRITÉ et les dégâts n'ont pas de plancher.
 */
import {
  bonusDeDegatsDesArmes,
  type Arme,
  type Aventure,
  type Personnage,
} from "./aventure";
import { formaterUnBonus, formaterUnNombre } from "./signes";

/** Ce qu'un effet peut changer. */
export type Cible =
  "pointsDeVie" | "pointsDeVieMax" | "chance" | "dexterite" | "degats";

export interface Effet {
  nom: string;
  duree: string;
  cible: Cible | null;
  valeur: number;
}

/** Les cibles, dans l'ordre des puces du panneau « Nouvel effet ». */
export const CIBLES: readonly Cible[] = [
  "pointsDeVie",
  "pointsDeVieMax",
  "chance",
  "dexterite",
  "degats",
];

/** Le nom de chaque cible : sur sa puce, et dans la liste des effets (« DEX +1 »). */
export const NOMS_DES_CIBLES: Record<Cible, { puce: string; court: string }> = {
  pointsDeVie: { puce: "PV", court: "PV" },
  pointsDeVieMax: { puce: "PV max", court: "PV max" },
  chance: { puce: "Chance", court: "CHANCE" },
  dexterite: { puce: "Dextérité", court: "DEX" },
  degats: { puce: "Dégâts", court: "dégâts" },
};

/** Un simple rappel ne vise aucune valeur. */
export function estUnRappel(effet: Effet): boolean {
  return effet.cible === null;
}

/** La ligne de la liste : « Potion d'agilité · DEX +1 » ; un rappel garde son seul nom. */
export function decrireUnEffet(effet: Effet): string {
  if (effet.cible === null) return effet.nom;
  return `${effet.nom} · ${NOMS_DES_CIBLES[effet.cible].court} ${formaterUnBonus(effet.valeur)}`;
}

/** Vérifie un effet relu depuis l'appareil. */
export function estUnEffet(valeur: unknown): valeur is Effet {
  if (typeof valeur !== "object" || valeur === null) return false;
  const { nom, duree, cible, valeur: nombre } = valeur as Effet;
  return (
    typeof nom === "string" &&
    typeof duree === "string" &&
    (cible === null || CIBLES.includes(cible)) &&
    Number.isInteger(nombre)
  );
}

/** Les cibles dont les effets s'ajoutent à une valeur : un bonus de PV monte aussi le maximum. */
const CIBLES_QUI_COMPTENT: Record<Cible, readonly Cible[]> = {
  pointsDeVie: ["pointsDeVie"],
  pointsDeVieMax: ["pointsDeVieMax", "pointsDeVie"],
  chance: ["chance"],
  dexterite: ["dexterite"],
  degats: ["degats"],
};

/** Plus petite valeur effective : une réserve ne descend pas sous 0, le maximum sous 1. */
const PLANCHERS: Record<Cible, number> = {
  pointsDeVie: 0,
  pointsDeVieMax: 1,
  chance: 0,
  dexterite: -Infinity,
  degats: -Infinity,
};

/** Les effets qui changent cette valeur, dans l'ordre où le lecteur les a ajoutés. */
function effetsSur(cible: Cible, effets: readonly Effet[]): Effet[] {
  return effets.filter(
    (effet) =>
      effet.cible !== null && CIBLES_QUI_COMPTENT[cible].includes(effet.cible),
  );
}

/** Ce que les effets ajoutent à cette valeur. */
function bonusDesEffets(cible: Cible, effets: readonly Effet[]): number {
  return effetsSur(cible, effets).reduce(
    (somme, effet) => somme + effet.valeur,
    0,
  );
}

export function valeurEffective(
  cible: Cible,
  base: number,
  effets: readonly Effet[],
): number {
  return Math.max(PLANCHERS[cible], base + bonusDesEffets(cible, effets));
}

/**
 * La base qui donne cette valeur effective : l'inverse de `valeurEffective`.
 * Toute perte, dépense ou correction à la main se fait sur la valeur
 * affichée, puis s'enregistre ainsi dans la base. Tant qu'un effet la
 * soutient, la base peut passer sous 0 (la CHANCE prêtée par un effet a été
 * dépensée) ; `retirerUnEffet` la remet d'aplomb.
 */
export function baseApres(
  cible: Cible,
  valeur: number,
  effets: readonly Effet[],
): number {
  return valeur - bonusDesEffets(cible, effets);
}

/** Les valeurs effectives dont le combat et la CHANCE automatique ont besoin. */
export type ValeursEffectives = Record<Cible, number>;

export function valeursEffectives({
  personnage,
  armes,
  effets,
}: {
  personnage: Personnage;
  armes: readonly Arme[];
  effets: readonly Effet[];
}): ValeursEffectives {
  return {
    pointsDeVie: valeurEffective("pointsDeVie", personnage.pointsDeVie, effets),
    pointsDeVieMax: valeurEffective(
      "pointsDeVieMax",
      personnage.pointsDeVieMax,
      effets,
    ),
    chance: valeurEffective("chance", personnage.chance, effets),
    dexterite: valeurEffective("dexterite", personnage.dexterite, effets),
    degats: valeurEffective("degats", bonusDeDegatsDesArmes(armes), effets),
  };
}

/** Les valeurs du personnage qu'un effet peut changer (les dégâts viennent des armes). */
const VALEURS_DU_PERSONNAGE = [
  "pointsDeVie",
  "pointsDeVieMax",
  "chance",
  "dexterite",
] as const;

/**
 * Retire l'effet n° `index`. Chaque valeur revient à sa base, plus les
 * effets qui restent : les pertes et dépenses faites pendant l'effet restent
 * acquises (30 / 34 avec la bague, −5, donne 23 / 32 sans elle).
 *
 * - Une base passée sous son plancher (0 PV, 1 PV max, 0 CHANCE) parce que
 *   l'effet a été dépensé y revient : le retrait ne laisse aucune dette cachée.
 * - Si le retrait fait passer les PV au-dessus du maximum (soigné jusqu'à
 *   34 / 34 avec un bonus de PV max), ils redescendent au maximum. Des PV
 *   déjà au-dessus avant le retrait (le livre peut déroger) restent tels quels.
 */
export function retirerUnEffet(
  { personnage, effets }: Pick<Aventure, "personnage" | "effets">,
  index: number,
): { personnage: Personnage; effets: Effet[] } {
  const restants = effets.filter((_, rang) => rang !== index);
  const apres = { ...personnage };
  for (const cible of VALEURS_DU_PERSONNAGE) {
    apres[cible] = Math.max(
      apres[cible],
      PLANCHERS[cible] - bonusDesEffets(cible, restants),
    );
  }
  const avant = valeursEffectives({ personnage, armes: [], effets });
  const maintenant = valeursEffectives({
    personnage: apres,
    armes: [],
    effets: restants,
  });
  if (
    avant.pointsDeVie <= avant.pointsDeVieMax &&
    maintenant.pointsDeVie > maintenant.pointsDeVieMax
  ) {
    apres.pointsDeVie = baseApres(
      "pointsDeVie",
      maintenant.pointsDeVieMax,
      restants,
    );
  }
  return { personnage: apres, effets: restants };
}

/** Le premier mot du nom, en minuscules : « Potion d'agilité » devient « potion ». */
function nomCourt(effet: Effet): string {
  return effet.nom.trim().split(/\s+/)[0].toLocaleLowerCase("fr");
}

/**
 * La ligne sous une valeur modifiée : « base 7 · potion +1 ». `null` quand
 * aucun effet ne vise la valeur. La base des dégâts (le bonus des armes)
 * s'écrit avec son signe, comme un bonus.
 */
export function explication(
  cible: Cible,
  base: number,
  effets: readonly Effet[],
): string | null {
  const concernes = effetsSur(cible, effets);
  if (concernes.length === 0) return null;
  const ecrireLaBase = cible === "degats" ? formaterUnBonus : formaterUnNombre;
  return [
    `base ${ecrireLaBase(base)}`,
    ...concernes.map(
      (effet) => `${nomCourt(effet)} ${formaterUnBonus(effet.valeur)}`,
    ),
  ].join(" · ");
}
