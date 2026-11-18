# 06: Armes

**What to build:** dans la section « Armes » de la feuille, le lecteur ajoute une arme avec un nom et un bonus de dommage (ex. « épée courte +1 »), la corrige ou la retire. Les armes ne prennent pas de place dans la besace. Le bonus de dommage total (somme des armes portées) est visible, car le combat s'en sert. Au-delà de 2 armes, le compteur passe en rouge (« 3 / 2 ») avec un indice, sans rien bloquer.

Références : `docs/regles-livre-1.md` (Armes, cumul des bonus en choix par défaut), `DESIGN.md` (Rows, Hints, Buttons : Ajouter), maquette (section Armes).

**Blocked by:** 02 (Nouvel apprenti)

**Status:** ready-for-agent

- [ ] On peut ajouter, modifier et retirer une arme ; chaque changement est enregistré tout de suite.
- [ ] Chaque ligne montre le nom à gauche et le bonus à droite (18 px, graisse 700).
- [ ] Le titre de section indique le nombre d'armes sur 2 ; au-delà, compteur rouge et indice non bloquant.
- [ ] Le bonus de dommage total des armes est calculé et testé.
