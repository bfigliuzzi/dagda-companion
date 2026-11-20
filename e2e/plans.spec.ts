import { expect, test } from "@playwright/test";
import { enregistrementDeTest } from "./aventure";

test.beforeEach(async ({ page }) => {
  await page.addInitScript((enregistrement) => {
    // Une seule fois : le rechargement garde ce que le lecteur a créé.
    if (!localStorage.getItem("dagda-compagnon")) {
      localStorage.setItem("dagda-compagnon", JSON.stringify(enregistrement));
    }
  }, enregistrementDeTest());
});

test("un plan créé hors ligne se retrouve au rechargement ; sa ligne fait 48 px et ses cases 44 px", async ({
  page,
  context,
}) => {
  await page.goto("/");
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
  await context.setOffline(true);
  await page.reload();

  await page.getByRole("button", { name: "Nouveau plan" }).click();
  await page.getByLabel("Nom du plan").fill("Souterrains");
  await page.getByRole("button", { name: "Créer le plan" }).click();

  await page.reload();
  const ligne = page.getByRole("button", { name: "Souterrains" });
  await expect(ligne).toBeVisible();
  expect((await ligne.boundingBox())!.height).toBeGreaterThanOrEqual(48);

  await ligne.click();
  const grille = page.getByRole("img", { name: /8 colonnes sur 8 lignes/ });
  const boite = (await grille.boundingBox())!;
  expect(boite.width).toBeCloseTo(8 * 44, 0);
  expect(boite.height).toBeCloseTo(8 * 44, 0);
  // La grille de 8 cases tient entre les marges de l'écran (412 px de large).
  expect(boite.x).toBeGreaterThanOrEqual(0);
  expect(boite.x + boite.width).toBeLessThanOrEqual(412);
});
