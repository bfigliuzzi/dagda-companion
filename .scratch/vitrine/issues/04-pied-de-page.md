# 04: Pied de page de la feuille

**What to build:** tout en bas de la feuille, après la section « Aventure » et sous le dock de dés, qui s'arrête au-dessus de lui en fin de défilement, le lecteur trouve le nom de l'app, le numéro de version, une icône GitHub qui ouvre l'accueil du dépôt, et le lien « Mentions légales ». Le pied de page n'apparaît ni sur les écrans de combat, ni sur les plans, ni sur « Nouvel apprenti ».

Références : `.scratch/vitrine/spec.md` (Pied de page), maquette (ticket 02).

**Blocked by:** 01 (Versions automatiques), 02 (Design), 03 (Mentions légales)

**Status:** done

- [x] Le pied de page affiche le nom de l'app et le numéro de version publié.
- [x] L'icône GitHub a un nom accessible et ouvre <https://github.com/bfigliuzzi/dagda-companion>.
- [x] « Mentions légales » ouvre la page du ticket 03.
- [x] Le dock de dés ne masque jamais le pied de page.
- [x] Le dock de dés passe de `position: fixed` à `position: sticky; bottom: 0` (`Dock.svelte`), placé à la fin de la feuille avant le pied de page : il s'arrête au-dessus du pied de page en fin de défilement, et la marge de 92 px gardée en bas de `.feuille` (`App.svelte`) disparaît. Les docks de combat et de plan ne changent pas.
- [x] Le pied de page est absent des écrans de combat, de plan, de l'historique et de « Nouvel apprenti ».
- [x] Il suit la maquette.
