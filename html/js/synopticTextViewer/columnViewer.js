import ColumnViewerConfig from "./column_viewer_config.js";
import EditionState from "./editionState.js";
import EditionManager from "./editionManager.js";
import StateFromUrl from "./stateFromUrl.js";

async function loadConfig() {
  return new ColumnViewerConfig();
}

function sortStringsOrInts(a, b) {
  if (typeof a === "number" && typeof b === "number") {
    // Numerical comparison
    return a - b;
  } else if (typeof a === "string" && typeof b === "string") {
    // String comparison
    return a.localeCompare(b);
  } else {
    throw new Error("Inconsistent types for sorting attribute");
  }
}

function sortWitnessIdsBySorting(metadata) {
  return Object.entries(metadata)
    .sort((a, b) => sortStringsOrInts(a[1].sorting, b[1].sorting))
    .map(([key]) => key);
}

async function loadSnippetMetadata(config) {
  try {
    const response = await fetch(config.snippetMetadataPath);
    if (!response.ok) {
      console.error(`Error loading snippet metadata: ${response.statusText}`);
      return {};
    } else {
      return response.json();
    }
  } catch (error) {
    console.error(`Error loading snippet metadata: ${error.message}`);
    return {};
  }
}

function createButtonContainer(containerId, config) {
  const controls = document.querySelector(
    `.${config.controlsContainerClass}`
  );
  if (!controls) {
    console.error(`Controls container not found`);
    return null;
  }
  const container = document.createElement("div");
  container.id = containerId;
  controls.appendChild(container);
  console.log("created  button container with id " + containerId);
  return container;
}

function getButtonContainer(containerId, config) {
  const existingContainer = document.getElementById(containerId);
  return existingContainer
    ? existingContainer
    : createButtonContainer(containerId, config);
}

function addButton(containerId, text, onClick, ariaLabel, config) {
  const container = getButtonContainer(containerId, config);
  if (!container) {
    console.error(`Button container not found: ${containerId}`);
    return;
  }
  const button = document.createElement("button");
  button.textContent = text;
  button.onclick = onClick;
  if (ariaLabel) {
    button.setAttribute("aria-label", ariaLabel);
  }
  container.appendChild(button);
}

function setupControlsMenuEvents(toggle, controls) {
  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("aria-controls", "controls-container");

  toggle.addEventListener("click", (e) => {
    const isOpen = controls.classList.toggle("open");
    toggle.setAttribute("aria-expanded", isOpen.toString());
    e.stopPropagation();
  });

  document.addEventListener("click", (e) => {
    if (!controls.contains(e.target) && !toggle.contains(e.target)) {
      controls.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && controls.classList.contains("open")) {
      controls.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.focus();
    }
  });
}

function createControls(config, manager) {
  addButton(
    config.generateCitationUrlButtonId,
    config.generateCitationUrlLabel,
    () => manager.updateUrlWithState(),
    config.generateCitationUrlAriaLabel,
    config
  );
  addButton(
    config.addColumnButtonId,
    config.addColumnLabel,
    () => manager.addNewColumn(),
    config.addColumnAriaLabel,
    config
  );
  // addButton(
  //   config.toggleScrollButtonId,
  //   config.toggleScrollLabel,
  //   () => manager.toggleScrollingBehaviour(),
  //   config.toggleScrollAriaLabel,
  //   config
  // );
  addButton(
    config.toggleEmptyLinesButtonId,
    config.toggleEmptyLinesLabel,
    () => manager.toggleEmptyLinesVisibility(),
    config.toggleEmptyLinesAriaLabel,
    config
  );
  addButton(
    config.toggleGlobalLineNumbersButtonId,
    config.toggleGlobalLineNumbersLabel,
    () => manager.toggleGlobalLinecounterVisibility(),
    config.toggleGlobalLineNumbersAriaLabel,
    config
  );
  addButton(
    config.toggleLocalLineNumbersButtonId,
    config.toggleLocalLineNumbersLabel,
    () => manager.toggleLocalLinecounterVisibility(),
    config.toggleLocalLineNumbersAriaLabel,
    config
  );

  const toggle = document.querySelector(
    `.${config.controlsContainerTogglerClass}`
  );
  const controls = document.querySelector(
    `.${config.controlsContainerClass}`
  );
  setupControlsMenuEvents(toggle, controls);
}

// --- MAIN ---

document.addEventListener("DOMContentLoaded", async () => {
  const config = await loadConfig();
  const witness_metadata = await loadSnippetMetadata(config);

  if (!witness_metadata || Object.keys(witness_metadata).length === 0) {
    // failed to load the witness metadata
    const errorDiv = document.createElement("div");
    errorDiv.textContent = "Error: Could not load edition metadata. Please check your connection or try again later. If this issue persists, please contact the responsible team.";
    errorDiv.style.color = "red";
    errorDiv.style.fontWeight = "bold";
    errorDiv.style.margin = "1rem";
    document.body.prepend(errorDiv);
    const retryBtn = document.createElement("button");
    retryBtn.textContent = "Retry";
    retryBtn.onclick = () => window.location.reload();
    retryBtn.style.marginLeft = "1rem";
    errorDiv.appendChild(retryBtn);
    return; // Stop further initialization
  }

  const sortedWitnessIds = sortWitnessIdsBySorting(witness_metadata);
  const stateFromUrl = new StateFromUrl();
  const state = new EditionState(
    witness_metadata,
    sortedWitnessIds,
    stateFromUrl
  );
  const manager = new EditionManager(state, config);
  await manager.initColumns(stateFromUrl.witnessIds);
  createControls(config, manager);
});
