import { render, screen, within } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { tick } from "svelte";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "../App.svelte";
import { enregistrerAventure } from "./test/uneAventure";

/*
 * Le tutoriel d'installation, sur l'Accueil et sur l'écran « Installer
 * l'app » ouvert depuis le pied de page de la feuille. Seul ce qui vient du
 * navigateur est remplacé : son identifiant, son écran tactile, le mode
 * installé, et l'invitation `beforeinstallprompt` de Chrome.
 */

const IPHONE_SAFARI =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1";
const ANDROID_CHROME =
  "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36";
const WINDOWS_FIREFOX =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0";

/** Le navigateur que le test tient en main. */
function surLeNavigateur(
  userAgent: string,
  { pointsDeContact = 5, installee = false } = {},
) {
  vi.spyOn(navigator, "userAgent", "get").mockReturnValue(userAgent);
  Object.defineProperty(navigator, "maxTouchPoints", {
    value: pointsDeContact,
    configurable: true,
  });
  // jsdom n'a pas `matchMedia` : le mode installé se lit par lui.
  vi.stubGlobal("matchMedia", (media: string) => ({
    media,
    matches: installee && media === "(display-mode: standalone)",
  }));
}

/** Chrome propose l'installation ; le lecteur l'accepte ou la refuse. */
async function chromeProposeLInstallation(
  outcome: "accepted" | "dismissed" = "accepted",
) {
  const invite = Object.assign(
    new Event("beforeinstallprompt", { cancelable: true }),
    {
      prompt: vi.fn(async () => {}),
      userChoice: Promise.resolve({ outcome }),
    },
  );
  window.dispatchEvent(invite);
  await tick();
  return invite;
}

function ouvrirLApp() {
  render(App);
  return userEvent.setup();
}

/** « Autre appareil ? », avec son espace insécable. */
const AUTRE_APPAREIL = /^Autre appareil\s\?$/;
const tutoriel = () =>
  screen.queryByRole("region", { name: "Installer l'app" });
const piedDePage = () => within(screen.getByRole("contentinfo"));
/**
 * Le texte lu par un lecteur d'écran : sans ce qui lui est caché (le numéro
 * d'étape, déjà dit par la liste), avec le nom des boutons dessinés.
 */
function lu(element: Element) {
  const copie = element.cloneNode(true) as Element;
  copie.querySelectorAll("[aria-hidden=true]").forEach((e) => e.remove());
  copie
    .querySelectorAll("[role=img]")
    .forEach((e) => e.replaceWith(`[${e.getAttribute("aria-label")}]`));
  return (copie.textContent ?? "").replace(/\s+/g, " ").trim();
}

beforeEach(() => localStorage.clear());
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  // Propriété propre à Safari sur iPhone, posée par un test.
  Reflect.deleteProperty(navigator, "standalone");
});

