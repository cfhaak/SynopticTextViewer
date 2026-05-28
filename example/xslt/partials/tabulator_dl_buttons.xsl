<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xs="http://www.w3.org/2001/XMLSchema"
    exclude-result-prefixes="xs"
    version="2.0">
    <xsl:template match="/" name="tabulator_dl_buttons">
        <h4>Download Table</h4>
        <div class="flex gap-2">
            <button type="button" class="px-3 py-1.5 border border-gray-400 rounded text-gray-600 hover:bg-gray-100 text-sm" id="download-csv" title="Download CSV">
                <i class="bi bi-filetype-csv"></i>
                <span class="sr-only">Download CSV</span>
            </button>
            <button type="button" class="px-3 py-1.5 border border-gray-400 rounded text-gray-600 hover:bg-gray-100 text-sm" id="download-json" title="Download JSON">
                <i class="bi bi-filetype-json"></i>
                <span class="sr-only">Download JSON</span>
            </button>
            <button type="button" class="px-3 py-1.5 border border-gray-400 rounded text-gray-600 hover:bg-gray-100 text-sm" id="download-html" title="Download HTML">
                <i class="bi bi-filetype-html"></i>
                <span class="sr-only">Download HTML</span>
            </button>
        </div>
    </xsl:template>
</xsl:stylesheet>