# 08: Effets temporaires

**What to build:** le lecteur boit une potion ou enfile une bague dans le livre. Dans la section « Effets », il ouvre le panneau « Nouvel effet » et donne un nom, une note de durée facultative en texte libre (« 24 h »), et ce que l'effet vise : une caractéristique chiffrée (PV, PV max, CHANCE, DEX, bonus de dommage) avec une valeur, ou rien (simple rappel en texte). Une caractéristique modifiée affiche sa valeur effective en vert et une ligne d'explication (« base 7 · potion +1 »). L'effet reste jusqu'à ce que le lecteur le retire avec la croix ; la valeur revient alors à la base. Un bonus de PV venant d'un objet porté s'applique au maximum.

Références : `docs/regles-livre-1.md` (Effets temporaires et bonus d'objets), `DESIGN.md` (couleur verte, Rows : ligne d'effet et rappel, Bottom sheet), maquette (« Nouvel effet »).

**Blocked by:** 04 (Bloc vital vivant), 06 (Armes)

**Status:** ready-for-agent

- [x] Le panneau permet de choisir la cible en puces, dont « rien » pour un simple rappel.
- [x] Les noms d'effets actifs sont en vert ; les rappels en craie grise.
- [x] Chaque caractéristique visée montre sa valeur effective en vert et la ligne « base … · effet … ».
- [x] La valeur effective du bonus de dommage additionne armes et effets.
- [x] Un bonus de PV augmente le maximum ; le retirer ramène le maximum à sa base.
- [x] Retirer un effet le fait disparaître, avec la trace de craie sur la valeur qui change.
- [x] Le calcul des valeurs effectives (base + effets) est testé pour chaque cible.
