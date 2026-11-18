# 07: Besace et bourse

**What to build:** dans la section « Besace », le lecteur ajoute et retire des objets. Les 24 emplacements sont dessinés en traits de comptage : craie si occupé, discret si libre, rouge pour chaque objet en trop. Dépasser 24 affiche un avertissement, sans bloquer. La bourse est un objet qui occupe un emplacement ; tant qu'elle est dans la besace, un compteur de boulons (avec petits boutons + / −) est actif. Sans bourse, le compteur est désactivé avec une explication, et le lecteur peut quand même le forcer.

Références : `docs/regles-livre-1.md` (Inventaire et monnaie, choix par défaut sur la bourse), `DESIGN.md` (Tally marks, Steppers : bourse, Hints), maquette (section Besace).

**Blocked by:** 02 (Nouvel apprenti)

**Status:** ready-for-agent

- [ ] On peut ajouter, renommer et retirer un objet ; chaque changement est sauvegardé tout de suite.
- [ ] Les 24 traits reflètent le nombre d'objets ; les objets en trop s'affichent en traits rouges.
- [ ] Au-delà de 24 objets, un indice rouge prévient sans empêcher l'ajout.
- [ ] La bourse compte pour un emplacement ; les boulons n'en prennent pas.
- [ ] Sans bourse, le compteur de boulons est désactivé, avec une option pour le forcer.
- [ ] Le calcul des emplacements et la règle de la bourse sont testés.
