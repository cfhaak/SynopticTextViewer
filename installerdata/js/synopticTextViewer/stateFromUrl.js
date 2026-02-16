class StateFromUrl {
  constructor() {
    const params = new URLSearchParams(window.location.search);
    this.displayEmptyLines = StateFromUrl.parseBooleanParam(
      params.get("emptyLines")
    );
    this.displayLinenrGlobal = StateFromUrl.parseBooleanParam(
      params.get("globalLinenr")
    );
    this.displayLinenrLocal = StateFromUrl.parseBooleanParam(
      params.get("localLinenr")
    );
    this.witnessIds = params.get("witnessIds")
      ? params.get("witnessIds").split(",")
      : null;
    this.currentLine = params.get("currentLine") || null;
  }

  static parseBooleanParam(value) {
    if (value === "yes" || value === "1" || value === "true") return true;
    if (value === "no" || value === "0" || value === "false") return false;
    return null;
  }
}

export default StateFromUrl;