describe("sur l'Accueil, le tutoriel de l'appareil deviné", () => {
  it("iPhone avec Safari : les étapes numérotées, avec le bouton Partager dessiné", () => {
    surLeNavigateur(IPHONE_SAFARI);
    ouvrirLApp();

    const section = within(tutoriel()!);
    expect(section.getByText("iPhone · Safari")).toBeVisible();
    expect(
      section.getByText(
        "Installée, elle s'ouvre en plein écran depuis son icône et marche sans réseau.",
      ),
    ).toBeVisible();
    const etapes = section.getByRole("list", { name: "Étapes" });
    expect(within(etapes).getAllByRole("listitem").map(lu)).toEqual([
      "Touchez le bouton Partager [Partager] en bas de l'écran.",
      "Choisissez « Sur l'écran d'accueil ».",
      "Touchez « Ajouter ».",
    ]);
    expect(within(etapes).getByRole("img", { name: "Partager" })).toBeVisible();
    expect(section.queryByRole("button", { name: "Installer" })).toBeNull();
  });

  it("Android avec Chrome : le bouton « Installer » du navigateur remplace les étapes, puis disparaît avec toute la section une fois l'app installée", async () => {
    surLeNavigateur(ANDROID_CHROME);
    const lecteur = ouvrirLApp();
    const section = within(tutoriel()!);
    expect(section.getByText("Android · Chrome")).toBeVisible();
    // L'invitation de Chrome n'est pas encore arrivée.
    expect(
      section.getByText(
        "Le bouton « Installer » apparaît ici quand le navigateur le propose.",
      ),
    ).toBeVisible();

    const invite = await chromeProposeLInstallation("accepted");
    // L'app retient l'invitation : Chrome n'affiche pas sa propre bannière.
    expect(invite.defaultPrevented).toBe(true);
    expect(section.queryByRole("list", { name: "Étapes" })).toBeNull();
    expect(
      section.queryByText(/apparaît ici quand le navigateur le propose/),
    ).toBeNull();

    await lecteur.click(section.getByRole("button", { name: "Installer" }));
    expect(invite.prompt).toHaveBeenCalledOnce();
    expect(tutoriel()).toBeNull();
    expect(
      piedDePage().queryByRole("link", { name: "Installer l'app" }),
    ).toBeNull();
    // « Commencer » reste.
    expect(screen.getByRole("button", { name: "Commencer" })).toBeVisible();
  });

  it("le lecteur refuse l'installation : le bouton s'en va, le tutoriel reste", async () => {
    surLeNavigateur(ANDROID_CHROME);
    const lecteur = ouvrirLApp();
    await chromeProposeLInstallation("dismissed");
    await lecteur.click(
      within(tutoriel()!).getByRole("button", { name: "Installer" }),
    );
    expect(tutoriel()).toBeVisible();
    expect(screen.queryByRole("button", { name: "Installer" })).toBeNull();
    expect(
      piedDePage().getByRole("link", { name: "Installer l'app" }),
    ).toBeVisible();
  });

  it("l'app installée depuis le menu du navigateur (`appinstalled`) : le tutoriel disparaît", async () => {
    surLeNavigateur(ANDROID_CHROME);
    ouvrirLApp();
    await chromeProposeLInstallation();
    window.dispatchEvent(new Event("appinstalled"));
    await tick();
    expect(tutoriel()).toBeNull();
    expect(
      piedDePage().queryByRole("link", { name: "Installer l'app" }),
    ).toBeNull();
  });

  it("Firefox sur ordinateur : ce navigateur n'installe pas les apps web", () => {
    surLeNavigateur(WINDOWS_FIREFOX, { pointsDeContact: 0 });
    ouvrirLApp();
    const section = within(tutoriel()!);
    expect(section.getByText("Ordinateur · Firefox")).toBeVisible();
    expect(
      section.getByText(
        "Ce navigateur n'installe pas les apps web ; l'app marche très bien dans un onglet.",
      ),
    ).toBeVisible();
    expect(section.queryByRole("list", { name: "Étapes" })).toBeNull();
    expect(section.queryByRole("button", { name: "Installer" })).toBeNull();
  });

  it("le lien « Installer l'app » du pied de page mène au tutoriel de l'Accueil", () => {
    surLeNavigateur(IPHONE_SAFARI);
    ouvrirLApp();
    const lien = piedDePage().getByRole("link", { name: "Installer l'app" });
    expect(lien).toHaveAttribute("href", "#installer-accueil");
    expect(tutoriel()).toHaveAttribute("id", "installer-accueil");
  });
});

/** Les six cas du tableau, tels que les déplie « Autre appareil ? ». */
const TOUS_LES_APPAREILS = [
  "Android Chrome, Edge, Samsung Internet",
  "Android Firefox",
  "iPhone, iPad Safari, Chrome, Edge",
  "Ordinateur Chrome, Edge",
  "Mac Safari",
  "Ordinateur Firefox",
];

/** Chaque ligne : l'appareil et ses navigateurs, puis la marche à suivre. */
const lignes = (liste: HTMLElement) =>
  within(liste)
    .getAllByRole("listitem")
    .map((ligne) => ({
      appareil: Array.from(ligne.firstElementChild!.children, lu).join(" "),
      marche: lu(ligne.lastElementChild!),
    }));

