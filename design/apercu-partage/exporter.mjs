// Exporte apercu.html en public/apercu-partage.png (1200 × 630), l'image des aperçus de partage.
import { chromium } from "playwright";
import { fileURLToPath } from "node:url";

const source = new URL("./apercu.html", import.meta.url);
const cible = fileURLToPath(new URL("../../public/apercu-partage.png", import.meta.url));

const navigateur = await chromium.launch();
const page = await navigateur.newPage({ viewport: { width: 1200, height: 630 } });
await page.goto(source.href);
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: cible });
await navigateur.close();
console.log(`Écrit : ${cible}`);
