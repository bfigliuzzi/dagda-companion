# 13: Mode simplifié : 3 sauvegardes

**What to build:** en mode simplifié, le lecteur dispose de 3 sauvegardes pour tout le livre, affichées en traits dans le bloc vital (craie si disponible, discret si utilisée). Dans la section « Aventure », il pose une sauvegarde : elle garde le chapitre en cours et l'état complet du personnage, et elle est consommée. Plus tard, il peut reprendre à la sauvegarde la plus récente, après confirmation ; la feuille revient alors à cet état. Les sauvegardes et la reprise n'existent pas dans les autres modes.

Références : `docs/regles-livre-1.md` (Modes de jeu : simplifié), `DESIGN.md` (Tally marks : sauvegardes, Layout : la section Aventure tout en bas), maquette (section Aventure).

**Blocked by:** 04 (Bloc vital vivant)

**Status:** ready-for-agent

- [x] Les 3 traits de sauvegarde apparaissent dans le bloc vital, seulement en mode simplifié.
- [x] Poser une sauvegarde consomme un trait et garde le chapitre et tout l'état du personnage.
- [x] Une fois les 3 utilisées, le bouton d'enregistrement est désactivé et son libellé le dit.
- [x] Reprendre demande une confirmation et restaure l'état de la sauvegarde la plus récente uniquement.
- [x] Le nombre de sauvegardes utilisées reste modifiable à la main.
- [x] L'enregistrement et la reprise sont testés.
