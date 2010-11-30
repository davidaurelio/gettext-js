/**
 * @requires {gettext.TextDomain}
 */

/**
 * @constructor
 * @param {Function} funcLoader A function responsible of retrieving message catalogs.
 * @param {Object} [options] Configuration options for the store.
 */
gettext.Store = function(funcLoader, options) {
    this.load = funcLoader;
    this.lang = null;
    this._catalogs = {};

    this._langFallback = !!options.langFallback;
};

gettext.Store.prototype = {
    _rePluralFunc: /plural[ \v\t\f]*=((?:n?[*?:+-\/%=!|<>&^,\s()0-9]+)*n?)\s*;?\s*$/,

    bindTextDomain: function(domainName) {
        return new gettext.TextDomain(domainName, this);
    },

// ---------------------------------------------------------- MESSAGE RETRIEVAL

    getMessage: function(domain, lang, context, singular, plural, n, options) {
        lang = lang || this.lang;
        if (!lang) {
            throw new Error("No language code has been passed or been set on the textdomain.");
        }

        var catalog, domainLangs = this._catalogs[domain];
        if (domainLangs) {
            var doFallback = this._doFallback;

            var langCodeBits = this._normalizeLangCode(lang, true);
            var numLangCodeBits = langCodeBits.length;
            do {
                lang = langCodeBits.join("-");
                if (domainLangs.hasOwnProperty(lang)) {
                    catalog = domainLangs[lang];
                    break;
                }

                langCodeBits.length = (numLangCodeBits -= 1);
            } while (doFallback && numLangCodeBits);

            if (catalog) {
                var messages = catalog.messages;
                var msgid = null == context ? // null or undefined
                    singular : context + "\x04" + singular;

                if (messages.hasOwnProperty(msgid)) {
                    var idx = catalog.pluralFunc(n);
                    var message = messages[msgid][idx];
                    return message != null ? // null or undefined
                        message : (idx === 0 ? singular : messages[msgid][0]);
                }
            }
        }

        return n === 1 ? singular : plural;
    },

// --------------------------------------------------------- CATALOG MANAGEMENT

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
        catalogs[domain][lang] = {
            messages: data.msg || {},
            pluralFunc: this._createPluralFunc(data.plural)
        };
        return this;
    },

    /**
     * Creates a gettext plural function.
     *
     * Creates a function from a string. The string represents an arithmetic
     * expression and may only consist of Numbers, operators, and the
     * variable `n`.
     *
     * @param {string} [pluralForms] A string containing an arithmetic
     *      expression. Leave empty to use default plural function.
     * @returns {Function}
     */
    _createPluralFunc: function(pluralForms) {
        var match = this._rePluralFunc.exec(pluralForms);
        if (match) {
            try {
                return new Function("n", "return (" + match[1] + ") >> 0");
                // "(expr) >> 0" casts to number and might be more efficient
                // than "Number(expr)"
            } catch(e) {
                throw new Error("Could not parse plural function: " + match[1]);
            }
        }

        return this._defaultPluralFunc;
    },

    /**
     * The default plural function represents english plural rules and supports
     * one plural form.
     *
     * @param {number} n The number of things.
     * @return {number} The index of the plural form to use.
     */
    _defaultPluralFunc: function(n) {
        return n === 1 ? 0 : 1;
    },

// ---------------------------------------------------------------------- UTILS

    /**
     * @param {string} langCode
     */
    _normalizeLangCode: function(langCode, doReturnArray) {
        var bits = langCode.toLowerCase().split("_");
        return doReturnArray ? bits : bits.join("-");
    }
};
