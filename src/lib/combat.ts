/**
 * LE MOTEUR DE COMBAT : les règles du livre (docs/regles-livre-1.md,
 * « Combat »), sans écran. Il reçoit le dé en paramètre pour que les tests le
 * jouent avec des dés fixés.
 *
 * Un tour, en boucle : le premier camp attaque (2d6 ≤ sa DEXTÉRITÉ : touché ;
 * la cible perd alors 1 + 1d6 + bonus de dommage), puis l'autre riposte avec
 * les mêmes règles. Le combat s'arrête dès qu'un camp tombe à 0 PV : ennemi à
 * 0 → « gagné » ; lecteur à 0 → « perdu », et c'est le livre qui dit la suite.
 *
 * Emploi :
 *
 *   let combat = commencerUnCombat(nouveau, ficheDuLecteur(valeursEffectives(aventure)));
 *   combat = jouerUnTour(combat, de);        // « Tour suivant »
 *   combat = jouerJusquALaFin(combat, de);   // « Finir »
 *   combat = interrompreLeCombat(combat);    // le lecteur quitte en cours
 *
 * Chaque fonction rend un nouveau combat (rien n'est modifié sur place), prêt
 * à enregistrer tel quel : `Combat` est aussi la ligne de l'historique
 * (chapitre, issue, fiches de départ, déroulé ; `bilanDuCombat` en tire le
 * nombre de tours, les PV perdus et la CHANCE dépensée).
 *
 * Le lecteur se bat avec ses valeurs effectives (base + armes + effets, voir
 * valeursEffectives.ts), relevées une fois au début du combat.
 */
import {
  estCritique,
  estUnBonusDeDegats,
  estUnChapitre,
  estUneDexterite,
  estUnMaximumDePointsDeVie,
} from "./aventure";
import { ajusterLeTotal } from "./chance";
import type { De } from "./des";
import type { ValeursEffectives } from "./valeursEffectives";

export type Camp = "lecteur" | "ennemi";

/** Comment le combat s'est terminé. « interrompu » : le lecteur l'a quitté en cours. */
export type Issue = "gagne" | "perdu" | "interrompu";

/** Ce qu'il faut savoir d'un camp pour l'opposer à l'autre. */
export interface Combattant {
  dexterite: number;
  pointsDeVie: number;
  /** Bonus de dommage ajouté à chaque coup qui touche (0 pour un ennemi sans bonus). */
  bonus: number;
}

/** Le lecteur au début du combat, avec ses valeurs effectives. */
export interface FicheDuLecteur extends Combattant {
  pointsDeVieMax: number;
  chance: number;
}

/** Ce que le lecteur recopie du livre sur l'écran « Nouveau combat ». */
export interface NouveauCombat {
  /** Le combat est repéré par son chapitre, pas par le nom de l'ennemi. */
  chapitre: number;
  /** Individus du groupe : un groupe compte pour un seul adversaire (sert au mode narratif). */
  adversaires: number;
  ennemi: Combattant;
  /** Qui frappe en premier : le lecteur, sauf mention contraire du livre. */
  premier: Camp;
}

/** Les dégâts d'un coup qui touche : 1 + d6 + bonus. */
export interface Degats {
  /** Le d6 lancé. */
  de: number;
  /** CHANCE ajoutée au d6 par la CHANCE automatique (6 au plus) ; 0 sinon. */
  chance: number;
  bonus: number;
  /** PV que perd la cible : 1 + de + chance + bonus, jamais moins de 0. */
  total: number;
}

/** Une entrée du journal : une attaque. */
export interface Jet {
  tour: number;
  attaquant: Camp;
  /** Les deux dés du toucher. */
  des: [number, number];
  /** CHANCE retirée du total par la CHANCE automatique pour toucher ; 0 sinon. */
  chance: number;
  /** Total retenu : somme des dés − chance. Touché s'il est ≤ DEXTÉRITÉ. */
  total: number;
  touche: boolean;
  /** `null` quand le coup est raté. */
  degats: Degats | null;
  /** PV de la cible après ce jet. */
  pointsDeVie: number;
}

