<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet 
    xmlns="http://www.w3.org/1999/xhtml"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xs="http://www.w3.org/2001/XMLSchema"
    exclude-result-prefixes="#all"
    version="2.0">
    <xsl:template match="/" name="html_footer">
        <footer class="py-3 bg-gray-100 border-t border-gray-200 mt-auto">
            <div class="text-center">
                <a href="{$github_url}" class="text-gray-500 hover:text-gray-900">
                    <i aria-hidden="true" class="bi bi-github text-2xl"></i>
                    <span class="sr-only">GitHub repo</span>
                </a>
            </div>
        </footer>
        
    </xsl:template>
</xsl:stylesheet>