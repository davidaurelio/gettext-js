/**
 * @requires {gettext.TextDomain}
 * @requires {gettext.CatalogLibrary}
 */

gettext.Store = function(funcLoader) {
    this.load = funcLoader;
    this.lang = null;
    this._catalogs = new gettext.CatalogLibrary();
};

gettext.Store.prototype = {
    bindTextDomain: function(domainName) {
        return new gettext.TextDomain(domainName, this);
    },

    getMessage: function(domain, lang, context, singular, plural, n, options) {
        lang = lang || this.lang;
        if (!lang) {
            throw new Error("No language code has been passed or been set on the textdomain.");
        }

        var catalog = this._catalogs.getCatalog(domain, lang);
        return catalog ?
            catalog.getMessage(context, singular, plural, n) :
            (n === 1 ? singular : plural);
    },

    setCatalog: function(domain, lang, data) {
        this._catalogs.setCatalog(domain, lang, data);
    }
};
