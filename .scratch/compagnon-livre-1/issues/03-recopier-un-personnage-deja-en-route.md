# 03: Recopier un personnage déjà en route

**What to build:** un lecteur qui a déjà commencé le livre sur papier choisit « Déjà en route » sur l'écran « Nouvel apprenti ». Il recopie sa feuille : TALENT, mode de jeu, PV actuels et PV maximum, CHANCE, DEXTÉRITÉ, dernier chapitre lu, et, en mode simplifié, le nombre de sauvegardes déjà utilisées. Il valide et retrouve son personnage sur la feuille, prêt à continuer.

Références : `PRODUCT.md` (premier lancement : recopier un personnage), `DESIGN.md` (Segmented control, Inputs / Fields, steppers), maquette (variante « Déjà en route »).

**Blocked by:** 02 (Nouvel apprenti)

**Status:** ready-for-agent

- [ ] Le contrôle segmenté bascule le formulaire entre « Nouvelle aventure » et « Déjà en route » sans changer de page.
- [ ] Chaque valeur chiffrée se saisit par un champ numérique avec pas à pas.
- [ ] Le choix des sauvegardes utilisées n'apparaît qu'en mode simplifié.
- [ ] Des PV actuels supérieurs au maximum déclenchent un indice, pas un blocage.
- [ ] Après validation, la feuille montre exactement les valeurs saisies, chapitre compris.
