# Compagnon de La Saga de Dagda

Une feuille d'aventure sur téléphone pour les livres-jeux « La Saga de Dagda ». On lit le livre papier, le téléphone posé à côté, et l'app remplace la feuille, le crayon, la gomme et les dés.

Seul le livre 1, « La Harpe des Quatre Saisons », est pris en charge pour l'instant.

Projet de fan, non officiel : il reprend les règles et le vocabulaire du jeu, pas le texte ni les illustrations du livre.

Version en ligne : <https://bfigliuzzi.github.io/dagda-companion/>

Mentions légales : <https://bfigliuzzi.github.io/dagda-companion/mentions-legales.html>

## Ce que fait l'app

Tout tient sur un seul écran, comme la feuille papier :

- le personnage (POINTS DE VIE, CHANCE, DEXTÉRITÉ, TALENT), créé de zéro ou recopié depuis une feuille déjà commencée ;
- deux armes au plus, et une besace de 24 emplacements avec la bourse et ses boulons ;
- les effets temporaires et les bonus d'objets, que le lecteur retire lui-même quand ils prennent fin ;
- le dernier chapitre lu, noté avant de poser le livre ;
- des notes libres ;
- les combats, joués automatiquement selon les règles du livre et retrouvés ensuite par leur numéro de chapitre ;
- un lancer de dés ;
- les trois modes de jeu du livre : narratif, simplifié (trois sauvegardes) et mortel ;
- des plans des lieux (labyrinthe, souterrains, tour) que l'on trace au doigt sur une grille, avec un repère « vous êtes ici » qui suit le dernier chapitre lu.

L'app calcule et prévient, mais ne bloque rien : toute valeur se corrige à la main, et c'est toujours le lecteur qui décide d'une mort ou d'un nouveau départ, parce que le livre peut déroger à ses propres règles.

Elle s'installe comme une application (PWA), marche hors ligne et garde l'écran allumé pendant la lecture. L'aventure est enregistrée sur l'appareil à chaque changement : pas de compte, pas de serveur, une seule aventure à la fois. Le fond est noir pur pour économiser la batterie des écrans OLED.

## Documentation

| Fichier | Contenu |
|---|---|
| [`PRODUCT.md`](PRODUCT.md) | Pour qui, pourquoi, et les principes qui guident les choix |
| [`docs/regles-livre-1.md`](docs/regles-livre-1.md) | Les règles du livre 1 telles que l'app les applique, avec les interprétations retenues là où le livre ne tranche pas. Fait foi |
| [`GLOSSARY.md`](GLOSSARY.md) | Le vocabulaire propre à l'app (aventure, enregistrement, plan, case, repère…) |
| [`DESIGN.md`](DESIGN.md) | L'identité visuelle : une feuille écrite à la craie sur une ardoise noire |
| [`docs/tests.md`](docs/tests.md) | Quoi tester, à quel niveau, et quand un ticket est fini |
| [`CHANGELOG.md`](CHANGELOG.md) | Ce qui a changé d'une version à l'autre, tenu à jour automatiquement |

La maquette de référence est dans `design/maquette/`, les tickets dans `.scratch/`.

## Développement

Svelte 5, TypeScript et Vite, avec `vite-plugin-pwa`. Le site produit est entièrement statique. Il faut Node 24.

```sh
npm install
npm run dev      # serveur de développement
npm run check    # svelte-check, ESLint, Prettier
npm test         # tests unitaires et d'intégration (Vitest)
npm run e2e      # tests de bout en bout (Playwright)
npm run build    # construit le site dans dist/
```

Chaque push sur `main` lance sur GitHub Actions la vérification des messages de commit, l'analyse statique et les tests. S'ils passent, `semantic-release` publie une nouvelle version quand un commit apporte un `ajout` ou un `correctif` (tag, release GitHub, [`CHANGELOG.md`](CHANGELOG.md)), puis le site est publié sur GitHub Pages avec ce numéro. Les messages de commit suivent la convention décrite dans [`CLAUDE.md`](CLAUDE.md).

## Licence

Le code est sous licence [MIT](LICENSE). Elle ne couvre que ce qu'a écrit ce projet : « La Saga de Dagda », ses règles, ses noms et son univers restent la propriété de leurs auteurs et de leur éditeur.
