# Règles du livre 1 — « La Harpe des Quatre Saisons »

Résumé reformulé des règles du livre, à usage de développement. Le texte original n'est pas reproduit (projet de fan non officiel, voir `PRODUCT.md`).

Tous les dés sont des dés à six faces (d6).

Principe transversal : **l'app n'est jamais contraignante.** Elle calcule, propose et prévient, mais toute valeur reste modifiable à la main et aucune décision lourde (mort, remise à zéro) n'est prise sans le lecteur. Le livre peut toujours déroger à une règle.

Les décisions marquées *(choix par défaut)* sont des interprétations retenues en attendant que le livre en dise plus.

## Création du personnage

| Élément | Règle |
|---|---|
| TALENT | Un seul, choisi parmi : Instinct, Herbologie, Discrétion, Persuasion, Observation, Doigts agiles, Empratique. |
| POINTS DE VIE max | 2d6 × 4. On commence avec tous ses points de vie. Les points de vie ne dépassent jamais ce maximum, sauf mention contraire du livre (un effet sur les POINTS DE VIE peut les y porter, voir « Effets temporaires »). |
| CHANCE | 1d6. |
| DEXTÉRITÉ | 7 (valeur fixe en début d'aventure). Peut évoluer en cours d'aventure. |

Le TALENT n'a pas d'effet chiffré dans les règles : c'est le livre qui y renvoie au fil du texte.

## Chance

- Réserve de points. Chaque point dépensé décale de 1 le **total** d'un jet, quel que soit le nombre de dés lancés, vers le haut ou vers le bas.
- Exemple : il faut 5, le dé donne 3, on dépense 2 points pour régler le total sur 5 ; la CHANCE baisse de 2.
- Utilisable en combat.
- Regain et plafond : non précisés dans les règles ; le livre l'indiquera. La valeur reste modifiable à la main.

## Armes

- Liste à part de l'inventaire (elles ne prennent pas de place dans la besace).
- **2 armes au maximum** en même temps (ex. épée + bouclier).
- Une arme peut avoir un bonus de dommage (ex. épée courte +1).
- *(choix par défaut)* Les bonus de dommage des armes portées s'additionnent. Le livre ne précise pas encore ce point.

## Inventaire et monnaie

- La besace a **24 emplacements**. Dépasser ce nombre déclenche un avertissement, pas un blocage.
- La monnaie est le **boulon**. Il faut une **bourse** pour transporter des boulons.
- *(choix par défaut)* La bourse occupe un emplacement ; les boulons sont un compteur rattaché à la bourse et ne prennent pas d'emplacement. Sans bourse, le compteur de boulons est désactivé (avec possibilité de forcer).

## Effets temporaires et bonus d'objets

Exemples rencontrés : une potion qui donne un bonus de DEXTÉRITÉ pendant 24 h (temps de l'histoire), une bague qui donne +2 POINTS DE VIE.

- Un effet a un nom, une valeur, et éventuellement une note de durée en texte libre (« 24 h », « jusqu'au prochain combat »).
- Il vise soit une caractéristique chiffrée (POINTS DE VIE, POINTS DE VIE max, CHANCE, DEXTÉRITÉ, bonus de dommage), qui est alors recalculée, soit rien de chiffré : c'est un simple rappel en texte (« les gardes vous reconnaissent »). Cela couvre les cas que les règles n'ont pas prévus.
- L'app ne connaît pas le temps de l'histoire : c'est le lecteur qui retire l'effet quand il prend fin.
- La caractéristique affiche sa valeur de base et sa valeur effective (base + effets).
- *(choix par défaut)* Les POINTS DE VIE max sont une caractéristique comme une autre. Un effet sur les POINTS DE VIE ne change que les POINTS DE VIE actuels ; un effet sur les POINTS DE VIE max ne change que le maximum. Les POINTS DE VIE peuvent donc dépasser le maximum : un effet +2 sur 34 / 34 donne 36 / 34, que la feuille écrit « 36 (34 + 2) / 34 » (la valeur, puis la base et les effets, puis le maximum).
- *(choix par défaut)* Un bonus de POINTS DE VIE venant d'un objet porté (la bague) vise les POINTS DE VIE max : la bague +2 fait passer 28 / 32 à 28 / 34.
- *(choix par défaut)* Pertes, dépenses et corrections portent sur la valeur affichée, et l'effet garde sa valeur : le retirer enlève exactement cette valeur. Avec un effet POINTS DE VIE +2, 36 / 34 puis −5 donne 31 / 34, et 29 / 34 sans l'effet. Avec un effet CHANCE +2 sur une CHANCE de 4, dépenser 2 donne 4, puis 2 sans l'effet.
- *(choix par défaut)* Le « + » de la feuille s'arrête quand la base des POINTS DE VIE atteint le maximum : avec un effet +2, à 36 (34 + 2) / 34, « + » ne fait rien et « − » donne 35 ; avec un effet −4, « + » s'arrête à 30 (34 − 4) / 34. L'indice « PV au-dessus du maximum » ne parle que d'une base au-dessus du maximum (saisie à la main) : un dépassement dû à un effet est voulu.
- *(choix par défaut)* Retirer un effet ne remet jamais les POINTS DE VIE au maximum : retirer la bague à 34 / 34 donne 34 / 32, et la feuille le signale par l'indice (le livre peut déroger). Une valeur ne tombe jamais sous 0 (POINTS DE VIE, CHANCE) ni le maximum sous 1 ; la DEXTÉRITÉ et le bonus de dommage n'ont pas de plancher.

## Modes de jeu

Choisi en début d'aventure.

- **Narratif** : pour un combat, le lecteur indique directement s'il l'a gagné ou perdu. Exception : au-delà de 5 adversaires simultanés, le combat se joue normalement. L'app a donc besoin du nombre d'adversaires.
- **Simplifié** : toutes les règles s'appliquent, avec **3 sauvegardes pour tout le livre** (une sauvegarde utilisée est consommée). Une sauvegarde enregistre le chapitre en cours et l'état complet du personnage. On ne peut reprendre qu'à la sauvegarde la plus récente.
  - *(choix par défaut)* « L'état complet du personnage » est ce que le livre appelle le personnage : caractéristiques (PV, PV max, CHANCE, DEXTÉRITÉ, TALENT, en valeurs de base), armes, besace avec la bourse et les boulons, et effets. Les notes et l'historique des combats ne sont pas gardés : ils disent ce que le lecteur a lu et vécu, ils ne sont pas l'état du personnage, et les perdre à la reprise nuirait au lecteur. La reprise les laisse tels quels.
  - *(choix par défaut)* Poser une sauvegarde la consomme tout de suite et remplace la sauvegarde précédente (seule la plus récente se reprend). Reprendre ne consomme rien et ne rend pas la sauvegarde utilisée : la sauvegarde reste la plus récente, on peut y revenir encore. Le nombre de sauvegardes utilisées reste modifiable à la main, sans toucher à la sauvegarde déjà posée.
- **Mortel** : toutes les règles s'appliquent. En cas de mort, on perd armes et équipement et on recommence au **chapitre 1** avec un nouveau personnage. L'app le propose ; elle ne l'impose pas.
  - *(choix par défaut)* L'app propose à **0 PV** (valeur affichée, effets compris), sur la feuille ou à la fin d'un combat « Perdu », et seulement en mode mortel. Le lecteur accepte (après une confirmation qui rappelle la perte) ou ignore. Ignorer ne change rien à l'aventure. La proposition n'est pas rappelée tant que les PV restent à 0 : elle revient quand ils remontent au-dessus de 0 puis retombent à 0, ou au prochain lancement de l'app.
  - *(choix par défaut)* Accepter ouvre l'écran « Nouvel apprenti » avec le mode mortel déjà coché (sans « Déjà en route », puisqu'on repart du chapitre 1). L'ancienne aventure reste enregistrée jusqu'à la création du nouveau personnage. Le nouveau personnage repart de zéro : chapitre 1, ni armes, ni besace, ni bourse, ni boulons, ni effets (les effets du mort ne suivent pas), historique des combats vide. Les notes sont gardées : ce sont les connaissances du lecteur sur le livre, pas l'équipement du personnage. « Recommencer une aventure » de la section Aventure, valable dans tous les modes, efface au contraire tout, notes comprises.

## Combat

### Fiche d'un ennemi

Le livre donne un nom, une DEXTÉRITÉ et des POINTS DE VIE, par exemple : « GROUPE DE SEPT GOBELINS — DEXTÉRITÉ 7 — POINTS DE VIE 50 ».

- Un groupe compte comme un seul adversaire, sauf mention contraire du livre. Le nombre d'individus (ici 7) sert seulement à la règle des 5 adversaires du mode narratif.
- Pas de bonus de dommage dans l'exemple : 0 par défaut, modifiable.

### Déroulé

Le lecteur frappe en premier, sauf mention contraire du livre (l'app permet d'inverser). Un tour, en boucle :

1. **Toucher** : 2d6. Touché si le total est ≤ DEXTÉRITÉ de l'attaquant, sinon raté.
2. **Dégâts** (si touché) : la cible perd 1 + 1d6 + bonus de dommage.
3. **Riposte** : l'ennemi attaque avec les mêmes règles.

*(choix par défaut)* Les dégâts ne sont jamais négatifs : avec un malus de dommage, un coup qui touche retire au moins 0 POINT DE VIE, il ne soigne pas la cible.

Fin : POINTS DE VIE de l'ennemi à 0 → victoire. POINTS DE VIE du lecteur à 0 → le livre indique la suite ; l'app le signale sans rien décider.

Exemple : DEXTÉRITÉ 7, épée courte +1. 2d6 = 5 → touché. 1d6 = 3. Dégâts : 1 + 3 + 1 = 5.

### Chance automatique en combat

La CHANCE ne modifie que les jets du lecteur, jamais ceux de l'ennemi. L'idée est d'en finir plus vite avec l'ennemi.

En combat automatique, l'app dépense la CHANCE seule quand toutes ces conditions sont réunies :

- le lecteur est en état critique (**moins de 7 POINTS DE VIE**) ;
- un seul coup peut achever l'ennemi : ses POINTS DE VIE sont ≤ 1 + 6 + bonus de dommage ;
- la CHANCE restante suffit pour l'étape en cours.

Elle agit alors en deux temps, en dépensant chaque fois le minimum :

1. **Toucher raté** : elle baisse le total des 2d6 jusqu'à la DEXTÉRITÉ du lecteur pour que le coup touche.
2. **Dégâts insuffisants** : elle monte le d6 de dégâts (6 au plus) pour que les dégâts atteignent les POINTS DE VIE restants de l'ennemi.

Si la CHANCE ne suffit pas pour une étape, elle ne dépense rien à cette étape. *(choix par défaut : « peut vraiment sauver le joueur » est compris comme « ce coup peut tuer l'ennemi ».)*

Toute autre dépense de CHANCE est faite à la main par le lecteur.

## Suivi de lecture et notes

- Le repère principal est le **dernier chapitre lu**, mis à jour à la main avant une pause. Pas d'obligation de noter chaque chapitre.
- Une zone de **notes libres** (texte) garde ce que le lecteur apprend du livre.
- Les **plans** remplacent le papier quadrillé : un plan par lieu (labyrinthe, souterrains, tour), nommé par le lecteur, sur une grille de cases, le nord toujours en haut. Le lecteur y trace des **murs** sur les bords des cases et y note, dans une case, un numéro de chapitre et une courte note. Un **repère** « vous êtes ici » suit le dernier chapitre lu. Un plan neuf compte 8 × 8 cases.
  - *(choix par défaut)* Tracer un mur : le doigt glisse le long des points et le trait se cale sur les bords des cases. Le premier bord touché décide pour tout le trait : vide, le trait pose des murs ; mur, il les efface. Un simple appui sur un bord pose ou retire un mur. « Annuler » défait le dernier trait entier ; les traits à défaire tiennent à l'écran du plan ouvert, ils ne se gardent pas quand on revient à la feuille.
  - *(choix par défaut)* La grille grandit toute seule : un mur posé sur son bord extérieur (un bord horizontal sur la ligne de points du haut ou du bas, un bord vertical sur celle de gauche ou de droite ; un bord qui touche le pourtour par un seul bout ne compte pas) ajoute une rangée ou une colonne de ce côté. Un trait en ajoute au plus une par côté, même s'il longe tout le bord ; un trait qui tourne au coin en ajoute une de chaque côté. La grille grandit quand le doigt se lève, pas pendant le trait. Un trait qui efface ne la fait pas grandir. Elle ne rétrécit jamais : « Annuler » retire les murs du trait, mais garde la rangée ou la colonne ajoutée. Au-delà de 30 colonnes ou de 30 lignes, elle ne grandit plus de ce côté et le mur se pose quand même. Sa taille est enregistrée avec le plan.
  - *(choix par défaut)* Un doigt trace, deux doigts font défiler le plan. Si un second doigt se pose pendant un trait, le trait est abandonné sans rien changer, et le geste reste un défilement jusqu'à ce que tous les doigts soient levés.
  - *(choix par défaut)* Une case porte un numéro de chapitre (entier de 1 à 9999), une note de 60 caractères au plus, ou les deux. Une case vidée (« Vider la case », ou numéro et note effacés) est retirée du plan. Un numéro hors de 1 à 9999 n'est pas enregistré. Un même numéro peut se trouver sur plusieurs cases : un indice le dit, rien n'est bloqué. Chaque case garde le rang d'écriture de son numéro : si deux cases portent le même numéro, la dernière numérotée est celle dont le numéro a été écrit en dernier (le repère va sur elle) ; changer la note ne change pas ce rang. Dans le nom lu par les lecteurs d'écran, les cases se comptent à partir de 1 depuis le coin en haut à gauche de la grille d'aujourd'hui : quand la grille grandit par le haut ou la gauche, ces numéros se décalent, les données non.
  - *(choix par défaut)* Le repère « vous êtes ici » : chaque plan a le sien, enregistré avec le plan (la case, le dernier chapitre lu au moment où il y a pris place, et s'il a été posé à la main). Règle, à chaque changement du dernier chapitre lu ou des cases du plan : (1) posé à la main pour ce même chapitre, il ne bouge pas ; (2) si une case porte ce numéro, il va sur la dernière numérotée ; (3) sinon il reste où il était, en craie pâle, et un indice « § 205 n'est pas sur ce plan » le dit. Écrire dans une case le numéro du dernier chapitre lu y amène donc le repère, sauf s'il a été posé à la main pour ce chapitre. « Je suis ici » (panneau d'une case) le pose à la main sur cette case ; dès que le dernier chapitre lu change, il suit de nouveau le chapitre, et une pose à la main ne revient pas si le chapitre d'avant revient. Un plan qui n'a jamais eu de repère n'en montre pas ; son indice de chapitre absent ne vient que si une case est numérotée. Vider la case du repère ne le déplace pas. À l'ouverture d'un plan, la vue se centre sur le repère. Sur la feuille, la ligne du plan dit « ici § N » quand le repère est sur une case numérotée (le numéro de cette case, même pâle), sinon le nombre de cases notées (« 3 cases notées », « 1 case notée », rien pour 0).
  - *(choix par défaut)* Les plans font partie de l'aventure enregistrée. « Recommencer une aventure » les efface avec le reste. Après une mort en mode mortel, ils sont gardés, comme les notes : le lieu ne change pas d'une partie à l'autre. Une sauvegarde du mode simplifié ne les garde pas et la reprise les laisse tels quels, comme les notes.

## Évolution

Le personnage (caractéristiques, talents, inventaire) se transmet d'un tome à l'autre ; le tome 2, « La Confrérie de Nuada », ajoutera un TALENT. Hors périmètre pour l'instant.
