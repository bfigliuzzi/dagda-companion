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
    await page
      .getByTestId("vue-du-plan")
      .evaluate((vue) => getComputedStyle(vue).touchAction),
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

test("la grille grandit par le haut et par la gauche sans que rien ne bouge à l'écran ; deux doigts font défiler le plan sans tracer", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Nouveau plan" }).click();
  await page.getByLabel("Nom du plan").fill("Labyrinthe");
  await page.getByRole("button", { name: "Créer le plan" }).click();
  await page.getByRole("button", { name: "Labyrinthe" }).click();

  const grille = page.getByRole("img", { name: /Grille du plan/ });
  const coin = (await grille.boundingBox())!;
  const cdp = await page.context().newCDPSession(page);
  /** Un glissé d'un vrai doigt, d'un point de grille à l'autre, à l'écran. */
  async function glisser(...points: [number, number][]) {
    const [depart, ...suite] = points;
    const toucher = (
      type: "touchStart" | "touchMove",
      [x, y]: [number, number],
    ) =>
      cdp.send("Input.dispatchTouchEvent", {
        type,
        touchPoints: [{ x, y, id: 1 }],
      });
    await toucher("touchStart", depart);
    for (const point of suite) await toucher("touchMove", point);
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });
  }
  /**
   * Le point de grille (c, l) du plan neuf, à l'écran, mesuré une fois pour
   * toutes : ni l'indice qui s'en va au premier mur, ni la grille qui grandit
   * ne doivent le déplacer.
   */
  const point = (c: number, l: number): [number, number] => [
    coin.x + c * 44,
    coin.y + l * 44,
  ];
  const murs = grille.locator('line[data-etat="mur"]');
  const premierMur = async () => (await murs.first().boundingBox())!;

  await glisser(point(1, 2), point(2, 2), point(3, 2));
  await expect(murs).toHaveCount(2);
  const avant = await premierMur();

  // Le long du bord du haut : une rangée s'ajoute en haut, rien ne bouge.
  await glisser(point(0, 0), point(1, 0), point(2, 0));
  await expect(grille).toHaveAccessibleName(/8 colonnes sur 9 lignes/);
  expect(await premierMur()).toEqual(avant);

  // Le long du bord de gauche : une colonne s'ajoute à gauche, rien ne bouge.
  await glisser(point(0, 1), point(0, 2), point(0, 3));
  await expect(grille).toHaveAccessibleName(/9 colonnes sur 9 lignes/);
  expect(await premierMur()).toEqual(avant);
  await expect(murs).toHaveCount(6);

  // Deux doigts glissent de 30 px à droite et 40 px vers le bas : le plan suit,
  // aucun mur n'est tracé et la page ne défile pas.
  const deux = (dx: number, dy: number) => [
    { x: 150 + dx, y: 600 + dy, id: 1 },
    { x: 250 + dx, y: 600 + dy, id: 2 },
  ];
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: deux(0, 0),
  });
  for (let pas = 1; pas <= 10; pas++) {
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: deux(3 * pas, 4 * pas),
    });
  }
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  const apres = await premierMur();
  expect(apres.x - avant.x).toBeCloseTo(30, 0);
  expect(apres.y - avant.y).toBeCloseTo(40, 0);
  await expect(murs).toHaveCount(6);
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
});

test("en mode Cases, un vrai appui tactile ouvre le panneau qui glisse, un glissé non ; le numéro est écrit en 13 px", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Nouveau plan" }).click();
  await page.getByLabel("Nom du plan").fill("Tour");
  await page.getByRole("button", { name: "Créer le plan" }).click();
  await page.getByRole("button", { name: "Tour" }).click();
  await page.getByRole("radio", { name: "Cases" }).check({ force: true });

  const cdp = await page.context().newCDPSession(page);
  const touche = async (
    type: "touchStart" | "touchMove" | "touchEnd",
    x: number,
    y: number,
  ) =>
    cdp.send("Input.dispatchTouchEvent", {
      type,
      touchPoints: type === "touchEnd" ? [] : [{ x, y, id: 1 }],
    });
  const bouton = page.getByRole("button", { name: "Case 3-2", exact: true });
  const { x, y, width, height } = (await bouton.boundingBox())!;
  expect(width).toBe(44);
  expect(height).toBe(44);
  const centre = { x: x + 22, y: y + 22 };

  // Un glissé qui part de la case n'ouvre rien et ne trace rien.
  await touche("touchStart", centre.x, centre.y);
  for (let pas = 1; pas <= 6; pas++) {
    await touche("touchMove", centre.x + pas * 10, centre.y);
  }
  await touche("touchEnd", centre.x + 60, centre.y);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.locator('line[data-etat="mur"]')).toHaveCount(0);

  // Un appui ouvre le panneau, qui glisse depuis le bas.
  await touche("touchStart", centre.x, centre.y);
  await touche("touchEnd", centre.x, centre.y);
  const panneau = page.getByRole("dialog", { name: "Case 3-2" });
  await expect(panneau).toBeVisible();
  expect(
    await panneau.evaluate((e) => getComputedStyle(e).animationName),
  ).toContain("glisser");

  await page.getByRole("spinbutton", { name: "Chapitre" }).fill("47");
  await page.getByRole("textbox", { name: "Note" }).fill("clé");
  await page.getByRole("button", { name: "Fermer" }).click();

  const numero = page.locator("svg text", { hasText: "47" });
  await expect(numero).toHaveCount(1);
  expect(await numero.evaluate((e) => getComputedStyle(e).fontSize)).toBe(
    "13px",
  );
  await expect(
    page.getByRole("button", { name: "Case 3-2, chapitre 47, note : clé" }),
  ).toBeVisible();
});

