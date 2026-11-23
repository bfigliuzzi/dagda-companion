---
name: Compagnon de La Saga de Dagda
description: La feuille d'apprenti écrite à la craie sur l'ardoise noire de l'Académie.
colors:
  noir: "#000"
  ardoise-1: "#0e0e0d"
  ardoise-2: "#1b1b19"
  trait: "#2c2b28"
  craie: "#ecebe4"
  craie-2: "#a9a79d"
  craie-3: "#85837a"
  jaune: "#f2c94c"
  rouge: "#e86a5a"
  rouge-trait: "#4a2420"
  vert: "#7cc4a8"
typography:
  display:
    fontFamily: "Atkinson Hyperlegible Next, system-ui, sans-serif"
    fontSize: "88px"
    fontWeight: 800
    lineHeight: 0.92
    letterSpacing: "-0.03em"
    fontFeature: "tnum"
  numeral-lg:
    fontFamily: "Atkinson Hyperlegible Next, system-ui, sans-serif"
    fontSize: "64px"
    fontWeight: 800
    lineHeight: 1
    fontFeature: "tnum"
  numeral-md:
    fontFamily: "Atkinson Hyperlegible Next, system-ui, sans-serif"
    fontSize: "52px"
    fontWeight: 800
    lineHeight: 1
    fontFeature: "tnum"
  headline:
    fontFamily: "Atkinson Hyperlegible Next, system-ui, sans-serif"
    fontSize: "40px"
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  stat:
    fontFamily: "Atkinson Hyperlegible Next, system-ui, sans-serif"
    fontSize: "32px"
    fontWeight: 800
    lineHeight: 1
    fontFeature: "tnum"
  title-screen:
    fontFamily: "Atkinson Hyperlegible Next, system-ui, sans-serif"
    fontSize: "28px"
    fontWeight: 800
    letterSpacing: "-0.015em"
  title:
    fontFamily: "Atkinson Hyperlegible Next, system-ui, sans-serif"
    fontSize: "22px"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.005em"
  action:
    fontFamily: "Atkinson Hyperlegible Next, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 800
  value:
    fontFamily: "Atkinson Hyperlegible Next, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 700
    fontFeature: "tnum"
  body:
    fontFamily: "Atkinson Hyperlegible Next, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.45
    fontFeature: "tnum"
  reading:
    fontFamily: "Atkinson Hyperlegible Next, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.55
  meta:
    fontFamily: "Atkinson Hyperlegible Next, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: "Atkinson Hyperlegible Next, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    letterSpacing: "0.02em"
rounded:
  tick: "2px"
  seg: "9px"
  r: "12px"
  die: "16px"
  sheet: "22px"
  pill: "999px"
  round: "50%"
spacing:
  hair: "4px"
  xs: "6px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  gutter: "18px"
  section: "20px"
  target: "44px"
  row: "48px"
components:
  dice-cta:
    backgroundColor: "{colors.noir}"
    textColor: "{colors.jaune}"
    typography: "{typography.action}"
    rounded: "{rounded.r}"
    height: "58px"
    width: "100%"
  dice-cta-fill:
    backgroundColor: "{colors.jaune}"
    textColor: "{colors.noir}"
    typography: "{typography.action}"
    rounded: "{rounded.r}"
    height: "58px"
    width: "100%"
  dice-cta-disabled:
    backgroundColor: "{colors.noir}"
    textColor: "{colors.craie-3}"
    rounded: "{rounded.r}"
    height: "58px"
  ghost-button:
    textColor: "{colors.craie}"
    rounded: "{rounded.r}"
    height: "52px"
  pill-action:
    textColor: "{colors.craie}"
    rounded: "{rounded.pill}"
    height: "44px"
    padding: "0 14px"
  roll-button:
    textColor: "{colors.jaune}"
    rounded: "{rounded.pill}"
    height: "44px"
    padding: "0 14px"
  hp-step:
    textColor: "{colors.craie}"
    rounded: "{rounded.round}"
    size: "56px"
  hp-step-minus:
    textColor: "{colors.rouge}"
    rounded: "{rounded.round}"
    size: "56px"
  stepper-button:
    textColor: "{colors.craie}"
    rounded: "{rounded.round}"
    size: "44px"
  chip:
    textColor: "{colors.craie-2}"
    rounded: "{rounded.pill}"
    height: "44px"
    padding: "0 16px"
  chip-on:
    textColor: "{colors.jaune}"
    rounded: "{rounded.pill}"
    height: "44px"
    padding: "0 16px"
  segmented:
    backgroundColor: "{colors.ardoise-2}"
    rounded: "{rounded.r}"
    padding: "4px"
  segmented-on:
    backgroundColor: "{colors.craie}"
    textColor: "{colors.noir}"
    rounded: "{rounded.seg}"
    height: "44px"
  input:
    backgroundColor: "{colors.ardoise-2}"
    textColor: "{colors.craie}"
    rounded: "{rounded.r}"
    height: "52px"
    padding: "12px 14px"
  bottom-sheet:
    backgroundColor: "{colors.ardoise-1}"
    textColor: "{colors.craie}"
    rounded: "{rounded.sheet}"
    padding: "10px 18px 22px"
  row:
    textColor: "{colors.craie}"
    typography: "{typography.body}"
    height: "48px"
    padding: "8px 0"
  hint:
    textColor: "{colors.craie-2}"
    typography: "{typography.meta}"
    padding: "10px 0 0"
  auto-badge:
    textColor: "{colors.jaune}"
    rounded: "{rounded.pill}"
    padding: "3px 10px"
  big-choice:
    textColor: "{colors.craie}"
    typography: "{typography.action}"
    rounded: "{rounded.r}"
    height: "120px"
  die:
    textColor: "{colors.craie}"
    rounded: "{rounded.die}"
    size: "84px"
  plan-cell:
    size: "44px"
  plan-dot:
    backgroundColor: "{colors.trait}"
    size: "5px"
  plan-wall:
    textColor: "{colors.craie}"
    width: "3px"
  start-dock:
    backgroundColor: "{colors.noir}"
    padding: "12px 18px 22px"
  install-step:
    textColor: "{colors.craie}"
    typography: "{typography.body}"
    height: "48px"
    padding: "12px 0"
  device-pill:
    textColor: "{colors.craie}"
    rounded: "{rounded.pill}"
    padding: "1px 8px"
  footer-github:
    textColor: "{colors.craie-2}"
    size: "44px"
  drawn-phone:
    rounded: "46px"
    width: "390px"
    height: "844px"
