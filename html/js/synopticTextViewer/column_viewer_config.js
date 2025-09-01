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
  addColumnLabel = "Add column";
  toggleScrollLabel = "Toggle global scroll";
  toggleEmptyLinesLabel = "Toggle empty lines";
  toggleGlobalLineNumbersLabel = "Toggle global line numbers";
  toggleLocalLineNumbersLabel = "Toggle local line numbers";
  generateCitationUrlLabel = "Copy citation URL to clipboard";
  removeColumnLabel = "Remove column";
  copyUrlNotificationLabel = "URL copied to clipboard!";

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
  copyUrlNotificationClass = "url-copy-notification";

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
