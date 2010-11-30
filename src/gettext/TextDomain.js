/** @requires gettext */

/**
 */
gettext.TextDomain = function(name, store) {
    /**
     * The name of the domain. This property should be considered read-only.
     *
     * @type {String}
     */
    this.name = name;

    /**
     * The store to use for message retrieval. This property should be
     * considered read-only.
     *
     * @type {gettext.Store}
     */
    this.store = store;

    /**
     * The language to retrieve. Defaults to the language of the store,
     * but can be overridden.
     *
     * @type String
     */
    this.lang = null;

    var bind = gettext.util.bind, p = gettext.TextDomain.prototype; // arguments.callee.prototype ?
    for (var i = 0, method; (method = this._toBind[i]); i++) {
        this[method] = bind(this, p[method]);
    }
};

gettext.TextDomain.prototype = {
    /**
     * @type {String[]} Names of methods that will be bound to each instance
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
    }
};
