# 06: Tutoriel d'installation

**What to build:** sur l'Accueil, le visiteur voit comment installer l'app sur l'appareil qu'il tient : un vrai bouton « Installer » quand son navigateur le propose, sinon les étapes propres à son navigateur, ou une phrase qui dit que son navigateur n'installe pas les apps web. « Autre appareil ? » déplie toutes les marches à suivre, au cas où la détection se trompe. Sur la feuille, le lien « Installer l'app » du pied de page ouvre le même tutoriel. Quand l'app tourne déjà installée, rien de tout cela n'apparaît.

Références : `.scratch/vitrine/spec.md` (Tutoriel d'installation, tableau des appareils), maquette (ticket 02).

**Blocked by:** 05 (Accueil)

**Status:** done

- [x] Quand le navigateur propose l'installation, un bouton « Installer » la lance ; une fois l'app installée, le bouton disparaît.
- [x] Sinon, les étapes affichées correspondent au tableau du spec pour Android Firefox, iPhone et iPad (Safari, Chrome, Edge), Mac Safari et Firefox sur ordinateur.
- [x] « Autre appareil ? » montre les marches à suivre de tous les appareils du tableau.
- [x] L'app ouverte en mode installé n'affiche ni le tutoriel ni le lien « Installer l'app ».
- [x] Le lien « Installer l'app » du pied de page de la feuille ouvre le tutoriel, et le retour rend la feuille.
- [x] Le choix de la marche à suivre selon le navigateur est testé unitairement sur des identifiants de navigateur réels.
