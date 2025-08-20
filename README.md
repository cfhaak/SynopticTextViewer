# Synoptic Text Viewer for DSE

## This repo and it's code is under development. Meaningful documentation will shortly follow.
V. 0.1
* build with [DSE-Static-Cookiecutter](https://github.com/acdh-oeaw/dse-static-cookiecutter)

## Contents of this repo
Right now this repo contains a wild mix of scripts, test-data and documentation. This will likely change in the future. A lot of files stems from [DSE-Static-Cookiecutter](https://github.com/acdh-oeaw/dse-static-cookiecutter).
* build.xml: build file from DSE-Static-Cookiecutter defining the build routine
* data: contains some TEIs to test the tool 
* html: directory containing the htmls of the satic test site
    * js: this contains some of the main scripts of this tool.
        * Column.js: a class representing a single column containing a witness or other text
        * column_viewer_config.js: a config class mainly defining how the js and css interact and what some default behavior of the page should be
        * columnViewer.js: this is the main script handling the loading of all components
        * EditionManager.js: this class handles the overall behavior and rendering of the interface
        * editionState.js: this class keeps track of the current state of the interface
        * textContainer.js: very simple class representing the container of a displayed text loaded into a column
        * other files stem from DSE-Static-Cookiecutter
    * witness_snippets: this directory contains the text contents rendered in the synoptic view; all files are created by ```pyscripts/make_snippets.py```
        * a html-snippet for each witness
        * snippet_paths.json: a file containing metadata about the witnesses and their files
* LICENSE: you know what that is …
* nginx.conf: server configuration from DSE-Static-Cookiecutter
* oai-pmh
* pyscripts
    * make_snippets.py
    * requirements.txt: needed python modules; run ```python3 -m pip install -r requirements.txt``` to install them

* README.md: the file you a reading right now
* saxon: xslt processor installed by the main script
* shellscripts: a bunch of shellscripts from DSE-Static-Cookiecutter
* xslt: xsl scripts
    * column_viewer.xsl: this creates the basic page in which the column-viewer is rendered; feel free to modify or replace this as needed, all you need is a div-container
    * extract-all-witnesses.xsl: if your TEIs use the classical text critic tags to encode all witnesses in on file use this script to create individual files per witness. You probably will have to adapt the script to your data
    * generate_snippets.xsl: this script creates the witness html-snippets when its called by ```pyscripts/make_snippets.py```


## test setup
* run `./shellscripts/script.sh`
* run `ant` to build htmls, etc.

### start dev server

* `cd html/`
* `python -m http.server`
* go to [http://0.0.0.0:8000/](http://0.0.0.0:8000/)


### third-party libraries

the code for all third-party libraries used is included in the `html/vendor` folder, their respective licenses can be found either in a `LICENSE.txt` file or directly in the header of the `.js` file
