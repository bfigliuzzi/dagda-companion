// Publication automatique d'une version à chaque push sur main (voir le workflow
// .github/workflows/deploiement.yml) : `ajout` monte la mineure, `correctif` le
// correctif, `!` la majeure ; les autres types ne publient rien.
const types = [
  { type: "ajout", section: "Ajouts" },
  { type: "correctif", section: "Corrections" },
];

export default {
  branches: ["main"],
  tagFormat: "v${version}",
  plugins: [
    [
      "@semantic-release/commit-analyzer",
      {
        preset: "conventionalcommits",
        // Seuls ces types publient une version. Un type absent de cette liste ne
        // publie rien, sauf avec `!`.
        releaseRules: [
          { breaking: true, release: "major" },
          { type: "ajout", release: "minor" },
          { type: "correctif", release: "patch" },
        ],
      },
    ],
    [
      "@semantic-release/release-notes-generator",
      {
        preset: "conventionalcommits",
        presetConfig: { types },
        // Pas de section « BREAKING CHANGES » : les notes n'ont que « Ajouts » et
        // « Corrections ».
        writerOpts: {
          finalizeContext: (context) => ({ ...context, noteGroups: [] }),
        },
      },
    ],
    [
      "@semantic-release/changelog",
      { changelogTitle: "# Journal des versions" },
    ],
    [
      "@semantic-release/git",
      {
        assets: ["CHANGELOG.md"],
        message: "docs(version): ${nextRelease.version} [skip ci]",
      },
    ],
    [
      "@semantic-release/github",
      { successComment: false, failComment: false, releasedLabels: false },
    ],
  ],
};
