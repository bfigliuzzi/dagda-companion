# 02: Nouvel apprenti

**What to build:** au premier lancement, quand aucune aventure n'existe, le lecteur arrive sur l'écran « Nouvel apprenti » et choisit « Nouvelle aventure ». Il choisit son TALENT et le mode de jeu (narratif, simplifié, mortel). Il lance ensuite les dés de création : les POINTS DE VIE maximum (2d6 × 4), puis la CHANCE (1d6). La DEXTÉRITÉ vaut 7. Une fois tout rempli, il valide : la feuille s'ouvre avec le bloc vital, qui montre les PV (pleins), la CHANCE et la DEX, et le chapitre réglé sur 1. Tout est enregistré sur l'appareil.

Le contrôle segmenté « Nouvelle aventure / Déjà en route » est présent ; le second choix est traité par le ticket 03.

Références : `docs/regles-livre-1.md` (Création du personnage, Modes de jeu), `DESIGN.md` (Chips, Rows : ligne de jet à la création, Buttons : désactivé), maquette (écran « Nouvel apprenti »).

**Blocked by:** 01 (Squelette PWA et repère de chapitre)

**Status:** ready-for-agent

- [x] Sans aventure enregistrée, l'app ouvre l'écran « Nouvel apprenti » au lieu de la feuille.
- [x] Les 7 TALENTS du livre sont proposés en puces, choix unique.
- [x] Les 3 modes sont proposés, chacun avec une courte description.
- [x] Le bouton « Lancer » de chaque ligne tire les dés et affiche la valeur en 32 px ; on peut relancer ou corriger la valeur à la main.
- [x] Le bouton de validation reste désactivé tant qu'il manque quelque chose, et son libellé dit ce qui manque (« Lancez d'abord la CHANCE »).
- [x] Après validation, la feuille affiche le bloc vital (grille 1.45fr / 1fr) avec PV = PV max, la CHANCE tirée et DEX 7.
- [x] Le personnage et le mode sont enregistrés et retrouvés après rechargement.
- [x] Les règles de tirage sont testées (bornes de 2d6 × 4 et de 1d6).
