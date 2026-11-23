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

Vitest, sur le code pur, celui qui ignore l'écran et le navigateur : moteur de combat, valeurs effectives (DEX et bonus de dommage avec armes et effets), CHANCE, modes de jeu, fin d'aventure, lecture et migration de l'enregistrement versionné.

- Ces fonctions reçoivent les dés en paramètre ; chaque test tourne avec des *dés fixés*.
- Chaque exemple chiffré de `docs/regles-livre-1.md` devient un test (DEX 7, épée courte +1, 2d6 = 5, 1d6 = 3 → 5 dégâts).
- Chaque règle marquée « choix par défaut » dans ce même document a son test, pour qu'un changement de décision fasse passer un test au rouge.

### 3. Intégration : l'étage principal

Vitest + jsdom + `@testing-library/svelte` + `@testing-library/user-event`. La plupart des cases des tickets se vérifient ici.

Le test affiche un vrai morceau de l'app, souvent la feuille entière, avec le vrai état et le vrai enregistrement dans le `localStorage` de jsdom. Il agit *comme le lecteur* : il appuie, saisit, puis lit l'écran.

- Trouve les éléments comme un lecteur : `getByRole`, `getByLabelText`, `getByText`, avec le texte français affiché. Garde `data-testid` pour un élément qu'aucun rôle ni texte ne désigne (le dock, le voile). Pour un état que seul l'œil voit (valeur en rouge, ligne passée, trait de besace en trop), lis un attribut sémantique, `data-etat="critique"` : le CSS s'appuie sur le même attribut, et un test ne lit jamais une classe CSS.
- Vérifie l'écran, pas les *détails d'implémentation* : un renommage interne qui ne change rien à l'écran laisse tous les tests verts.
- Remplace seulement ce qui vient du navigateur ou du hasard : les dés (injectés), `navigator.wakeLock` (absent de jsdom), l'horloge si besoin. Nos propres modules tournent pour de vrai, sans `vi.mock`.
- Pour « Rien ne se perd » : modifie une valeur, démonte l'app, remonte-la, et vérifie que la valeur est toujours là.

### 4. Bout en bout : une fine couche

Playwright, Chromium seul, appareil « Pixel 7 », sur l'app construite (`vite build` puis `vite preview`). Un scénario n'a sa place ici que s'il vérifie ce que jsdom ne sait pas faire : un vrai service worker, le hors ligne, les styles réellement calculés (animations, position fixe, zones d'appui), la police servie. Tout le reste se vérifie en intégration.

Les scénarios actuels, un par sujet :

- `pwa.spec.ts` : l'app construite s'installe comme PWA (manifeste, service worker), se recharge hors ligne, y crée un personnage, y retrouve une valeur modifiée, ne fait aucune requête externe, sert sa police et son ardoise noire ;
- `mentions-legales.spec.ts` : la page « Mentions légales » s'ouvre par son adresse avec ses cinq sections, sans contact autre que les issues ni requête externe, avec l'ardoise et la police de l'app, et « Retour à l'app » (en haut et en bas) rend l'app ; elle s'ouvre en mode avion, sans que le service worker la remplace par l'app ; sur un écran large, sa colonne de lecture mesure 30 em et se centre ;
- `parcours.spec.ts` : un parcours de lecteur, créer un personnage, mener un combat avec des *dés fixés*, recharger, retrouver l'aventure et l'historique ;
- `trace-de-craie.spec.ts` : le fondu de 1,2 s est joué par le navigateur, et `prefers-reduced-motion` le supprime, pour une valeur comme pour un mur effacé sur un plan ; les valeurs du bloc vital ont une zone d'appui d'au moins 44 px ;
- `des.spec.ts` : le dock de dés est collant, pas fixe : il reste en bas de l'écran pendant toute la feuille, puis s'arrête 12 px au-dessus du pied de page, qui finit la page sans que rien ne masque ses liens ; le panneau glisse par-dessus la feuille, sauf avec `prefers-reduced-motion` ;
- `notes.spec.ts` : la zone de notes s'agrandit avec son texte, sans défilement interne ;
- `plans.spec.ts` : un plan créé hors ligne se retrouve au rechargement, sa ligne fait 48 px et la grille de 8 cases mesure 8 × 44 px ; un vrai glissé tactile y trace des murs de 3 px à bouts arrondis sans faire défiler la page, et la barre du bas reste fixée sous « Supprimer ce plan » ; quand la grille grandit par le haut et par la gauche, les murs déjà tracés restent au même pixel de l'écran, et un vrai glissé à deux doigts fait défiler le plan sans tracer ; en mode Cases, un vrai glissé tactile n'ouvre rien alors qu'un vrai appui ouvre le panneau, qui glisse, et le numéro écrit dans la case mesure 13 px ; une case de la dernière ligne reste visible au-dessus du panneau qu'un vrai appui ouvre ; à l'ouverture d'un grand plan, la vue se centre sur le repère (son disque, de 36 px, au milieu du cadre), plein en craie, puis en craie pâle quand le chapitre est absent.

Les aventures posées dans le `localStorage` avant le chargement viennent d'une seule fabrique, `enregistrementDeTest` dans `e2e/aventure.ts`, à la version courante de l'enregistrement.

Pour fixer les dés dans le navigateur, l'app accepte une graine de dés (valeur de départ qui rend les tirages reproductibles) lue seulement en mode test : une suite de faces dans l'adresse, `/?graine=4,4,3,1,1,4`, rejouée dans l'ordre puis en boucle (`deDeLaGraine` dans `src/lib/des.ts`). Seule l'app construite avec `vite build --mode test`, celle que lance Playwright, la lit ; l'app publiée tire toujours au hasard.

Un nouveau scénario s'ajoute seulement pour un ticket qui touche au vrai navigateur, et jamais pour redire en e2e ce qu'un test d'intégration vérifie déjà (par exemple : retrouver ses notes après rechargement).

## Mesure de la suite

La suite se juge à une seule chose : chaque case cochée d'un ticket a son test. Les assertions portent sur des comportements visibles (texte, valeurs, rôles), jamais sur un instantané du HTML ; aucun seuil de couverture n'est fixé. Le rendu visuel se vérifie à l'œil contre `design/maquette/index.html`.

## Organisation

- Unitaires et intégration à côté du code : `combat.ts` et `combat.test.ts`, `Feuille.svelte` et `Feuille.test.ts`.
- Bout en bout dans `e2e/`.
- Noms de tests en français, avec le vocabulaire du livre et de `GLOSSARY.md` : `it("retire 5 PV quand l'épée courte touche avec 1d6 = 3")`.
- Le ticket 01 crée les trois scripts `check`, `test` et `e2e` dans `package.json`.
