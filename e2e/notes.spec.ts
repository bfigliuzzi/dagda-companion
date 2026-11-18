import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    if (localStorage.getItem("dagda-compagnon")) return;
    localStorage.setItem(
      "dagda-compagnon",
      JSON.stringify({
        version: 4,
        aventure: {
          chapitre: 112,
          mode: "simplifie",
          sauvegardesUtilisees: 0,
          notes: "",
          armes: [],
          besace: {
            objets: [],
            bourse: false,
            boulons: 0,
            boulonsForces: false,
          },
          personnage: {
            talent: "Herbologie",
            pointsDeVieMax: 32,
            pointsDeVie: 28,
            chance: 4,
            dexterite: 7,
          },
        },
      }),
    );
  });
});

test("la zone de notes s'agrandit avec son texte, sans défilement interne, et le focus est jaune", async ({
  page,
}) => {
  await page.goto("/");
  const zone = page.getByRole("textbox", { name: "Notes" });
  const hauteurVide = (await zone.boundingBox())!.height;
  expect(hauteurVide).toBeGreaterThanOrEqual(120);

  await zone.click();
  await zone.fill(
    Array.from({ length: 15 }, (_, i) => `Ligne ${i + 1}`).join("\n"),
  );

  const { hauteur, defile } = await zone.evaluate((z) => ({
    hauteur: z.getBoundingClientRect().height,
    defile: z.scrollHeight > z.clientHeight,
  }));
  expect(hauteur).toBeGreaterThan(hauteurVide + 100);
  expect(defile).toBe(false);

  // Texte de 15 px, interligne 1,55, contour jaune au focus.
  const style = await zone.evaluate((z) => {
    const css = getComputedStyle(z);
    return {
      taille: css.fontSize,
      interligne: css.lineHeight,
      contour: css.outlineColor,
      epaisseur: css.outlineWidth,
    };
  });
  expect(style.taille).toBe("15px");
  expect(style.interligne).toBe("23.25px");
  expect(style.contour).toBe("rgb(242, 201, 76)");
  expect(style.epaisseur).toBe("2px");
});

test("les notes sont retrouvées après rechargement, même hors ligne", async ({
  page,
  context,
}) => {
  await page.goto("/");
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload(); // le service worker contrôle la page
  const zone = page.getByRole("textbox", { name: "Notes" });
  await zone.fill("Porte qui ne s'ouvre qu'en hiver");

  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole("textbox", { name: "Notes" })).toHaveValue(
    "Porte qui ne s'ouvre qu'en hiver",
  );
});
