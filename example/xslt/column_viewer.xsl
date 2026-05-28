<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns="http://www.w3.org/1999/xhtml"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:tei="http://www.tei-c.org/ns/1.0"
    xmlns:xs="http://www.w3.org/2001/XMLSchema"
    xmlns:local="http://dse-static.foo.bar" version="2.0" exclude-result-prefixes="xsl tei xs local">
    <xsl:output encoding="UTF-8" media-type="text/html" method="html" version="5.0" indent="yes" omit-xml-declaration="yes" />

    <xsl:import href="./partials/html_head.xsl" />
    <xsl:import href="./partials/html_navbar.xsl" />
    <xsl:import href="./partials/html_footer.xsl" />
    <xsl:import href="./partials/one_time_alert.xsl" />

    <xsl:template match="/">
        <xsl:variable name="doc_title">
            <xsl:value-of select='"Fassungsvergleich"' />
        </xsl:variable>
        <html lang="{$default_lang}">
            <head>
                <xsl:call-template name="html_head">
                    <xsl:with-param name="html_title" select="$doc_title"></xsl:with-param>
                </xsl:call-template>
                <style type="text/tailwindcss">
                    /* Page layout for the synoptic viewer — full-height, no page scroll */
                    html, body { @apply h-full m-0 p-0 w-full; }
                    body { @apply flex flex-col; }
                    main {
                        @apply flex flex-col overflow-hidden w-full;
                        flex: 1 1 auto;
                        min-height: 0;
                    }

                    /* Controls menu (top-level toggle + popup) */
                    div.synTexView_controls_wrapper {
                        @apply relative inline-block mb-4 mt-8 ml-1;
                    }
                    button.synTexView_controls_toggle {
                        @apply px-5 py-2 bg-gray-100 border border-gray-300 cursor-pointer rounded inline-block select-none relative z-10;
                    }
                    div.synTexView_controls {
                        @apply hidden absolute top-full left-0 bg-white shadow-lg z-[100] p-2;
                        min-width: 12.5rem;
                    }
                    div.synTexView_controls.open {
                        @apply block absolute top-full left-0 bg-white shadow-lg z-[100] p-2;
                        min-width: 12.5rem;
                    }
                    div.synTexView_controls.open > div {
                        @apply p-2 flex flex-row justify-start items-center;
                    }
                    div.synTexView_controls.open > div > button {
                        @apply bg-gray-100 text-gray-700 border border-gray-300 rounded p-2 cursor-pointer text-base inline-block select-none;
                        transition: background 0.2s, border 0.2s;
                    }
                    div.synTexView_controls.open > div > button:hover,
                    div.synTexView_controls.open > div > button:focus {
                        @apply bg-gray-400 outline-none;
                    }

                    /* Witness columns container — fills remaining height, horizontal scroll */
                    #synTexView-witness-container {
                        @apply mx-1 flex flex-row flex-nowrap gap-3 pb-4 items-stretch w-full overflow-x-auto overflow-y-hidden;
                        white-space: nowrap;
                        flex: 1 1 auto;
                        min-height: 0;
                    }

                    /* Individual witness column */
                    .synTexView-witness {
                        @apply relative flex flex-col border border-gray-300 bg-white shadow-sm px-4 py-2 text-left;
                        flex: 0 0 auto;
                        min-width: 30rem;
                        max-width: fit-content;
                        font-family: Garamond, serif;
                    }
                    .synTexView-witness h4 {
                        @apply whitespace-normal break-words;
                    }

                    /* Per-column controls header (dropdown + remove button) */
                    .synTexView-controls-container {
                        @apply flex flex-wrap justify-between items-center mb-2 sticky top-0 z-20 pt-2;
                        flex: 0 0 auto;
                    }
                    .synTexView-controls-container .synTexView-remove-column {
                        @apply ml-auto;
                    }

                    /* Remove-column button */
                    button.synTexView-remove-column {
                        @apply sticky bg-white text-gray-400 border-none w-4 h-8 text-base cursor-pointer z-10 leading-4 text-center;
                    }

                    /* Text content area (scrollable) */
                    .synTexView-text-content {
                        @apply overflow-y-auto box-border;
                        flex: 1 1 auto;
                        min-height: 0;
                        max-height: 100%;
                        padding-top: 3rem;
                        padding-bottom: 3rem;
                    }
                    @media (max-width: 800px) {
                        .synTexView-text-content { padding-top: 2rem; padding-bottom: 2rem; }
                    }
                    .synTexView-text-content:focus { outline: 2px solid grey !important; }

                    /* Individual line */
                    span.synTexView-line {
                        @apply block w-full;
                        white-space: normal !important;
                    }
                    span.synTexView-line:hover { @apply bg-blue-100; }
                    .synTexView-line:focus { outline: 2px solid grey !important; }

                    /* Line numbers */
                    .synTexView-linenr-global { @apply text-sm text-gray-400; }
                    .synTexView-linenr-local  { @apply text-sm text-gray-400; }
                    .synTexView-last .synTexView-linenr-global { @apply text-orange-400; }

                    /* Highlight (synchronized scrolling) */
                    span.synTexView-highlight {
                        @apply bg-gray-300;
                        transition: background-color 0.3s ease;
                    }
                    span.synTexView-highlight.synTexView-neighbor {
                        background-color: inherit;
                        @apply border-b-4 border-gray-300 inline-block w-full;
                        margin-bottom: 1rem;
                        transition: border-bottom 0.3s ease;
                    }

                    /* Initialcap (rubricated initial) */
                    .synTexView-init { @apply text-red-500 text-lg; }

                    /* Hidden class used by JS visibility toggles */
                    .synTexView-hidden { display: none !important; }

                    /* URL-copy toast notification */
                    .synTexView-url-copy-notification {
                        @apply fixed bg-gray-800 text-white rounded-lg text-lg z-[9999] pointer-events-none select-none;
                        top: 10%;
                        left: 50%;
                        transform: translateX(-50%);
                        padding: 0.75em 2em;
                        opacity: 1;
                        transition: opacity 2s;
                    }

                    /* Snippet text styles (applied to dynamically loaded content) */
                    .lb          { @apply text-red-500; }
                    .rub         { @apply text-red-500; }
                    .am          { display: none; }
                    .s_orig      { display: none; }
                    .sup_orig    { display: none; }
                    .editorial_note { display: none; }
                    .italic      { @apply italic; }
                    .bold        { @apply font-bold; }
                    .smallcaps   { font-variant: small-caps; }
                    .del         { @apply line-through; }
                    .unclear     { @apply opacity-60; }
                </style>
                <script type="module" src="js/synopticTextViewer/columnViewer.js"/>
            </head>
            <body>
                <xsl:call-template name="nav_bar" />
                <main>
                    <div class="container mx-auto px-4">
                        <xsl:call-template name="one_time_alert" />
                        <h2>
                            <xsl:value-of select="$project_title" />
                        </h2>
                        <p>The (non random) data of this test implementation stem from the great digital edition »<a href="https://doi.org/10.11588/edition.ahd">Der arme Heinrich – digital</a>« by Dr. Gustavo Fernández Riva (Universität Heidelberg), Prof. Dr. Victor Millet (Universität Santiago de Compostela) and Dr. Jakub Šimek (Universität Heidelberg).</p>
                    </div>
                    <div class="synTexView_controls_wrapper">
                        <button class="synTexView_controls_toggle">Menu</button>
                        <div class="synTexView_controls" id="synTexView-controls-container" role="menu" aria-label="Synoptic viewer options">
                            <div id="column-adder"></div>
                            <div id="empty-line-toggler"></div>
                            <div id="global-linenr-toggler"></div>
                            <div id="local-linenr-toggler"></div>
                            <div id="generate-citation-url"></div>
                        </div>
                    </div>
                    <div id="synTexView-witness-container"></div>
                </main>
                <xsl:call-template name="html_footer" />
            </body>
        </html>
    </xsl:template>
</xsl:stylesheet>