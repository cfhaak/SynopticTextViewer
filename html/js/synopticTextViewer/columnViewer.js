import ColumnViewerConfig from "./column_viewer_config.js";
import EditionState from "./editionState.js";
import EditionManager from "./editionManager.js";

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
    const response = await fetch(config.snippetLogPath);
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
  const controls = document.querySelector(`.${config.class_of_controls_container}`);
  if (!controls) {
    console.error(`Controls container not found`);
    return null;
  }
  const container = document.createElement("div");
  container.id = containerId
  controls.appendChild(container);
  console.log("created  button container with id " + containerId)
  return container;
};

function getButtonContainer(containerId, config) {
  const existingContainer = document.getElementById(containerId);
  return existingContainer ? existingContainer : createButtonContainer(containerId, config);
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
    config.generateCitationUrlId,
    config.label_generate_citation_link,
    () => manager.updateUrlWithState(),
    "Generate a citation URL",
    config
  );
  addButton(
    config.columnAdderId,
    config.label_column_adder,
    () => manager.addNewColumn(),
    "Add a new column",
    config
  );
  // addButton(
  //   config.scrollTogglerId,
  //   config.label_scroll_toggler,
  //   () => manager.toggleScrollingBehaviour(),
  //   "Toggle global scrolling behavior",
  //   config
  // );
  addButton(
    config.emptyLineTogglerId,
    config.label_empty_line_toggler,
    () => manager.toggleEmptyLinesVisibility(),
    "Toggle visibility of empty lines",
    config
  );
  addButton(
    config.globalLinenrTogglerId,
    config.label_global_linenr_toggler,
    () => manager.toggleGlobalLinecounterVisibility(),
    "Toggle visibility of global line numbers",
    config
  );
  addButton(
    config.localLinenrTogglerId,
    config.label_local_linenr_toggler,
    () => manager.toggleLocalLinecounterVisibility(),
    "Toggle visibility of local line numbers",
    config
  );

  const toggle = document.querySelector(
    `.${config.class_of_controls_container_toggler}`
  );
  const controls = document.querySelector(
    `.${config.class_of_controls_container}`
  );
  setupControlsMenuEvents(toggle, controls);
}
// --- MAIN ---

document.addEventListener("DOMContentLoaded", async () => {
  const config = await loadConfig();
  const witness_metadata = await loadSnippetMetadata(config);
  const sortedWitnessIds = sortWitnessIdsBySorting(witness_metadata);
  const state = new EditionState(witness_metadata, sortedWitnessIds);
  const manager = new EditionManager(state, config);
  await manager.initColumns();
  createControls(config, manager);
});
