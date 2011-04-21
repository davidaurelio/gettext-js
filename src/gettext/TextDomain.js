/** @requires gettext */

/**
 * @param {string} name The name of the text domain.
 * @param {Store} store The store to use to fetch catalogs.
 * @param {string} [lang] The language to provide translations for.
 * @param {Object} [options] Options. You can add oncatalogchange and
 *  oncatalogload handlers by passing an option object
 *
 */
gettext.TextDomain = function(name, store, lang, options) {
    if (typeof lang !== "string") {
        options = lang;
        lang = null;
    }

    /**
     * The name of the domain. This property should be considered read-only.
     *
     * @type {string}
     */
    this.name = name;

    /**
     * The store to use for message retrieval. This property should be
     * considered read-only.
     *
     * @type {gettext.Store}
     */
    this.store = store;

    var bind = gettext.util.bind, toBind = this._toBind;
    for (var i = 0, method; (method = toBind[i]); i++) {
        this[method] = bind(this, this[method]);
    }

    this._registerListeners(options);
    this.setLanguage(lang);
};

gettext.TextDomain.prototype = {
    /**
     * @type {string[]} Names of methods that will be bound to each instance
     */
    _toBind: ["gettext", "ngettext"],

    /**
     * @param {String} [context] The context of the message
     * @param {String} message The message to translate
     * @param {Object} [options] Options
     * @returns {String}
     */
    gettext: function(context, message, options) {
        // arguments normalization
        if (typeof options === "undefined") { // less than 3 args received
            if (typeof message !== "string") { // no context received
                message = context;
                options = message;
                context = null;
            }
        }

        return this.store.getMessage(this.name, this.lang, context,
                                     message, "", 1, options);
    },

    /**
     * @param {String} [context] The context of the message
     * @param {String} singularMsg The singular message to translate
     * @param {String} pluralMsg The plural message to translate
     * @param {Number} n
     * @param {Object} [options] Options
     * @returns {String}
     */
    ngettext: function(context, singularMsg, pluralMsg, n, options) {
        // arguments normalization
        if (typeof options === "undefined") { // less than 5 args received
            if (typeof n !== "number") { // if not a number, no context given
                singularMsg = context;
                pluralMsg = singularMsg;
                n = pluralMsg;
                options = n;
                context = null;
            }
        }

        return this.store.getMessage(this.name, this.lang, context,
                                     singularMsg, pluralMsg, n, options);
    },

    /**
     * @param {string|null} lang The language to provide translations for.
     */
    setLanguage: function(lang) {
        /**
         * The language to retrieve. Defaults to the language of the store,
         * but can be overridden.
         *
         * @type {string}
         */
        this.lang = lang = lang || null;
        return this.store.fetchCatalog(this.name, lang);
    },

    /**
     * @param {Object} [listeners] An object with listeners to register.
     * @param {Function} [listeners.onlangchange] An event listener.
     *      Will be fired for every new catalog that is beeing used by the
     *      TextDomain instance. Use this to react to language changes.
     * @param {Function} [listeners.onlangready] An event listener. Will be
     *      fired once as soon as the next catalog beeing loaded is ready.
     */
    _registerListeners: function(listeners) {
        if (typeof listeners !== "object") { return; }

    }
};
