(function(/**gettext.TextDomain.prototype*/tdp){
    tdp.LazyTranslation = function(domain, args) {
        this._domain = domain;
        this._args = args;
    };

    tdp.LazyTranslation.prototype.toString = function() {
        var domain = this._domain;
        return domain.ngettext.apply(domain, this._args);
    };

    tdp._toBind.push("gettextLazy", "ngettextLazy");

    /**
     * @param {String} [context] The context of the message
     * @param {String} message The message to translate
     * @param {Object} [options] Options
     * @returns {String}
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
     * @param {String} [context] The context of the message
     * @param {String} singularMsg The singular message to translate
     * @param {String} pluralMsg The plural message to translate
     * @param {Number} n
     * @param {Object} [options] Options
     * @returns {String}
     */
    tdp.ngettextLazy = function() {
        return new this.LazyTranslation(this, arguments);
    };
}(gettext.TextDomain.prototype));
