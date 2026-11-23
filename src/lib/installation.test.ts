import { describe, expect, it } from "vitest";
import { devinerLAppareil, type Appareil, type Morceau } from "./installation";

/*
 * Identifiants de navigateur (user agents) réels, relevés sur les appareils.
 * Un iPad récent se présente comme un Mac : seul son écran tactile
 * (`navigator.maxTouchPoints`, 5 sur un iPad, 0 sur un Mac) le trahit.
 */
const UA = {
  androidChrome:
    "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36",
  androidEdge:
    "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36 EdgA/131.0.0.0",
  androidSamsung:
    "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/27.0 Chrome/125.0.0.0 Mobile Safari/537.36",
  androidFirefox:
    "Mozilla/5.0 (Android 14; Mobile; rv:133.0) Gecko/133.0 Firefox/133.0",
  androidWebView:
    "Mozilla/5.0 (Linux; Android 14; Pixel 8 Build/AP2A.240805.005; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/131.0.6778.39 Mobile Safari/537.36",
  androidOpera:
    "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36 OPR/86.0.0.0",
  iphoneSafari:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1",
  iphoneChrome:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/131.0.6778.73 Mobile/15E148 Safari/604.1",
  iphoneEdge:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 EdgiOS/131.2903.68 Mobile/15E148 Safari/605.1.15",
  iphoneFirefox:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/133.0 Mobile/15E148 Safari/605.1.15",
  iphoneAppGoogle:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) GSA/343.0.695551749 Mobile/15E148 Safari/604.1",
  ipadSafari:
    "Mozilla/5.0 (iPad; CPU OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1",
  ipadChrome:
    "Mozilla/5.0 (iPad; CPU OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/131.0.6778.73 Mobile/15E148 Safari/604.1",
  ipadEdge:
    "Mozilla/5.0 (iPad; CPU OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 EdgiOS/131.2903.68 Mobile/15E148 Safari/605.1.15",
  /** Safari sur un Mac, et sur un iPad qui demande le site pour ordinateur. */
  macSafari:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Safari/605.1.15",
  /** Edge sur un iPad qui demande le site pour ordinateur. */
  ipadCommeUnMacEdge:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 EdgiOS/131.2903.68 Safari/605.1.15",
  windowsChrome:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  macChrome:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  linuxChrome:
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  windowsEdge:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0",
  windowsOpera:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 OPR/116.0.0.0",
  windowsFirefox:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0",
  macFirefox:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:133.0) Gecko/20100101 Firefox/133.0",
  linuxFirefox:
    "Mozilla/5.0 (X11; Linux x86_64; rv:133.0) Gecko/20100101 Firefox/133.0",
};

/** Une étape lue comme à l'écran : le pictogramme dessiné est lu par son nom. */
const texte = (morceaux: readonly Morceau[]) =>
  morceaux
    .map((m) => (typeof m === "string" ? m : `[${m.nom}]`))
    .join("")
    .replaceAll(" ", " ");

/** Ce qu'on retient de l'appareil deviné : son nom, son cas et la marche à suivre. */
function lu(appareil: Appareil | null) {
  if (appareil === null) return null;
  const { cas, nom, marche } = appareil;
  return {
    cas,
    nom: `${nom.appareil} · ${nom.navigateur}`,
    marche: marche.type === "etapes" ? marche.etapes.map(texte) : marche.type,
  };
}

const sur = (userAgent: string, pointsDeContact = 0) =>
  lu(devinerLAppareil(userAgent, pointsDeContact));

const etapesIOS = (partager: string) => [
  `Touchez le bouton Partager [Partager] ${partager}.`,
  "Choisissez « Sur l'écran d'accueil ».",
  "Touchez « Ajouter ».",
];

describe("Android : Chrome, Edge et Samsung Internet ont le bouton « Installer » du navigateur", () => {
  it.each([
    ["Chrome", UA.androidChrome],
    ["Edge", UA.androidEdge],
    ["Samsung Internet", UA.androidSamsung],
  ])("%s", (navigateur, userAgent) => {
    expect(sur(userAgent, 5)).toEqual({
      cas: "android",
      nom: `Android · ${navigateur}`,
      marche: "bouton",
    });
  });
});

