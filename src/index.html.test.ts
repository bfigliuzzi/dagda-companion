import { describe, expect, it } from "vitest";
import html from "../index.html?raw";

const page = new DOMParser().parseFromString(html, "text/html");

const contenu = (cle: string, valeur: string) =>
  page.querySelector(`meta[${cle}="${valeur}"]`)?.getAttribute("content");

const image = "https://bfigliuzzi.github.io/dagda-companion/apercu-partage.png";

describe("aperçu de partage", () => {
  it("porte les balises Open Graph", () => {
    expect(contenu("property", "og:title")).toBe(
      "Compagnon de La Saga de Dagda",
    );
    expect(contenu("property", "og:description")).toMatch(/non officiel/i);
    expect(contenu("property", "og:locale")).toBe("fr_FR");
    expect(contenu("property", "og:url")).toBe(
      "https://bfigliuzzi.github.io/dagda-companion/",
    );
    expect(contenu("property", "og:image:width")).toBe("1200");
    expect(contenu("property", "og:image:height")).toBe("630");
    expect(contenu("property", "og:image:alt")).toBeTruthy();
  });

  it("pointe l'image vers une adresse absolue du site publié", () => {
    expect(contenu("property", "og:image")).toBe(image);
    expect(contenu("name", "twitter:image")).toBe(image);
  });

  it("porte l'équivalent pour les cartes Twitter/X", () => {
    expect(contenu("name", "twitter:card")).toBe("summary_large_image");
    expect(contenu("name", "twitter:title")).toBe(
      contenu("property", "og:title"),
    );
    expect(contenu("name", "twitter:description")).toBe(
      contenu("property", "og:description"),
    );
    expect(contenu("name", "twitter:image:alt")).toBeTruthy();
  });
});
