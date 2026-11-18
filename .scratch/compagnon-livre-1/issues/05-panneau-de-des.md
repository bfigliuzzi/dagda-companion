# 05: Panneau de dés

**What to build:** le bouton « Lancer les dés », en contour jaune, reste fixé en bas de la feuille. Un appui ouvre un panneau qui glisse depuis le bas, par-dessus la feuille (les PV restent visibles au-dessus du voile). Le lecteur choisit 1 dé ou 2 dés et lance. Il voit les dés dessinés et le total. S'il veut dépenser de la CHANCE, il ajuste le total vers le haut ou vers le bas avec un pas à pas : chaque point coûte 1 CHANCE, l'ancien total s'affiche barré en rouge juste avant le nouveau. En validant (bouton jaune plein), la CHANCE dépensée est retirée de la feuille.

Références : `docs/regles-livre-1.md` (Chance), `DESIGN.md` (Dice dock, Bottom sheet, Buttons), maquette (« Lancer les dés »).

**Blocked by:** 04 (Bloc vital vivant)

**Status:** ready-for-agent

- [x] Le dock de dés est le seul élément fixe de la feuille, sur un dégradé noir vers transparent.
- [x] Le panneau propose 1 dé / 2 dés ; les dés sont des d6 dessinés en SVG.
- [x] L'ajustement ne peut pas dépenser plus que la CHANCE disponible.
- [x] Un total ajusté montre l'ancien total barré en rouge avant le nouveau.
- [x] La validation retire de la CHANCE exactement le nombre de points dépensés ; fermer sans valider ne dépense rien.
- [x] Le panneau se ferme par son bouton de fermeture ou un appui sur le voile.
- [x] Le calcul du total ajusté et du coût en CHANCE est testé.
