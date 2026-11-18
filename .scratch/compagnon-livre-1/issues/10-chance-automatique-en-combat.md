# 10: CHANCE automatique en combat

**What to build:** en combat automatique, quand le lecteur est en danger et peut achever l'ennemi d'un coup, l'app dépense la CHANCE à sa place, comme le prévoient les règles. Les trois conditions : moins de 7 PV pour le lecteur ; PV de l'ennemi ≤ 1 + 6 + bonus de dommage ; CHANCE restante suffisante pour l'étape. Elle agit en deux temps, en dépensant chaque fois le minimum : d'abord baisser un toucher raté jusqu'à la DEX, puis monter le d6 de dégâts (6 au plus) pour atteindre les PV de l'ennemi. Si la CHANCE ne suffit pas pour une étape, rien n'est dépensé à cette étape. Chaque dépense est signalée dans le journal par le badge « CHANCE dépensée automatiquement », avec l'ancien total barré avant le nouveau, et la CHANCE de la feuille baisse d'autant.

Références : `docs/regles-livre-1.md` (Chance automatique en combat, choix par défaut), `DESIGN.md` (Combat : badge automatique, Signature).

**Blocked by:** 09 (Combat automatique)

**Status:** ready-for-agent

- [ ] La CHANCE ne modifie jamais les jets de l'ennemi.
- [ ] Rien n'est dépensé si l'une des trois conditions manque.
- [ ] Étape toucher : dépense minimale pour amener le total à la DEX effective ; rien si la CHANCE ne suffit pas.
- [ ] Étape dégâts : dépense minimale pour atteindre les PV de l'ennemi, d6 plafonné à 6 ; rien si la CHANCE ne suffit pas.
- [ ] Chaque dépense automatique s'affiche avec le badge et la trace de craie, et réduit la CHANCE de la feuille.
- [ ] Chaque cas (conditions remplies ou non, CHANCE suffisante ou non, à chaque étape) est testé avec des dés fixés.
