# 05: Accueil

**What to build:** quand on ouvre l'app sans aventure enregistrée, on arrive sur l'Accueil au lieu de « Nouvel apprenti » : il dit ce qu'est l'app et qu'elle est un projet de fan non officiel, et « Commencer » ouvre « Nouvel apprenti ». Le pied de page est en bas. Le lecteur qui a une aventure arrive toujours sur sa feuille (ou son combat en cours), et celui qui recommence une aventure, ou recommence après une mort, va directement à « Nouvel apprenti ».

Références : `.scratch/vitrine/spec.md` (Accueil), `GLOSSARY.md` (Accueil), maquette (ticket 02).

**Blocked by:** 02 (Design), 04 (Pied de page de la feuille)

**Status:** done

- [x] Sans aventure enregistrée, l'app s'ouvre sur l'Accueil.
- [x] « Commencer » ouvre « Nouvel apprenti » avec ses choix habituels (« Nouvelle aventure » / « Déjà en route »).
- [x] Avec une aventure enregistrée, l'app s'ouvre comme avant (feuille, ou combat en cours).
- [x] « Recommencer une aventure » et la proposition de recommencer après une mort en mode mortel mènent directement à « Nouvel apprenti », sans Accueil.
- [x] Le pied de page est en bas de l'Accueil.
- [x] L'Accueil suit la maquette ; le texte n'invente rien du livre et ne se présente pas comme officiel.
- [x] Les tests d'intégration couvrent les trois chemins d'ouverture (sans aventure, avec aventure, après recommencer).
