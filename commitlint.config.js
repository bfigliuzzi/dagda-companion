// Format des messages de commit : `type(portée facultative): texte`, en français.
// Un `!` après le type ou la portée signale un changement qui casse.
// La règle complète est dans CLAUDE.md ; l'effet de chaque type sur la version
// est dans release.config.js.
export default {
  // Même lecture des messages que semantic-release, qui comprend le `!`.
  parserPreset: "conventional-changelog-conventionalcommits",
  rules: {
    "type-enum": [
      2,
      "always",
      ["ajout", "correctif", "dette", "docs", "tests", "ci", "outils"],
    ],
    "type-empty": [2, "never"],
    "subject-empty": [2, "never"],
  },
};
