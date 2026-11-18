# 14: Fin de partie et mode mortel

**What to build:** tout en bas de la feuille, la section « Partie » propose de recommencer l'aventure. Après une confirmation claire, la partie est effacée et le lecteur revient à l'écran « Nouvel apprenti ». En mode mortel, quand les PV du lecteur tombent à 0 (sur la feuille ou en combat), l'app propose de recommencer au chapitre 1 avec un nouveau personnage, en perdant armes et équipement. Le lecteur peut accepter ou ignorer la proposition : l'app ne décide jamais la mort à sa place, et le livre peut déroger.

Références : `docs/regles-livre-1.md` (Modes de jeu : mortel), `PRODUCT.md` (principe 4 « Jamais contraignante »), `DESIGN.md` (Buttons : secondaire variante de danger, Hints).

**Blocked by:** 04 (Bloc vital vivant)

**Status:** ready-for-agent

- [ ] « Recommencer l'aventure » est un bouton secondaire en rouge, loin du pouce, avec une confirmation explicite.
- [ ] Après confirmation, toute la partie est effacée et l'écran « Nouvel apprenti » s'ouvre.
- [ ] En mode mortel, 0 PV affiche un indice qui propose de recommencer au chapitre 1 ; il peut être ignoré.
- [ ] Accepter la proposition mène à la création d'un nouveau personnage, chapitre 1, sans armes ni équipement.
- [ ] Dans les autres modes, 0 PV n'affiche pas cette proposition.
