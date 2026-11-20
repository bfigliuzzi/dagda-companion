# 05: Le repère « vous êtes ici »

**What to build:** le lecteur voit sur chaque plan où il se trouve. Quand le dernier chapitre lu correspond au numéro d'une case, un disque de craie s'y place tout seul. « Je suis ici », dans le panneau d'une case, le déplace à la main ; il y reste jusqu'au prochain changement de chapitre. Si le dernier chapitre lu n'est sur aucune case du plan, le repère reste où il était, en craie pâle, et un indice le dit. À l'ouverture, la vue se centre sur le repère. Sur la feuille, la ligne du plan affiche « ici § 203 ».

Références : `.scratch/plans/spec.md` (Direction, États et ordres de grandeur), `docs/regles-livre-1.md` (dernier chapitre lu), `DESIGN.md` (Three Chalks Rule, Hints).

**Blocked by:** 03 (Le plan s'agrandit et se fait défiler), 04 (Numéroter et annoter une case)

**Status:** ready-for-agent

- [ ] Quand le dernier chapitre lu correspond à une case, le repère (disque plein en craie) s'y place ; changer le chapitre le déplace.
- [ ] Si deux cases portent ce numéro, le repère va sur la dernière numérotée.
- [ ] « Je suis ici » place le repère sur la case choisie ; il y reste jusqu'au prochain changement de chapitre.
- [ ] Chapitre absent du plan : le repère reste en place en craie pâle, et l'indice « § 205 n'est pas sur ce plan » s'affiche.
- [ ] Chaque plan garde son propre repère.
- [ ] À l'ouverture d'un plan, la vue est centrée sur le repère.
- [ ] Sur la feuille, la ligne du plan affiche « ici § N » quand le repère est sur une case numérotée, sinon le nombre de cases notées.
- [ ] La position du repère est enregistrée et retrouvée après rechargement.
