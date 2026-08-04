{
  // Path to the JSON file containing snippet metadata
  "snippetLogPath": "./witness_snippets/snippet_paths.json",

  // ID of the main container where witness columns are rendered
  "witnessContainerId": "witness-container",

  // ID of the container for the "Add Column" button
  "columnAdderId": "column-adder",


  // ID of the container for the "Toggle Empty Line Visibility" button
  "emptyLineTogglerId": "empty-line-toggler",

  // ID of the container for the "Toggle Global Line Counter" button
  "globalLinenrTogglerId": "global-linenr-toggler",

  // ID of the container for the "Toggle Individual Line Counter" button
  "localLinenrTogglerId": "local-linenr-toggler",

  // Default number of columns to display
  "defaultColumnNumber": 3,

  // Master switch for the word-level collation (diff) feature that is
  // triggered when a line is double-clicked or Enter is pressed. Differing
  // words are simply highlighted in red.
  "collationEnabled": true,

  // CSS selectors for content excluded from the diffed text (line numbers,
  // hidden editorial/apparatus annotations), preserved in the DOM
  "collationExcludedSelectors": [".synTexView-linenr-global", ".synTexView-linenr-local", ".editorial_note"],

  // Attribute added to a base-witness word listing which other witnesses
  // it differs from (set to null/false to omit it)
  "collationDiffersInAttr": "data-collation-differs-in"
}