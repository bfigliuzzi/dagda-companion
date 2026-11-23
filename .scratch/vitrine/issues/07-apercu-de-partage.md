# 07: Aperçu de partage

**What to build:** quand on partage le lien de l'app sur une messagerie ou un réseau social, l'aperçu affiche le nom de l'app, une description courte qui dit « non officiel », et l'image dessinée au ticket 02.

Références : `.scratch/vitrine/spec.md` (Aperçu de partage), maquette (ticket 02).

**Blocked by:** 02 (Design)

**Status:** ready-for-agent

- [x] La page de l'app porte les balises Open Graph (titre, description, image, adresse, langue) et l'équivalent pour les cartes Twitter/X.
- [x] L'adresse de l'image est absolue et pointe vers le site publié.
- [x] L'image fait 1200 × 630 et reste légère.
- [ ] Un outil de vérification d'aperçu (par exemple celui de LinkedIn ou opengraph.xyz) montre l'aperçu attendu sur le site publié.

## Comments

- Balises posées dans `index.html`, test dans `src/index.html.test.ts`, image de 1200 × 630 pour 50 Ko, copiée dans `dist/`. Reste la dernière case : la vérification de l'aperçu sur le site publié, possible seulement après déploiement.