describe("« Autre appareil ? » déplie les marches à suivre de tous les appareils", () => {
  it("sur l'Accueil : replié d'abord, puis les six cas, l'appareil deviné marqué", async () => {
    surLeNavigateur(IPHONE_SAFARI);
    const lecteur = ouvrirLApp();
    const autre = within(tutoriel()!).getByRole("button", {
      name: AUTRE_APPAREIL,
    });
    expect(autre).toHaveAttribute("aria-expanded", "false");
    expect(
      screen.queryByRole("list", { name: "Tous les appareils" }),
    ).toBeNull();

    await lecteur.click(autre);
    expect(autre).toHaveAttribute("aria-expanded", "true");
    const liste = screen.getByRole("list", { name: "Tous les appareils" });
    expect(lignes(liste)).toEqual([
      {
        appareil: "Android Chrome, Edge, Samsung Internet",
        marche:
          "Le bouton « Installer » apparaît au-dessus quand le navigateur le propose.",
      },
      {
        appareil: "Android Firefox",
        marche: "Menu [trois points] puis « Installer ».",
      },
      {
        appareil: "iPhone, iPad votre appareil Safari, Chrome, Edge",
        marche: "Bouton Partager [Partager] puis « Sur l'écran d'accueil ».",
      },
      {
        appareil: "Ordinateur Chrome, Edge",
        marche:
          "Le bouton « Installer » apparaît au-dessus quand le navigateur le propose.",
      },
      {
        appareil: "Mac Safari",
        marche: "Menu Fichier puis « Ajouter au Dock ».",
      },
      {
        appareil: "Ordinateur Firefox",
        marche:
          "Ce navigateur n'installe pas les apps web ; l'app marche très bien dans un onglet.",
      },
    ]);

    await lecteur.click(autre);
    expect(
      screen.queryByRole("list", { name: "Tous les appareils" }),
    ).toBeNull();
  });

  it("un appareil absent du tableau : pas d'appareil nommé, toutes les marches à suivre dépliées", () => {
    surLeNavigateur(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 OPR/116.0.0.0",
      { pointsDeContact: 0 },
    );
    ouvrirLApp();
    const section = within(tutoriel()!);
    expect(section.queryByText(/·/)).toBeNull();
    const liste = section.getByRole("list", { name: "Tous les appareils" });
    expect(lignes(liste).map((l) => l.appareil)).toEqual(TOUS_LES_APPAREILS);
  });
});

describe("l'app ouverte en mode installé n'affiche ni le tutoriel ni le lien « Installer l'app »", () => {
  it.each([
    ["Android (mode standalone)", ANDROID_CHROME],
    ["iPhone (navigator.standalone)", IPHONE_SAFARI],
  ])("sur l'Accueil, %s", (_, userAgent) => {
    surLeNavigateur(userAgent);
    if (userAgent === IPHONE_SAFARI) {
      Object.defineProperty(navigator, "standalone", {
        value: true,
        configurable: true,
      });
    } else {
      surLeNavigateur(userAgent, { installee: true });
    }
    ouvrirLApp();
    expect(screen.getByRole("button", { name: "Commencer" })).toBeVisible();
    expect(tutoriel()).toBeNull();
    expect(screen.queryByText("Installer l'app")).toBeNull();
    expect(
      piedDePage().getByRole("link", { name: "Mentions légales" }),
    ).toBeVisible();
  });

  it("sur la feuille", () => {
    surLeNavigateur(ANDROID_CHROME, { installee: true });
    enregistrerAventure();
    ouvrirLApp();
    expect(
      piedDePage().getByRole("link", { name: "Mentions légales" }),
    ).toBeVisible();
    expect(
      piedDePage().queryByRole("link", { name: "Installer l'app" }),
    ).toBeNull();
  });
});