describe("Android : Firefox s'installe par son menu", () => {
  it("menu ⋮ puis « Installer »", () => {
    expect(sur(UA.androidFirefox, 5)).toEqual({
      cas: "androidFirefox",
      nom: "Android · Firefox",
      marche: [
        "Touchez le menu [trois points] du navigateur.",
        "Choisissez « Installer ».",
      ],
    });
  });

  it.each([
    ["une vue web dans une autre app", UA.androidWebView],
    ["Opera", UA.androidOpera],
  ])("ne devine rien pour %s, absent du tableau", (_, userAgent) => {
    expect(sur(userAgent, 5)).toBeNull();
  });
});

describe("iPhone et iPad : bouton Partager puis « Sur l'écran d'accueil »", () => {
  it("iPhone avec Safari : le bouton Partager est en bas de l'écran", () => {
    expect(sur(UA.iphoneSafari, 5)).toEqual({
      cas: "ios",
      nom: "iPhone · Safari",
      marche: etapesIOS("en bas de l'écran"),
    });
  });

  it("iPad avec Safari : le bouton Partager est en haut de l'écran", () => {
    expect(sur(UA.ipadSafari, 5)).toEqual({
      cas: "ios",
      nom: "iPad · Safari",
      marche: etapesIOS("en haut de l'écran"),
    });
  });

  it("l'iPad qui se présente comme un Mac est reconnu à son écran tactile", () => {
    expect(sur(UA.macSafari, 5)).toEqual({
      cas: "ios",
      nom: "iPad · Safari",
      marche: etapesIOS("en haut de l'écran"),
    });
    expect(sur(UA.ipadCommeUnMacEdge, 5)).toMatchObject({
      cas: "ios",
      nom: "iPad · Edge",
    });
  });

  it.each([
    ["iPhone · Chrome", UA.iphoneChrome],
    ["iPhone · Edge", UA.iphoneEdge],
    ["iPad · Chrome", UA.ipadChrome],
    ["iPad · Edge", UA.ipadEdge],
  ])("%s : le bouton Partager du navigateur", (nom, userAgent) => {
    expect(sur(userAgent, 5)).toEqual({
      cas: "ios",
      nom,
      marche: etapesIOS("du navigateur"),
    });
  });

  it.each([
    ["Firefox", UA.iphoneFirefox],
    ["l'app Google", UA.iphoneAppGoogle],
  ])("ne devine rien pour %s, absent du tableau", (_, userAgent) => {
    expect(sur(userAgent, 5)).toBeNull();
  });
});

describe("Mac : Safari ajoute l'app au Dock", () => {
  it("menu Fichier puis « Ajouter au Dock »", () => {
    expect(sur(UA.macSafari, 0)).toEqual({
      cas: "macSafari",
      nom: "Mac · Safari",
      marche: [
        "Ouvrez le menu Fichier, en haut de l'écran.",
        "Choisissez « Ajouter au Dock ».",
        "Cliquez sur « Ajouter ».",
      ],
    });
  });
});

describe("Ordinateur : Chrome et Edge ont le bouton « Installer » du navigateur", () => {
  it.each([
    ["Chrome", UA.windowsChrome],
    ["Chrome", UA.macChrome],
    ["Chrome", UA.linuxChrome],
    ["Edge", UA.windowsEdge],
  ])("%s", (navigateur, userAgent) => {
    expect(sur(userAgent, 0)).toEqual({
      cas: "ordinateur",
      nom: `Ordinateur · ${navigateur}`,
      marche: "bouton",
    });
  });

  it("ne devine rien pour Opera, absent du tableau", () => {
    expect(sur(UA.windowsOpera, 0)).toBeNull();
  });
});

describe("Ordinateur : Firefox n'installe pas les apps web", () => {
  it.each([UA.windowsFirefox, UA.macFirefox, UA.linuxFirefox])(
    "%s",
    (userAgent) => {
      expect(sur(userAgent, 0)).toEqual({
        cas: "ordinateurFirefox",
        nom: "Ordinateur · Firefox",
        marche: "aucune",
      });
    },
  );
});