test("en mode Cases, une case du bas reste visible au-dessus du panneau qu'un vrai appui ouvre", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Nouveau plan" }).click();
  await page.getByLabel("Nom du plan").fill("Cave");
  await page.getByRole("button", { name: "Créer le plan" }).click();
  await page.getByRole("button", { name: "Cave" }).click();
  await page.getByRole("radio", { name: "Cases" }).check({ force: true });

  // La dernière ligne de la grille : le panneau, haut de plus de 400 px, la couvrirait.
  const bouton = page.getByRole("button", { name: "Case 4-8", exact: true });
  const { x, y } = (await bouton.boundingBox())!;
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x: x + 22, y: y + 22, id: 1 }],
  });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });

  const panneau = page.getByRole("dialog", { name: "Case 4-8" });
  await expect(panneau).toBeVisible();
  // Le panneau a fini de glisser quand son bas touche celui de l'écran.
  const hauteurDeLEcran = page.viewportSize()!.height;
  await expect
    .poll(async () => {
      const b = (await panneau.boundingBox())!;
      return Math.round(b.y + b.height);
    })
    .toBe(hauteurDeLEcran);
  const hautDuPanneau = (await panneau.boundingBox())!.y;
  const laCase = (await bouton.boundingBox())!;
  const cadre = (await page.getByTestId("vue-du-plan").boundingBox())!;
  expect(laCase.y + laCase.height).toBeLessThanOrEqual(hautDuPanneau - 12);
  expect(laCase.y).toBeGreaterThanOrEqual(cadre.y);
});

test("à l'ouverture, la vue montre le repère, au milieu du cadre sur un grand plan ; le disque est plein de craie, pâle quand le chapitre est absent", async ({
  page,
}) => {
  const plan = {
    id: 1,
    nom: "Labyrinthe",
    grille: { colonne: 0, ligne: 0, colonnes: 24, lignes: 24 },
    murs: [],
    cases: [
      { colonne: 18, ligne: 17, chapitre: 112, note: "", ordre: 1 },
      { colonne: 2, ligne: 3, chapitre: 9, note: "", ordre: 2 },
    ],
    repere: null,
  };
  // Posé avant tout chargement : la page ne garde que cet enregistrement.
  await page.addInitScript(
    (enregistrement) =>
      localStorage.setItem("dagda-compagnon", JSON.stringify(enregistrement)),
    enregistrementDeTest({ plans: [plan] }),
  );
  await page.goto("/");
  await page.getByRole("button", { name: /^Labyrinthe/ }).click();

  const disque = page.locator("circle[data-repere]");
  await expect(disque).toHaveCount(1);
  const cadre = (await page.getByTestId("vue-du-plan").boundingBox())!;
  const centre = async () => {
    const d = (await disque.boundingBox())!;
    return { x: d.x + d.width / 2, y: d.y + d.height / 2 };
  };
  const vers = await centre();
  expect(vers.x).toBeCloseTo(cadre.x + cadre.width / 2, 0);
  expect(vers.y).toBeCloseTo(cadre.y + cadre.height / 2, 0);

  // Disque plein de craie, à 36 px, sans couleur nouvelle.
  expect((await disque.boundingBox())!.width).toBeCloseTo(36, 0);
  expect(await disque.evaluate((e) => getComputedStyle(e).fill)).toBe(
    "rgb(236, 235, 228)",
  );

  // Chapitre absent du plan : même place, craie pâle.
  await page.getByRole("button", { name: "Retour à la feuille" }).click();
  await page.getByRole("button", { name: /Dernier chapitre lu/ }).click();
  await page.getByLabel("Dernier chapitre lu").fill("205");
  await page.keyboard.press("Enter");
  await page.getByRole("button", { name: /^Labyrinthe/ }).click();
  await expect(page.locator("circle[data-repere]")).toHaveAttribute(
    "data-etat",
    "pale",
  );
  expect(
    await page
      .locator("circle[data-repere]")
      .evaluate((e) => getComputedStyle(e).fill),
  ).toBe("rgb(133, 131, 122)");
  await expect(page.getByText("n'est pas sur ce plan")).toBeVisible();
});
