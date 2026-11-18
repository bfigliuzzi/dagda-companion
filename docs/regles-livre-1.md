# Règles du livre 1 — « La Harpe des Quatre Saisons »

Résumé reformulé des règles du livre, à usage de développement. Le texte original n'est pas reproduit (projet de fan non officiel, voir `PRODUCT.md`).

Tous les dés sont des dés à six faces (d6).

Principe transversal : **l'app n'est jamais contraignante.** Elle calcule, propose et prévient, mais toute valeur reste modifiable à la main et aucune décision lourde (mort, remise à zéro) n'est prise sans le lecteur. Le livre peut toujours déroger à une règle.

Les décisions marquées *(choix par défaut)* sont des interprétations retenues en attendant que le livre en dise plus.

## Création du personnage

| Élément | Règle |
|---|---|
| TALENT | Un seul, choisi parmi : Instinct, Herbologie, Discrétion, Persuasion, Observation, Doigts agiles, Empratique. |
| POINTS DE VIE max | 2d6 × 4. On commence avec tous ses points de vie. Les points de vie ne dépassent jamais ce maximum, sauf mention contraire du livre. |
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
- *(choix par défaut)* Un bonus de POINTS DE VIE venant d'un objet porté (la bague) s'applique au maximum.
- *(choix par défaut)* Un effet sur les POINTS DE VIE monte à la fois les POINTS DE VIE et leur maximum (la bague +2 : 28 / 32 devient 30 / 34). Un effet sur les POINTS DE VIE max ne monte que le maximum.
- *(choix par défaut)* Pertes, dépenses et corrections portent sur la valeur affichée, et l'effet garde sa valeur : le retirer enlève exactement cette valeur. Avec la bague, 30 / 34 puis −5 donne 25 / 34, et 23 / 32 sans la bague. Avec un effet CHANCE +2 sur une CHANCE de 4, dépenser 2 donne 4, puis 2 sans l'effet.
- *(choix par défaut)* Si le retrait d'un effet fait passer les POINTS DE VIE au-dessus du maximum, ils redescendent au maximum. Une valeur ne tombe jamais sous 0 (POINTS DE VIE, CHANCE) ni le maximum sous 1 ; la DEXTÉRITÉ et le bonus de dommage n'ont pas de plancher.

## Modes de jeu

Choisi en début d'aventure.

- **Narratif** : pour un combat, le lecteur indique directement s'il l'a gagné ou perdu. Exception : au-delà de 5 adversaires simultanés, le combat se joue normalement. L'app a donc besoin du nombre d'adversaires.
- **Simplifié** : toutes les règles s'appliquent, avec **3 sauvegardes pour tout le livre** (une sauvegarde utilisée est consommée). Une sauvegarde enregistre le chapitre en cours et l'état complet du personnage. On ne peut reprendre qu'à la sauvegarde la plus récente.
- **Mortel** : toutes les règles s'appliquent. En cas de mort, on perd armes et équipement et on recommence au **chapitre 1** avec un nouveau personnage. L'app le propose ; elle ne l'impose pas.

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
- Une zone de **notes libres** (texte) remplace les croquis ; pas de dessin.

## Évolution

Le personnage (caractéristiques, talents, inventaire) se transmet d'un tome à l'autre ; le tome 2, « La Confrérie de Nuada », ajoutera un TALENT. Hors périmètre pour l'instant.