describe("sur la feuille, le lien « Installer l'app » du pied de page ouvre le tutoriel", () => {
  const ouvrirLeTutoriel = async () => {
    enregistrerAventure();
    const lecteur = ouvrirLApp();
    await lecteur.click(
      piedDePage().getByRole("link", { name: "Installer l'app" }),
    );
    return lecteur;
  };
  const titre = () =>
    screen.queryByRole("heading", { level: 1, name: "Installer l'app" });

  it("iPhone avec Safari : l'appareil en toutes lettres, ses étapes, et tous les appareils dépliés ; le retour rend la feuille", async () => {
    surLeNavigateur(IPHONE_SAFARI);
    const lecteur = await ouvrirLeTutoriel();

    expect(titre()).toBeVisible();
    expect(
      screen.getByText(
        "Installée, elle s'ouvre en plein écran depuis son icône et marche sans réseau. Votre aventure reste la même.",
      ),
    ).toBeVisible();
    expect(lu(screen.getByText(/^Sur/))).toBe("Sur iPhone avec Safari :");
    expect(
      within(screen.getByRole("list", { name: "Étapes" }))
        .getAllByRole("listitem")
        .map(lu),
    ).toEqual([
      "Touchez le bouton Partager [Partager] en bas de l'écran.",
      "Choisissez « Sur l'écran d'accueil ».",
      "Touchez « Ajouter ».",
    ]);
    expect(
      screen.getByRole("button", { name: AUTRE_APPAREIL }),
    ).toHaveAttribute("aria-expanded", "true");
    const liste = screen.getByRole("list", { name: "Tous les appareils" });
    expect(lignes(liste).map((l) => l.appareil)).toEqual([
      "Android Chrome, Edge, Samsung Internet",
      "Android Firefox",
      "iPhone, iPad votre appareil Safari, Chrome, Edge",
      "Ordinateur Chrome, Edge",
      "Mac Safari",
      "Ordinateur Firefox",
    ]);
    expect(lignes(liste)[0].marche).toBe(
      "Le bouton « Installer » apparaît en haut de cet écran quand le navigateur le propose.",
    );
    // Ni pied de page ni dock de dés sur cet écran.
    expect(screen.queryByRole("contentinfo")).toBeNull();

    await lecteur.click(
      screen.getByRole("button", { name: "Retour à la feuille" }),
    );
    expect(titre()).toBeNull();
    expect(
      screen.getByRole("button", { name: /^Dernier chapitre lu/ }),
    ).toHaveTextContent("§ 112");
    expect(
      piedDePage().getByRole("link", { name: "Installer l'app" }),
    ).toBeVisible();
  });

  it("Android avec Chrome : le bouton « Installer » du navigateur, puis plus rien à suivre une fois l'app installée", async () => {
    surLeNavigateur(ANDROID_CHROME);
    const lecteur = await ouvrirLeTutoriel();
    expect(lu(screen.getByText(/^Sur/))).toBe(
      "Sur Android avec Chrome, le bouton « Installer » apparaît ici quand le navigateur le propose.",
    );

    const invite = await chromeProposeLInstallation("accepted");
    expect(lu(screen.getByText(/^Sur/))).toBe(
      "Sur Android avec Chrome, votre navigateur propose l'installation :",
    );
    await lecteur.click(screen.getByRole("button", { name: "Installer" }));
    expect(invite.prompt).toHaveBeenCalledOnce();
    expect(screen.queryByRole("button", { name: "Installer" })).toBeNull();
    expect(screen.queryByRole("button", { name: AUTRE_APPAREIL })).toBeNull();

    await lecteur.click(
      screen.getByRole("button", { name: "Retour à la feuille" }),
    );
    expect(
      piedDePage().queryByRole("link", { name: "Installer l'app" }),
    ).toBeNull();
  });

  it("Firefox sur ordinateur : ce navigateur n'installe pas les apps web", async () => {
    surLeNavigateur(WINDOWS_FIREFOX, { pointsDeContact: 0 });
    await ouvrirLeTutoriel();
    expect(lu(screen.getByText(/^Sur/))).toBe(
      "Sur ordinateur avec Firefox, ce navigateur n'installe pas les apps web ; l'app marche très bien dans un onglet.",
    );
    expect(screen.queryByRole("button", { name: "Installer" })).toBeNull();
  });
});
