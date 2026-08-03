// this class manages the rendering and the interaction with user/dom
class EditionManager {
  constructor(state, config) {
    this.maxReloadAttempts = 3;
    this.state = state;
    this.config = config;
    this.ariaElement = this.makeAriaElement();
    this.witnessContainer = document.getElementById(
      this.config.witnessColumnsContainerId
    );
    this.columnElements = [];
    this._boundRemoveHighlights = null;
    this.initListeners();
  }

  isMobileView() {
    const mobileMaxWidthPx = this.config.mobileMaxWidthPx || 800;
    return window.matchMedia(`(max-width: ${mobileMaxWidthPx}px)`).matches;
  }

  updateMobileUiControls() {
    const addButtonContainer = document.getElementById(this.config.addColumnButtonId);
    if (!addButtonContainer) return;
    const addButton = addButtonContainer.querySelector("button");
    if (!addButton) return;
    const isMobile = this.isMobileView();
    addButton.disabled = isMobile;
    addButton.style.display = isMobile ? "none" : "";
  }

  getReloadAttemptStorageKey() {
    return `synTexViewReloadAttempts:${window.location.pathname}${window.location.search}`;
  }

  requestControlledReload() {
    const storageKey = this.getReloadAttemptStorageKey();
    const currentAttempts = Number(sessionStorage.getItem(storageKey) || "0");
    if (currentAttempts >= this.maxReloadAttempts) {
      console.warn("Default witness content is still missing after reload attempts.");
      return false;
    }
    sessionStorage.setItem(storageKey, String(currentAttempts + 1));
    window.location.reload();
    return true;
  }

