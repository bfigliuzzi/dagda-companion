# Standard de tests

Le compagnon suit le *testing trophy* de Kent C. Dodds, en version allégée : « Write tests. Not too many. Mostly integration. » Un test vaut par la confiance qu'il donne pour son coût, et il donne d'autant plus confiance qu'il utilise l'app comme le lecteur.

Sources : [Write tests](https://kentcdodds.com/blog/write-tests), [The Testing Trophy and Testing Classifications](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications).

## Tester un ticket

1. Reprends chaque case à cocher du ticket. Pour chacune, choisis l'étage le plus bas qui donne vraiment confiance (voir « Les quatre étages ») :
   - une règle de calcul du livre → unitaire ;
   - ce que le lecteur voit et fait sur la feuille → intégration ;
   - ce qui exige un vrai navigateur (service worker, installation, hors ligne) → bout en bout.
2. Écris les tests. Pour un bug, écris d'abord le test qui le montre *rouge*, puis corrige.
3. Lance `npm run check`, `npm test` et `npm run e2e`.

**Fini** quand : chaque case du ticket a au moins un test qui la vérifie, les trois commandes passent, et aucun test n'est marqué `skip` ou `only`.

## Les quatre étages

### 1. Analyse statique

TypeScript en mode `strict` vérifié par `svelte-check`, ESLint avec la configuration recommandée Svelte + TypeScript, Prettier pour le format. Tout passe par `npm run check`.

### 2. Unitaires : les règles du livre

Vitest, sur le code pur, celui qui ignore l'écran et le navigateur : moteur de combat, valeurs effectives (DEX et bonus de dommage avec armes et effets), CHANCE, modes de jeu, fin de partie, lecture et migration de la sauvegarde versionnée.

- Ces fonctions reçoivent les dés en paramètre ; chaque test tourne avec des *dés fixés*.
- Chaque exemple chiffré de `docs/regles-livre-1.md` devient un test (DEX 7, épée courte +1, 2d6 = 5, 1d6 = 3 → 5 dégâts).
- Chaque règle marquée « choix par défaut » dans ce même document a son test, pour qu'un changement de décision fasse passer un test au rouge.

### 3. Intégration : l'étage principal

Vitest + jsdom + `@testing-library/svelte` + `@testing-library/user-event`. La plupart des cases des tickets se vérifient ici.

Le test affiche un vrai morceau de l'app, souvent la feuille entière, avec le vrai état et la vraie sauvegarde dans le `localStorage` de jsdom. Il agit *comme le lecteur* : il appuie, saisit, puis lit l'écran.

- Trouve les éléments comme un lecteur : `getByRole`, `getByLabelText`, `getByText`, avec le texte français affiché. Garde `data-testid` pour un élément qu'aucun rôle ni texte ne désigne.
- Vérifie l'écran, pas les *détails d'implémentation* : un renommage interne qui ne change rien à l'écran laisse tous les tests verts.
- Remplace seulement ce qui vient du navigateur ou du hasard : les dés (injectés), `navigator.wakeLock` (absent de jsdom), l'horloge si besoin. Nos propres modules tournent pour de vrai, sans `vi.mock`.
- Pour « Rien ne se perd » : modifie une valeur, démonte l'app, remonte-la, et vérifie que la valeur est toujours là.

### 4. Bout en bout : une fine couche

Playwright, Chromium seul, appareil « Pixel 7 », sur l'app construite (`vite build` puis `vite preview`). Deux scénarios en tout :

- l'app construite s'installe comme PWA (manifeste et service worker présents) et fonctionne hors ligne après un premier chargement ;
- un parcours de lecteur : créer un personnage, mener un combat avec des *dés fixés*, recharger, retrouver la partie.

Pour fixer les dés dans le navigateur, l'app accepte une graine de dés (valeur de départ qui rend les tirages reproductibles) lue seulement en mode test. Le ticket qui pose le moteur de dés en fixe la forme.

Un nouveau scénario s'ajoute seulement pour un ticket qui touche au vrai navigateur.

## Mesure de la suite

La suite se juge à une seule chose : chaque case cochée d'un ticket a son test. Les assertions portent sur des comportements visibles (texte, valeurs, rôles), jamais sur un instantané du HTML ; aucun seuil de couverture n'est fixé. Le rendu visuel se vérifie à l'œil contre `design/maquette/index.html`.

## Organisation

- Unitaires et intégration à côté du code : `combat.ts` et `combat.test.ts`, `Feuille.svelte` et `Feuille.test.ts`.
- Bout en bout dans `e2e/`.
- Noms de tests en français, avec le vocabulaire du livre et de `GLOSSARY.md` : `it("retire 5 PV quand l'épée courte touche avec 1d6 = 3")`.
- Le ticket 01 crée les trois scripts `check`, `test` et `e2e` dans `package.json`.