export interface Combat {
  chapitre: number;
  adversaires: number;
  premier: Camp;
  /** Les deux fiches au début du combat ; elles ne changent plus. */
  depart: { lecteur: FicheDuLecteur; ennemi: Combattant };
  /** Où en sont les deux camps. */
  pointsDeVie: Record<Camp, number>;
  /** CHANCE qui reste au lecteur (seule la CHANCE automatique la dépense en combat). */
  chance: number;
  /** Le journal, du premier jet au dernier. */
  jets: Jet[];
  /** `null` tant que le combat continue. */
  issue: Issue | null;
}

/** Ce que le lecteur a saisi sur l'écran « Nouveau combat ». */
export interface BrouillonDeCombat {
  chapitre: number | null;
  dexterite: number | null;
  pointsDeVie: number | null;
  adversaires: number | null;
  bonus: number | null;
  ennemiEnPremier: boolean;
}

/**
 * Ce qui manque encore pour commencer, dit comme le libellé du bouton ;
 * `null` quand la fiche de l'ennemi est complète.
 */
export function ceQuiManqueAuCombat(
  brouillon: BrouillonDeCombat,
): string | null {
  const { chapitre, dexterite, pointsDeVie, adversaires, bonus } = brouillon;
  if (!estUnChapitre(chapitre)) return "Corrigez le chapitre du combat";
  if (dexterite === null) return "Saisissez d'abord la DEX de l'ennemi";
  if (!estUneDexterite(dexterite)) return "Corrigez la DEX de l'ennemi";
  if (pointsDeVie === null) return "Saisissez d'abord les PV de l'ennemi";
  if (!estUnMaximumDePointsDeVie(pointsDeVie))
    return "Corrigez les PV de l'ennemi";
  if (!estUnMaximumDePointsDeVie(adversaires))
    return "Corrigez le nombre d'adversaires";
  if (!estUnBonusDeDegats(bonus)) return "Corrigez le bonus de dégâts";
  return null;
}

/** La fiche de l'ennemi recopiée, prête pour `commencerUnCombat`. */
export function nouveauCombat(brouillon: BrouillonDeCombat): NouveauCombat {
  if (ceQuiManqueAuCombat(brouillon) !== null) {
    throw new Error("La fiche de l'ennemi n'est pas complète.");
  }
  return {
    chapitre: brouillon.chapitre!,
    adversaires: brouillon.adversaires!,
    ennemi: {
      dexterite: brouillon.dexterite!,
      pointsDeVie: brouillon.pointsDeVie!,
      bonus: brouillon.bonus!,
    },
    premier: brouillon.ennemiEnPremier ? "ennemi" : "lecteur",
  };
}

/** Les valeurs effectives du lecteur, telles que le combat les emploie. */
export function ficheDuLecteur(valeurs: ValeursEffectives): FicheDuLecteur {
  return {
    dexterite: valeurs.dexterite,
    bonus: valeurs.degats,
    pointsDeVie: valeurs.pointsDeVie,
    pointsDeVieMax: valeurs.pointsDeVieMax,
    chance: valeurs.chance,
  };
}

/** Le combat s'arrête dès qu'un camp est à 0 PV ; le lecteur à 0, c'est perdu. */
function issueSelonLesPV(pointsDeVie: Record<Camp, number>): Issue | null {
  if (pointsDeVie.lecteur <= 0) return "perdu";
  if (pointsDeVie.ennemi <= 0) return "gagne";
  return null;
}

export function commencerUnCombat(
  nouveau: NouveauCombat,
  lecteur: FicheDuLecteur,
): Combat {
  const pointsDeVie = {
    lecteur: lecteur.pointsDeVie,
    ennemi: nouveau.ennemi.pointsDeVie,
  };
  return {
    chapitre: nouveau.chapitre,
    adversaires: nouveau.adversaires,
    premier: nouveau.premier,
    depart: { lecteur: { ...lecteur }, ennemi: { ...nouveau.ennemi } },
    pointsDeVie,
    chance: lecteur.chance,
    jets: [],
    issue: issueSelonLesPV(pointsDeVie),
  };
}

const autreCamp = (camp: Camp): Camp =>
  camp === "lecteur" ? "ennemi" : "lecteur";

/** Le nombre de tours joués : le tour du dernier jet. */
export function toursJoues(combat: Combat): number {
  return combat.jets.at(-1)?.tour ?? 0;
}

