import { expect, test } from "@playwright/test";

const aventure = {
  version: 6,
  aventure: {
    chapitre: 112,
    mode: "simplifie",
    sauvegardesUtilisees: 0,
    notes: "",
    armes: [],
    // Assez d'objets pour que la feuille défile : le dock doit rester en bas.
    besace: {
      objets: Array.from({ length: 12 }, (_, i) => `Objet ${i + 1}`),
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
};

test.beforeEach(async ({ page }) => {
  await page.addInitScript((enregistrement) => {
    localStorage.setItem("dagda-compagnon", JSON.stringify(enregistrement));
  }, aventure);
});

test("le dock de dés est le seul élément fixe : il reste en bas quand la feuille défile", async ({
  page,
}) => {
  await page.goto("/");
  const dock = page.locator(".dock");
  await expect(dock).toHaveCount(1);

  const fixes = await page.evaluate(
    () =>
      [...document.body.querySelectorAll("*")].filter(
        (e) => getComputedStyle(e).position === "fixed",
      ).length,
  );
  expect(fixes).toBe(1);

  const degrade = await dock.evaluate(
    (e) => getComputedStyle(e).backgroundImage,
  );
  expect(degrade).toContain("linear-gradient");

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  const hauteurDeLEcran = page.viewportSize()!.height;
  const boite = (await dock.boundingBox())!;
  expect(boite.y + boite.height).toBeCloseTo(hauteurDeLEcran, 0);
  await expect(
    page.getByRole("button", { name: "Lancer les dés" }),
  ).toBeInViewport();
});

test("le panneau glisse par-dessus la feuille, PV visibles au-dessus, sauf si le lecteur réduit les animations", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Lancer les dés" }).click();
  const panneau = page.getByRole("dialog", { name: "Lancer les dés" });
  await expect(panneau).toBeVisible();

  const animation = await panneau.evaluate(
    (e) => getComputedStyle(e).animationName,
  );
  expect(animation).toContain("glisser");

  // Les PV restent visibles au-dessus du panneau.
  const pv = (await page.getByText("Points de vie").first().boundingBox())!;
  const haut = (await panneau.boundingBox())!;
  expect(pv.y + pv.height).toBeLessThan(haut.y);

  await page.emulateMedia({ reducedMotion: "reduce" });
  const sansAnimation = await panneau.evaluate(
    (e) => getComputedStyle(e).animationName,
  );
  expect(sansAnimation).toBe("none");
});
