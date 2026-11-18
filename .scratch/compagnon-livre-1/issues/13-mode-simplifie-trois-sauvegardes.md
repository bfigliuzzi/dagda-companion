# 13: Mode simplifié : 3 sauvegardes

**What to build:** en mode simplifié, le lecteur dispose de 3 sauvegardes pour tout le livre, affichées en traits dans le bloc vital (craie si disponible, discret si utilisée). Dans la section « Partie », il enregistre une sauvegarde : elle garde le chapitre en cours et l'état complet du personnage, et elle est consommée. Plus tard, il peut reprendre à la sauvegarde la plus récente, après confirmation ; la feuille revient alors à cet état. Les sauvegardes et la reprise n'existent pas dans les autres modes.

Références : `docs/regles-livre-1.md` (Modes de jeu : simplifié), `DESIGN.md` (Tally marks : sauvegardes, Layout : la partie tout en bas), maquette (section Partie).

**Blocked by:** 04 (Bloc vital vivant)

**Status:** ready-for-agent

- [ ] Les 3 traits de sauvegarde apparaissent dans le bloc vital, seulement en mode simplifié.
- [ ] Enregistrer une sauvegarde consomme un trait et garde le chapitre et tout l'état du personnage.
- [ ] Une fois les 3 utilisées, le bouton d'enregistrement est désactivé et son libellé le dit.
- [ ] Reprendre demande une confirmation et restaure l'état de la sauvegarde la plus récente uniquement.
- [ ] Le nombre de sauvegardes utilisées reste modifiable à la main.
- [ ] L'enregistrement et la reprise sont testés.
