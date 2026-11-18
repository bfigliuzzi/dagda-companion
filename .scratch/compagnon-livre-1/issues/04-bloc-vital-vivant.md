# 04: Bloc vital vivant

**What to build:** sur la feuille, le lecteur met à jour ses POINTS DE VIE d'un geste avec les boutons ronds « − » (rouge) et « + » de 56 px. Il peut aussi corriger à la main les PV, les PV maximum, la CHANCE et la DEXTÉRITÉ. À chaque changement, l'ancienne valeur reste un instant barrée en craie rouge juste avant la nouvelle, puis s'efface en 1,2 s : c'est la trace de craie, la seule animation de l'app. Sous 7 PV, les PV et leur barre passent en rouge (état critique). Les PV ne dépassent pas le maximum par les boutons, mais une saisie à la main peut le dépasser (le livre peut déroger), avec un indice.

Ce ticket crée la trace de craie comme élément réutilisable : les tickets dés, combat et effets s'en servent.

Références : `DESIGN.md` (Steppers, Signature : la trace de craie, Hints), `docs/regles-livre-1.md` (POINTS DE VIE max, principe « jamais contraignante »), maquette (bloc vital).

**Blocked by:** 02 (Nouvel apprenti)

**Status:** ready-for-agent

- [ ] « − » et « + » changent les PV de 1 ; chaque changement est enregistré tout de suite.
- [ ] Un appui sur une valeur (PV, PV max, CHANCE, DEX) permet de la corriger à la main.
- [ ] L'ancienne valeur s'affiche barrée en rouge avant la nouvelle, puis s'efface en 1,2 s ; l'animation se joue une fois et respecte `prefers-reduced-motion`.
- [ ] Sous 7 PV, le chiffre et la barre passent en rouge.
- [ ] Le « + » s'arrête au maximum ; une saisie au-dessus du maximum est acceptée avec un indice non bloquant.
- [ ] À 0 PV, rien n'est décidé à la place du lecteur (pas de mort automatique).
- [ ] Les règles de mise à jour des PV sont testées.