---

# Design System: Compagnon de La Saga de Dagda

## Overview

**Creative North Star: "L'Ardoise de l'Académie"**

L'app est la feuille d'apprenti qu'on tient à la craie sur une ardoise noire : chaque valeur s'écrit, se gomme et se réécrit. Le fond est un noir pur qui disparaît sur les écrans OLED ; le texte est une craie blanc cassé, légèrement chaude, et trois craies de couleur gardent chacune un seul rôle. Tout tient sur une seule feuille qui défile, dans l'ordre de la feuille papier ; aucun onglet, aucun tableau de bord.

La densité est celle d'une fiche consultée par coups d'œil, téléphone posé à côté du livre : de très gros chiffres pour l'état vital, des lignes de 48 px séparées par des filets, des cibles tactiles d'au moins 44 px. La structure vient des traits de craie (filets de 1 px et soulignés de 2 px), pas de boîtes. La profondeur se limite au panneau qui glisse depuis le bas par-dessus la feuille.

La signature : quand une valeur change, l'ancienne reste un instant barrée en craie rouge juste avant la nouvelle, puis s'efface. Le même geste (ancienne valeur barrée, puis la nouvelle) revient partout où une valeur est remplacée : PV, total des dés ajusté, bilan de fin de combat.

La vitrine (Accueil, tutoriel d'installation, pied de page, mentions légales, image de partage) reste sur la même ardoise. Elle n'ajoute ni couleur, ni police, ni ombre. Sa seule figure nouvelle est le téléphone dessiné de l'Accueil : une feuille d'exemple montrée comme une image, pour qu'on ne la confonde jamais avec sa propre feuille.

**Key Characteristics:**
- Noir pur `#000` comme fond de la feuille, pour l'économie d'énergie OLED.
- Trois craies de couleur à rôle fixe : jaune = action principale, rouge = PV perdus et danger, vert = effet actif.
- Une seule famille, Atkinson Hyperlegible Next, chiffres tabulaires partout.
- Structure par traits de craie, sans cartes ni ombres portées ni texture.
- Ancienne valeur barrée en rouge avant la nouvelle, puis fondu de 1,2 s.
- Un seul élément collant sur la feuille : le bouton « Lancer les dés », en bas de l'écran jusqu'à la fin de la feuille.

## Colors

Une ardoise noire, des craies neutres légèrement chaudes, et trois couleurs saturées employées en petites surfaces, chacune liée à un seul sens.

### Primary
- **Craie jaune** (`jaune`) : l'action principale et rien d'autre. Contour et texte du bouton « Lancer les dés », bouton plein de validation dans un panneau, bouton « Lancer » d'un jet, puce sélectionnée, bouton radio coché, champ en cours de saisie, icône des indices, badge « CHANCE dépensée automatiquement », anneau de focus, sélection de texte et curseur de saisie. Dans la vitrine : contour et texte de « Commencer » sur l'Accueil, et du bouton « Installer » sur l'écran « Installer l'app », où c'est l'action de l'écran.

### Secondary
- **Craie rouge** (`rouge`) : ce qu'on perd et ce qui menace. Ancienne valeur barrée, bouton « − » des PV, PV en état critique et leur barre, compteur en dépassement (« 3 / 2 », trait de besace en trop), bandeau d'état critique, icône d'avertissement, issue « Perdu », dégâts subis.
- **Rouge sombre** (`rouge-trait`, `#4a2420`) : le contour du bouton secondaire de danger, à la place du contour `trait`, quand le texte est déjà en rouge (« Recommencer au chapitre 1 »). C'est un rouge de filet, jamais un texte ni un aplat ; il n'annonce rien de plus que `rouge`.

### Tertiary
- **Craie verte** (`vert`) : un effet actif. Nom d'un effet dans la liste Effets, valeur effective modifiée par un effet (DEX 8) et sa ligne d'explication (« base 7 · potion +1 »).

### Neutral
- **Noir d'ardoise** (`noir`) : le fond de la feuille et des écrans plein écran, le fond du dock de dés, le texte posé sur une surface craie ou jaune.
- **Ardoise posée** (`ardoise-1`) : le fond du panneau glissé depuis le bas, seul plan au-dessus de la feuille.
- **Ardoise de champ** (`ardoise-2`) : le creux des champs, du contrôle segmenté, des lignes d'ajustement et des interrupteurs.
- **Trait discret** (`trait`) : filets entre lignes (1 px), séparations de bloc (2 px), contours neutres (puces, petits boutons ronds, bouton secondaire), cases vides des traits de comptage, fond des barres de PV, points de la grille du plan.
- **Craie** (`craie`) : texte principal (17,6:1 sur noir), soulignés de titre de section, gros chiffres, contour des boutons + / −, segment actif, murs du plan, disque du repère.
- **Craie grise** (`craie-2`) : texte secondaire (8,4:1) : étiquettes, méta à droite des titres, indices, sous-textes, tours de combat passés, trait de note d'une case du plan.
- **Craie pâle** (`craie-3`) : indications, valeurs vides, icônes de suppression, état désactivé, « N » du plan, repère pâle (5,5:1 sur noir, 4,5:1 sur `ardoise-2`). Jamais pour un texte qu'il faut lire pour agir. Dans la vitrine : contour du téléphone dessiné, numéros des étapes d'installation, navigateurs de la liste des appareils, version du pied de page, mention non officielle, date de mise à jour des mentions légales.

### Named Rules
**The Three Chalks Rule.** Jaune, rouge et vert ont chacun un rôle unique et ne s'échangent jamais. Une couleur qui n'annonce ni l'action principale, ni une perte ou un danger, ni un effet actif reste en craie.

Sur l'Accueil, le jaune reste à « Commencer » : le bouton « Installer » du tutoriel y est un bouton secondaire (contour `trait`). Sur l'écran « Installer l'app », il n'y a pas d'autre action : « Installer » y prend le contour jaune. Dans la feuille d'exemple, le rouge ne marque que l'ancienne valeur barrée et le vert que l'effet : ils gardent leur sens.

**The OLED Ground Rule.** Le fond de la feuille est `#000`, pas un gris très sombre. Les couleurs claires restent sur de petites surfaces ; les seuls aplats clairs sont le segment actif, le bouton jaune plein de validation dans un panneau et le disque de 36px du repère d'un plan.

## Typography

**Display Font:** Atkinson Hyperlegible Next (avec `system-ui, sans-serif`)
**Body Font:** Atkinson Hyperlegible Next (avec `system-ui, sans-serif`)

**Character:** Une seule famille, conçue pour la lisibilité, en graisses 400, 500, 700 et 800. Son zéro barré est voulu : il évite toute confusion entre 0 et O sur une fiche faite de chiffres. Toute la page est en chiffres tabulaires (`font-variant-numeric: tabular-nums`) pour que les valeurs ne bougent pas quand elles changent. Pour l'app hors ligne, la police sera hébergée avec l'app ; la maquette la charge depuis Google Fonts.

### Hierarchy
- **Display** (800, 88px, 0.92, -0.03em) : les PV de la feuille, seul chiffre géant. Le maximum (« / 32 ») suit en 24px graisse 500, craie grise.
- **Numeral large** (800, 64px, 1) : le total d'un lancer de dés.
- **Numeral medium** (800, 52px, 1) : les PV des deux camps en combat ; le maximum suit en 18px graisse 500.
- **Headline** (800, 40px, 1.05, -0.02em) : l'issue d'un écran de résultat (« Gagné », « Perdu »).
- **Stat** (800, 32px, 1) : CHANCE, DEXTÉRITÉ, valeurs tirées à la création.
- **Title screen** (800, 28px, -0.015em) : titre d'un écran plein (« Nouvel apprenti », « Combats »).
- **Title** (800, 22px, 1.1) : titres de section de la feuille, soulignés d'un trait de craie de 2 px ; titre d'un panneau, sans souligné.
- **Action** (800, 20px) : texte du bouton de dés et des deux grands choix.
- **Value** (700, 18px) : valeur en bout de ligne, chapitre dans l'en-tête, numéro de chapitre d'un combat.
- **Body** (400, 16px, 1.45) : texte courant et noms dans les lignes. Notes libres en 15px, interligne 1.55.
- **Reading** (400, 16px, 1.55) : texte courant de la page de lecture (mentions légales). Il est en craie, pas en craie grise, pour qu'il se lise ; la ligne s'arrête à 30em.
- **Meta** (400, 14px) : méta des sections, indices, en-tête de feuille, sous-textes.
- **Label** (400, 13px, 0.02em) : étiquette au-dessus d'une valeur ou d'un champ, en casse normale.

Dans la vitrine, les tailles existantes servent telles quelles : nom de l'app en titre d'écran (28px 800, interligne 1.1, `text-wrap: balance`), « Installer l'app » et les titres des mentions légales en titre de section souligné (22px), numéros d'étape en 18px 800, nom de l'app du pied de page en 15px 700. L'image de partage, vue réduite dans un fil de messages, a sa propre échelle (voir « Aperçu de partage »).

### Named Rules
**The Numbers First Rule.** Les chiffres sont le contenu : ils sont toujours plus gros et plus gras que leur étiquette, et toujours tabulaires.

**The One Family Rule.** Une seule famille. La hiérarchie vient de la taille et de la graisse, jamais d'une seconde police ni des majuscules forcées. Les termes du livre écrits en capitales (CHANCE, DEX) le sont dans le texte, pas par un style.

## Layout

Une colonne mobile de 390 px de référence, avec une marge latérale de 18 px (`gutter`) sur tous les écrans. La feuille est une seule page qui défile, dans l'ordre de la feuille papier : en-tête d'une ligne, bloc vital, Armes, Effets, Besace, Derniers combats, Notes, puis la section Aventure (sauvegardes, recommencer) tout en bas, loin du pouce.

Le bloc vital est une grille de deux colonnes (1.45fr / 1fr, écart 16px) : les PV et leurs boutons + / − à gauche, la pile CHANCE / DEXTÉRITÉ / sauvegardes à droite. Il se ferme par un trait de 2 px.

Rythme : sections espacées de 20px en haut ; lignes d'au moins 48px ; champs de 52px ; bouton de dés de 58px ; aucune cible tactile sous 44px. Les écarts internes suivent 4, 6, 8, 12 et 16px.

Éléments fixes : sur la feuille, seul le dock de dés reste collé en bas (padding 12px 18px 22px), sur un dégradé du noir opaque (70 %) vers le transparent pour que la page passe dessous. Il est collant (`position: sticky; bottom: 0`), pas fixe : placé à la fin de la feuille, juste après la section Aventure et avant le pied de page, il reste en bas de l'écran pendant toute la feuille, puis s'arrête à sa fin et remonte avec elle quand le pied de page arrive. Le pied de page défile donc sous le bouton, jamais dessous, et la feuille n'a pas à garder de place vide en bas. Sur les écrans de combat, le dock porte deux boutons (1fr / 1.35fr), sur fond noir opaque avec un filet `trait` en haut. Sur l'écran d'un plan, la barre du bas a le même fond et le même filet, et porte le contrôle « Murs / Cases » (1.35fr) puis « Annuler » (1fr) ; l'écran garde sous son dernier bouton la hauteur de la barre plus 20px. Les écrans de combat et l'historique s'ouvrent en plein écran avec un bouton retour à gauche du titre ; dés et ajout d'effet s'ouvrent en panneau par-dessus la feuille.

Vitrine. L'Accueil se lit de haut en bas : le nom et une phrase (padding 22px 18px 0), la feuille d'exemple coupée à 410px de haut, sa légende, le tutoriel d'installation, le pied de page. « Commencer » est collant comme le bouton de dés, mais sur fond noir opaque avec un filet `trait` de 1px en haut, comme le dock de combat. La mention non officielle tient dans ce dock, sous le bouton. Il est placé après le tutoriel et avant le pied de page : arrivé au bout de l'Accueil, il s'arrête au-dessus du pied de page.

Le pied de page ferme la feuille : sous la section Aventure et sous le dock de dés arrivé au bout de la feuille (12px plus bas), qui ne le cache donc jamais. Il ferme aussi l'Accueil. Il n'apparaît jamais sur les écrans de combat, de plan, d'historique ni de création.

La page de lecture (mentions légales) est une page à part. Sur téléphone, elle garde la marge de 18px. Sur ordinateur, la colonne s'arrête à 30em (environ 70 caractères par ligne) et se centre ; rien d'autre ne change.

## Elevation & Depth

Le système est plat. La feuille n'a aucune ombre portée ; les plans se distinguent par le ton. Un seul plan monte au-dessus de la feuille : le panneau glissé depuis le bas, sur `ardoise-1`, bordé en haut d'un trait de craie de 2 px, au-dessus d'un voile noir à 72 % (`rgba(0,0,0,.72)`). Les champs sont des creux en `ardoise-2`, pas des reliefs.

Le téléphone dessiné de l'Accueil n'a ni fond ni ombre : c'est un contour posé à plat sur la feuille. Les ombres autour des téléphones et de la fenêtre d'ordinateur de la maquette appartiennent à la planche de présentation, pas à l'app.

### Named Rules
**The Chalk Line Rule.** On sépare par un trait, pas par une boîte : filet `trait` de 1 px entre les lignes, trait `trait` de 2 px entre les blocs, trait `craie` de 2 px sous un titre de section et en haut du panneau.

**The No Drop Shadow Rule.** Aucune ombre portée dans l'app. Le seul `box-shadow` est un anneau intérieur qui dessine le bouton radio coché ; ce n'est pas une élévation.

## Shapes

Des coins doux et réguliers, un seul rayon de référence (`--r`, 12px) pour tout ce qui est rectangulaire et touchable : bouton de dés, bouton secondaire, champs, contrôle segmenté, lignes d'ajustement, bandeau critique, grands choix. Les formes qu'on presse du pouce sont rondes : boutons + / − des PV (56px), boutons des pas à pas (44px), anneau des grandes icônes de résultat (64px). Les puces, le bouton « Combattre » et les badges sont en pilule. Le panneau a ses deux coins du haut à 22px. Les dés dessinés ont un trait de 3px et des coins à 16px. Les petits traits (sauvegardes, comptage de la besace) ont des coins de 2px.

Les contours font 2px partout (craie, jaune, rouge ou `trait` selon le rôle), sauf le badge automatique (1,5px) et les dés (3px).

Exception d'illustration : le téléphone dessiné de l'Accueil a des coins de 46px et un contour de 3px en craie pâle. Il ne se touche pas : il dessine un appareil. La règle du rayon de 12px vaut pour ce qu'on touche ; ce rayon de 46px est donc voulu, et un détecteur qui le signale relève cette exception. Aucun élément touchable ne le reprend. L'encoche du téléphone est une barre de 90 × 8px à coins de 4px, en `trait`. La pastille « votre appareil » a un contour de 1,5px, comme le badge automatique. Le trait vertical de l'image de partage fait 4px, à l'échelle de l'image.

Icônes : pictogrammes dessinés pour l'app, en SVG en ligne sur une grille de 24, trait de 2px, extrémités et jonctions arrondies, sans remplissage, en `currentColor`. Affichées entre 18 et 30px selon le contexte (22px par défaut). Aucune image matricielle.

Icônes ajoutées pour la vitrine, sur la même grille et le même trait : `i-github` (lien vers le code source), `i-share` (le bouton Partager du navigateur, dessiné tel qu'il apparaît à l'écran), `i-more` (le menu à trois points), `i-down` (chevron de « Autre appareil ? », retourné de 180° quand la liste est dépliée), `i-install` (bouton « Installer »).

## Components

### Buttons
Contour de craie, jamais d'aplat sauf pour valider dans un panneau.
- **Shape:** coins doux (12px) pour les boutons pleine largeur, pilule (999px) pour les actions en ligne, cercle pour + / −.
- **Bouton de dés (principal):** contour jaune de 2px, texte jaune 20px graisse 800, icône de dé 26px, hauteur 58px, pleine largeur. Fixé en bas de la feuille.
- **Valider dans un panneau:** même forme, aplat jaune, texte noir.
- **Désactivé:** contour et texte en craie pâle ; le libellé dit ce qui manque (« Lancez d'abord la CHANCE ») au lieu d'un message d'erreur. Bouton secondaire : seul le texte passe en craie pâle, le contour `trait` reste.
- **Secondaire (ghost):** contour `trait` de 2px, texte craie 700, hauteur 52px. Variante de danger : texte rouge, contour `rouge-trait`.
- **Action en ligne (« Combattre », « Ajuster »):** pilule à contour craie de 2px, hauteur 44px, icône 18px.
- **Ajouter:** texte craie grise graisse 700 précédé d'un +, sans contour.
- **Lien:** texte craie grise souligné, soulignement en craie pâle décalé de 4px.
- **Focus:** anneau jaune de 2px décalé de 3px.

### Steppers
- **PV:** deux cercles de 56px à contour de 2px ; « − » en rouge, « + » en craie.
- **Pas à pas de champ:** cercles de 44px à contour craie pâle autour d'une valeur 22px ; dans un champ numérique, boutons sans contour sur le creux `ardoise-2`.
- **Bourse:** petits cercles de 44px à contour `trait`.

### Segmented control
Creux `ardoise-2` à coins de 12px, padding 4px, deux segments. Le segment actif est un aplat craie à coins de 9px, texte noir 700 ; l'autre est en craie grise. Il change de mode à l'intérieur d'un formulaire ou d'un panneau (1 dé / 2 dés, nouvelle aventure / déjà en route), ou l'outil de l'écran d'un plan (« Murs / Cases », dans la barre du bas), jamais de page. Composant partagé : `ControleSegmente.svelte`.

### Chips
- **Style:** pilule de 44px, contour `trait` de 2px, texte craie grise 700.
- **State:** sélectionnée = contour et texte jaunes. Choix unique dans une liste courte (talent, mode, valeur modifiée, sauvegardes utilisées).

### Inputs / Fields
- **Style:** creux `ardoise-2`, coins 12px, hauteur 52px, texte 17px ; étiquette 13px craie grise au-dessus ; texte d'exemple en craie pâle.
- **Focus:** contour jaune de 2px (le contour transparent au repos évite tout décalage).
- **Interrupteur:** 52 × 32px, creux `ardoise-2`, contour craie pâle.
- **Choix à description (radio):** cercle de 24px à contour craie pâle ; coché = disque jaune entouré d'un anneau noir. Titre 17px, description 14px craie grise.

### Rows
La ligne est l'unité de la feuille : hauteur minimale 48px, filet `trait` en bas, nom à gauche, valeur 18px graisse 700 à droite, croix de retrait en craie pâle (cible 44px). Ligne de plan : « ici § 203 » quand le repère est plein ; « § 203 » est la valeur (18px graisse 700, chiffres tabulaires) et « ici » la précède en 14px graisse 400 craie grise (`craie-2`), comme « / 32 » après les PV ; un repère pâle ne dit pas « ici », la ligne montre alors le nombre de cases notées ; « 3 cases notées » décrit le plan sans en être une valeur, et se met en 14px craie grise (`craie-2`), comme « 3 restantes » dans la section Aventure ; un plan sans case notée n'a rien à droite. Ligne d'effet : nom en vert. Rappel : texte en craie grise. Ligne de jet à la création : 64px, valeur 32px, bouton « Lancer » en pilule jaune.

### Tally marks
Les compteurs se dessinent en traits de craie verticaux à coins de 2px. Sauvegardes : 6 × 24px, craie si disponible, `trait` si utilisée. Besace : 24 traits de 6 × 16px, craie si occupé, `trait` si libre, rouge pour chaque objet en trop.

### Hints
Indice non bloquant sous un bloc : trait `trait` de 2px au-dessus, icône 20px jaune (information) ou rouge (avertissement), texte 14px craie grise avec les chiffres utiles en craie. Il dit quoi faire, il n'empêche rien. Le bandeau d'état critique en combat est la seule version encadrée : contour rouge de 2px, coins 12px.

### Bottom sheet
Panneau de dés et d'ajout d'effet. Il glisse depuis le bas en 0,22 s à l'ouverture, une fois, sans mouvement à la fermeture (ticket 05) ; sans animation si le lecteur la réduit. Fond `ardoise-1`, trait de craie de 2px en haut, coins du haut à 22px, poignée 44 × 5px en craie pâle, titre 22px graisse 800 avec bouton de fermeture 44px. Les PV restent visibles au-dessus du voile.

### Dice dock
Panneau de dés : sélecteur 1 dé / 2 dés, dés dessinés de 84px (trait craie de 3px, points de 14px), total en 64px, ligne d'ajustement de la CHANCE (creux `ardoise-2` + pas à pas), puis bouton de validation. Quand le total est ajusté, l'ancien total est barré en rouge 36px juste avant.

### Combat
- **Face-à-face:** deux colonnes séparées d'un trait de 2px ; nom du camp 14px craie grise (l'ennemi est repéré par « § chapitre »), PV 52px, barre de 6px (craie, ou rouge en état critique), statistiques 13px.
- **Journal:** une entrée par jet, filet en bas ; qui agit en 13px graisse 700, ce qui arrive en 16px. Tour en cours en clair, tours passés en craie grise et craie pâle. Coup manqué en craie pâle, dégâts subis en rouge 800.
- **Badge automatique:** pilule à contour jaune de 1,5px, texte 13px jaune, icône 14px ; signale chaque dépense automatique de CHANCE.
- **Dock de combat:** deux boutons côte à côte sur fond noir opaque.
- **Mode narratif:** deux grands choix de 120px, contour craie pour « Gagné », rouge pour « Perdu », icône 30px.

### Fight rows
Historique des combats : grille 64px / 1fr / auto, hauteur 56px. Chapitre 18px graisse 800, issue 16px (rouge si « Perdu ») avec un sous-texte 13px, PV perdus en rouge à droite. Un appui déplie le détail (14px craie grise, valeurs en craie, pertes en rouge).

### Plan
L'écran d'un plan s'ouvre en plein écran, comme celui des combats. Il n'a pas de maquette dédiée : il est fait des seuls motifs de ce document.
- **Grille pointée:** aucune ligne ; un point de 5px (rayon 2,5px) couleur `trait` à chaque croisement, sur des cases de 44px. Une grille de 8 × 8 cases a 9 × 9 points. Les points sont peints par un motif SVG, pas un par un, pour qu'une grille de 30 × 30 reste fluide.
- **Cadre du plan:** la grille occupe toute la hauteur libre entre l'en-tête et « Supprimer ce plan », 12px sous l'en-tête, d'un bord à l'autre de l'écran, sans fond, sans contour, sans filet et sans barre de défilement : le cadre coupe simplement la grille à ses bords. À l'ouverture, chaque axe a sa règle. Là où la grille tient entière dans le cadre, elle est centrée en largeur, et posée en haut du cadre à une case du bord si elle y tient avec cette marge (un plan neuf de 8 × 8 est donc centré sur un téléphone, avec 30px de chaque côté). Là où elle ne tient pas, la vue se centre sur le repère, puis s'arrête une case au-delà du bord de la grille, comme quand on la fait défiler ; sans repère, la grille est centrée sur cet axe.
- **Repère du nord:** un « N » 13px en craie pâle, centré au-dessus du bord haut. Le nord est toujours en haut.
- **Mur:** trait de craie (`craie`) de 3px, bouts arrondis (`stroke-linecap: round`), d'un point au point voisin, sur le bord d'une case. Comme les dés dessinés, c'est un trait de 3px.
- **Mur effacé:** il passe en craie rouge puis s'efface en 1,2s (voir « Signature : la trace de craie ») ; avec `prefers-reduced-motion`, il disparaît tout de suite. Un mur retiré par « Annuler » fait de même.
- **Tracer:** un doigt sur la grille dessine (`touch-action: none`), il ne fait pas défiler la page. Le trait se cale sur les bords des cases : il n'y a pas à viser juste.
- **Grandir:** un mur posé sur le bord extérieur ajoute une rangée ou une colonne de ce côté, jusqu'à 30 × 30 cases. Rien ne bouge à l'écran quand la grille grandit, même par le haut ou la gauche : la nouvelle rangée apparaît au bord, les murs déjà tracés restent sous le doigt.
- **Défiler:** deux doigts font glisser le plan, dans les deux modes ; un doigt seul ne fait jamais défiler. Le plan s'arrête une case au-delà du bord de la grille. Un second doigt posé pendant un trait abandonne ce trait. Sans mouvement d'inertie : le plan s'arrête quand les doigts s'arrêtent.
- **Case notée:** le numéro de chapitre en 13px graisse 700, craie, au milieu de la case. Une note se signale par un petit trait de 2px en craie grise, en diagonale dans le coin en haut à droite, à 3px des bords (diagonale de 8px, bouts arrondis) : aucune couleur nouvelle. En mode Cases, chaque case est un bouton de 44px, invisible, nommé « Case 3-5, chapitre 47, note : clé » (colonne-ligne à partir de 1 depuis le coin haut-gauche de la grille) ; au clavier, son focus est le contour jaune de 2px habituel. En mode Murs ces boutons n'existent pas.
- **Panneau d'une case:** le panneau du bas de la maquette (« Bottom sheet »), sans bouton jaune puisque tout s'enregistre à chaque modification : titre « Case 3-5 », champ numérique « Chapitre » (préfixe « § », comme dans la maquette des combats), champ de note courte (champ de 52px, 60 caractères au plus, texte d'exemple en craie pâle), indice non bloquant « Le § 47 est déjà sur la case 3-5. » (icône jaune) quand le numéro est ailleurs, puis « Je suis ici » et le lien discret « Vider la case ». « Je suis ici » est le bouton secondaire de la maquette (`BoutonContour` : contour `trait`, texte craie 700, 52px), pas un bouton jaune : il n'y a pas d'action principale à porter, tout est déjà enregistré. Il place le repère et ferme le panneau.
- **Repère « vous êtes ici »:** un disque plein de craie (`craie`) de 36px (rayon 18) au milieu de la case, sous le numéro, qui passe en noir (`noir`, 13px graisse 700) par-dessus, comme le segment actif du contrôle « Murs / Cases » : le numéro reste lu en entier, même à quatre chiffres. Ni jaune (ce n'est pas une action), ni rouge (ce n'est pas un danger), ni vert (ce n'est pas un effet) : c'est la Three Chalks Rule, le repère reste en craie. Quand le lecteur n'y est plus (le dernier chapitre lu n'est sur aucune case, ou la case du repère a été vidée ou renumérotée, sauf s'il a été posé à la main pour ce chapitre), le repère reste où il était en craie pâle (`craie-3`, `data-etat="pale"`), le numéro noir y garde plus de 5:1 de contraste ; aucune opacité, aucune couleur nouvelle. Un repère sur une case qui porte une note : le trait en coin longe le disque sans le toucher (diagonale de 8px). Un plan qui n'a jamais eu de repère n'a pas de disque. Il est annoncé : « , vous êtes ici » (ou « , vous étiez ici (repère pâle) ») à la fin du nom de sa case en mode Cases, et « vous êtes ici en case 3-5 » (ou « repère pâle en case 3-5 ») dans le nom de la grille. À l'ouverture, la vue suit la règle du cadre ci-dessus : le repère est toujours visible, au milieu du cadre sur un axe où la grille ne tient pas, sauf près du bord de la grille.
- **Indice du chapitre absent:** « § 205 n'est pas sur ce plan. » (icône jaune d'information, chiffre en craie), sous la grille, quand le repère est pâle. Sans repère, il ne vient que si le plan a au moins une case numérotée : sur un plan encore vierge il n'y a rien à comparer et il ne ferait que gêner.
- **Appui sur une case:** un doigt qui se pose et se lève sans bouger de plus de 10px ouvre le panneau ; un glissé, ou deux doigts, n'ouvre rien et ne trace rien. Si le bas de la case arrive à moins de 12px du haut du panneau ouvert, la vue se déplace d'un coup, sans animation, pour mettre la case au milieu de ce qui reste visible du cadre au-dessus du panneau (elle peut alors dépasser ses limites habituelles).
- **Indice:** tant que le plan n'a aucun mur, « Glissez le doigt le long des points pour tracer un mur. » sous la grille ; il s'en va au premier mur.
- **Barre du bas:** fixe, fond noir opaque et filet `trait` en haut, comme le dock de combat ; contrôle segmenté « Murs / Cases » puis « Annuler », bouton secondaire de 52px (contour `trait`, texte craie 700 ; désactivé : texte en craie pâle, quand il n'y a rien à défaire). « Supprimer ce plan » (bouton secondaire de danger) reste au-dessus de la barre.

### Signature : la trace de craie
Quand une valeur est remplacée, l'ancienne reste barrée en craie rouge (graisse 700, trait de barre de 3px, 2px dans les lignes) juste avant la nouvelle, puis s'efface en 1,2 s avec un fondu en sortie exponentielle. L'ancienne valeur précède toujours la nouvelle, dans le sens de lecture. C'est la seule animation d'une valeur. Le même geste vaut pour un mur effacé sur un plan : le trait passe en craie rouge, puis s'efface en 1,2 s. Le système n'a qu'un autre mouvement, le glissement du panneau (voir « Bottom sheet »), et aucun des deux ne se répète : chacun se joue une fois, et `prefers-reduced-motion` les supprime tous les deux.

### Accueil
Le premier écran, seulement quand aucune aventure n'est enregistrée.
- **En-tête:** le nom de l'app en titre d'écran (28px 800, interligne 1.1), puis une phrase en craie grise.
- **Feuille d'exemple (téléphone dessiné):** une image, pas une feuille. Elle montre les vrais motifs de la feuille (en-tête, bloc vital avec 31 barré puis 28, Armes, Effets, Besace et ses traits) dans le contour d'un téléphone de 390 × 844px réduit à 62 % (`transform: scale(.62)`) : contour craie pâle de 3px, coins de 46px, encoche, ni fond ni ombre. Le cadre la coupe net à 410px de haut, sur un trait `trait` de 2px. Elle ne se touche pas (`pointer-events: none`) et se lit comme une seule image (`role="img"` et une description des valeurs).
- **Légende:** « Une feuille d'exemple. La vôtre commence vierge. », 15px craie grise, centrée, 10px sous le trait.
- **Dock « Commencer »:** le bouton de dés (contour jaune, 58px, 20px 800), sans icône, collant en bas (`sticky`, arrêté avant le pied de page) sur fond noir opaque avec un filet `trait` de 1px en haut. Dessous, centrée à 8px, la mention « Projet de fan non officiel · tout reste sur votre téléphone » en 13px craie pâle.

**The Sample Is A Picture Rule.** Une feuille d'exemple se montre toujours réduite, dans le contour du téléphone dessiné, coupée par un trait, avec sa légende, et sans rien de touchable. Une vraie feuille est à taille réelle et sans contour : les deux se distinguent d'un coup d'œil.

### Tutoriel d'installation
- **Titre:** titre de section souligné « Installer l'app », avec l'appareil deviné en méta à droite (14px craie grise, « iPhone · Safari »). Dessous, une phrase de 15px en craie grise dit pourquoi installer.
- **Étapes:** numérotées, parce que l'ordre compte. Grille 28px / 1fr, hauteur minimale 48px, padding 12px 0, filet `trait` en bas. Numéro 18px 800 en craie pâle, texte 16px en craie. Les boutons du navigateur sont dessinés dans la phrase (icône 20px, craie), tels qu'ils apparaissent à l'écran.
- **Bouton « Installer »:** le vrai bouton, quand le navigateur propose l'installation ; il remplace alors les étapes. Icône `i-install` de 22px. Sur l'Accueil, c'est un bouton secondaire (contour `trait`, texte craie 700, 52px), pour laisser le jaune à « Commencer ». Sur l'écran « Installer l'app », c'est le bouton de dés (contour jaune, 58px), parce que c'est l'action de l'écran.
- **« Autre appareil ? »:** un lien suivi du chevron `i-down` de 18px, retourné quand la liste est dépliée.
- **Liste des appareils:** une ligne par cas, padding 10px 0, filet `trait` en bas. L'appareil en 16px 700 craie à gauche, les navigateurs en 13px craie pâle à droite ; dessous, la marche à suivre en 14px craie grise, avec les libellés à toucher en craie 700 et les icônes dessinées de 18px. L'appareil deviné porte la pastille « votre appareil » : 13px craie, contour `trait` de 1,5px, pilule, padding 1px 8px.
- **Écran « Installer l'app »:** ouvert depuis le pied de page, en plein écran, avec un bouton retour à gauche du titre, comme l'historique des combats. Une phrase d'intro de 15px en craie grise, l'appareil deviné écrit en toutes lettres (« Sur **Android avec Chrome**, … », 14px), puis le bouton et la liste dépliée.
- **App déjà installée:** pas de tutoriel sur l'Accueil, pas de lien « Installer l'app » dans le pied de page.

### Pied de page
- **Place:** il ferme la feuille sous la section Aventure (32px plus bas, marge 18px) et le bas de l'Accueil. Jamais sur les écrans de combat, de plan, d'historique ni de création.
- **Forme:** trait `trait` de 2px en haut, puis 12px d'espace. À gauche, le nom de l'app (15px 700, craie) et dessous la version (14px craie pâle). À droite, le lien vers GitHub : un bouton icône de 44px en craie grise.
- **Liens:** « Mentions légales » et « Installer l'app », côte à côte (écart 22px), dans le style lien : 15px 700 craie grise, souligné en craie pâle décalé de 4px, 44px de haut.

### Page de lecture
Les mentions légales : une page HTML à part, avec sa propre adresse, lisible hors ligne sans lancer l'app. Même ardoise, même police.
- **Haut:** le lien « Retour à l'app » précédé de la flèche `i-back`, le titre en titre d'écran (28px), la date de mise à jour en 14px craie pâle.
- **Sections:** soulignées comme celles de la feuille (22px 800, trait craie de 2px, à la largeur du titre), 26px au-dessus de chacune.
- **Texte:** Reading (16px, interligne 1.55) en craie, ligne de 30em au plus. Les liens du texte sont en craie, soulignés en craie pâle.
- **Bas:** « Retour à l'app » en bouton secondaire, 32px sous le texte.
- **Ordinateur:** la colonne (30em plus les marges) se centre ; rien d'autre ne change.

### Aperçu de partage
L'image de 1200 × 630 (`public/apercu-partage.png`), exportée depuis `design/apercu-partage/apercu.html` par `design/apercu-partage/exporter.mjs`. Elle est vue réduite dans un fil de messages : elle a donc sa propre échelle, qui ne sert de modèle à aucun écran.
- **Fond et grille:** noir pur, deux colonnes (1fr / 420px, écart 48px), marges 76px 72px 70px.
- **À gauche:** l'icône de l'app (72px) ; le nom en 64px 800 (interligne 1.04, -0.025em) sur deux lignes, la seconde (« La Saga de Dagda ») soulignée d'un trait de craie de 4px ; une phrase en 30px craie grise (24ch au plus) ; « Projet de fan non officiel » en 24px craie pâle, posé en bas.
- **À droite:** après un trait vertical `trait` de 4px, l'étiquette « Points de vie » en 26px craie grise, puis la trace de craie figée : 31 barré en rouge (48px 700, barre de 6px), 28 en 176px 800, « / 32 » en 44px 500 craie grise.
- **Contenu:** rien du livre, ni texte ni illustration.

## Do's and Don'ts

### Do:
- **Do** garder le fond de la feuille en `#000` et réserver les couleurs claires aux petites surfaces.
- **Do** utiliser le jaune pour l'action principale, le rouge pour les pertes et le danger, le vert pour les effets actifs, et rien d'autre.
- **Do** montrer chaque valeur remplacée barrée en rouge avant la nouvelle, puis l'effacer en 1,2 s.
- **Do** séparer les blocs par des traits de craie (1px entre lignes, 2px entre blocs et sous les titres de section).
- **Do** garder toute cible tactile à 44px au moins et les lignes à 48px.
- **Do** dessiner les icônes en SVG en ligne, grille de 24, trait de 2px, extrémités arrondies.
- **Do** prévenir par un indice non bloquant (icône jaune ou rouge, texte qui dit quoi faire) plutôt que bloquer.
- **Do** héberger Atkinson Hyperlegible Next avec l'app pour le hors-ligne.
- **Do** montrer une feuille d'exemple seulement dans le téléphone dessiné : réduite, coupée par un trait, légendée « La vôtre commence vierge. ».
- **Do** laisser le jaune à « Commencer » sur l'Accueil : le bouton « Installer » n'y prend que le contour `trait`.
- **Do** numéroter les étapes d'installation, parce que l'ordre compte.

### Don't:
- **Don't** ajouter d'onglets ni de barre de navigation : la feuille est une seule page ; le contrôle segmenté ne change que le mode d'un formulaire ou d'un panneau.
- **Don't** regrouper le contenu dans des cartes remplies ; les creux `ardoise-2` sont réservés aux champs, au contrôle segmenté, aux lignes d'ajustement et aux interrupteurs, et `ardoise-1` au panneau.
- **Don't** utiliser d'ombre portée ni de texture.
- **Don't** utiliser d'animation continue ou en boucle ; seuls la trace de craie et le glissement du panneau bougent, chacun une fois.
- **Don't** utiliser une seconde famille de caractères ni des chiffres proportionnels.
- **Don't** donner un aplat de couleur au bouton de dés de la feuille : il reste en contour jaune ; l'aplat jaune sert à valider dans un panneau.
- **Don't** rendre la feuille d'exemple touchable, ni la montrer à taille réelle.
- **Don't** reprendre le rayon de 46px du téléphone dessiné sur un élément touchable.
- **Don't** mettre le pied de page sur les écrans de combat, de plan, d'historique ou de création.
- **Don't** mettre de contenu du livre (texte ou illustration) dans l'image de partage.
