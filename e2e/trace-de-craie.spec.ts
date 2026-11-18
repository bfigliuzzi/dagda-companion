import { expect, test } from "@playwright/test";
import { enregistrementDeTest } from "./aventure";

const aventure = enregistrementDeTest();

test.beforeEach(async ({ page }) => {
  await page.addInitScript((enregistrement) => {
    localStorage.setItem("dagda-compagnon", JSON.stringify(enregistrement));
  }, aventure);
});

test("la trace de craie se fond en 1,2 s, sauf si le lecteur réduit les animations", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Retirer un point de vie" }).click();

  const trace = page.locator("s");
  await expect(trace).toHaveText(/28/);
  const style = await trace.evaluate((s) => {
    const css = getComputedStyle(s);
    return {
      animation: css.animationName,
      duree: css.animationDuration,
      couleur: css.color,
      barre: css.textDecorationLine,
    };
  });
  expect(style.animation).not.toBe("none");
  expect(style.duree).toBe("1.2s");
  expect(style.couleur).toBe("rgb(232, 106, 90)");
  expect(style.barre).toBe("line-through");

  // Une fois jouée, la trace n'est plus dans la page.
  await expect(trace).toHaveCount(0, { timeout: 2_000 });

  // Animations réduites : la trace reste lisible 1,2 s, sans fondu.
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.getByRole("button", { name: "Retirer un point de vie" }).click();
  await expect(trace).toHaveText(/27/);
  expect(await trace.evaluate((s) => getComputedStyle(s).animationName)).toBe(
    "none",
  );
  await expect(trace).toHaveCount(0, { timeout: 2_000 });
});

test("les valeurs du bloc vital se touchent du pouce : zone d'appui d'au moins 44 px", async ({
  page,
}) => {
  await page.goto("/");
  for (const nom of [
    "Points de vie maximum, modifier : 32",
    "Chance, modifier : 4",
    "Dextérité, modifier : 7",
  ]) {
    const zone = await page.getByRole("button", { name: nom }).evaluate((b) => {
      const apres = getComputedStyle(b, "::after");
      return [parseFloat(apres.width), parseFloat(apres.height)];
    });
    expect(zone[0]).toBeGreaterThanOrEqual(44);
    expect(zone[1]).toBeGreaterThanOrEqual(44);
  }
});
