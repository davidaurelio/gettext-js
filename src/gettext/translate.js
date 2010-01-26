/**
 * This file contains the actual translation code and is work in progress.
 *
 * @author David Aurelio <dev@david-aurelio.com>
 */

var gettext = gettext || {};

/**
 * @namespace
 */
gettext.translate = {};

(function(t) {
    /**
     * Represents a single “text domain” / message catalog.
     *
     * @class
     * @param {String} name The domain name
     * @param {gettext.translate.DomainStore} The store which is used to
     *      retrieve and load JSON catalogs.
     */
    t.Textdomain = function(name, store) {

        // scaffold the instance. can be used to create bound methods on the
        // instance, so that they can be aliased. E.g.:
        //      var _ = domain.gettext, n_ = domain.ngettext;
        for (var i = 0, fn; fn = arguments.callee.scaffolders; i += 1) {
            fn(this, arguments.callee);
        }
    };

    /**
     * Functions to scaffold newly created {@link gettext.translate.Textdomain}
     * instances.
     *
     * Every function will receive two arguments: the Textdomain instance and
     * the Textdomain constructor function.
     *
     * @type {Function[]}
     */
    t.Textdomain.scaffolders = [

        // Adds bound “gettext” and “ngettext” methods to the instance.
        // Those will always be executed in the context of the instance
        function(domain, constructor) {
            domain.gettext = function() {
                return constructor.prototype.gettext.apply(domain, arguments);
            };

            domain.ngettext = function() {
                return constructor.prototype.ngettext.apply(domain, arguments);
            };
        }
    ];

    /**
     * @param {String} [context] The context of the message
     * @param {String} message The message to translate
     * @param {Object} [options] Options
     * @returns {String}
     */
    t.Textdomain.prototype.gettext = function(context, message, options) {
        // arguments normalization
        switch (true) {
            case arguments.length == 2 && typeof message == "object":
                options = arguments[1];
                // FALLTRHOUGH INTENDED!
            case arguments.length == 1:
                context = null;
                message = arguments[0];
                break;
        }

        //TODO
    };

    t.Textdomain.ngettext = function(context, singularMsg, pluralMsg,
                                           count, options) {
        // arguments normalization
        switch (true) {
            case arguments.length == 4 && typeof count == "object":
                options = arguments[4];
                // FALLTRHOUGH INTENDED!
            case arguments.length == 3:
                context = null;
                singularMsg = arguments[0];
                pluralMsg = arguments[1];
                count = arguments[2];
                break;
        };

        //TODO
    };


    /**
     * A domain store retrieves message catalogs and acts as a factory for
     * {@link gettext.translate.Textdomain} instances.
     *
     * The constructor receives a function as argument, which will be used
     * to load/open/retrieve catalog files for a certain domain name and
     * language.
     *
     * @class
     * @param {Function} fnLoad A function used to load and retrieve message
     *      catalogs. The loader function is supposed to forward the catalog
     *      to {@link gettext.translate.DomainStore#addCatalog}. This makes
     *      asynchronous catalog loading possible.
     */
    t.DomainStore = function(fnLoad) {
        /**
         * Loads a catalog/domain for the given domain name and language.
         *
         * @methodOf {gettext.translate.DomainStore}
         * @param {String} domainName The domain name of the catalog
         *      to retrieve.
         * @param {String} lang The language code of the catalog to retrieve.
         */
        this.loadCatalog = fnLoad;

        this._textdomains = [];

        //TODO
    };

    /**
     * @returns {gettext.translate.Textdomain}
     */
    t.DomainStore.prototype.textdomain = function(domainName) {
        //TODO

        this._textdomains.push(domain);
        return domain;
    };

    /**
     * Adds a catalog to the store.
     *
     * Fires a language change event and propagates it to all Textdomain
     * instances produced by {@link gettext.translate.DomainStore#textdomain}.
     *
     * @param {Object} catalog
     */
    t.DomainStore.prototype.addCatalog = function(catalog) {
        //TODO
    };

}(gettext.translate));
