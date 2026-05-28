<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xs="http://www.w3.org/2001/XMLSchema"
    exclude-result-prefixes="xs"
    version="2.0">
    <xsl:template match="/" name="one_time_alert">
        <div style="display:none" id="once-popup">
            <div class="flex items-start justify-between bg-yellow-100 border border-yellow-400 text-yellow-800 rounded px-4 py-3 text-center my-2" role="alert">
                <strong class="text-2xl text-center flex-1">
                    Beta Version
                </strong>
                <button type="button"
                        class="ml-4 text-yellow-600 hover:text-yellow-900 text-xl leading-none"
                        aria-label="Close"
                        onclick="document.getElementById('once-popup').style.display='none'">
                    &#215;
                </button>
            </div>
        </div>
        <script type="text/javascript" src="js/one_time_alert.js"></script>
    </xsl:template>
</xsl:stylesheet>