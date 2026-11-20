## Agent skills

### Issue tracker

Les tickets sont des fichiers markdown locaux dans `.scratch/<feature>/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Les cinq libellés par défaut (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`), notés dans une ligne `Status:`. See `docs/agents/triage-labels.md`.

### Tests

Testing trophy allégé : lis `docs/tests.md` avant d'écrire un test, et avant de déclarer un ticket fini.

### Domain docs

Single-context : `GLOSSARY.md` et `docs/adr/` à la racine, en plus de `PRODUCT.md`, `DESIGN.md` et `docs/regles-livre-1.md`, qui existent déjà et font foi. See `docs/agents/domain.md`.

## Messages de commit

Entièrement en français, au format `type(portée facultative): texte`. La CI les vérifie avec `commitlint` (`commitlint.config.js`) et refuse un message hors format ; `semantic-release` en tire la version (`release.config.js`).

| Type | Pour | Effet sur la version |
|---|---|---|
| `ajout` | ce que le lecteur peut faire de nouveau | mineure (0.1.0 → 0.2.0) |
| `correctif` | un défaut corrigé, visible du lecteur | correctif (0.1.0 → 0.1.1) |
| `dette` | réorganisation du code sans changement visible | aucun |
| `docs` | documentation, tickets, maquette | aucun |
| `tests` | tests seuls | aucun |
| `ci` | GitHub Actions, publication | aucun |
| `outils` | dépendances, configuration des outils | aucun |

La portée est une partie de l'app : `plans`, `combat`, `besace`, `des`, `feuille`… Un `!` juste avant les deux-points signale un changement qui casse, par exemple une aventure enregistrée qui ne se relit plus, et fait monter le premier chiffre de la version.

```
ajout(plans): le repère suit le dernier chapitre lu
correctif(combat): la CHANCE n'est plus retirée deux fois
dette: un seul composant pour les boutons pleins
ajout(besace)!: la besace passe à 30 emplacements
```

Après chaque version, la CI pousse elle-même sur `main` un commit `docs(version): X.Y.Z [skip ci]` qui met à jour le `CHANGELOG.md` : récupère-le (`git pull --rebase`) avant de pousser.

Seuls `ajout` et `correctif` apparaissent dans le `CHANGELOG.md` et la release GitHub : écris leur texte pour le lecteur de l'app.
