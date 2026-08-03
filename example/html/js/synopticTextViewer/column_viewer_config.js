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
  mobileTabBarClass = "synTexView-mobile-tabs";
  mobileTabClass = "synTexView-mobile-tab";
  mobileTabActiveClass = "synTexView-mobile-tab-active";
  mobileActiveColumnClass = "synTexView-mobile-active";

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
