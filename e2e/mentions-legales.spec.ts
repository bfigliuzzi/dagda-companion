import { expect, test } from "@playwright/test";

const SECTIONS = [
  "Éditeur",
  "Hébergeur",
  "Propriété intellectuelle",
  "Données personnelles",
  "Responsabilité",
];

test("la page « Mentions légales » s'ouvre par son adresse et ramène à l'app", async ({
  page,
}) => {
  const requetesExternes: string[] = [];
  page.on("request", (requete) => {
    if (!requete.url().startsWith("http://localhost:4173")) {
      requetesExternes.push(requete.url());
    }
  });

  await page.goto("/mentions-legales.html");

  await expect(
    page.getByRole("heading", { level: 1, name: "Mentions légales" }),
  ).toBeVisible();
  const titres = await page
    .getByRole("heading", { level: 2 })
    .allTextContents();
  expect(titres).toEqual(SECTIONS);

  // L'éditeur n'a ni adresse, ni téléphone, ni e-mail : seulement les issues.
  await expect(page.getByText("Benoît Figliuzzi")).toBeVisible();
  await expect(page.locator('a[href^="mailto:"], a[href^="tel:"]')).toHaveCount(
    0,
  );
  await expect(
    page.getByRole("link", { name: "dépôt GitHub du projet" }),
  ).toHaveAttribute("href", /\/dagda-companion\/issues$/);
  await expect(
    page.getByRole("link", { name: "déclaration de confidentialité" }),
  ).toHaveAttribute(
    "href",
    "https://docs.github.com/fr/site-policy/privacy-policies/github-general-privacy-statement",
  );

  // Même ardoise et même police que l'app, servie localement.
  const style = await page.evaluate(async () => {
    await document.fonts.ready;
    return {
      fond: getComputedStyle(document.body).backgroundColor,
      police: document.fonts.check('800 28px "Atkinson Hyperlegible Next"'),
      taille: getComputedStyle(document.querySelector("h1")!).fontSize,
    };
  });
  expect(style).toEqual({
    fond: "rgb(0, 0, 0)",
    police: true,
    taille: "28px",
  });

  // « Retour à l'app », en haut comme en bas, rend l'app.
  const retours = page.getByRole("link", { name: "Retour à l'app" });
  await expect(retours).toHaveCount(2);
  await retours.first().click();
  await expect(page).toHaveURL("/");
  // Sans aventure enregistrée, l'app rendue est l'Accueil.
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Compagnon de La Saga de Dagda",
    }),
  ).toBeVisible();

  await page.goto("/mentions-legales.html");
  await retours.last().click();
  await expect(page).toHaveURL("/");

  expect(requetesExternes).toEqual([]);
});

test("la page « Mentions légales » s'ouvre en mode avion, sans être détournée vers l'app", async ({
  page,
  context,
}) => {
  await page.goto("/");
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);

  await context.setOffline(true);
  await page.goto("/mentions-legales.html");

  await expect(
    page.getByRole("heading", { level: 1, name: "Mentions légales" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { level: 2 })).toHaveCount(5);
});

test.describe("sur un écran large", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("la colonne de lecture s'arrête à 30 em et se centre", async ({
    page,
  }) => {
    await page.goto("/mentions-legales.html");

    const colonne = await page
      .getByText("Ce site est édité par")
      .evaluate((p) => {
        const boite = p.getBoundingClientRect();
        return { largeur: boite.width, gauche: boite.left };
      });
    expect(colonne.largeur).toBe(480);
    expect(colonne.gauche + colonne.largeur / 2).toBeCloseTo(640, 0);
  });
});
