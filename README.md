# Synoptic Text Viewer for DSE

Version 0.1

This repository contains the code (js/css/xslt) for a synoptic text view for digital scholarly editions created with static pages. It offers a small **installer** so you can copy only the parts you need (mainly JS, CSS and XSLT) into your own static page project, plus an [**example** project](https://cfhaak.github.io/SynopticTextViewer/column_viewer.html?emptyLines=yes&globalLinenr=yes&localLinenr=no&witnessIds=A%2CBa%2CBb&currentLine=v_100) that demonstrates a complete setup.

Built with [DSE-Static-Cookiecutter](https://github.com/acdh-oeaw/dse-static-cookiecutter).

Disclaimer: I'm not a frontend developer, so the code is not necessarily the most elegant or efficient. Use it for whatever you want, e.g. as a working starting point that you can adapt to your needs.
---

## 1. Plugin-style viewer and minimal requirements

The synoptic viewer is designed as a small, pluggable module that mounts into an
existing static page. Instead of prescribing a full site layout or build
pipeline, it expects a few explicit, minimal inputs that you can generate in
whatever way fits your project.

At runtime the viewer needs four things:

1. **A mount container with a clear sizing policy**  
    Your host page must provide a container element into which the viewer will
    render the witness columns. By default this is the `<div id="synTexView-witness-container"></div>`
    shown in the example at `example/html/column_viewer.html`, sized via
    `installerdata/css/synopticTextViewer.css` to take up the remaining space in
    the `<main>` area. Projects are free to adapt both the container ID (via
    `column_viewer_config.js`) and the surrounding layout/CSS, as long as there
    is a dedicated container where the viewer can attach.

2. **Per‑witness HTML snippets with a predictable structure**  
    The viewer loads one HTML file per witness (for example the files in
    `example/html/witness_snippets/`). Each snippet:
    - contains a heading for the witness (optional but recommended), and
    - encodes each line as an element with a stable line identifier
      (e.g. `id="v_123"`, `data-n="v_123"`) and the CSS classes configured in
      `column_viewer_config.js` (by default `synTexView-line`,
      `synTexView-linenr-global`, `synTexView-linenr-local`, …).

    The important contract is that corresponding lines across witnesses share the
    same identifier; this is what allows the viewer to align them on demand.
    How you create these snippets is up to you; this repository ships
    `installerdata/xslt/generate_snippets.xsl` and
    `installerdata/pyscripts/make_snippets.py` as working examples that you can
    copy and adapt to your TEI.

3. **A JSON manifest listing snippet paths and metadata**  
    The viewer reads a small JSON file (by default
    `witness_snippets/snippet_paths.json` relative to the viewer page, e.g.
    `html/column_viewer.html` → `html/witness_snippets/snippet_paths.json`)
    whose structure is illustrated by
    `example/html/witness_snippets/snippet_paths.json`. It is a simple object
    keyed by witness ID, where each entry at minimum provides:

    - `filepath`: path to the HTML snippet relative to the host page,  
    - `title`: human‑readable label used in menus, and  
    - `sorting`: a string or number used to sort witnesses in the dropdown.

    The path to this manifest is configured via
    `snippetMetadataPath` in `installerdata/js/synopticTextViewer/column_viewer_config.js`.

4. **A configuration module for CSS classes, alignment targets, labels, and ARIA strings**  
    Most IDs, class names, default behaviors, button labels, and ARIA labels used
    by the controls are centralised in
    `installerdata/js/synopticTextViewer/column_viewer_config.js`
    (class `ColumnViewerConfig`). Projects typically copy this file into their
    own `html/js/synopticTextViewer/` folder and adjust it to:

    - map viewer logic to project‑specific CSS class names and container IDs,
    - declare the path to the snippet manifest and default number of columns,
    - set internationalised button labels and messages, and
    - customise ARIA labels and attributes used for keyboard navigation and
      focus management.

In normal use you only touch data generation (your TEI → snippets + JSON) and
this configuration module; the viewer’s core JavaScript classes remain
unchanged and can be updated via the installer.

## 2. Using the installer in your own project

To integrate the Synoptic Text Viewer into an existing static site, you can either copy what you need manually or use the "installer" script (`installerdata/install.py`).

### Prerequisites

- Python 3.6 or newer.

### Basic workflow for "installing" or "updating" the viewer in your project

1. **Copy the "installer" script**
     - From this repository, take `installerdata/install.py`.
     - Place it in the **root directory of your static edition project**, i.e. the directory that contains your `html/`, `data/`, `xslt/`, etc.

2. **Run the installer**
     - In your project root, run:
         - `python3 install.py` (or `python install.py`, depending on your setup)
     - The (primitive) script will:
         - Download the latest SynopticTextViewer repository archive.
         - Unpack it to a temporary directory.
         - Locate the `installerdata` folder inside the archive.
         - Copy the relevant **CSS**, **JavaScript**, **Python scripts**, and **XSLT** files into your project.

3. **Choose or confirm target directories**
     - For each kind of file, the installer proposes a default directory (you can confirm or override); the defaults assume a DSE-Static-Cookiecutter-style project.

4. **Resolve conflicts interactively**
     - If a target file does **not** exist, it is created.
     - If a target file exists and is **identical**, it is skipped.
     - If a target file exists and **differs**, you are asked whether to overwrite it:
         - If you overwrite, the existing file is replaced.
         - If you do **not** overwrite, the new file is saved under a name like `*_NNNN_updated.*` so nothing is lost.

5. **After installation**
     - Include the copied JS and CSS in your HTML templates.
     - Optionally use the provided Python and XSLT scripts to generate witness snippets; these are meant as **working defaults** which you can adapt to your own TEI and workflow.

Only the **JS and CSS** are strictly required to use the viewer in the browser. The Python and XSLT parts are suggestions that you can keep, extend, or replace, if your data structure or workflow differs.

---

## 3. What is in `installerdata/`?

The installer always operates on the `installerdata` directory contained in the downloaded repository. Its contents are mirrored in this repository under `installerdata/`.

### `installerdata/css/`

- CSS files required for the synoptic viewer layout and styling.
- These are copied into the CSS target directory you choose (default: `html/css`).
- You can further customize these styles in your project as needed.

### `installerdata/js/synopticTextViewer/`

Core JavaScript modules for the viewer (copied into your JS target directory, default: `html/js/synopticTextViewer`):

- `column.js`: Represents a single column containing a witness or other text.
- `column_viewer_config.js`: Configuration of how JS and CSS interact and some default behaviors of the page. You can adapt this to your needs, but it provides a ready-made starting point.
- `columnViewer.js`: Main script orchestrating loading and interaction of all components.
- `editionManager.js`: Manages the overall behavior and rendering of the interface.
- `editionState.js`: Keeps track of the current state of the interface.
- `stateFromUrl.js`: Reads/writes viewer state from/to the URL.
- `textContainer.js`: Represents the container of a displayed text loaded into a column.

### `installerdata/pyscripts/`

Python helper scripts (copied into your Python target directory, default: `pyscripts`):

- `make_snippets.py`: Creates the HTML snippets used to display witnesses in the synoptic view.
    - Reads TEI files from `data/editions` (or your chosen source).
    - Writes snippets into a dedicated folder (e.g. `html/witness_snippets`).
    - Produces a `snippet_paths.json` file with metadata used by the interface.
- `saxon_xpath.py`: Small helper for working with Saxon/XPath from Python.
- `requirements.txt`: Lists the required Python packages. Install them with:
    - `python3 -m pip install -r pyscripts/requirements.txt`

You should adapt these scripts for your own TEI structure; they serve as a ready-made starting point.

### `installerdata/xslt/`

XSLT stylesheets (copied into your XSLT target directory, default: `xslt`):

- `column_viewer.xsl`: Builds the basic page in which the column viewer is rendered. You may replace or adapt it as long as you keep a suitable container `div` for the viewer (specified in `column_viewer_config.js`).
- `generate_snippets.xsl`: Creates witness HTML snippets when called by `pyscripts/make_snippets.py`.

These are reference stylesheets; feel free to customize them for your own encoding practices.

---

## 4. Example project (`example/`)

The `example/` directory contains a complete test implementation of a DSE-style static project that uses the Synoptic Text Viewer. It is **not** required for using the tool, but serves as a concrete reference.

See `example/README.md` for details on the example’s structure and how to run it locally.

---

## 5. Development notes

- This repository is still under active development; structure and details may change.
- The top-level `html/`, `data/`, `xslt/`, etc. in this repo are mainly used for development and may mirror (or diverge from) the example project over time.
- Third-party libraries used by the viewer are vendored under `example/html/vendor` in the example project; each library’s license is either in the `LICENSE` file or in the header of the corresponding `.js` file. Saxon is licensed under `example/saxon/notices/saxon.txt`.
If you are just integrating the viewer into your own project, you usually only need:

- `installerdata/install.py` (copied into your project root and executed there), and
- The files it installs for you (CSS, JS, Python scripts, XSLT).

Everything else in this repository is at the moment mainly used for development, testing, and as an extended example.
