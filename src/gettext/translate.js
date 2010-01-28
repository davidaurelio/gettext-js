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
     * @name gettext.translate.textdomain
     * @param {String} name The domain name
     * @param {gettext.translate.DomainStore} The store which is used to
     *      retrieve and load JSON catalogs.
     */
    t.Textdomain = function(name, store) {
        /**
         * The name of the domain. This property should be considered read-only.
         *
         * @type String
         */
        this.name = name;

        /**
         * The store to use for message retrieval. This property should be
         * considered read-only.
         *
         * @type gettext.translate.DomainStore
         */
        this.store = store;

        // scaffold the instance. can be used to create bound methods on the
        // instance, so that they can be aliased. E.g.:
        //      var _ = domain.gettext, n_ = domain.ngettext;
        for (var i = 0, fn; fn = t.Textdomain.scaffolders; i += 1) {
            fn(this);
        }
    };

    /**
     * Functions to scaffold newly created instances
     * of {@link gettext.translate.Textdomain}.
     *
     * Every scaffolding function will receive the instance as argument.
     *
     * @type Function[]
     */
    t.Textdomain.scaffolders = [

        // Adds bound “gettext” and “ngettext” methods to the instance.
        // Those will always be executed in the context of the instance
        function(domain) {
            domain.gettext = function() {
                return t.Textdomain.prototype.gettext.apply(domain, arguments);
            };

            domain.ngettext = function() {
                return t.Textdomain.prototype.ngettext.apply(domain, arguments);
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
        var argLen = arguments.length; // arguments lookup can be expensive
        if (argLen == 2 && typeof count == "object") { // no context
            options = message;
        }
        if (argLen == 1 || argLen == 2 && typeof count == "object") {
            message = context;
            context = null;
        }

        return this.store.getMessage(this.name, this.lang, context,
                                     message, "", 1, options);
    };

    /**
     * @param {String} [context] The context of the message
     * @param {String} singularMsg The singular message to translate
     * @param {String} pluralMsg The plural message to translate
     * @param {Number} n
     * @param {Object} [options] Options
     * @returns {String}
     */
    t.Textdomain.ngettext = function(context, singularMsg, pluralMsg,
                                     n, options) {
        // arguments normalization
        var argLen = arguments.length;
        if (argLen == 4 && typeof count == "object") { // no context
                options = count;
        }
        if (argLen == 3 || argLen == 4 && typeof count == "object") {
            count = pluralMsg;
            pluralMsg = singularMsg;
            singularMsg = context;
            context = null;
        }

        return this.store.getMessage(this.name, this.lang, context,
                                     singularMsg, pluralMsg, n, options);
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
     * @name gettext.translate.DomainStore
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

    /**
     * @returns {String}
     */
    t.DomainStore.prototype.getMessage = function(domain, lang, context,
                                                  singular, plural, n, options) {
        return "";
    }

}(gettext.translate));