/**
 * LA CHANCE AUTOMATIQUE (docs/regles-livre-1.md, « Chance automatique en
 * combat »). L'app ne dépense la CHANCE à la place du lecteur que si :
 * - il est en état critique (moins de 7 PV) ;
 * - un seul coup peut achever l'ennemi : PV de l'ennemi ≤ 1 + 6 + bonus ;
 * - la CHANCE restante suffit pour l'étape en cours.
 * Elle agit en deux étapes, chaque fois au minimum : `chanceAuToucher`, puis
 * `chanceAuxDegats`. Une étape que la CHANCE ne couvre pas ne coûte rien ;
 * l'étape « toucher » se décide avant le d6 de dégâts, donc sans savoir si
 * l'étape « dégâts » sera payable.
 */
function chanceAutomatiquePossible(combat: Combat): boolean {
  return (
    estCritique(combat.pointsDeVie.lecteur) &&
    ennemiAchevable(combat.pointsDeVie.ennemi, combat.depart.lecteur.bonus)
  );
}

/**
 * Un seul coup du lecteur peut achever l'ennemi encore debout : ses PV sont
 * ≤ 1 + 6 + bonus de dommage du lecteur (le journal le dit : « Ennemi
 * achevable. »).
 */
export function ennemiAchevable(pointsDeVie: number, bonus: number): boolean {
  return pointsDeVie > 0 && pointsDeVie <= 1 + 6 + bonus;
}

/**
 * Le coût d'un décalage du total qui doit atteindre `cible` : `null` si la
 * CHANCE disponible ne suffit pas (alors l'étape ne dépense rien).
 */
function coutPourAtteindre(
  obtenu: number,
  cible: number,
  chanceDisponible: number,
): number | null {
  const { total, cout } = ajusterLeTotal(
    obtenu,
    cible - obtenu,
    chanceDisponible,
  );
  return total === cible ? cout : null;
}

/**
 * Étape « toucher » : points de CHANCE retirés du total des 2d6 pour que le
 * coup du lecteur touche, juste jusqu'à sa DEXTÉRITÉ.
 */
function chanceAuToucher(combat: Combat, obtenu: number): number {
  const { dexterite } = combat.depart.lecteur;
  if (obtenu <= dexterite || !chanceAutomatiquePossible(combat)) return 0;
  return coutPourAtteindre(obtenu, dexterite, combat.chance) ?? 0;
}

/**
 * Étape « dégâts » : points de CHANCE ajoutés au d6 de dégâts (6 au plus)
 * pour que le coup du lecteur achève l'ennemi. `combat.chance` est déjà
 * diminuée de ce que l'étape « toucher » a coûté.
 */
function chanceAuxDegats(combat: Combat, de: number): number {
  if (!chanceAutomatiquePossible(combat)) return 0;
  const { bonus } = combat.depart.lecteur;
  const deNecessaire = combat.pointsDeVie.ennemi - 1 - bonus;
  if (de >= deNecessaire || deNecessaire > 6) return 0;
  return coutPourAtteindre(de, deNecessaire, combat.chance) ?? 0;
}

/**
 * Une attaque : toucher, puis dégâts si touché. La CHANCE ne touche qu'aux
 * jets du lecteur, jamais à ceux de l'ennemi.
 */
function attaquer(combat: Combat, attaquant: Camp, de: De): Combat {
  const cible = autreCamp(attaquant);
  const fiche = combat.depart[attaquant];
  const des: [number, number] = [de(), de()];
  const obtenu = des[0] + des[1];
  const chance = attaquant === "lecteur" ? chanceAuToucher(combat, obtenu) : 0;
  const total = obtenu - chance;
  const touche = total <= fiche.dexterite;
  let depense = chance;
  let degats: Degats | null = null;
  if (touche) {
    const d6 = de();
    const ajout =
      attaquant === "lecteur"
        ? chanceAuxDegats({ ...combat, chance: combat.chance - chance }, d6)
        : 0;
    depense += ajout;
    degats = {
      de: d6,
      chance: ajout,
      bonus: fiche.bonus,
      // Choix par défaut : un malus ne fait jamais des dégâts négatifs.
      total: Math.max(0, 1 + d6 + ajout + fiche.bonus),
    };
  }
  const pointsDeVie = {
    ...combat.pointsDeVie,
    [cible]: Math.max(0, combat.pointsDeVie[cible] - (degats?.total ?? 0)),
  };
  const jet: Jet = {
    tour: toursJoues(combat) + (attaquant === combat.premier ? 1 : 0),
    attaquant,
    des,
    chance,
    total,
    touche,
    degats,
    pointsDeVie: pointsDeVie[cible],
  };
  return {
    ...combat,
    pointsDeVie,
    chance: combat.chance - depense,
    jets: [...combat.jets, jet],
    issue: issueSelonLesPV(pointsDeVie),
  };
}

