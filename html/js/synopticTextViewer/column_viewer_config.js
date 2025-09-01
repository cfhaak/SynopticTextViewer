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
  witnessColumnsContainerId = "witness-container";
  /** Default number of columns to display */
  defaultNumberOfColumns = 3;
  /** Whether to fetch all witnesses (boolean) */
  fetchAllWitnesses = false;

  // ===========================================================================
  // BUTTON & CONTROL IDS
  // ===========================================================================
  addColumnButtonId = "column-adder";
  toggleScrollButtonId = "scroll-toggler";
  toggleEmptyLinesButtonId = "empty-line-toggler";
  toggleGlobalLineNumbersButtonId = "global-linenr-toggler";
  toggleLocalLineNumbersButtonId = "local-linenr-toggler";
  generateCitationUrlButtonId = "generate-citation-url";

  // ===========================================================================
  // BUTTON & CONTROL LABELS
  // ===========================================================================
  addColumnLabel = "Add Column";
  toggleScrollLabel = "Toggle Global Scroll";
  toggleEmptyLinesLabel = "Toggle Empty Lines";
  toggleGlobalLineNumbersLabel = "Toggle Global Line Numbers";
  toggleLocalLineNumbersLabel = "Toggle Local Line Numbers";
  generateCitationUrlLabel = "Generate Citation URL";
  removeColumnLabel = "Remove Column";

  // ===========================================================================
  // CSS CLASS NAMES
  // ===========================================================================
  globalScrollClass = "global-scroll-vertical";
  individualScrollClass = "individual-scroll-vertical";
  witnessLineClass = "witness-line";
  omittedLineClass = "om";
  hiddenElementClass = "hidden";
  globalLineNumberClass = "linenr-global";
  localLineNumberClass = "linenr_own";
  highlightClass = "highlight";
  neighborHighlightClass = "neigh";
  textContentClass = "text-content";
  witnessColumnClass = "witness";
  witnessDropdownContainerClass = "controls-container";
  removeColumnButtonClass = "remove-column-button";
  witnessSelectClass = "text-select";
  controlsContainerTogglerClass = "witness_view_controls_toggle";
  controlsContainerClass = "witness_view_controls";

  // ===========================================================================
  // ARIA LABELS
  // ===========================================================================
  generateCitationUrlAriaLabel = "Generate a citation URL";
  addColumnAriaLabel = "Add a new column";
  toggleScrollAriaLabel = "Toggle global scrolling behavior";
  toggleEmptyLinesAriaLabel = "Toggle visibility of empty lines";
  toggleGlobalLineNumbersAriaLabel = "Toggle visibility of global line numbers";
  toggleLocalLineNumbersAriaLabel = "Toggle visibility of local line numbers";

    // ===========================================================================
  // ARIA & ACCESSIBILITY ATTRIBUTES
  // ===========================================================================
  controlsContainerAriaExpandedAttr = "aria-expanded";
  controlsContainerAriaControlsAttr = "aria-controls";
  controlsContainerAriaControlsValue = "controls-container";
  controlsContainerOpenClass = "open";
  escapeKey = "Escape";
}

export default ColumnViewerConfig;