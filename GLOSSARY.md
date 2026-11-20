# Compagnon de La Saga de Dagda

Le vocabulaire propre à l'app, en plus de celui du livre. Les termes de jeu (CHANCE, DEXTÉRITÉ, sauvegarde, modes de jeu, dernier chapitre lu…) sont définis dans `docs/regles-livre-1.md`, qui fait foi ; ils ne sont pas recopiés ici.

## Langage

**Aventure** :
La lecture du livre que le lecteur mène avec son personnage, telle que l'app la tient : le personnage, le dernier chapitre lu et tout ce que porte la feuille. Il n'en existe qu'une à la fois ; on peut la recommencer.
_À éviter_ : partie

**Enregistrement** :
La copie de l'aventure gardée sur l'appareil, mise à jour à chaque changement sans action du lecteur. C'est elle qui permet de retrouver l'aventure après avoir fermé l'app.
_À éviter_ : sauvegarde (réservé à la sauvegarde du livre, un point de reprise que le lecteur décide de poser en mode simplifié).

**Plan** :
Le dessin d'un lieu du livre (labyrinthe, souterrains, tour), nommé par le lecteur : une grille de cases, le nord toujours en haut. Il fait partie de l'aventure. Il remplace le papier quadrillé ; ce n'est pas une carte du livre.
_À éviter_ : carte (le livre a ses propres cartes, que l'app ne reproduit pas)

**Case** :
Un carré de la grille d'un plan, de 44 px de côté. Elle peut recevoir un numéro de chapitre (de 1 à 9999) et une note courte (60 caractères au plus) ; une case qui n'a ni l'un ni l'autre n'est pas enregistrée. Pour le lecteur elle s'appelle « colonne-ligne » à partir de 1 depuis le coin en haut à gauche de la grille (« Case 3-5 »). Ce n'est pas un emplacement de la besace.
_À éviter_ : cellule, emplacement (réservé à la besace)

**Mur** :
Un trait de craie posé sur le bord d'une case, entre deux croisements de points de la grille. Les murs dessinent le lieu.
_À éviter_ : ligne, trait (un « trait » désigne aussi les compteurs de la feuille)

**Trait du doigt** :
Ce que fait le doigt sur la grille d'un plan, du moment où il se pose jusqu'à ce qu'il se lève : un glissé le long des points, ou un simple appui sur un bord. Le premier bord touché décide : vide, le trait pose des murs ; occupé, il les efface. « Annuler » défait un trait entier.
_À éviter_ : geste, coup ; « trait » seul quand on parle d'un mur ou d'un compteur

**Repère** :
Le disque de craie « vous êtes ici » d'un plan. Il se place sur la case dont le numéro est le dernier chapitre lu (la dernière numérotée si deux cases portent ce numéro). « Je suis ici » le déplace à la main, jusqu'au prochain changement de chapitre. Quand le dernier chapitre lu n'est sur aucune case, il reste où il était, en craie pâle. Chaque plan a le sien.
_À éviter_ : marqueur, pion
