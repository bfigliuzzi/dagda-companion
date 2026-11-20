# 02: Tracer et effacer des murs

**What to build:** sur l'écran d'un plan, le lecteur trace les murs du lieu au doigt. Il glisse le doigt le long des points de la grille et le trait se cale sur les bords des cases, sans qu'il ait besoin de viser juste. Le premier bord touché décide de tout le trait : s'il est vide, le trait dessine ; s'il porte un mur, le trait efface. Un simple appui sur un bord pose ou retire un mur. Un mur effacé reste un instant en craie rouge, puis disparaît. Une barre fixe en bas porte le contrôle « Murs / Cases » (seul Murs agit pour l'instant) et « Annuler », qui défait le dernier trait.

Références : `.scratch/plans/spec.md` (Direction, Interaction), `DESIGN.md` (Signature : la trace de craie, Segmented control, Elevation : dock).

**Blocked by:** 01 (Créer un plan nommé et le retrouver)

**Status:** ready-for-agent

- [ ] Un glissé le long des points pose des murs sur chaque bord parcouru, calés sur la grille ; les murs sont des traits de craie de 3 px à bouts arrondis.
- [ ] Un glissé qui commence sur un mur efface les murs parcourus au lieu d'en poser.
- [ ] Un appui sur un bord pose un mur s'il n'y en a pas, le retire s'il y en a un.
- [ ] Un mur effacé reste en craie rouge puis disparaît en 1,2 s ; avec `prefers-reduced-motion`, il disparaît tout de suite.
- [ ] « Annuler » défait le dernier trait entier (pose ou effacement) ; il est désactivé quand il n'y a rien à défaire.
- [ ] Le contrôle « Murs / Cases » est dans la barre fixe du bas.
- [ ] Les murs sont enregistrés à chaque trait et retrouvés après rechargement.
- [ ] `DESIGN.md` décrit la grille du plan (points, murs, repère, barre du bas).
