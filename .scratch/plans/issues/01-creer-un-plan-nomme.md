# 01: Créer un plan nommé et le retrouver

**What to build:** sur la feuille, juste après « Notes », une section « Plans » liste les plans de l'aventure, une ligne par plan, et propose « + Nouveau plan », qui demande un nom. Un appui sur une ligne ouvre l'écran du plan en plein écran, avec un bouton retour vers la feuille : une grille pointée de 8 × 8 cases encore vide, un « N » discret au bord haut, et un indice qui dit comment tracer un mur. Le nom se modifie dans l'en-tête de l'écran ; « Supprimer ce plan », en bas, demande une confirmation. Les plans font partie de l'aventure enregistrée : une aventure enregistrée avant cette fonction s'ouvre sans erreur, avec une liste de plans vide. « Recommencer l'aventure » efface aussi les plans ; après une mort en mode mortel, les plans sont gardés, comme les notes.

Ce ticket lève aussi la décision « pas de dessin » dans les documents qui font foi.

Références : `.scratch/plans/spec.md`, `DESIGN.md` (Rows, Buttons, Hints, Layout : écrans plein écran), écran « Combats » pour le modèle d'écran plein avec retour.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] La section « Plans » suit « Notes » sur la feuille ; chaque plan est une ligne d'au moins 48 px avec son nom ; sans plan, seul « + Nouveau plan » s'affiche.
- [ ] « + Nouveau plan » crée un plan avec le nom saisi ; un nom vide n'est pas accepté et le bouton dit ce qui manque.
- [ ] Un appui sur une ligne ouvre l'écran du plan ; le bouton retour ramène à la feuille.
- [ ] L'écran d'un plan neuf montre une grille pointée de 8 × 8 cases de 44 px, un « N » au bord haut, et l'indice « Glissez le doigt le long des points pour tracer un mur. »
- [ ] Le nom du plan se modifie dans l'en-tête de l'écran.
- [ ] « Supprimer ce plan » demande une confirmation ; après confirmation, le plan disparaît et la feuille s'ouvre.
- [ ] Les plans sont retrouvés après rechargement, même hors ligne ; une aventure enregistrée sans plans s'ouvre sans erreur.
- [ ] La confirmation de « Recommencer l'aventure » dit que les plans seront effacés, et ils le sont ; après une mort en mode mortel, les plans sont gardés.
- [ ] `PRODUCT.md`, `docs/regles-livre-1.md` et `GLOSSARY.md` (Plan, Case, Mur, Repère) sont à jour ; « pas de dessin » n'y figure plus.
