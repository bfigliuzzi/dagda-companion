# 03: Le plan s'agrandit et se fait défiler

**What to build:** le lecteur n'a jamais à choisir la taille d'un plan. Quand il trace un mur sur le bord extérieur de la grille, une rangée ou une colonne s'ajoute de ce côté, et ce qu'il voit ne saute pas sous son doigt, même quand la grille grandit par le haut ou par la gauche. Quand le plan dépasse l'écran, il le fait défiler avec deux doigts ; un seul doigt continue de dessiner.

Références : `.scratch/plans/spec.md` (États et ordres de grandeur, Interaction).

**Blocked by:** 02 (Tracer et effacer des murs)

**Status:** ready-for-agent

- [ ] Un mur tracé sur le bord extérieur ajoute une rangée ou une colonne de ce côté.
- [ ] Quand la grille grandit par le haut ou par la gauche, les murs déjà tracés restent sous le doigt à l'écran.
- [ ] Un glissé à deux doigts fait défiler le plan sans tracer de mur ; un glissé à un doigt trace sans faire défiler.
- [ ] Un plan d'environ 30 × 30 cases reste fluide à tracer et à faire défiler sur un téléphone.
- [ ] La taille de la grille est enregistrée et retrouvée après rechargement.
