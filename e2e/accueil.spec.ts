import { expect, test, type Page } from "@playwright/test";

/*
 * L'Accueil s'ouvre sans aventure enregistrée. Sur un petit téléphone
 * (375 × 667), il est plus haut que l'écran : « Commencer » doit y rester
 * collé en bas, puis s'arrêter au-dessus du pied de page.
 */
test.use({ viewport: { width: 375, height: 667 } });

/** Bas du dock et haut du pied de page, en pixels depuis le haut de l'écran. */
async function bords(page: Page) {
  return page.evaluate(() => ({
    dock: document.querySelector("[data-testid=dock]")!.getBoundingClientRect()
      .bottom,
    pied: document.querySelector("footer")!.getBoundingClientRect().top,
  }));
}

test("« Commencer » reste en bas de l'écran sur fond noir plein, puis s'arrête au-dessus du pied de page sans le masquer", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Compagnon de La Saga de Dagda" }),
  ).toBeVisible();
  const dock = page.getByTestId("dock");
  const pied = page.getByRole("contentinfo");
  const commencer = page.getByRole("button", { name: "Commencer" });
  const hauteurDeLEcran = page.viewportSize()!.height;

  // Collant, pas fixe, sur fond noir plein avec un filet en haut.
  const style = await dock.evaluate((e) => ({
    position: getComputedStyle(e).position,
    bas: getComputedStyle(e).bottom,
    fond: getComputedStyle(e).backgroundColor,
    degrade: getComputedStyle(e).backgroundImage,
    filet: getComputedStyle(e).borderTopWidth,
  }));
  expect(style).toEqual({
    position: "sticky",
    bas: "0px",
    fond: "rgb(0, 0, 0)",
    degrade: "none",
    filet: "1px",
  });

  // En haut de l'Accueil : « Commencer » est en bas de l'écran, le pied de
  // page plus bas.
  const enHaut = await bords(page);
  expect(enHaut.dock).toBeCloseTo(hauteurDeLEcran, 0);
  expect(enHaut.pied).toBeGreaterThan(hauteurDeLEcran);
  await expect(commencer).toBeInViewport({ ratio: 1 });

  // En fin de défilement : arrêté 12 px au-dessus du pied de page, qui finit
  // la page avec ses liens sous le doigt.
  await page.evaluate(() =>
    window.scrollTo(0, document.documentElement.scrollHeight),
  );
  const enBas = await bords(page);
  expect(enBas.pied - enBas.dock).toBeCloseTo(12, 0);
  const finDuPied = (await pied.boundingBox())!;
  expect(finDuPied.y + finDuPied.height).toBeCloseTo(hauteurDeLEcran, 0);
  await expect(commencer).toBeInViewport({ ratio: 1 });
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

  await commencer.click();
  await expect(
    page.getByRole("heading", { name: "Nouvel apprenti" }),
  ).toBeVisible();
});
