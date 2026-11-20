# Plans

Brief validé le 2026-11-20 (cadrage `impeccable shape`).

## Pour qui, dans quelle situation

Le lecteur arrive dans un labyrinthe, des souterrains, une tour. Le livre le fait passer de chapitre en chapitre (« si vous prenez le couloir nord, rendez-vous au 47 ») et il se perd. Aujourd'hui, il dessinerait sur du papier quadrillé ; le Plan remplace ce papier. Mode : Operate. Téléphone posé à côté du livre ; le lecteur trace un mur ou note une case entre deux paragraphes.

## Ce qu'il doit pouvoir faire

- Tracer les murs d'un lieu sur une grille, au doigt, sans viser au pixel près.
- Écrire dans une case son numéro de chapitre et une courte note (« clé », « porte fermée », « gobelin »).
- Voir d'un coup d'œil où il se trouve : le repère « vous êtes ici » se place tout seul sur la case dont le numéro est le dernier chapitre lu.
- Garder plusieurs plans nommés, un par lieu.

Réussite : le lecteur ne sort plus de crayon pour cartographier un lieu, et retrouve ses plans intacts à la reprise.

## Direction

Le monde de l'ardoise de l'Académie, sans rien inventer :

- murs en traits de craie de 3 px, bouts arrondis ;
- grille sans lignes : de petits points `trait` aux croisements, comme un papier pointé ;
- repère « vous êtes ici » : un disque plein en craie (ni jaune, ni rouge, ni vert : ce n'est ni une action, ni un danger, ni un effet) ;
- nord toujours en haut, avec un « N » discret au bord de la grille ; les directions N/S/E/O viennent de cette orientation fixe ;
- signature : un mur effacé reste un instant en craie rouge, puis disparaît en 1,2 s ; avec `prefers-reduced-motion`, il disparaît tout de suite.

## Périmètre

- Section « Plans » sur la feuille, juste après « Notes » : une ligne de 48 px par plan (nom à gauche ; à droite « ici § 203 » ou le nombre de cases notées), puis « + Nouveau plan » (formulaire d'ajout existant, demande un nom).
- Un appui sur une ligne ouvre l'écran du plan en plein écran, avec un bouton retour, comme l'écran des combats ; nom modifiable dans l'en-tête.
- Hors périmètre : dessin libre, rotation du plan, génération automatique, reproduction des cartes du livre (projet de fan), onglets, texture de parchemin, dézoom pour une vue d'ensemble (v1), bouton de dés sur l'écran du plan (on revient à la feuille, comme pour le combat).

## États et ordres de grandeur

- Nouveau plan : 8 × 8 cases de 44 px. Un mur tracé sur le bord ajoute une rangée ou une colonne de ce côté ; la vue ne saute pas sous le doigt. Jusqu'à environ 30 × 30 cases.
- Plan vide : grille pointée et un indice : « Glissez le doigt le long des points pour tracer un mur. »
- Chapitre absent du plan : le repère reste où il était, en craie pâle ; indice non bloquant « § 205 n'est pas sur ce plan ».
- Même numéro dans deux cases : indice, sans blocage ; le repère va sur la dernière case numérotée.
- Repère déplacé à la main : il reste là jusqu'au prochain changement de chapitre. Chaque plan a son repère.
- « Recommencer l'aventure » efface les plans, et sa confirmation le dit. Après une mort en mode mortel, les plans sont gardés, comme les notes : le lieu ne change pas d'une partie à l'autre.

## Interaction

- Barre fixe en bas : contrôle segmenté « Murs / Cases » et bouton « Annuler » (défait le dernier trait).
- Mode Murs : on glisse un doigt le long des points ; le trait se cale sur les bords des cases. Le premier bord touché décide pour tout le trait : vide → le trait dessine ; mur → le trait efface. Un simple appui sur un bord pose ou retire un mur.
- Mode Cases : un appui sur une case ouvre le panneau du bas : numéro de chapitre (champ numérique), note courte, « Je suis ici », « Vider la case ». Dans la grille, la case montre son numéro en 13 px ; une note se signale par un petit trait en coin.
- Défilement du plan à deux doigts (un doigt dessine). À l'ouverture, la vue se centre sur le repère.
- « Supprimer ce plan » : bouton secondaire de danger en bas de l'écran, avec confirmation.

## Contraintes

- Enregistré sur l'appareil à chaque trait, dans l'aventure.
- En mode Cases, chaque case est un bouton nommé (« Case 3-5, chapitre 47, note : clé »). Tracer des murs au clavier ou au lecteur d'écran est hors périmètre en v1.
- Documents à mettre à jour : `PRODUCT.md`, `docs/regles-livre-1.md` (Suivi de lecture et notes), `GLOSSARY.md` (Plan, Case, Mur, Repère), `DESIGN.md` (grille du plan), brief de surface `.impeccable/surfaces/src-app-svelte.md`.
