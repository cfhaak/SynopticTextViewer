<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet  xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:tei="http://www.tei-c.org/ns/1.0" exclude-result-prefixes="xsl tei" version="2.0">
    
    
    <doc xmlns="http://www.oxygenxml.com/ns/doc/xsl">
        <desc>
            <h1>Widget annotation options.</h1>
            <p>Contact person: daniel.stoxreiter@oeaw.ac.at</p>
            <p>Applied with call-templates in html:body.</p>
            <p>Custom template to create interactive options for text annoations.</p>
        </desc>    
    </doc>
    
    <xsl:template name="annotation-options">
        <div id="aot-navBarNavDropdown" class="relative inline-block">
            <a title="Annotationen" href="#"
               id="aot-dropdown-toggle"
               class="text-gray-500 hover:text-gray-900 px-2 py-1"
               aria-expanded="false" role="button"
               onclick="var m=document.getElementById('aot-dropdown-menu');m.classList.toggle('hidden');this.setAttribute('aria-expanded',!m.classList.contains('hidden'));return false;">
                <i class="bi bi-gear" title="Menü zur Anpassung der Anzeige"></i>
            </a>
            <ul id="aot-dropdown-menu" class="hidden absolute right-0 top-full bg-white shadow-lg rounded py-1 z-50 min-w-[10rem] border border-gray-200">
                <li class="px-3 py-1">
                    <full-size opt="fls"></full-size>
                </li>
                <!-- image-switch hidden: not applicable in this view -->
                <li class="px-3 py-1 hidden">
                    <image-switch opt="es"></image-switch>
                </li>
                <li class="px-3 py-1">
                    <font-size opt="fs"></font-size>
                </li>
                <li class="px-3 py-1">
                    <font-family opt="ff"></font-family>
                </li>
                <li class="px-3 py-1 border-t-4 border-dashed border-gray-200">
                    <annotation-slider opt="ef"></annotation-slider>
                </li>
                <li class="px-3 py-1">
                    <annotation-slider opt="prs"></annotation-slider>
                </li>
                <li class="px-3 py-1">
                    <annotation-slider opt="plc"></annotation-slider>
                </li>
                <li class="px-3 py-1">
                    <annotation-slider opt="wrk"></annotation-slider>
                </li>
                <li class="px-3 py-1">
                    <annotation-slider opt="org"></annotation-slider>
                </li>
            </ul>
            <script>
                document.addEventListener('click', function(e) {
                    var m = document.getElementById('aot-dropdown-menu');
                    if (!m) { return; }
                    if (e.target.closest('#aot-navBarNavDropdown')) { return; }
                    m.classList.add('hidden');
                    var t = document.getElementById('aot-dropdown-toggle');
                    if (t) { t.setAttribute('aria-expanded', 'false'); }
                });
            </script>
        </div>
    </xsl:template>
</xsl:stylesheet>