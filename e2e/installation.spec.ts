import { expect, test } from "@playwright/test";

/*
 * L'écran 13 de la maquette, à 390 × 844 : avec le tutoriel d'installation,
 * l'Accueil dépasse l'écran, et « Commencer » reste collé en bas, le titre
 * « Installer l'app » visible juste au-dessus.
 */
test.use({ viewport: { width: 390, height: 844 } });

test("avec le tutoriel d'installation, « Commencer » est collé en bas de l'écran, sous le titre « Installer l'app »", async ({
  page,
}) => {
  await page.goto("/");
  const tutoriel = page.getByRole("region", { name: "Installer l'app" });
  await expect(tutoriel).toBeAttached();
  // Le téléphone de Playwright (Pixel 7) est un Android avec Chrome.
  await expect(tutoriel.getByText("Android · Chrome")).toBeVisible();

  const mesures = await page.evaluate(() => ({
    hauteurDeLEcran: innerHeight,
    dock: document.querySelector("[data-testid=dock]")!.getBoundingClientRect(),
    titre: document
      .querySelector("#installer-accueil h2")!
      .getBoundingClientRect(),
    finDeLaPage: document.documentElement.scrollHeight,
  }));
  expect(mesures.finDeLaPage).toBeGreaterThan(mesures.hauteurDeLEcran);
  expect(mesures.dock.bottom).toBeCloseTo(mesures.hauteurDeLEcran, 0);
  // Le titre du tutoriel se lit au-dessus du dock, comme sur la maquette.
  expect(mesures.titre.top).toBeGreaterThan(0);
  expect(mesures.titre.bottom).toBeLessThan(mesures.dock.top);
  await expect(page.getByRole("button", { name: "Commencer" })).toBeInViewport({
    ratio: 1,
  });
});
