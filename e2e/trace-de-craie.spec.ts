import { expect, test } from "@playwright/test";
import type { Plan } from "../src/lib/plans";
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

test("un mur effacé reste en craie rouge et se fond en 1,2 s ; sans animation, il disparaît tout de suite", async ({
  page,
}) => {
  const plan: Plan = {
    id: 1,
    nom: "Souterrains",
    grille: { colonne: 0, ligne: 0, colonnes: 8, lignes: 8 },
    murs: [
      { sens: "horizontal", colonne: 0, ligne: 0 },
      { sens: "horizontal", colonne: 3, ligne: 3 },
    ],
  };
  await page.addInitScript(
    (enregistrement) => {
      localStorage.setItem("dagda-compagnon", JSON.stringify(enregistrement));
    },
    enregistrementDeTest({ plans: [plan] }),
  );
  await page.goto("/");
  await page.getByRole("button", { name: "Souterrains" }).click();

  const grille = page.getByRole("img", { name: /Grille du plan/ });
  const { x, y } = (await grille.boundingBox())!;
  const efface = grille.locator('line[data-etat="efface"]');

  // Un appui du doigt au milieu du mur du haut, à 6 px à côté : il s'efface.
  await page.touchscreen.tap(x + 22, y + 6);
  await expect(efface).toHaveCount(1);
  const style = await efface.evaluate((ligne) => {
    const css = getComputedStyle(ligne);
    return {
      animation: css.animationName,
      duree: css.animationDuration,
      couleur: css.stroke,
    };
  });
  expect(style.animation).not.toBe("none");
  expect(style.duree).toBe("1.2s");
  expect(style.couleur).toBe("rgb(232, 106, 90)");
  await expect(efface).toHaveCount(0, { timeout: 2_000 });

  // Animations réduites : le mur effacé ne reste pas en rouge.
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.touchscreen.tap(x + 3 * 44 + 22, y + 3 * 44);
  await expect(grille.locator('line[data-etat="mur"]')).toHaveCount(0);
  await expect(efface).toBeHidden();
});
