import { expect, test } from "@playwright/test";

/*
 * Parcours de lecteur, avec la graine de dés (voir src/lib/des.ts) : l'app
 * construite en mode test rejoue ces faces, dans l'ordre.
 *
 * - Création : 2d6 = 4 + 4 → 32 PV ; 1d6 = 3 → CHANCE 3.
 * - Combat contre un ennemi DEX 7, 8 PV, qui frappe en premier.
 *   Tour 1 : l'ennemi touche (1 + 1 = 2), d6 = 4, 5 dégâts ; le lecteur
 *   riposte (2 + 3 = 5 ≤ 7), d6 = 3, 4 dégâts.
 *   « Finir » : tour 2, l'ennemi rate (4 + 4), le lecteur touche (3 + 1), d6 = 1,
 *   2 dégâts ; tour 3, l'ennemi touche (4 + 2), d6 = 3, 4 dégâts, le lecteur
 *   touche (3 + 4), d6 = 4 : l'ennemi tombe. Le lecteur finit à 23 PV.
 */
const GRAINE = "4,4,3,1,1,4,2,3,3";

test("parcours de lecteur : créer un personnage, mener un combat aux dés fixés, recharger, retrouver l'aventure", async ({
  page,
}) => {
  await page.goto(`/?graine=${GRAINE}`);

  // Créer le personnage, depuis l'Accueil.
  await page.getByRole("button", { name: "Commencer" }).click();
  await page.getByText("Herbologie").click();
  await page.getByText("Simplifié", { exact: true }).click();
  await page.getByRole("button", { name: "Lancer les points de vie" }).click();
  await page.getByRole("button", { name: "Lancer la chance" }).click();
  await page.getByRole("button", { name: "Commencer l'aventure" }).click();
  const pointsDeVie = page.getByRole("group", { name: "Points de vie" });
  await expect(pointsDeVie).toContainText("32 / 32");

  // Mener le combat.
  await page.getByRole("button", { name: "Combattre" }).click();
  await page.getByLabel("Dextérité", { exact: true }).fill("7");
  await page.getByLabel("Points de vie", { exact: true }).fill("8");
  await page.getByText("L'ennemi frappe en premier").click();
  await page.getByRole("button", { name: "Commencer le combat" }).click();
  await page.getByRole("button", { name: "Tour suivant" }).click();

  const journal = page.getByRole("list", { name: "Journal" });
  await expect(journal).toContainText(
    "L'ENNEMI ATTAQUE 2 dés = 2, touché. Dégâts 1 + 4 = −5 PV",
  );
  await expect(journal).toContainText(
    "VOUS RIPOSTEZ 2 dés = 5, touché. Dégâts 1 + 3 = 4.",
  );
  await page.getByRole("button", { name: "Finir" }).click();
  await expect(page.getByRole("heading", { name: "Gagné" })).toBeVisible();
  await expect(page.getByText(/vaincu en 3 tours/)).toBeVisible();
  await page.getByRole("button", { name: "Retour à la feuille" }).click();
  await expect(pointsDeVie).toContainText("23 / 32");

  // Recharger, retrouver l'aventure.
  await page.reload();
  await expect(page.getByText("Herbologie · Mode simplifié")).toBeVisible();
  await expect(pointsDeVie).toContainText("23 / 32");

  // L'historique du combat est retrouvé : sur la feuille, puis dans l'écran « Combats ».
  const combats = page.getByRole("region", { name: "Combats" });
  await expect(combats).toContainText("§ 1");
  await expect(combats).toContainText("3 tours · 1 adversaire");
  await expect(combats).toContainText("−9 PV");
  await combats.getByRole("button", { name: "Tout l'historique" }).click();
  await expect(page.getByRole("heading", { name: "Combats" })).toBeVisible();
  await page.getByRole("button", { name: /^§ 1/ }).click();
  await expect(
    page.getByRole("region", { name: "Détail du § 1" }),
  ).toContainText("PV 32 → 23");
});
