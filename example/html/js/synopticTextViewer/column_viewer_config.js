class ColumnViewerConfig {
  // ===========================================================================
  // DATA & METADATA PATHS
  // ===========================================================================
  /** Path to the file containing the paths and metadata html snippets */
  snippetMetadataPath = "./witness_snippets/snippet_paths.json";

  // ===========================================================================
  // CONTAINER & COLUMN SETTINGS
  // ===========================================================================
  /** ID of the top-level container for the witness columns */
  witnessColumnsContainerId = "synTexView-witness-container";
  /** Default number of columns to display */
  defaultNumberOfColumns = 3;
  /** Whether to fetch all witnesses (boolean) */
  fetchAllWitnesses = false;
  /** Max viewport width (px) treated as mobile mode */
  mobileMaxWidthPx = 800;

  // ===========================================================================
  // BUTTON & CONTROL IDS
  // ===========================================================================
  addColumnButtonId = "column-adder";
  toggleEmptyLinesButtonId = "empty-line-toggler";
  toggleGlobalLineNumbersButtonId = "global-linenr-toggler";
  toggleLocalLineNumbersButtonId = "local-linenr-toggler";
  generateCitationUrlButtonId = "generate-citation-url";

  // ===========================================================================
  // BUTTON & CONTROL LABELS
  // ===========================================================================
  addColumnLabel = "Add column";
  toggleEmptyLinesLabel = "Toggle empty lines";
  toggleGlobalLineNumbersLabel = "Toggle global line numbers";
  toggleLocalLineNumbersLabel = "Toggle local line numbers";
  generateCitationUrlLabel = "Copy citation URL to clipboard";
  removeColumnLabel = "Remove column";
  copyUrlNotificationLabel = "URL copied to clipboard!";

  // ===========================================================================
  // COLLATION (word/character-level diffing across witnesses)
  // ===========================================================================
  /** Master switch: turns the collation feature on/off. */
  collationEnabled = true;
  /** CSS selectors for content that must be excluded from the diffed text
   * (line numbers, hidden editorial/apparatus annotations) but is
   * preserved in the DOM. */
  collationExcludedSelectors = [
    ".synTexView-linenr-global",
    ".synTexView-linenr-local",
    ".editorial_note",
  ];
  /** Selector for elements re-appended verbatim (e.g. hidden footnotes)
   * after the collated content of a line. */
  collationAnnotationSelector = ".editorial_note";
  /** Attribute added to a base-witness word listing which other witnesses
   * it differs from. Set to null/false to omit it. */
  collationDiffersInAttr = "data-collation-differs-in";

  // ===========================================================================
  // CSS CLASS NAMES
  // ===========================================================================
  witnessLineClass = "synTexView-line";
  omittedLineClass = "synTexView-omitted";
  hiddenElementClass = "synTexView-hidden";
  globalLineNumberClass = "synTexView-linenr-global";
  localLineNumberClass = "synTexView-linenr-local";
  highlightClass = "synTexView-highlight";
  neighborHighlightClass = "synTexView-neighbor";
  textContentClass = "synTexView-text-content";
  witnessColumnClass = "synTexView-witness";
  witnessDropdownContainerClass = "synTexView-controls-container";
  removeColumnButtonClass = "synTexView-remove-column";
  witnessSelectClass = "text-select";
  controlsContainerTogglerClass = "synTexView_controls_toggle";
  controlsContainerClass = "synTexView_controls";
  copyUrlNotificationClass = "synTexView-url-copy-notification";
  /** Applied to any word that differs between witnesses (in the base row
   * or any other witness). Single class, highlighted in red - no
   * character-level or insert/replace distinction. */
  collationDiffClass = "synTexView-collation-diff";

  // ===========================================================================
  // ARIA LABELS
  // ===========================================================================
  generateCitationUrlAriaLabel = "Generate a citation URL";
  addColumnAriaLabel = "Add a new column";
  toggleEmptyLinesAriaLabel = "Toggle visibility of empty lines";
  toggleGlobalLineNumbersAriaLabel = "Toggle visibility of global line numbers";
  toggleLocalLineNumbersAriaLabel = "Toggle visibility of local line numbers";

  // ===========================================================================
  // ARIA & ACCESSIBILITY ATTRIBUTES
  // ===========================================================================
  controlsContainerAriaExpandedAttr = "aria-expanded";
  controlsContainerAriaControlsAttr = "aria-controls";
  controlsContainerAriaControlsValue = "synTexView-controls-container";
  controlsContainerOpenClass = "open";
  ariaLabelAttr = "aria-label";
  ariaLiveRegionId = "aria-live-region";
  ariaLiveRegionPolite = "polite";
  ariaSelectWitnessLabel = (columnId) =>
    `Select witness for column ${columnId}`;
  ariaTextContentLabel = (witnessTitle) => `Text content for ${witnessTitle}`;
  ariaRemoveColumnLabel = (witnessTitle) => `Remove column for ${witnessTitle}`;
  ariaColumnLabel = (witnessTitle) => `Column for ${witnessTitle}`;
}

export default ColumnViewerConfig;