/**
 * Un tour : le premier camp attaque, puis l'autre riposte s'il est encore
 * debout. Un combat déjà terminé ne bouge plus.
 */
export function jouerUnTour(combat: Combat, de: De): Combat {
  if (combat.issue !== null) return combat;
  const apresLAttaque = attaquer(combat, combat.premier, de);
  if (apresLAttaque.issue !== null) return apresLAttaque;
  return attaquer(apresLAttaque, autreCamp(combat.premier), de);
}

/**
 * Au-delà, « Finir » s'arrête et rend la main : deux camps qui ne peuvent
 * jamais se toucher (DEXTÉRITÉ sous 2) ne doivent pas bloquer l'app.
 */
export const TOURS_MAX_POUR_FINIR = 1000;

/** « Finir » : joue les tours jusqu'à la fin du combat. */
export function jouerJusquALaFin(combat: Combat, de: De): Combat {
  let courant = combat;
  for (let n = 0; n < TOURS_MAX_POUR_FINIR && courant.issue === null; n++) {
    courant = jouerUnTour(courant, de);
  }
  return courant;
}

/** Le lecteur quitte le combat en cours : ce qui a été joué reste acquis. */
export function interrompreLeCombat(combat: Combat): Combat {
  return combat.issue === null ? { ...combat, issue: "interrompu" } : combat;
}

/** Ce que l'écran de résultat et l'historique résument d'un combat. */
export interface Bilan {
  tours: number;
  pointsDeViePerdus: number;
  /** CHANCE dépensée pendant le combat : toute dépense y est automatique. */
  chanceDepensee: number;
}

export function bilanDuCombat(combat: Combat): Bilan {
  return {
    tours: toursJoues(combat),
    pointsDeViePerdus: Math.max(
      0,
      combat.depart.lecteur.pointsDeVie - combat.pointsDeVie.lecteur,
    ),
    chanceDepensee: combat.depart.lecteur.chance - combat.chance,
  };
}

const ISSUES: readonly Issue[] = ["gagne", "perdu", "interrompu"];
const CAMPS: readonly Camp[] = ["lecteur", "ennemi"];

function estUnObjet(valeur: unknown): valeur is Record<string, unknown> {
  return typeof valeur === "object" && valeur !== null;
}

function sontDesEntiers(objet: unknown, cles: readonly string[]): boolean {
  return estUnObjet(objet) && cles.every((cle) => Number.isInteger(objet[cle]));
}

const CLES_D_UN_COMBATTANT = ["dexterite", "pointsDeVie", "bonus"] as const;

function estUnJet(valeur: unknown): valeur is Jet {
  if (!sontDesEntiers(valeur, ["tour", "chance", "total", "pointsDeVie"]))
    return false;
  const { attaquant, des, touche, degats } = valeur as unknown as Jet;
  return (
    CAMPS.includes(attaquant) &&
    Array.isArray(des) &&
    des.length === 2 &&
    des.every(Number.isInteger) &&
    typeof touche === "boolean" &&
    (degats === null ||
      sontDesEntiers(degats, ["de", "chance", "bonus", "total"]))
  );
}

/** Vérifie un combat relu depuis l'appareil, en cours ou terminé. */
export function estUnCombat(valeur: unknown): valeur is Combat {
  if (!sontDesEntiers(valeur, ["chapitre", "adversaires", "chance"]))
    return false;
  const combat = valeur as unknown as Combat;
  return (
    combat.chapitre >= 1 &&
    CAMPS.includes(combat.premier) &&
    (combat.issue === null || ISSUES.includes(combat.issue)) &&
    sontDesEntiers(combat.pointsDeVie, CAMPS) &&
    estUnObjet(combat.depart) &&
    sontDesEntiers(combat.depart.lecteur, [
      ...CLES_D_UN_COMBATTANT,
      "pointsDeVieMax",
      "chance",
    ]) &&
    sontDesEntiers(combat.depart.ennemi, CLES_D_UN_COMBATTANT) &&
    Array.isArray(combat.jets) &&
    combat.jets.every(estUnJet)
  );
}
