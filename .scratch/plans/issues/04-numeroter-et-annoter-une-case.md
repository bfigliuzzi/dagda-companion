# 04: Numéroter et annoter une case

**What to build:** en mode Cases, le lecteur touche une case et un panneau glisse depuis le bas : il y écrit le numéro de chapitre de cette pièce et une courte note (« clé », « porte fermée »), ou vide la case. Dans la grille, une case numérotée montre son numéro en petit ; une case avec une note porte un petit trait en coin, et la note se lit en entier dans le panneau. Si le même numéro est écrit dans deux cases, un indice le signale sans rien bloquer.

Références : `.scratch/plans/spec.md` (Interaction, Contraintes), `DESIGN.md` (Bottom sheet, Inputs, Hints).

**Blocked by:** 02 (Tracer et effacer des murs)

**Status:** ready-for-agent

- [ ] En mode Cases, un appui sur une case ouvre le panneau avec un champ numérique (chapitre) et un champ de note courte ; un glissé ne trace plus de mur.
- [ ] Le numéro s'affiche dans la case en 13 px ; une note se signale par un petit trait en coin.
- [ ] « Vider la case » retire le numéro et la note.
- [ ] Un numéro déjà présent dans une autre case affiche un indice non bloquant.
- [ ] Chaque case est un bouton nommé pour les lecteurs d'écran (« Case 3-5, chapitre 47, note : clé »).
- [ ] Numéros et notes sont enregistrés et retrouvés après rechargement.