  updateUrlWithState() {
    // this writes the current state to the URL
    // 0. empty lines visibility
    // 1. global line numbers visibility
    // 2. local line numbers visibility
    // 3. witnessIds in order of appearance
    // 4. currentLineId (if any line was double-clicked)
    const params = new URLSearchParams();

    // 0. empty lines visibility
    params.set("emptyLines", this.state.displayEmptyLines ? "yes" : "no");

    // 1. global line numbers visibility
    params.set("globalLinenr", this.state.displayLinenrGlobal ? "yes" : "no");

    // 2. local line numbers visibility
    params.set("localLinenr", this.state.displayLinenrLocal ? "yes" : "no");

    // 3. witnessIds in order of appearance
    const loadedWitnessIds = this.state
      .getAllColumns()
      .map((col) => col.witnessId);
    params.set("witnessIds", loadedWitnessIds.join(","));

    // 4. currentLineId (if any line was double-clicked)
    const selectedElement = this.getCurrentSelectedElement();
    const currentLineId = this.state.lastDoubleClickedElementId
      ? this.state.lastDoubleClickedElementId
      : selectedElement
      ? selectedElement.getAttribute("id")
      : null;
    if (currentLineId) {
      params.set("currentLine", currentLineId);
    }
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, "", newUrl);
  }

  getOneIndexByColumnId(columnId) {
    return this.state.getIndexByColumnId(columnId) + 1;
  }

  makeAriaElement() {
    const liveRegion = document.createElement("div");
    liveRegion.id = this.config.ariaLiveRegionId;
    liveRegion.setAttribute("aria-live", this.config.ariaLiveRegionPolite);
    liveRegion.style.position = "absolute";
    liveRegion.style.left = "-9999px"; // Hide it visually but keep it accessible
    document.body.appendChild(liveRegion);
    return liveRegion;
  }

  sendAriaMessage(message) {
    if (!this.ariaElement){
      console.error("Aria element not found");
      return;
    }
    this.ariaElement.textContent = message;
    // console.log(`Aria message sent: ${message}`);
  }

  reloadFromState(newState) {
    this.state = newState;
    this.witnessContainer.innerHTML = "";
    this.renderAllColumns();
    if (this.state.lastDoubleClickedElementId) {
      this.syncVerticalScrolling("", this.state.lastDoubleClickedElementId);
    }
  }

  enterTargetsTextContent(event) {
    return (
      event.target.matches(`.${this.config.witnessLineClass}`) &&
      event.key === "Enter"
    );
  }

  eventTargetsWitnessContent(event) {
    return !!event.target.closest(`.${this.config.textContentClass}`);
  }

  getNthSibling(textContentParent, currentElement, n) {
    const siblings = Array.from(
      textContentParent.querySelectorAll(`.${this.config.witnessLineClass}`)
    ).filter((el) => this.elementIsVisible(el));
    const rawIndex = Array.prototype.indexOf.call(siblings, currentElement) + n;
    const newIndex = Math.max(0, Math.min(rawIndex, siblings.length - 1));
    const sibling = siblings ? siblings[newIndex] : null;
    return sibling;
  }

  arrowDownAction(event, step = 1) {
    // Prevent default scrolling behavior
    event.preventDefault();
    let currentElement = this.getCurrentSelectedElement();
    const activeTextContent = this.getTextContentParent(event);
    if (!currentElement) {
      const firstVisibleChild =
        this.getFirstVisibleChildInContainer(activeTextContent);
      this.updateFocusState(firstVisibleChild, activeTextContent, false);
    } else {
      if (activeTextContent != this.getCurrentSelectedWitness()) {
        const firstVisibleChild =
          this.getFirstVisibleChildInContainer(activeTextContent);
        this.updateFocusState(firstVisibleChild, activeTextContent, false);
      } else {
        // Move focus to the Nth next visible sibling
        const nextElement = this.getNthSibling(
          activeTextContent,
          this.getCurrentSelectedElement(),
          step
        );
        this.updateFocusState(nextElement, activeTextContent, false, "bottom");
      }
    }
  }

  arrowUpAction(event, step = 1) {
    event.preventDefault();
    let currentElement = this.getCurrentSelectedElement();
    const activeTextContent = this.getTextContentParent(event);
    if (!currentElement) {
      const firstVisibleChild =
        this.getFirstVisibleChildInContainer(activeTextContent);
      this.updateFocusState(firstVisibleChild, activeTextContent, false);
    } else {
      if (activeTextContent != this.getCurrentSelectedWitness()) {
        const firstVisibleChild =
          this.getFirstVisibleChildInContainer(activeTextContent);
        this.updateFocusState(firstVisibleChild, activeTextContent, false);
      } else {
        // Move focus to the Nth previous visible sibling
        const prevElement = this.getNthSibling(
          activeTextContent,
          this.getCurrentSelectedElement(),
          -step
        );
        this.updateFocusState(prevElement, activeTextContent, false, "top");
      }
    }
  }

  horizontalActionTrigger(event) {
    const isHorizontalKey =
      event.key === "ArrowRight" || event.key === "ArrowLeft";
    const inTextContent = !!event.target.closest(
      `.${this.config.textContentClass}`
    );
    return isHorizontalKey && inTextContent;
  }

  getDefaultElement() {
    const currentWitness = this.state.getCurrentSelectedWitness();
    if (currentWitness) {
      const element = currentWitness.querySelector(
        `.${this.config.witnessLineClass}`
      );
      this.state.setCurrentSelectedElement(element);
      return element;
    } else {
      const defaultWitness = this.getDefaultWitness();
      if (defaultWitness) {
        const element = defaultWitness.querySelector(
          `.${this.config.witnessLineClass}`
        );
        this.state.setCurrentSelectedElement(element);
        return element;
      }
    }
    return null;
  }

  getDefaultWitness() {
    if (this.columnElements && this.columnElements.length > 0) {
      const witness = this.columnElements[0].querySelector(
        `.${this.config.textContentClass}`
      );
      if (witness) {
        sessionStorage.removeItem(this.getReloadAttemptStorageKey());
        this.state.setCurrentSelectedWitness(witness);
        return witness;
      }
    }
    console.warn("Can't find default witness content. Reloading page.");
    this.requestControlledReload();
    return null;
  }

  getCurrentSelectedElement() {
    const element =
      this.state.getCurrentSelectedElement() ||
      this.getDefaultElement() ||
      null;
    return element;
  }

  getCurrentSelectedWitness() {
    const witness =
      this.state.getCurrentSelectedWitness() ||
      this.getDefaultWitness() ||
      null;
    return witness;
  }

  getVisibleLineByIdOrFirst(container, lineId) {
    if (!container) return null;
    let line = lineId ? container.querySelector(`#${lineId}`) : null;
    if (line && this.elementIsVisible(line)) {
      return line;
    }
    // fallback: first visible child in container
    return this.getFirstVisibleChildInContainer(container);
  }

  findClosestLineByScreenTop(container, referenceTop) {
    let closestLine = null;
    let minDiff = Infinity;
    for (const child of container.children) {
      if (!this.elementIsVisible(child)) continue;
      const childTop = child.getBoundingClientRect().top;
      const diff = Math.abs(childTop - referenceTop);
      if (diff < minDiff) {
        minDiff = diff;
        closestLine = child;
      }
    }
    return closestLine;
  }

  getElementScreenTop(element) {
    return element ? element.getBoundingClientRect().top : 0;
  }

  arrowHorizontalAction(event) {
    event.preventDefault();
    const textContentColumn = event.target.closest(
      `.${this.config.witnessColumnClass}`
    );
    const targetColumn =
      event.key === "ArrowRight"
        ? textContentColumn.nextElementSibling || null
        : textContentColumn.previousElementSibling;
    if (!targetColumn) return null;

    const textContentParent = targetColumn.querySelector(
      `.${this.config.textContentClass}`
    );
    if (!textContentParent) return null;
    // maybe make this behavior unconditional
    if (!this.state.displayEmptyLines) {
      // if empty lines are invisible, try to focus the line closest to the current line
      const currentElement = this.getCurrentSelectedElement();
      const referenceTop = this.getElementScreenTop(currentElement);

      const closestLine = this.findClosestLineByScreenTop(
        textContentParent,
        referenceTop
      );

      if (closestLine) {
        this.updateFocusState(closestLine, textContentParent, false, "none");
        this.scrollColumnIntoView(targetColumn);
      }
    } else {
      // if empty lines are visible, try to focus the line with the same id as the current line
      const currentLineId = this.getCurrentSelectedElement()
        ? this.getCurrentSelectedElement().getAttribute("id")
        : null;
      const targetLine = this.getVisibleLineByIdOrFirst(
        textContentParent,
        currentLineId
      );
      this.syncVerticalScrolling(targetLine);
      this.scrollColumnIntoView(targetColumn);
    }
  }

  initKeyDownListeners() {
    this.witnessContainer.addEventListener("keydown", (event) => {
      if (this.enterTargetsTextContent(event)) {
        this.syncVerticalScrolling(event.target);
      } else if (this.eventTargetsWitnessContent(event)) {
        if (event.key === "ArrowDown") {
          this.arrowDownAction(event, 1);
        } else if (event.key === "ArrowUp") {
          this.arrowUpAction(event, 1);
        } else if (event.key === "PageDown") {
          this.arrowDownAction(event, 20);
        } else if (event.key === "PageUp") {
          this.arrowUpAction(event, 20);
        } else if (this.horizontalActionTrigger(event)) {
          this.arrowHorizontalAction(event);
        }
      }
    });
  }

  initClickListeners() {
    // doubleclick triggers scroll
    this.witnessContainer.addEventListener("dblclick", (event) => {
      const line = event.target.closest(`.${this.config.witnessLineClass}`);
      this.syncVerticalScrolling(line);
    });
    // click closes column
    this.witnessContainer.addEventListener("click", (event) => {
      if (event.target.matches(`.${this.config.removeColumnButtonClass}`)) {
        const columnId = event.target.closest(
          `.${this.config.witnessColumnClass}`
        ).id;
        this.removeColumn(columnId);
        this.updateUrlWithState();
      } else {
        const line = event.target.closest(`.${this.config.witnessLineClass}`);
        if (!line) return;
        if (this.isMobileView()) {
          // On mobile, a single tap should act like desktop double-click.
          this.syncVerticalScrolling(line);
          return;
        }
        const textContentParent = this.getTextContentParent(line);
        this.updateFocusState(line, textContentParent);
      }
    });
  }

  initDropDownListener() {
    this.witnessContainer.addEventListener("change", (event) => {
      if (event.target.matches(`.${this.config.witnessSelectClass}`)) {
        const columnId = event.target.getAttribute("data-column-id");
        this.updateColumnWitness(columnId, event.target.value);
        this.updateUrlWithState();
      }
    });
  }

  initListeners() {
    this.initDropDownListener();
    this.initClickListeners();
    this.initKeyDownListeners();
  }

  async fetchWithRetry(url, options = {}, retries = 3, timeoutMs = 15000) {
    for (let attempt = 0; attempt <= retries; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (!response.ok) {
          // HTTP error – retry unless this was the last attempt
          if (attempt === retries) return null;
        } else {
          return response;
        }
      } catch (error) {
        clearTimeout(timeoutId);
        // Network/timeout error – retry unless this was the last attempt
        if (attempt === retries) return null;
      }
    }
    return null;
  }

  async getSnippet(witnessId) {
    if (this.state.snippetsByLabels[witnessId]) {
      return this.state.snippetsByLabels[witnessId].cloneNode(true);
    }
    try {
      const filepath = this.state.witness_metadata[witnessId].filepath;
      const response = await this.fetchWithRetry(filepath);
      if (!response) {
        const errorDiv = document.createElement("div");
        errorDiv.textContent = `Resource '${filepath}' couldn't be loaded after multiple attempts.`;
        return errorDiv;
      }
      const htmlText = await response.text();
      const snippetBody = new DOMParser().parseFromString(
        htmlText,
        "text/html"
      ).body;
      this.state.snippetsByLabels[witnessId] = snippetBody;
      return snippetBody.cloneNode(true);
    } catch (error) {
      const dummyDiv = document.createElement("div");
      const errorSpan = document.createElement("span");
      errorSpan.textContent = `Resource '${this.state.witness_metadata[witnessId].filepath}' couldn't be loaded. ${error.message}`;
      dummyDiv.appendChild(errorSpan);
      return dummyDiv;
    }
  }

  generateDropdown(columnId, currentWitnessId) {
    const dropdown = document.createElement("select");
    dropdown.className = this.config.witnessSelectClass;
    dropdown.setAttribute("data-column-id", columnId);
    dropdown.setAttribute(
      this.config.ariaLabelAttr,
      this.config.ariaSelectWitnessLabel(columnId)
    );
    dropdown.id = `dropdown-${columnId}`;
    this.state.sortedWitnessIds.forEach((witnessId) => {
      const option = document.createElement("option");
      option.value = witnessId;
      option.textContent = this.state.witness_metadata[witnessId].title;
      if (witnessId === currentWitnessId) {
        option.selected = true;
      }
      dropdown.appendChild(option);
    });
    return dropdown;
  }

  createTextContentDiv(witnessId) {
    const textContentDiv = document.createElement("div");
    textContentDiv.className = this.config.textContentClass;
    textContentDiv.setAttribute("role", "document");
    textContentDiv.setAttribute("tabindex", "0");
    textContentDiv.setAttribute(
      this.config.ariaLabelAttr,
      this.config.ariaTextContentLabel(
        this.state.witness_metadata[witnessId].title
      )
    );
    textContentDiv.textContent =
      this.state.witness_metadata[witnessId].title || "Error while loading.";
    return textContentDiv;
  }

  createControlsContainer(columnId, witnessId) {
    const controlsContainer = document.createElement("div");
    controlsContainer.className = this.config.witnessDropdownContainerClass;
    controlsContainer.appendChild(this.generateDropdown(columnId, witnessId));
    const removeColButton = document.createElement("button");
    controlsContainer.appendChild(removeColButton);
    removeColButton.className = this.config.removeColumnButtonClass;
    removeColButton.title = this.config.removeColumnLabel;
    removeColButton.setAttribute(
      this.config.ariaLabelAttr,
      this.config.ariaRemoveColumnLabel(
        this.state.witness_metadata[witnessId].title
      )
    );
    removeColButton.innerHTML = "&times;";
    return controlsContainer;
  }

  createColumnHTML(columnId, witnessId) {
    const columnDiv = document.createElement("div");
    columnDiv.id = columnId;
    columnDiv.className = this.config.witnessColumnClass;
    columnDiv.setAttribute("role", "region");
    columnDiv.setAttribute(
      this.config.ariaLabelAttr,
      this.config.ariaColumnLabel(this.state.witness_metadata[witnessId].title)
    );
    columnDiv.appendChild(this.createControlsContainer(columnId, witnessId));
    columnDiv.appendChild(this.createTextContentDiv(witnessId));
    return columnDiv;
  }

  async renderAllColumns() {
    this.witnessContainer.innerHTML = "";
    const docFragment = document.createDocumentFragment();
    for (const col of this.state.getAllColumns()) {
      const columnHTML = this.createColumnHTML(col.id, col.witnessId);
      docFragment.appendChild(columnHTML);
    }
    this.witnessContainer.appendChild(docFragment);
    const renderPromises = this.state
      .getAllColumns()
      .map((col) => this.renderColumn(col.id));
    await Promise.all(renderPromises);
    this.applyVisibilitySettings();
  }

  async renderColumn(columnId) {
    const col = this.state.getColumn(columnId);
    if (!col) return;
    const snippetBody = await this.getSnippet(col.witnessId);
    this.updateColumnContent(col.id, snippetBody);
    this.applyVisibilitySettings(columnId);
  }

  addColumnContainer(witnessId) {
    const columnId = this.state.addColumn(witnessId);
    const columnElement = this.createColumnHTML(columnId, witnessId);
    this.witnessContainer.appendChild(columnElement);
    this.columnElements.push(columnElement);
    return columnId;
  }

  async addColumn(witnessId) {
    const columnId = this.addColumnContainer(witnessId);
    await this.renderColumn(columnId);
    this.sendAriaMessage(
      `Column ${this.getOneIndexByColumnId(columnId)} for ${
        this.state.witness_metadata[witnessId].title
      } added. ${this.state.columnCount} columns in total.`
    );
  }

  async removeColumn(columnId) {
    const oldColumnId = this.getOneIndexByColumnId(columnId);
    this.state.removeColumn(columnId);
    const colElem = document.getElementById(columnId);
    this.columnElements.pop(colElem);
    if (colElem) colElem.remove();
    this.sendAriaMessage(
      `Column ${oldColumnId} removed. ${this.state.columnCount} columns remaining.`
    );
  }

  async updateColumnWitness(columnId, witnessId) {
    const columnElementBeforeUpdate = document.getElementById(columnId);
    const textContentBeforeUpdate = columnElementBeforeUpdate
      ? columnElementBeforeUpdate.querySelector(`.${this.config.textContentClass}`)
      : null;
    const selectedElement = this.state.getCurrentSelectedElement();
    const selectedElementId = selectedElement
      ? selectedElement.getAttribute("id")
      : null;
    const selectedWitness = this.state.getCurrentSelectedWitness();
    const shouldRestoreFocusInUpdatedColumn =
      !!selectedElementId &&
      !!textContentBeforeUpdate &&
      selectedWitness === textContentBeforeUpdate;

    this.state.updateColumnWitness(columnId, witnessId);
    await this.renderColumn(columnId);

    if (shouldRestoreFocusInUpdatedColumn) {
      const columnElementAfterUpdate = document.getElementById(columnId);
      const textContentAfterUpdate = columnElementAfterUpdate
        ? columnElementAfterUpdate.querySelector(
            `.${this.config.textContentClass}`
          )
        : null;
      if (textContentAfterUpdate) {
        const focusTarget = this.getVisibleLineByIdOrFirst(
          textContentAfterUpdate,
          selectedElementId
        );
        this.updateFocusState(focusTarget, textContentAfterUpdate, false);
      }
    }

    if (
      this.isMobileView() &&
      this.state.lastDoubleClickedElementId
    ) {
      this.addNewHighlights(this.state.lastDoubleClickedElementId);
    }
    this.sendAriaMessage(
      `Column ${this.getOneIndexByColumnId(columnId)} for ${
        this.state.witness_metadata[witnessId].title
      } updated.`
    );
  }

  async addNewColumn() {
    if (this.isMobileView()) {
      this.sendAriaMessage("Adding columns is disabled on mobile view.");
      return;
    }
    const witnessId =
      this.state.sortedWitnessIds[this.state.columnCount] ||
      this.state.sortedWitnessIds[0];
    await this.addColumn(witnessId);
    this.updateUrlWithState();
  }

  toggleEmptyLinesVisibility() {
    this.state.displayEmptyLines = !this.state.displayEmptyLines;
    this.applyVisibilitySettings();
    this.sendAriaMessage(
      `Empty lines are now ${
        this.state.displayEmptyLines ? "visible" : "hidden"
      }.`
    );
    this.updateUrlWithState();
  }

  toggleGlobalLinecounterVisibility() {
    this.state.displayLinenrGlobal = !this.state.displayLinenrGlobal;
    this.applyVisibilitySettings();
    this.sendAriaMessage(
      `Global line numbers are now ${
        this.state.displayLinenrGlobal ? "visible" : "hidden"
      }.`
    );
    this.updateUrlWithState();
  }

  toggleLocalLinecounterVisibility() {
    this.state.displayLinenrLocal = !this.state.displayLinenrLocal;
    this.applyVisibilitySettings();
    this.sendAriaMessage(
      `Local line numbers are now ${
        this.state.displayLinenrLocal ? "visible" : "hidden"
      }.`
    );
    this.updateUrlWithState();
  }

  updateColumnContent(columnId, snippetBody) {
    const columnElement = document.getElementById(columnId);
    if (!columnElement) return;
    const textContentElement = columnElement.querySelector(
      `.${this.config.textContentClass}`
    );
    if (textContentElement) {
      if (snippetBody instanceof HTMLElement) {
        textContentElement.replaceChildren(...snippetBody.childNodes);
      }
    } else {
      textContentElement.innerHTML = "Error while loading...";
    }
  }

  setEmptyLinesVisibility(textContentElement) {
    if (!textContentElement) return;
    textContentElement
      .querySelectorAll(
        `.${this.config.witnessLineClass}.${this.config.omittedLineClass}`
      )
      .forEach((line) => {
        line.classList.toggle(
          this.config.hiddenElementClass,
          !this.state.displayEmptyLines
        );
      });
  }

  setGlobalLinecounterVisibility(textContentElement) {
    if (!textContentElement) return;
    textContentElement
      .querySelectorAll(`.${this.config.globalLineNumberClass}`)
      .forEach((line) => {
        line.classList.toggle(
          this.config.hiddenElementClass,
          !this.state.displayLinenrGlobal
        );
      });
  }

  setLocalLinecounterVisibility(textContentElement) {
    if (!textContentElement) return;
    textContentElement
      .querySelectorAll(`.${this.config.localLineNumberClass}`)
      .forEach((line) => {
        line.classList.toggle(
          this.config.hiddenElementClass,
          !this.state.displayLinenrLocal
        );
      });
  }

  applyVisibilitySettings(columnId = null) {
    if (columnId) {
      const columnElement = document.getElementById(columnId);
      if (columnElement) {
        const textContent = columnElement.querySelector(
          `.${this.config.textContentClass}`
        );
        this.setEmptyLinesVisibility(textContent);
        this.setGlobalLinecounterVisibility(textContent);
        this.setLocalLinecounterVisibility(textContent);
      }
    } else {
      const text_contents = this.witnessContainer.getElementsByClassName(
        this.config.textContentClass
      );
      for (const text_content of text_contents) {
        this.setEmptyLinesVisibility(text_content);
        this.setGlobalLinecounterVisibility(text_content);
        this.setLocalLinecounterVisibility(text_content);
      }
    }
  }

  elementIsVisible(element) {
    if (
      !element.classList.contains(this.config.hiddenElementClass) &&
      element.hasAttribute("id")
    ) {
      return true;
    } else {
      return false;
    }
  }

  getFirstVisibleChildInContainer(container) {
    if (!container) return null;
    const lines = container.querySelectorAll(`.${this.config.witnessLineClass}`);
    const containerRect = container.getBoundingClientRect();
    for (const line of lines) {
      if (!this.elementIsVisible(line)) continue;
      const childRect = line.getBoundingClientRect();
      // Check if child is at least partially within the container's viewport
      const verticallyVisible =
        childRect.bottom > containerRect.top &&
        childRect.top < containerRect.bottom;
      const horizontallyVisible =
        childRect.right > containerRect.left &&
        childRect.left < containerRect.right;
      if (verticallyVisible && horizontallyVisible) {
        return line;
      }
    }
    console.warn(`No visible child found in container ${container.id}.`);
    return null;
  }

  findNearestVisiblePreviousSibling(element) {
    let sibling = element.previousElementSibling;
    while (sibling) {
      if (this.elementIsVisible(sibling)) {
        return sibling; // Return the first visible previous sibling
      }
      sibling = sibling.previousElementSibling;
    }
    return null;
  }

  findNearestVisibleFollowingSibling(element) {
    let sibling = element.nextElementSibling;
    while (sibling) {
      if (this.elementIsVisible(sibling)) {
        return sibling; // Return the first visible next sibling
      }
      sibling = sibling.nextElementSibling;
    }
    return null;
  }

  findNearestVisibleSibling(element, followingFirst = false) {
    if (followingFirst) {
      return (
        this.findNearestVisibleFollowingSibling(element) ||
        this.findNearestVisiblePreviousSibling(element) ||
        element
      );
    } else {
      return (
        this.findNearestVisiblePreviousSibling(element) ||
        this.findNearestVisibleFollowingSibling(element) ||
        element
      );
    }
  }

  getTextContentParent(elementOrEvent) {
    if (elementOrEvent instanceof HTMLElement) {
      return elementOrEvent.closest(`.${this.config.textContentClass}`);
    } else if (elementOrEvent instanceof Event) {
      return elementOrEvent.target.classList.contains(
        this.config.textContentClass
      )
        ? elementOrEvent.target
        : elementOrEvent.target.closest(`div.${this.config.textContentClass}`);
    } else {
      console.error(
        `Provided input ${elementOrEvent} is neither a valid HTML element nor an event.`
      );
      return null;
    }
  }

  isElementInView(element, container) {
    if (!element || !container) return false;
    if (!this.elementIsVisible(element)) return false;
    const elemRect = element.getBoundingClientRect();
    const contRect = container.getBoundingClientRect();
    // Only return true if the entire element is within the container's visible area (vertically)
    return elemRect.top >= contRect.top && elemRect.bottom <= contRect.bottom;
  }

  updateFocusState(
    selectedElement,
    textContentParent,
    fromDoubleClick = false,
    scrollMode = "none" // "none", "top", "bottom", "center"
  ) {
    if (!selectedElement) {
      return null;
    }

    if (!textContentParent) {
      this.state.setCurrentSelectedWitness(
        this.getTextContentParent(selectedElement)
      );
    } else {
      this.state.setCurrentSelectedWitness(textContentParent);
    }
    // Always prevent browser's default scroll on focus
    selectedElement.focus({ preventScroll: true });
    // Custom scroll handling
    if (
      !this.isElementInView(
        selectedElement,
        this.state.getCurrentSelectedWitness(textContentParent)
      )
    ) {
      if (scrollMode === "top") {
        selectedElement.scrollIntoView({ behavior: "auto", block: "start" });
      } else if (scrollMode === "bottom") {
        selectedElement.scrollIntoView({ behavior: "auto", block: "end" });
      } else if (scrollMode === "center") {
        selectedElement.scrollIntoView({ behavior: "auto", block: "center" });
      }
    }
    this.state.setCurrentSelectedElement(selectedElement);
    const elementId = selectedElement.getAttribute("id");
    if (fromDoubleClick) {
      this.state.lastDoubleClickedElementId = elementId;
    }
    return elementId;
  }

  removeAllHighlights() {
    this.witnessContainer
      .querySelectorAll(
        `.${this.config.textContentClass} span.${this.config.highlightClass}, .${this.config.textContentClass} span.${this.config.neighborHighlightClass}`
      )
      .forEach((span) => {
        span.classList.remove(this.config.highlightClass);
        span.classList.remove(this.config.neighborHighlightClass);
      });
    this.state.highlightedSpans = [];
  }

  highlightAndCenterSpan(span, isNeighbour = false) {
    span.classList.add(this.config.highlightClass);
    if (isNeighbour) {
      span.classList.add(this.config.neighborHighlightClass);
    }
    const container = span.closest(`.${this.config.textContentClass}`);
    if (container) {
      const spanTop = span.offsetTop;
      const spanHeight = span.offsetHeight;
      const containerHeight = container.clientHeight;
      // Center the span vertically in the container
      container.scrollTop = spanTop - containerHeight / 2 + spanHeight / 2;
    }
  }

  setupRemoveHighlightsHandler(spanId) {
    // Remove previous handler if present
    if (this._boundRemoveHighlights) {
      this.witnessContainer.removeEventListener(
        "click",
        this._boundRemoveHighlights
      );
    }
    this._boundRemoveHighlights = (event) =>
      this.removeHighlights(event, spanId);
    this.witnessContainer.addEventListener(
      "click",
      this._boundRemoveHighlights
    );
  }

  syncVerticalScrolling(element) {
    if (!element) return null;
    const textContentParent = this.getTextContentParent(element);
    const spanId = this.updateFocusState(element, textContentParent, true);
    console.assert(
      spanId,
      `Couldn't get id-Attribute from doubleclicked element ${element}. Better check your markup.`
    );
    if (!spanId) return null;
    this.removeAllHighlights();
    this.addNewHighlights(spanId);
    this.setupRemoveHighlightsHandler(spanId);
    this.updateUrlWithState();
  }

  addNewHighlights(spanId) {
    // Find all matching spans with the same ID
    const matchingSpans = this.witnessContainer.querySelectorAll(
      `.${this.config.textContentClass} span[id="${spanId}"]`
    );
    // Highlight matching spans or their nearest visible siblings
    this.state.highlightedSpans = [];
    matchingSpans.forEach((span) => {
      if (this.elementIsVisible(span)) {
        this.highlightAndCenterSpan(span, false);
        this.state.highlightedSpans.push(span);
      } else {
        const nearestVisibleSibling = this.findNearestVisibleSibling(span);
        if (nearestVisibleSibling) {
          this.highlightAndCenterSpan(nearestVisibleSibling, true);
          this.state.highlightedSpans.push(nearestVisibleSibling);
        }
      }
    });
  }

  removeHighlights(event, spanId) {
    if (
      !event.target.closest(
        `.${this.config.textContentClass} span[id="${spanId}"]`
      )
    ) {
      this.state.highlightedSpans.forEach((span) => {
        span.classList.remove(this.config.highlightClass);
        span.classList.remove(this.config.neighborHighlightClass);
      });
      // Remove the event listener after it runs
      if (this._boundRemoveHighlights) {
        this.witnessContainer.removeEventListener(
          "click",
          this._boundRemoveHighlights
        );
        this._boundRemoveHighlights = null;
      }
    }
  }

  async initColumns(witnessIdsFromUrl) {
    const singleColumnMode = this.isMobileView();
    let columnIds = [];
    if (witnessIdsFromUrl) {
      // the witness ids and the column ids are already defined by the url
      // we need to load them
      for (const witnessId of witnessIdsFromUrl) {
        if (this.state.witness_metadata[witnessId]) {
          const columnId = this.addColumnContainer(witnessId);
          columnIds.push(columnId);
          if (singleColumnMode) {
            break;
          }
        } else {
          console.warn(
            `Witness ID from URL not found in metadata: ${witnessId}`
          );
        }
      }
    } else if (this.config.fetchAllWitnesses) {
      for (const witnessId of this.state.sortedWitnessIds) {
        const columnId = this.addColumnContainer(witnessId);
        columnIds.push(columnId);
        if (singleColumnMode) {
          break;
        }
      }
    } else {
      for (let i = 1; i <= this.config.defaultNumberOfColumns; i++) {
        const witnessId = this.state.sortedWitnessIds[i - 1];
        if (witnessId) {
          const columnId = this.addColumnContainer(witnessId);
          columnIds.push(columnId);
          if (singleColumnMode) {
            break;
          }
        }
      }
    }
    await Promise.all(columnIds.map((id) => this.renderColumn(id)));
    this.sendAriaMessage(
      `Initialized ${this.state.columnCount} columns with witnesses.`
    );
    this.state.columns.forEach((col, index) => {
      this.sendAriaMessage(
        `Column ${index + 1} for ${
          this.state.witness_metadata[col.witnessId].title
        } initialized.`
      );
    });
    if (this.state.lastDoubleClickedElementId) {
      const lastDoubleClickedSpan = document.getElementById(
        this.state.lastDoubleClickedElementId
      );
      if (lastDoubleClickedSpan) {
        this.syncVerticalScrolling(lastDoubleClickedSpan);
      } else {
        console.warn(
          `Last double-clicked element defined in URL not found: ${this.state.lastDoubleClickedElementId}`
        );
      }
    }
    this.updateUrlWithState();
  }

  scrollColumnIntoView(columnElement) {
    if (!columnElement || !this.witnessContainer) return;
    const colRect = columnElement.getBoundingClientRect();
    const containerRect = this.witnessContainer.getBoundingClientRect();

    // Check if the column is fully visible horizontally
    if (colRect.left < containerRect.left) {
      // Scroll left to bring the column into view
      this.witnessContainer.scrollLeft -= containerRect.left - colRect.left;
    } else if (colRect.right > containerRect.right) {
      // Scroll right to bring the column into view
      this.witnessContainer.scrollLeft += colRect.right - containerRect.right;
    }
  }

  async copyTextToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }

    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.setAttribute("readonly", "");
    textArea.style.position = "fixed";
    textArea.style.top = "-9999px";
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    const copied = document.execCommand("copy");
    textArea.remove();
    if (!copied) {
      throw new Error("Clipboard copy failed");
    }
  }

  showCopyUrlNotification() {
    const notification = document.createElement("div");
    notification.textContent = this.config.copyUrlNotificationLabel;
    notification.className = this.config.copyUrlNotificationClass;
    document.body.appendChild(notification);
    this.sendAriaMessage(this.config.copyUrlNotificationLabel);
    setTimeout(() => {
      notification.style.opacity = "4";
      setTimeout(() => notification.remove(), 200);
    }, 1500);
  }

  async copyUrlToClipboardAndNotify() {
    this.updateUrlWithState();
    try {
      await this.copyTextToClipboard(window.location.href);
      this.showCopyUrlNotification();
    } catch (err) {
      alert("Failed to copy URL: " + err);
    }
  }
}

export default EditionManager;
