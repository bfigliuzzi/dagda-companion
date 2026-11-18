import { expect, test } from "@playwright/test";

test("l'app s'installe comme PWA et s'ouvre en mode avion", async ({
  page,
  context,
}) => {
  const requetesExternes: string[] = [];
  page.on("request", (requete) => {
    if (!requete.url().startsWith("http://localhost:4173")) {
      requetesExternes.push(requete.url());
    }
  });

  await page.goto("/");

  // Manifeste installable.
  const urlManifeste = await page
    .locator('link[rel="manifest"]')
    .getAttribute("href");
  const manifeste = await (await page.request.get(urlManifeste!)).json();
  expect(manifeste).toMatchObject({
    name: "Compagnon de La Saga de Dagda",
    display: "standalone",
  });
  expect(manifeste.icons).toContainEqual(
    expect.objectContaining({ sizes: "512x512" }),
  );

  // Le service worker prend la main sur la page.
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);

  // Mode avion : la page se recharge depuis le cache.
  await context.setOffline(true);
  await page.reload();

  // Premier lancement : on crée l'apprenti, hors ligne.
  await expect(
    page.getByRole("heading", { name: "Nouvel apprenti" }),
  ).toBeVisible();
  await page.getByText("Herbologie").click();
  await page.getByText("Simplifié", { exact: true }).click();
  await page.getByRole("button", { name: "Lancer les points de vie" }).click();
  await page.getByRole("button", { name: "Lancer la chance" }).click();
  const pvTires = page.getByLabel("Points de vie maximum");
  await expect(pvTires).not.toHaveValue("");
  expect(
    await pvTires.evaluate((champ) => getComputedStyle(champ).fontSize),
  ).toBe("32px");
  await page.getByRole("button", { name: "Commencer l'aventure" }).click();

  // Bloc vital : grille 1.45fr / 1fr.
  const colonnes = await page
    .getByRole("group", { name: "Points de vie" })
    .evaluate((pv) =>
      getComputedStyle(pv.parentElement!)
        .gridTemplateColumns.split(" ")
        .map(parseFloat),
    );
  expect(colonnes[0] / colonnes[1]).toBeCloseTo(1.45, 1);

  const chapitre = page.getByRole("button", { name: /dernier chapitre lu/i });
  await expect(chapitre).toHaveText(/§ 1/);

  // La police est celle servie par l'app.
  const policeChargee = await page.evaluate(async () => {
    await document.fonts.ready;
    return document.fonts.check('700 18px "Atkinson Hyperlegible Next"');
  });
  expect(policeChargee).toBe(true);

  // Ardoise : fond noir pur, chiffres tabulaires, cible tactile de 44 px.
  const styles = await chapitre.evaluate((bouton) => ({
    fond: getComputedStyle(document.body).backgroundColor,
    chiffres: getComputedStyle(bouton).fontVariantNumeric,
    hauteur: bouton.getBoundingClientRect().height,
    largeur: bouton.getBoundingClientRect().width,
  }));
  expect(styles.fond).toBe("rgb(0, 0, 0)");
  expect(styles.chiffres).toBe("tabular-nums");
  expect(styles.hauteur).toBeGreaterThanOrEqual(44);
  expect(styles.largeur).toBeGreaterThanOrEqual(44);

  // Le chapitre modifié hors ligne est retrouvé après rechargement.
  await chapitre.click();
  await page.getByLabel("Dernier chapitre lu").fill("112");
  await page.keyboard.press("Enter");
  await page.reload();
  await expect(chapitre).toHaveText(/§ 112/);

  expect(requetesExternes).toEqual([]);
});
