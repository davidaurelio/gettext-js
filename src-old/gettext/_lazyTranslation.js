/**
 * This file adds support for lazy translations to gettext.TextDomain.
 *
 * @requires gettext.TextDomain
 */

(function(/**gettext.TextDomain.prototype*/tdp){
    /**
     * A lazy translation constructor.
     *
     * Lazy translations fetch the translation when converted to a string.
     * @param {TextDomain} domain The textdomain to use when retrieving the
     *      translation.
     * @param {Array|Arguments} The arguments to call ngettext with.
     */
    tdp.LazyTranslation = function(domain, args) {
        this._domain = domain;
        this._args = args;
    };

    /**
     * Fetches the translation.
     *
     * @returns {string}
     */
    tdp.LazyTranslation.prototype.toString = function() {
        var domain = this._domain;
        return domain.ngettext.apply(domain, this._args);
    };

    // add (n)gettextLazy to the functions to bind to each TextDomain
    tdp._toBind.push("gettextLazy", "ngettextLazy");

    /**
     * Same as gettext, but returns a LazyTranslation instead of a string.
     *
     * @param {String} [context] The context of the message
     * @param {String} message The message to translate
     * @param {Object} [options] Options
     * @returns {LazyTranslation}
     */
    tdp.gettextLazy = function(context, message, options) {
        // arguments normalization
        if (typeof options === "undefined") { // less than 3 args received
            if (typeof message !== "string") { // no context received
                message = context;
                options = message;
                context = null;
            }
        }

        return new this.LazyTranslation(this, [context, message, null, 1, options]);
    };

    /**
     * Same as ngettext, but returns a LazyTranslation instead of a string.
     *
     * @param {String} [context] The context of the message
     * @param {String} singularMsg The singular message to translate
     * @param {String} pluralMsg The plural message to translate
     * @param {Number} n The number of things to fetch the translation for.
     * @param {Object} [options] Options
     * @returns {LazyTranslation}
     */
    tdp.ngettextLazy = function() {
        return new this.LazyTranslation(this, arguments);
    };
}(gettext.TextDomain.prototype));
