<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns="http://www.w3.org/1999/xhtml"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:tei="http://www.tei-c.org/ns/1.0"
    xmlns:xs="http://www.w3.org/2001/XMLSchema" exclude-result-prefixes="#all" version="2.0">
    <xsl:template match="/" name="nav_bar">
        <header>
            <nav aria-label="Primary" class="bg-gray-100 border-b border-gray-200">
                <div class="max-w-screen-xl mx-auto px-4 flex items-center justify-between py-2">
                    <a class="text-xl font-semibold text-gray-900 hover:text-gray-700" href="index.html">
                        <xsl:value-of select="$project_short_title"/>
                    </a>
                    <button id="navToggle" type="button"
                            class="lg:hidden p-1 rounded text-gray-500 hover:bg-gray-200"
                            aria-label="Toggle navigation">
                        <i class="bi bi-list text-2xl"></i>
                    </button>
                    <div id="navMenu" class="hidden lg:flex lg:items-center w-full lg:w-auto">
                        <ul class="flex flex-col lg:flex-row lg:items-center mr-auto py-2 lg:py-0">
                            <li class="relative">
                                <a id="projektToggle" href="#"
                                   class="flex items-center gap-1 px-3 py-2 rounded text-gray-700 hover:bg-gray-200 text-sm cursor-pointer"
                                   role="button">
                                    Projekt <i class="bi bi-chevron-down text-xs"></i>
                                </a>
                                <ul id="projektMenu" class="hidden absolute left-0 top-full bg-white shadow-lg rounded py-1 z-50 min-w-[10rem] border border-gray-200">
                                    <li><a class="block px-4 py-2 hover:bg-gray-100 text-gray-700 text-sm" href="about.html">Über das Projekt</a></li>
                                    <li><a class="block px-4 py-2 hover:bg-gray-100 text-gray-700 text-sm" href="imprint.html">Impressum</a></li>
                                </ul>
                            </li>
                            <li>
                                <a class="block px-3 py-2 rounded text-gray-700 hover:bg-gray-200 text-sm" href="toc.html">Editionseinheiten</a>
                            </li>
                            <li>
                                <a class="block px-3 py-2 rounded text-gray-700 hover:bg-gray-200 text-sm" href="column_viewer.html">Fassungsvergleich</a>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
            <script>
                document.getElementById('navToggle').addEventListener('click', function() {
                    document.getElementById('navMenu').classList.toggle('hidden');
                });
                document.getElementById('projektToggle').addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    document.getElementById('projektMenu').classList.toggle('hidden');
                });
                document.addEventListener('click', function(e) {
                    var m = document.getElementById('projektMenu');
                    if (!m) { return; }
                    if (e.target.closest('#projektToggle')) { return; }
                    if (e.target.closest('#projektMenu')) { return; }
                    m.classList.add('hidden');
                });
            </script>
        </header>
    </xsl:template>
</xsl:stylesheet>