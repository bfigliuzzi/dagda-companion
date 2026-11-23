/**
 * LE TUTORIEL D'INSTALLATION (spec vitrine, tableau des appareils) : deviner
 * l'appareil et le navigateur d'après l'identifiant du navigateur (user
 * agent), et dire comment y installer l'app.
 *
 * Code pur : il reçoit ce que le navigateur dit de lui, sans le lire
 * (`navigateur.svelte.ts` lit `navigator`).
 */

/**
 * Les six cas du tableau, dans son ordre ; « Autre appareil ? » les déplie
 * tous et marque celui de l'appareil deviné.
 */
export type Cas =
  | "android"
  | "androidFirefox"
  | "ios"
  | "ordinateur"
  | "macSafari"
  | "ordinateurFirefox";

/** Un bouton du navigateur, dessiné dans la phrase tel qu'il apparaît à l'écran. */
export interface Pictogramme {
  icone: "partager" | "menu";
  /** Ce que lit un lecteur d'écran à sa place. */
  nom: string;
}

/** Un morceau de phrase : du texte, ou un bouton du navigateur dessiné. */
export type Morceau = string | Pictogramme;

/** Comment installer l'app sur ce navigateur. */
export type Marche =
  /** Le bouton « Installer » du navigateur (`beforeinstallprompt`). */
  | { type: "bouton" }
  /** Des étapes numérotées, parce que l'ordre compte. */
  | { type: "etapes"; etapes: readonly (readonly Morceau[])[] }
  /** Ce navigateur n'installe pas les apps web. */
  | { type: "aucune" };

export interface Appareil {
  cas: Cas;
  /** Nommé à droite du titre : « iPhone · Safari ». */
  nom: { appareil: string; navigateur: string };
  marche: Marche;
}

const BOUTON: Marche = { type: "bouton" };

/**
 * L'appareil deviné, ou `null` quand l'identifiant ne correspond à aucun cas
 * du tableau (Opera, une vue web dans une autre app…).
 *
 * `pointsDeContact` (`navigator.maxTouchPoints`) sépare l'iPad, qui se
 * présente comme un Mac, du vrai Mac, qui n'a pas d'écran tactile.
 */
export function devinerLAppareil(
  userAgent: string,
  pointsDeContact: number,
): Appareil | null {
  if (/Android/.test(userAgent)) return android(userAgent);
  if (/iPhone|iPod/.test(userAgent)) return ios(userAgent, "iPhone");
  if (/iPad/.test(userAgent)) return ios(userAgent, "iPad");
  if (/Macintosh/.test(userAgent) && pointsDeContact > 1) {
    return ios(userAgent, "iPad");
  }
  return ordinateur(userAgent);
}

function ordinateur(ua: string): Appareil | null {
  if (/Firefox\//.test(ua)) {
    return {
      cas: "ordinateurFirefox",
      nom: { appareil: "Ordinateur", navigateur: "Firefox" },
      marche: { type: "aucune" },
    };
  }
  if (/OPR\/|YaBrowser\//.test(ua)) return null;
  if (/Edg\//.test(ua)) {
    return {
      cas: "ordinateur",
      nom: { appareil: "Ordinateur", navigateur: "Edge" },
      marche: BOUTON,
    };
  }
  if (/Chrome\//.test(ua)) {
    return {
      cas: "ordinateur",
      nom: { appareil: "Ordinateur", navigateur: "Chrome" },
      marche: BOUTON,
    };
  }
  if (/Macintosh/.test(ua) && /Version\/.*Safari\//.test(ua)) {
    return {
      cas: "macSafari",
      nom: { appareil: "Mac", navigateur: "Safari" },
      marche: {
        type: "etapes",
        etapes: [
          ["Ouvrez le menu Fichier, en haut de l'écran."],
          ["Choisissez « Ajouter au Dock »."],
          ["Cliquez sur « Ajouter »."],
        ],
      },
    };
  }
  return null;
}

/** Le bouton Partager, dessiné dans la phrase. */
const PARTAGER: Pictogramme = { icone: "partager", nom: "Partager" };

/**
 * Sur iPhone et iPad, Safari, Chrome et Edge installent par leur bouton
 * Partager. Safari le place en bas de l'écran sur iPhone, en haut sur iPad ;
 * Chrome et Edge, chacun à sa façon.
 */
function ios(ua: string, appareil: "iPhone" | "iPad"): Appareil | null {
  const navigateur = /CriOS\//.test(ua)
    ? "Chrome"
    : /EdgiOS\//.test(ua)
      ? "Edge"
      : // Safari, et seulement lui, se nomme par « Version/… Safari/… » sans
        // autre marque (FxiOS, OPiOS, l'app Google « GSA »…).
        /Version\/.*Safari\//.test(ua) && !/FxiOS|OPiOS|GSA\//.test(ua)
        ? "Safari"
        : null;
  if (navigateur === null) return null;
  const ou =
    navigateur !== "Safari"
      ? "du navigateur"
      : appareil === "iPhone"
        ? "en bas de l'écran"
        : "en haut de l'écran";
  return {
    cas: "ios",
    nom: { appareil, navigateur },
    marche: {
      type: "etapes",
      etapes: [
        ["Touchez le bouton Partager ", PARTAGER, ` ${ou}.`],
        ["Choisissez « Sur l'écran d'accueil »."],
        ["Touchez « Ajouter »."],
      ],
    },
  };
}

/** Le menu à trois points, dessiné dans la phrase. */
const MENU: Pictogramme = { icone: "menu", nom: "trois points" };

function android(ua: string): Appareil | null {
  if (/Firefox\//.test(ua)) {
    return {
      cas: "androidFirefox",
      nom: { appareil: "Android", navigateur: "Firefox" },
      marche: {
        type: "etapes",
        etapes: [
          ["Touchez le menu ", MENU, " du navigateur."],
          ["Choisissez « Installer »."],
        ],
      },
    };
  }
  // Une vue web (« wv ») ou un Chromium absent du tableau (Opera…) : rien à deviner.
  if (/; wv\)|OPR\/|YaBrowser\//.test(ua)) return null;
  const navigateur = /SamsungBrowser\//.test(ua)
    ? "Samsung Internet"
    : /EdgA\//.test(ua)
      ? "Edge"
      : /Chrome\//.test(ua)
        ? "Chrome"
        : null;
  if (navigateur === null) return null;
  return {
    cas: "android",
    nom: { appareil: "Android", navigateur },
    marche: BOUTON,
  };
}

/** Ce que le tutoriel montre, une fois connue l'invitation du navigateur. */
export type MarcheAffichee =
  | Marche
  /** Chrome ou Edge n'ont pas (encore) proposé l'installation. */
  | { type: "attente" }
  /** L'appareil n'est pas dans le tableau : toutes les marches à suivre. */
  | { type: "inconnue" };

/**
 * L'invitation du navigateur (`beforeinstallprompt`) donne toujours le
 * bouton « Installer », même sur un appareil que le tableau ne connaît pas.
 */
export function marcheAffichee(
  appareil: Appareil | null,
  inviteRecue: boolean,
): MarcheAffichee {
  if (inviteRecue) return { type: "bouton" };
  if (appareil === null) return { type: "inconnue" };
  if (appareil.marche.type === "bouton") return { type: "attente" };
  return appareil.marche;
}

/** L'appareil deviné, dans une phrase : « Android avec Chrome », « ordinateur avec Firefox ». */
export function enToutesLettres({ nom }: Appareil): string {
  const appareil = nom.appareil === "Ordinateur" ? "ordinateur" : nom.appareil;
  return `${appareil} avec ${nom.navigateur}`;
}
