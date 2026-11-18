# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

PWA installable, pensée mobile d'abord.

Framework délégué : Svelte 5 + Vite + `vite-plugin-pwa`, sortie 100 % statique. Raisons : bundle léger, état réactif simple à relier à une feuille de personnage, aucun serveur nécessaire. L'utilisateur a laissé ce choix ouvert ; il peut être revu.

## Users

Grand public : des lecteurs de la série de livres-jeux « La Saga de Dagda » (le lecteur incarne le héros, fait des choix et lance des dés). Ils lisent le livre papier et gardent le téléphone posé à côté. L'app remplace la feuille d'aventure, le crayon, la gomme et les dés.

## Product Purpose

Accompagner la lecture sans la partie pénible : ne plus feuilleter le livre pour noter l'inventaire, mettre à jour les points de vie, mener les combats ou tirer les dés. Le lecteur reste dans l'histoire ; l'app tient les comptes.

Réussite : pendant toute une session de lecture, le lecteur n'a jamais besoin du crayon ni de chercher une information dans plusieurs menus.

## Positioning

Une feuille de personnage vivante, propre à « La Saga de Dagda » : elle reprend les règles du livre (dés, combats automatiques, points d'étape, inventaire, effets temporaires), et pas un lanceur de dés générique ni un outil de jeu de rôle universel.

## Operating Context

- Le livre papier est ouvert ; le téléphone est posé à côté, consulté par coups d'œil brefs entre deux paragraphes.
- Sessions de lecture longues : l'écran doit rester allumé (Wake Lock).
- Utilisation possible sans réseau.
- Une seule aventure en cours à la fois, qu'on peut recommencer.

## Capabilities and Constraints

Fonctions confirmées :
- feuille de personnage complète sur un seul écran, à la manière d'une feuille papier, sans navigation entre plusieurs menus ;
- lancer de dés ;
- combats joués automatiquement selon les règles du livre ;
- combats repérés par leur numéro de chapitre (pas de nom d'ennemi à saisir) et historique des combats consultable ;
- au premier lancement, au choix : créer un nouveau personnage, ou recopier un personnage déjà en cours d'histoire sur papier ;
- repère du dernier chapitre lu, noté avant une pause ;
- armes (2 au maximum, liste à part) et inventaire de la besace (24 emplacements) ;
- effets temporaires et bonus d'objets (« buffs »), retirés à la main ;
- trois modes de jeu du livre (narratif, simplifié avec 3 sauvegardes, mortel) ;
- zone de notes libres (texte, pas de dessin) ;
- maintien de l'écran allumé.

Contraintes :
- données uniquement locales sur l'appareil, pas de compte ni de serveur, fonctionnement hors ligne ;
- une seule partie sauvegardée ;
- économie d'énergie, l'écran restant allumé longtemps : fond noir pur (`#000`) pour éteindre les pixels des écrans OLED, couleurs claires réservées aux petites zones, aucune animation continue ;
- seul le livre 1, « La Harpe des Quatre Saisons », est couvert pour l'instant.

Décisions ouvertes :
- les règles du livre 1 sont résumées dans `docs/regles-livre-1.md`, qui fait foi pour les règles ; les interprétations y sont marquées « choix par défaut » et seront revues quand le livre en dira plus (regain de CHANCE, cumul des armes, etc.) ;
- export/import de sauvegarde : non demandé pour l'instant ;
- prise en charge des tomes suivants : pas prévue à ce stade.

## Brand Commitments

- Projet de fan public et non officiel. L'app peut reprendre les règles et les termes du jeu, mais ne reproduit ni le texte ni les illustrations du livre.
- Elle ne doit pas se présenter comme un produit officiel de l'auteur ou de l'éditeur.

## Evidence on Hand

Règles du livre 1 résumées dans `docs/regles-livre-1.md`, à partir d'une numérisation fournie par l'utilisateur. Pas de logo ni d'illustration. Rien de tout cela ne doit être fabriqué : ni contenu du livre, ni témoignage, ni affiliation officielle.

## Product Principles

1. Tout tient sur une feuille : chaque information utile en partie est visible ou à un geste près, comme sur le papier.
2. Le livre reste la vedette : l'app sert la lecture, elle ne la concurrence pas et ne réécrit pas l'histoire.
3. Les règles du livre font foi : l'app automatise les calculs mais ne les invente pas, et le lecteur peut toujours corriger une valeur à la main.
4. Jamais contraignante : l'app propose et prévient, elle ne bloque pas et ne prend aucune décision lourde (mort, remise à zéro) à la place du lecteur. Le livre peut toujours déroger à une règle.
5. Rien ne se perd : chaque changement est sauvegardé sur l'appareil immédiatement, sans action de l'utilisateur.
6. Coups d'œil, pas sessions d'écran : lisible et manipulable vite, d'une main, téléphone posé sur la table.
