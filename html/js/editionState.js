// this class only hold the data representing the current state of the synoptic view
class EditionState {
  constructor(witness_metadata, sortedWitnessIds) {
    this.witness_metadata = witness_metadata;
    this.sortedWitnessIds = sortedWitnessIds;
    this.snippetsByLabels = {};
    this.columns = []; // [{id, witnessId}]
    this.globalScroll = false;
    this.displayEmptyLines = true;
    this.displayLinenrGlobal = true;
    this.displayLinenrLocal = false;
    this.columnIdToColumnIndex = {};
    this.columnCount = 0;
    this.lastDoubleClickedElementId = null;
    this.currentSelectedElement = null;
    this.currentSelectedColumn = null;
    this.currentSelectedWitness = null;
    this.highlightedSpans = [];
  }

  getCurrentSelectedElement() {
    return this.currentSelectedElement;
  }

  setCurrentSelectedElement(element) {
    this.currentSelectedElement = element;
  }

  getCurrentSelectedWitness() {
    return this.currentSelectedWitness;
  }

  setCurrentSelectedWitness(element) {
    this.currentSelectedWitness = element;
  }

  getCurrentSelectedColumn(){
    return this.currentSelectedColumn;
  }

  setCurrentSelectedColumn(element) {
    this.currentSelectedColumn = element;
  }

  getIndexByColumnId(columnId) {
    return this.columnIdToColumnIndex[columnId];
  }

  addColumn(witnessId) {
    this.columnCount++;
    const columnId = `Witness_column_${String(this.columnCount).padStart(
      2,
      "0"
    )}`;
    this.columns.push({ id: columnId, witnessId });
    this.columnIdToColumnIndex[columnId] = this.columns.length - 1;
    return columnId;
  }

  removeColumn(columnId) {
    this.columns = this.columns.filter((col) => col.id !== columnId);
    delete this.columnIdToColumnIndex[columnId];
    this.columnCount--;
    // Update indices in columnIdToColumnIndex
    this.columns.forEach((col, index) => {
      this.columnIdToColumnIndex[col.id] = index;
    });
  }

  updateColumnWitness(columnId, witnessId) {
    const col = this.columns.find((col) => col.id === columnId);
    console.assert(col, `Column with id ${columnId} not found.`);
    if (col) col.witnessId = witnessId;
  }

  getColumn(columnId) {
    return this.columns.find((col) => col.id === columnId);
  }

  getAllColumns() {
    return this.columns;
  }

  resetColumns() {
    this.columns = [];
    this.columnCount = 0;
  }
}


export default EditionState;