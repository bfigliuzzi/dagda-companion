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

test("un doigt qui glisse sur la grille trace des murs de craie, sans faire défiler ; la barre du bas reste fixée sous « Supprimer ce plan »", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Nouveau plan" }).click();
  await page.getByLabel("Nom du plan").fill("Tour");
  await page.getByRole("button", { name: "Créer le plan" }).click();
  await page.getByRole("button", { name: "Tour" }).click();

  const grille = page.getByRole("img", { name: /Grille du plan/ });
  const { x, y } = (await grille.boundingBox())!;
  expect(
    await grille.evaluate(
      (svg) => getComputedStyle(svg.parentElement!).touchAction,
    ),
  ).toBe("none");

  // Un vrai glissé tactile, un peu à côté des points, du point (1, 2) au point (4, 2).
  const cdp = await page.context().newCDPSession(page);
  const doigt = (px: number, py: number) => [
    { x: x + px * 44, y: y + py * 44, id: 1 },
  ];
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: doigt(1.1, 2.15),
  });
  for (const [px, py] of [
    [1.6, 2.1],
    [2.2, 1.9],
    [2.9, 2.1],
    [3.5, 2.2],
    [4.05, 2.05],
  ]) {
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: doigt(px, py),
    });
  }
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });

  const murs = grille.locator('line[data-etat="mur"]');
  await expect(murs).toHaveCount(3);
  const trait = await murs.first().evaluate((ligne) => {
    const css = getComputedStyle(ligne);
    return [css.strokeWidth, css.strokeLinecap, css.stroke];
  });
  expect(trait).toEqual(["3px", "round", "rgb(236, 235, 228)"]);
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
  await expect(page.getByRole("button", { name: "Annuler" })).toBeEnabled();

  // La barre est collée en bas de l'écran, et « Supprimer ce plan » passe au-dessus.
  const barre = page.getByTestId("dock");
  expect(await barre.evaluate((b) => getComputedStyle(b).position)).toBe(
    "fixed",
  );
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  const hauteur = page.viewportSize()!.height;
  const boiteBarre = (await barre.boundingBox())!;
  expect(boiteBarre.y + boiteBarre.height).toBeCloseTo(hauteur, 0);
  const supprimer = (await page
    .getByRole("button", { name: "Supprimer ce plan" })
    .boundingBox())!;
  expect(supprimer.y + supprimer.height).toBeLessThanOrEqual(boiteBarre.y);
});
