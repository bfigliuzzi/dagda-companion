# 01: Versions automatiques

**What to build:** chaque push sur `main` qui apporte un `ajout` ou un `correctif` publie tout seul une nouvelle version (tag, release GitHub, CHANGELOG en français), puis le site est déployé avec ce numéro. Les messages de commit suivent la convention française décrite dans le spec, et la CI refuse un message hors format. Le build connaît le numéro de version, pour que le pied de page puisse l'afficher plus tard.

Références : `.scratch/vitrine/spec.md` (Versions).

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Le tag `v0.1.0` est posé sur le commit `801ff95` (dernier commit avant ce chantier) et poussé sur GitHub. L'historique n'est pas réécrit.
- [ ] `commitlint` accepte exactement les types `ajout`, `correctif`, `dette`, `docs`, `tests`, `ci`, `outils`, avec une portée facultative et le `!` de changement cassant ; un message hors format fait échouer la CI.
- [ ] `semantic-release` tourne en CI après les vérifications : `ajout` monte la version mineure, `correctif` le correctif, `!` la majeure, les autres types rien.
- [ ] La release GitHub et le CHANGELOG sont en français, avec les seules sections « Ajouts » et « Corrections ».
- [ ] Le déploiement sur GitHub Pages vient après la publication de la version, et le numéro de version est disponible dans l'app au moment du build (lu dans le tag).
- [ ] La règle de commit (types, format, exemples) est écrite dans `CLAUDE.md` ; le README mentionne le CHANGELOG.
- [ ] Le commit qui livre ce ticket suit lui-même la convention.
