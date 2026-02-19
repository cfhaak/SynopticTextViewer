# Example project for Synoptic Text Viewer

This directory contains a complete example DSE-style static project using the Synoptic Text Viewer. It largely mirrors what you could have in your own edition after running the installer and adapting the defaults.

## Contents of this example project

Many files originate from [DSE-Static-Cookiecutter](https://github.com/acdh-oeaw/dse-static-cookiecutter).

- `build.xml`: Ant build file defining the build routine for this example.
- `data/`: TEI source data used to test the tool.
- `html/`: Generated HTML files of the static test site.
  - `js/synopticTextViewer/`: Main scripts for the synoptic viewer.
    - `column.js`: Represents a single column containing a witness or other text.
    - `column_viewer_config.js`: Configuration for how JavaScript and CSS interact and default behaviors of the page.
    - `columnViewer.js`: Main script handling loading and coordination of all components.
    - `editionManager.js`: Manages overall behavior and rendering of the interface.
    - `editionState.js`: Keeps track of the current state of the interface.
    - `stateFromUrl.js`: Reads and writes the viewer state from/to the URL.
    - `textContainer.js`: Represents the container of a displayed text loaded into a column.
  - `witness_snippets/`: Text contents rendered in the synoptic view. All files are created by `pyscripts/make_snippets.py`.
    - One HTML snippet per witness.
    - `snippet_paths.json`: Metadata about the witnesses and their files, used by the viewer.
- `LICENSE`: License information for the example bundle (inherited from the main project).
- `nginx.conf`: Example server configuration from DSE-Static-Cookiecutter.
- `pyscripts/`:
  - `make_snippets.py`: Creates the HTML snippets used to display the witnesses in the synoptic view. It reads files from `data/editions` and writes into the dedicated folder in the `html/` directory. It also creates metadata for the snippets used by the interface.
  - `requirements.txt`: Lists the required Python modules for the example. Install them with `python3 -m pip install -r pyscripts/requirements.txt`.
  - `saxon_xpath.py`: Helper for integrating Saxon/XPath from Python.
- `saxon/`: Saxon XSLT processor as installed by the shell scripts.
- `shellscripts/`: Shell scripts from DSE-Static-Cookiecutter used to prepare and build the example.
- `xslt/`: XSLT stylesheets.
  - `column_viewer.xsl`: Creates the basic page in which the column viewer is rendered. You can modify or replace this as needed; the viewer only requires a suitable `div` container.
  - `extract-all-witnesses.xsl`: Example script to extract individual witnesses from TEI files that encode multiple witnesses in one file. Intended to be adapted to your data. Can be called via `shellscripts/split_witness.sh`.
  - `generate_snippets.xsl`: Creates witness HTML snippets when called by `pyscripts/make_snippets.py`.
  - Other XSLT files used to build the example site (index, search, lists, etc.).

## Running the example locally
0. If you just want to host the side locally for testing, you should be abel to run it like described below. It's a static side, already built after all …
1. Run the setup script:
   - `./shellscripts/script.sh`
2. Set up a Python environment if needed.
3. Install Python dependencies:
   - `python3 -m pip install -r pyscripts/requirements.txt`
4. Build HTML files and related assets:
   - `ant`

### Start a development server

1. Change into the HTML directory:
   - `cd html/`
2. Start a simple HTTP server (Python 3):
   - `python3 -m http.server`
3. Open the site in your browser:
   - `http://0.0.0.0:8000/` or `http://localhost:8000/`
4. Click on "Fassungsvergleich" in the navbar to open the synoptic viewer.

Some features (for example, copying the URL to RAM via the menu) may expect the URL `http://localhost:8000/column_viewer.html`.

### Third-party libraries

Third-party libraries used by the example are included in `html/vendor/`. Their respective licenses can be found either in a `LICENSE.txt` file or directly in the header of the corresponding `.js` file.
