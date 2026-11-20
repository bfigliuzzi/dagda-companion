# Vitrine

Décisions prises le 2026-11-20 (séance de questions). But : qu'un visiteur qui tombe sur l'app comprenne ce qu'elle fait, sache l'installer, trouve le code et les mentions légales, et que l'app ait l'air d'un produit fini.

## Accueil

- Un nouvel écran, l'**Accueil** (voir `GLOSSARY.md`). Il ne s'affiche qu'à l'ouverture de l'app quand aucune aventure n'est enregistrée.
- Il dit ce qu'est l'app, qu'elle est un projet de fan non officiel, et mène à « Nouvel apprenti » par « Commencer ».
- Recommencer une aventure, ou recommencer après une mort en mode mortel, va directement à « Nouvel apprenti », sans repasser par l'Accueil. Cas limite accepté : fermer l'app pendant « Nouvel apprenti » après avoir recommencé fait revoir l'Accueil, puisque l'aventure est déjà effacée.
- Le nom de l'app n'apparaît pas en haut de la feuille : la place y est réservée au résumé du personnage et au dernier chapitre lu. Il apparaît sur l'Accueil et dans le pied de page.

## Tutoriel d'installation

Sur l'Accueil, et ouvert depuis le lien « Installer l'app » du pied de page. Rien de tout cela n'apparaît quand l'app tourne déjà installée.

| Appareil et navigateur | Ce qui s'affiche |
|---|---|
| Android : Chrome, Edge, Samsung Internet | Bouton « Installer » natif (`beforeinstallprompt`) |
| Android : Firefox | Menu ⋮ → « Installer » |
| iPhone, iPad : Safari, Chrome, Edge | Bouton Partager → « Sur l'écran d'accueil » |
| Ordinateur : Chrome, Edge | Bouton « Installer » natif |
| Mac : Safari | Fichier → « Ajouter au Dock » |
| Ordinateur : Firefox | Ce navigateur n'installe pas les apps web ; l'app marche très bien dans un onglet |

L'appareil est deviné d'après le navigateur ; comme la détection peut se tromper, « Autre appareil ? » déplie toutes les marches à suivre.

## Pied de page

En bas de la feuille (après la section « Aventure ») et de l'Accueil, jamais sur les écrans de combat, de plan ou de création. Il contient : le nom de l'app, le numéro de version, une icône GitHub vers l'accueil du dépôt (<https://github.com/bfigliuzzi/dagda-companion>), le lien « Mentions légales », et « Installer l'app » tant que l'app n'est pas installée. Pas d'icône fixe dans un coin : elle chevaucherait l'en-tête ou le dock de dés.

## Mentions légales

Une seule page HTML à part, avec sa propre adresse, lisible hors ligne, sans lancer l'app, avec un lien « Retour à l'app ». En français seulement. Pas de CGU ni de bandeau cookies : l'app ne vend rien, n'a pas de compte et ne collecte rien ; le `localStorage` sert seulement au service demandé, ce qui est exempté.

Cinq sections :

1. **Éditeur** : Benoît Figliuzzi, à titre personnel et non professionnel. Contact : les issues GitHub du dépôt. Ni adresse, ni téléphone, ni e-mail (la LCEN le permet à un particulier non professionnel).
2. **Hébergeur** : GitHub, Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, États-Unis (adresse à vérifier sur le site de GitHub au moment d'écrire la page).
3. **Propriété intellectuelle et non-affiliation** : « La Saga de Dagda », ses règles, ses noms et son univers appartiennent à leurs auteurs et à leur éditeur. L'app est un projet de fan non officiel, sans lien avec eux ; elle ne reproduit ni le texte ni les illustrations du livre. Le code est sous licence MIT.
4. **Données personnelles** : l'app ne collecte rien ; l'aventure reste sur l'appareil. GitHub, en tant qu'hébergeur, conserve des journaux techniques (dont l'adresse IP) ; lien vers sa déclaration de confidentialité.
5. **Responsabilité** : l'app est fournie telle quelle, sans garantie. L'aventure n'existe que sur l'appareil : vider les données du navigateur l'efface. En cas de désaccord entre l'app et le livre, le livre fait foi.

## Aperçu de partage

Balises Open Graph (titre, description, image) pour qu'un lien partagé affiche un aperçu. Pas de page 404 : GitHub Pages en sert déjà une.

## Design

L'Accueil (tutoriel compris), le pied de page, la page « Mentions légales » et l'image de partage sont dessinés avec Impeccable et ajoutés à la maquette avant d'être codés. Le design suit `DESIGN.md` et `PRODUCT.md` (fond noir pur, craie, aucune animation continue).

## Versions

- Pas de réécriture de l'historique : le tag `v0.1.0` est posé sur le dernier commit avant ce chantier, puis poussé.
- `semantic-release` publie une version à chaque push sur `main` qui contient un `ajout` ou un `correctif` : tag, release GitHub et CHANGELOG en français (sections « Ajouts » et « Corrections »). Le déploiement vient après, et le build lit le numéro dans le tag.
- Messages de commit entièrement en français, contrôlés par `commitlint` en CI (pas de hook local) :

| Type | Effet sur la version |
|---|---|
| `ajout` | mineure |
| `correctif` | correctif |
| `dette`, `docs`, `tests`, `ci`, `outils` | aucun |

Format : `type(portée facultative): texte`, la portée étant une partie de l'app (plans, combat, besace…). Un `!` après le type ou la portée signale un changement qui casse (par exemple une aventure enregistrée qui ne se relit plus) et fait monter le premier chiffre de la version.
