import { expect, test, type Page } from "@playwright/test";
import { enregistrementDeTest } from "./aventure";

const aventure = enregistrementDeTest({
  // Assez d'objets pour que la feuille défile : le dock doit rester en bas.
  besace: {
    objets: Array.from({ length: 12 }, (_, i) => `Objet ${i + 1}`),
    bourse: false,
    boulons: 0,
    boulonsForces: false,
  },
});

test.beforeEach(async ({ page }) => {
  await page.addInitScript((enregistrement) => {
    localStorage.setItem("dagda-compagnon", JSON.stringify(enregistrement));
  }, aventure);
});

/** Bas du dock et haut du pied de page, en pixels depuis le haut de l'écran. */
async function bords(page: Page) {
  return page.evaluate(() => ({
    dock: document.querySelector("[data-testid=dock]")!.getBoundingClientRect()
      .bottom,
    pied: document.querySelector("footer")!.getBoundingClientRect().top,
  }));
}

test("le dock de dés reste en bas de l'écran pendant toute la feuille, puis s'arrête au-dessus du pied de page sans le masquer", async ({
  page,
}) => {
  await page.goto("/");
  const dock = page.getByTestId("dock");
  await expect(dock).toHaveCount(1);
  const pied = page.getByRole("contentinfo");
  const hauteurDeLEcran = page.viewportSize()!.height;

  // Collant, pas fixe : rien n'est fixe sur la feuille.
  const style = await dock.evaluate((e) => ({
    position: getComputedStyle(e).position,
    bas: getComputedStyle(e).bottom,
    degrade: getComputedStyle(e).backgroundImage,
  }));
  expect(style).toEqual({
    position: "sticky",
    bas: "0px",
    degrade: expect.stringContaining("linear-gradient"),
  });
  const fixes = await page.evaluate(
    () =>
      [...document.body.querySelectorAll("*")].filter(
        (e) => getComputedStyle(e).position === "fixed",
      ).length,
  );
  expect(fixes).toBe(0);

  // En haut puis au milieu de la feuille : le dock est en bas de l'écran,
  // le pied de page encore plus bas.
  for (const part of [0, 0.5]) {
    await page.evaluate(
      (part) =>
        window.scrollTo(
          0,
          (document.documentElement.scrollHeight - window.innerHeight) * part,
        ),
      part,
    );
    const { dock: bas, pied: haut } = await bords(page);
    expect(bas).toBeCloseTo(hauteurDeLEcran, 0);
    expect(haut).toBeGreaterThan(hauteurDeLEcran);
  }

  // En fin de défilement : le dock s'est arrêté 12 px au-dessus du pied de
  // page, entièrement visible, ses liens sous le doigt.
  await page.evaluate(() =>
    window.scrollTo(0, document.documentElement.scrollHeight),
  );
  const { dock: bas, pied: haut } = await bords(page);
  expect(haut - bas).toBeCloseTo(12, 0);
  // Le pied de page finit la page, au pixel près (arrondi du défilement).
  const finDuPied = (await pied.boundingBox())!;
  expect(finDuPied.y + finDuPied.height).toBeCloseTo(hauteurDeLEcran, 0);
  await expect(
    page.getByRole("button", { name: "Lancer les dés" }),
  ).toBeInViewport({ ratio: 1 });
  for (const nom of ["Mentions légales", "Code source sur GitHub"]) {
    const lien = pied.getByRole("link", { name: nom });
    const devant = await lien.evaluate((e) => {
      const r = e.getBoundingClientRect();
      const dessus = document.elementFromPoint(
        r.left + r.width / 2,
        r.top + r.height / 2,
      );
      return e.contains(dessus);
    });
    expect(devant).toBe(true);
  }
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
