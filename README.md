# Synoptic Text Viewer for DSE

## This repository and its code are under development. Meaningful documentation will follow shortly.
Version 0.1
* Built with [DSE-Static-Cookiecutter](https://github.com/acdh-oeaw/dse-static-cookiecutter)
* Have a look at [the test implemenentation here]( https://cfhaak.github.io/SynopticTextViewer/column_viewer.html?emptyLines=yes&globalLinenr=yes&localLinenr=no&witnessIds=A%2CBa%2CBb&currentLine=v_100)

## Contents of this repository
Currently, this repository contains a mix of scripts, test data, and documentation. This will likely change in the future. Many files originate from [DSE-Static-Cookiecutter](https://github.com/acdh-oeaw/dse-static-cookiecutter).
* `build.xml`: Build file from DSE-Static-Cookiecutter defining the build routine.
* `data`: Contains some TEI files to test the tool.
* `html`: Directory containing the HTML files of the static test site.
    * `js/synopticTextViewer`: Contains some of the main scripts for this tool.
        * `column.js`: A class representing a single column containing a witness or other text.
        * `column_viewer_config.js`: A configuration class mainly defining how the JavaScript and CSS interact and specifying some default behaviors of the page.
        * `columnViewer.js`: The main script handling the loading of all components.
        * `editionManager.js`: This class handles the overall behavior and rendering of the interface.
        * `editionState.js`: This class keeps track of the current state of the interface.
        * `textContainer.js`: A simple class representing the container of a displayed text loaded into a column.
        * Other files originate from DSE-Static-Cookiecutter.
    * `witness_snippets`: This directory contains the text contents rendered in the synoptic view. All files are created by `pyscripts/make_snippets.py`.
        * An HTML snippet for each witness.
        * `snippet_paths.json`: A file containing metadata about the witnesses and their files.
* `LICENSE`: You know what that is…
* `nginx.conf`: Server configuration from DSE-Static-Cookiecutter.
* `pyscripts`:
    * `make_snippets.py`: This script creates the html snippets used to display the witnesses in the synoptic view. It reads the files from `data/editions` and outputs to the dedicated folder in the hmtl-directory. In addition it creates metadate for the snippets which are then used by the interface.
    * `requirements.txt`: Lists the required Python modules. Run `python3 -m pip install -r requirements.txt` to install them.
* `README.md`: The file you are reading right now.
* `saxon`: XSLT processor installed by the ```shellscripts/script.sh``` script.
* `shellscripts`: A collection of shell scripts from DSE-Static-Cookiecutter.
* `xslt`: XSL scripts.
    * `column_viewer.xsl`: Creates the basic page in which the column viewer is rendered. Feel free to modify or replace this as needed; all you need is a `div` container.
    * `extract-all-witnesses.xsl`: If your TEI files use classical text-critical tags to encode all witnesses in one file, use this script to create individual files for each witness. You will likely need to adapt the script to your data. Can be executed via ```shellscripts/split_witness.sh```
    * `generate_snippets.xsl`: This script creates the witness HTML snippets when called by `pyscripts/make_snippets.py`.

## Test Setup
* Run `./shellscripts/script.sh`.
* Set up a python environment if necessary.
* Install python dependencies:
`python -m pip install -r pyscripts/requirements.txt`
* Run `ant` to build HTML files, etc.

### Start Development Server

* `cd html/`
* `python -m http.server`
* Go to [http://0.0.0.0:8000/](http://0.0.0.0:8000/) or [http://localhost:8000/](http://localhost:8000/)
* Click on "Fassungsvergleich" in the navbar.
* Some features (eg. copying the URL to RAM via the menu) may not work if the url isn't http://localhost:8000/column_viewer.html)

### Third-Party Libraries

The code for all third-party libraries used is included in the `html/vendor` folder. Their respective licenses can be found either in a `LICENSE.txt` file or directly in the header of the `.js` file.
