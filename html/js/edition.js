import ColumnViewerConfig from "./column_viewer_config.js";
import EditionState from "./editionState.js";
import EditionManager from "./EditionManager.js"

async function loadConfig() {
  return new ColumnViewerConfig();
}

function sortWitnessIdsBySorting(metadata) {
  return Object.entries(metadata)
    .sort((a, b) => a[1].sorting.localeCompare(b[1].sorting))
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

function addButton(containerId, text, onClick, ariaLabel) {
  const container = document.getElementById(containerId);
  if (container) {
    const button = document.createElement("button");
    button.textContent = text;
    button.onclick = onClick;
    if (ariaLabel) {
      button.setAttribute("aria-label", ariaLabel);
    }
    container.appendChild(button);
  }
}

function createControls(config, manager) {
  addButton(
    config.columnAdderId,
    config.label_column_adder,
    () => manager.addNewColumn(),
    "Add a new column"
  );
  addButton(
    config.scrollTogglerId,
    config.label_scroll_toggler,
    () => manager.toggleScrollingBehaviour(),
    "Toggle global scrolling behavior"
  );
  addButton(
    config.emptyLineTogglerId,
    config.label_empty_line_toggler,
    () => manager.toggleEmptyLinesVisibility(),
    "Toggle visibility of empty lines"
  );
  addButton(
    config.globalLinenrTogglerId,
    config.label_global_linenr_toggler,
    () => manager.toggleGlobalLinecounterVisibility(),
    "Toggle visibility of global line numbers"
  );
  addButton(
    config.localLinenrTogglerId,
    config.label_local_linenr_toggler,
    () => manager.toggleLocalLinecounterVisibility(),
    "Toggle visibility of local line numbers"
  );
  addButton(
    config.saveStateToUrlId,
    config.generateCitationUrlId,
    () => manager.updateUrlWithState(),
    "Save the current state to the URL"
  );

  const toggle = document.querySelector(
    `.${config.class_of_controls_container_toggler}`
  );
  const controls = document.querySelector(
    `.${config.class_of_controls_container}`
  );
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
