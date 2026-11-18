# 11: Historique des combats

**What to build:** sur la feuille, la section « Derniers combats » montre les combats les plus récents : chapitre, issue, PV perdus. Un lien ouvre l'écran plein « Combats » avec tout l'historique. Chaque ligne affiche le chapitre en gras, l'issue (rouge si « Perdu ») avec un sous-texte, et les PV perdus en rouge à droite. Un appui déplie le détail du combat (statistiques de départ, nombre de tours, CHANCE dépensée).

Références : `PRODUCT.md` (combats repérés par leur numéro de chapitre, historique consultable), `DESIGN.md` (Fight rows), maquette (section Combats et écran « Combats »).

**Blocked by:** 09 (Combat automatique)

**Status:** ready-for-agent

- [x] Un combat terminé apparaît en tête de « Derniers combats ».
- [x] La section de la feuille n'affiche que les plus récents ; l'écran « Combats » les affiche tous, du plus récent au plus ancien.
- [x] Les lignes suivent la grille 64 px / 1fr / auto, hauteur 56 px.
- [x] Un appui déplie et replie le détail d'un combat.
- [x] L'écran plein a un bouton retour à gauche du titre.
- [x] L'historique est enregistré et retrouvé après rechargement.
