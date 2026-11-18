# 01: Squelette PWA et repère de chapitre

**What to build:** le lecteur installe l'app sur son téléphone et l'ouvre, même sans réseau. Il voit une feuille sur fond noir pur, dans le style « L'Ardoise de l'Académie ». Pour l'instant, seul l'en-tête est rempli : le dernier chapitre lu, qu'il peut modifier. Ce chapitre est enregistré sur l'appareil à chaque changement, sans action de sa part, et il est toujours là après avoir fermé et rouvert l'app. L'écran reste allumé pendant la lecture.

Ce ticket pose les fondations dont tous les autres se servent : Svelte 5 + Vite + `vite-plugin-pwa` avec une sortie 100 % statique, les couleurs et la typographie de `DESIGN.md`, la police Atkinson Hyperlegible Next hébergée dans l'app, et un enregistrement local de l'aventure (une seule aventure).

Références : `PRODUCT.md` (Stack, Constraints), `DESIGN.md` (Colors, Typography, Layout), `design/maquette/index.html` (en-tête de la feuille).

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [x] L'app se construit en fichiers statiques et peut être installée comme PWA (manifeste, service worker).
- [x] Une fois chargée une première fois, l'app s'ouvre et fonctionne en mode avion.
- [x] Le fond de la feuille est `#000` ; les couleurs, rayons et espacements de `DESIGN.md` sont disponibles sous forme de variables CSS.
- [x] La police est servie par l'app elle-même, pas par Google Fonts ; les chiffres sont tabulaires partout.
- [x] L'en-tête affiche le dernier chapitre lu ; on peut le modifier (cible tactile ≥ 44 px).
- [x] Le changement de chapitre est enregistré tout de suite sur l'appareil et retrouvé après rechargement.
- [x] L'enregistrement local est versionné, pour pouvoir faire évoluer sa forme plus tard.
- [x] Le Wake Lock est demandé à l'ouverture et redemandé quand l'app revient au premier plan ; si le navigateur ne le permet pas, rien ne casse.
- [x] Des tests couvrent l'enregistrement et la relecture de l'état.
