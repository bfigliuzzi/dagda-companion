# 09: Combat automatique

**What to build:** le livre lance un combat. Le lecteur appuie sur « Combattre », saisit le numéro du chapitre (pas de nom d'ennemi), la DEXTÉRITÉ et les PV de l'ennemi, son bonus de dommage (0 par défaut), et peut indiquer que l'ennemi frappe en premier. L'écran de combat s'ouvre en plein écran : face-à-face des deux camps (l'ennemi repéré par « § chapitre »), PV en gros chiffres avec leur barre. Le lecteur joue tour par tour depuis le dock de combat ; l'app tire les dés et applique les règles du livre (toucher sur 2d6 ≤ DEX, dégâts 1 + 1d6 + bonus), avec les valeurs effectives du lecteur. Un journal note chaque jet. Les PV de la feuille suivent les dégâts reçus. À la fin, un écran de résultat dit « Gagné » ou « Perdu » avec un bilan. À 0 PV du lecteur, l'app le signale et renvoie au livre, sans rien décider.

Le combat est enregistré (chapitre, issue, PV perdus, déroulé) pour l'historique du ticket 11. Le moteur de règles du combat est séparé de l'affichage pour être testé seul, avec des dés injectables.

Références : `docs/regles-livre-1.md` (Combat), `DESIGN.md` (Combat, Hints : bandeau critique, Headline), maquette (« Nouveau combat », « Combat »).

**Blocked by:** 08 (Effets temporaires)

**Status:** ready-for-agent

- [x] Le formulaire « Nouveau combat » demande le chapitre, la DEX, les PV et le bonus de l'ennemi, et qui frappe en premier.
- [x] Chaque tour suit l'ordre : toucher, dégâts si touché, riposte.
- [x] Le combat utilise la DEX effective et le bonus de dommage effectif (armes + effets) du lecteur.
- [x] Le journal affiche chaque jet ; tour en cours en clair, tours passés en craie grise, dégâts subis en rouge.
- [x] Les PV du lecteur sur la feuille baissent avec les dégâts reçus, avec la trace de craie.
- [x] En état critique, le bandeau rouge encadré s'affiche.
- [x] Ennemi à 0 PV → « Gagné » ; lecteur à 0 PV → « Perdu » et rappel que le livre indique la suite.
- [x] Le lecteur peut quitter un combat en cours ; l'état reste cohérent.
- [x] Le moteur est testé avec des dés fixés, dont l'exemple du livre (DEX 7, épée courte +1, 2d6 = 5, 1d6 = 3 → 5 dégâts).
