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
  button.type = "button";
  button.setAttribute("role", "menuitem");
  button.tabIndex = -1;
  if (ariaLabel) {
    button.setAttribute(config.ariaLabelAttr, ariaLabel);
  }
  container.appendChild(button);
}
function setupControlsMenuEvents(toggle, controls, config, menuItems) {
  const mobileMaxWidthPx = config.mobileMaxWidthPx || 800;
  const isInlineControlsMode = () =>
    window.matchMedia(`(min-width: ${mobileMaxWidthPx + 1}px)`).matches;

  toggle.setAttribute("aria-haspopup", "true");
  toggle.setAttribute(config.controlsContainerAriaExpandedAttr, "false");
  toggle.setAttribute(
    config.controlsContainerAriaControlsAttr,
    config.controlsContainerAriaControlsValue
  );

  let currentIndex = 0;

  const updateRovingTabindex = (index) => {
    if (!menuItems || menuItems.length === 0) return;
    const itemCount = menuItems.length;
    const normalized = ((index % itemCount) + itemCount) % itemCount;
    menuItems.forEach((item, i) => {
      item.tabIndex = i === normalized ? 0 : -1;
    });
    currentIndex = normalized;
    menuItems[normalized].focus();
  };

  const openMenu = () => {
    if (!controls || isInlineControlsMode()) return;
    controls.classList.add(config.controlsContainerOpenClass);
    toggle.setAttribute(config.controlsContainerAriaExpandedAttr, "true");
    if (menuItems && menuItems.length > 0) {
      updateRovingTabindex(currentIndex || 0);
    }
  };

  const closeMenu = (returnFocus = true) => {
    if (!controls || isInlineControlsMode()) return;
    if (!controls.classList.contains(config.controlsContainerOpenClass)) {
      return;
    }
    controls.classList.remove(config.controlsContainerOpenClass);
    toggle.setAttribute(config.controlsContainerAriaExpandedAttr, "false");
    if (returnFocus) {
      toggle.focus();
    }
  };

  const applyControlsKeyboardMode = () => {
    const inlineMode = isInlineControlsMode();
    if (inlineMode) {
      toggle.setAttribute("aria-hidden", "true");
      toggle.tabIndex = -1;
      if (menuItems && menuItems.length > 0) {
        menuItems.forEach((item) => {
          item.tabIndex = 0;
        });
      }
      controls.classList.remove(config.controlsContainerOpenClass);
      toggle.setAttribute(config.controlsContainerAriaExpandedAttr, "false");
    } else {
      toggle.removeAttribute("aria-hidden");
      toggle.tabIndex = 0;
      if (controls.classList.contains(config.controlsContainerOpenClass)) {
        updateRovingTabindex(currentIndex || 0);
      } else if (menuItems && menuItems.length > 0) {
        menuItems.forEach((item) => {
          item.tabIndex = -1;
        });
      }
    }
  };

  toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    if (controls.classList.contains(config.controlsContainerOpenClass)) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  document.addEventListener("click", (e) => {
    if (isInlineControlsMode()) return;
    if (!controls.contains(e.target) && !toggle.contains(e.target)) {
      closeMenu(false);
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" || e.key === "Esc") {
      if (controls.classList.contains(config.controlsContainerOpenClass)) {
        e.preventDefault();
        e.stopPropagation();
        closeMenu(true);
      }
    }
  });

  if (controls && menuItems && menuItems.length > 0) {
    controls.addEventListener("keydown", (e) => {
      const inlineMode = isInlineControlsMode();
      if (
        !inlineMode &&
        !controls.classList.contains(config.controlsContainerOpenClass)
      ) {
        return;
      }
      let handled = false;
      if (e.key === "ArrowDown" || e.key === "Down") {
        updateRovingTabindex(currentIndex + 1);
        handled = true;
      } else if (e.key === "ArrowUp" || e.key === "Up") {
        updateRovingTabindex(currentIndex - 1);
        handled = true;
      } else if (e.key === "Home") {
        updateRovingTabindex(0);
        handled = true;
      } else if (e.key === "End") {
        updateRovingTabindex(menuItems.length - 1);
        handled = true;
      } else if (e.key === "Tab") {
        // Leaving the menu with Tab should also close it
        if (!inlineMode) {
          closeMenu(false);
        }
      }
      if (handled) {
        e.preventDefault();
        e.stopPropagation();
      }
    });

    menuItems.forEach((item, index) => {
      item.addEventListener("focus", () => {
        if (isInlineControlsMode()) {
          menuItems.forEach((el) => {
            el.tabIndex = 0;
          });
          return;
        }
        currentIndex = index;
        menuItems.forEach((el, i) => {
          el.tabIndex = i === index ? 0 : -1;
        });
      });
    });
  }

  applyControlsKeyboardMode();
  window.addEventListener("resize", applyControlsKeyboardMode);
}

function createControls(config, manager) {
  addButton(
    config.generateCitationUrlButtonId,
    config.generateCitationUrlLabel,
    () => manager.copyUrlToClipboardAndNotify(),
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
  const menuItems = controls ? controls.querySelectorAll("button") : [];
  setupControlsMenuEvents(toggle, controls, config, menuItems);
}

// --- MAIN ---

document.addEventListener("DOMContentLoaded", async () => {
  const config = await loadConfig();
  const witness_metadata = await loadSnippetMetadata(config);

  if (!witness_metadata || Object.keys(witness_metadata).length === 0) {
    // failed to load the witness metadata
    const errorDiv = document.createElement("div");
    errorDiv.textContent = "Error: Could not load edition metadata. Please check your connection or try again later. If this issue persists, please contact the responsible team.";
    errorDiv.className = "text-red-600 font-bold m-4";
    document.body.prepend(errorDiv);
    const retryBtn = document.createElement("button");
    retryBtn.textContent = "Retry";
    retryBtn.onclick = () => window.location.reload();
    retryBtn.className = "ml-4 px-3 py-1 border border-gray-400 rounded text-sm hover:bg-gray-100";
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
  manager.updateMobileUiControls();
  window.addEventListener("resize", () => manager.updateMobileUiControls());
});
