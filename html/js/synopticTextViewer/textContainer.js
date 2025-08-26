class TextContainer {
  constructor(parentColumnObject, witnessId, element) {
    parentColumnObject.registerColumn(this);
    this.witnessId = witnessId;
    this.element = element;
    this.activeSubstructure = null;
  }
}


export default TextContainer;