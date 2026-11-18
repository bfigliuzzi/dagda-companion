# 12: Mode narratif

**What to build:** en mode narratif, quand le lecteur démarre un combat, l'app lui demande aussi le nombre d'adversaires. Jusqu'à 5, il voit deux grands choix, « Gagné » (contour craie) et « Perdu » (contour rouge), et indique simplement l'issue. Au-delà de 5 adversaires simultanés, le combat se joue normalement, comme dans les autres modes. Dans les deux cas, le combat est noté dans l'historique.

Références : `docs/regles-livre-1.md` (Modes de jeu : narratif ; Fiche d'un ennemi : un groupe compte pour un adversaire), `DESIGN.md` (Combat : mode narratif).

**Blocked by:** 11 (Historique des combats)

**Status:** ready-for-agent

- [x] En mode narratif, le formulaire de combat demande le nombre d'adversaires ; les statistiques de l'ennemi ne sont demandées que si le combat se joue.
- [x] Jusqu'à 5 adversaires : écran « Gagné » / « Perdu », grands choix de 120 px.
- [x] Plus de 5 adversaires : le combat automatique se lance.
- [x] Un combat narratif apparaît dans l'historique avec son issue, sans PV perdus.
- [x] Le lecteur peut quand même choisir de jouer le combat normalement.
- [x] Dans les autres modes, rien ne change.
