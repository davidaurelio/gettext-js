gettext.CatalogLibrary = function() {
    this._catalogs = {};
}

gettext.CatalogLibrary.prototype = {
    /**
     * Returns a single textomain catalog for a given language.
     *
     * @param {string} domain The name of the desired domain.
     * @param {string} lang The language code for the desired language.
     * @param {bool} [doFallback] If not false, a less specific language
     *      catalog is returned when a language is not available. E.g.: If
     *      language code "en-gb" isn't available but "en" is, "en" will
     *      be returned.
     * @returns {gettext.Catalog}
     */
    getCatalog: function(domain, lang, doFallback) {
        /** @type Object */
        var domainLangs = this._catalogs[domain];
        if (domainLangs) {
            doFallback = doFallback === false;

            var langCodeBits = this._normalizeLangCode(lang, true);
            var numLangCodeBits = langCodeBits.length;
            do {
                lang = langCodeBits.join("-");
                if (domainLangs.hasOwnProperty(lang)) {
                    return domainLangs[lang];
                }

                langCodeBits.length = numLangCodeBits = (numLangCodeBits -= 1);
            } while (doFallback && numLangCodeBits);
        }

        return null;
    },

    /**
     * Removes a catalog from the library.
     *
     * @param {string} domain The name of the desired domain.
     * @param {string} lang The language code for the desired language.
     */
    removeCatalog: function(domain, lang) {
        lang = this._normalizeLangCode(lang);
        var catalogs = this._catalogs;
        if (catalogs && catalogs[domain]) {
            delete catalogs[domain][lang];
        }
        return this;
    },

    /**
     * Adds a catalog for a given domain / language code combination.
     *
     * @param {string} domain The textdomain name.
     * @param {string} lang The language code.
     * @param {Object} data An object representing the catalog.
     */
    setCatalog: function(domain, lang, data) {
        lang = this._normalizeLangCode(lang);
        var catalogs = this._catalogs;
        if (!catalogs.hasOwnProperty(domain)) {
            catalogs[domain] = {};
        }
        catalogs[domain][lang] = new gettext.Catalog(data);
        return this;
    },

    /**
     * @param {string} langCode
     */
    _normalizeLangCode: function(langCode, doReturnArray) {
        var bits = langCode.toLowerCase().split("_");
        return doReturnArray ? bits : bits.join("-");
    }
};
