(function(gettext) {
    function defaultPluralFunc(n){
        return +(n != 1);
    }

    var environment = (function(possible){
        for (var i = 0, env, to; (env = possible[i++]) && (to = possible[i++]); ) {
            if (to != 'undefined') {
                return env;
            }
        }

        if (console && console.warn) {
            console.warn('Unknown environment; no default loader for gettext catalogs.');
        }
        return 'unknown';
    }([
        'browser', typeof window,
        'node', typeof global
    ]));

    var language = (function(name) {
        var lang, env;

        // detect node.js
        if (this.process && (env = this.process.env) && "LANG" in env) {
            lang = env.LANG;
        }

        // detect browser
        else if (this.navigator && "language" in this.navigator) {
            lang = this.navigator.language;
        }

        // get language code
        lang && (lang = /^([a-z]{2,3})(?:[_-]([a-z]{2,3}))?$/i.exec(lang));

        if (lang) {
            lang = lang[1].toLowerCase() + (lang[2] ? '_' + lang[2].toUpperCase() : '');
        }

        return;
    }());

    gettext.getLang = function() {
        return language;
    };

    gettext.setLang = function(lang) {
        language = lang;
    };

    function TextDomain(lang, loader) {
        loader || (loader == defaultLoader);
    }

    TextDomain.prototype = {
        gettext: function(context, message) {
            // argument normalization
            switch(arguments.length) {
                case 0:
                    throw TypeError("gettext takes at least 1 argument");
                break;

                case 1:
                    message = context;
                    context = null;
                break;
            }

            return message;
        },

        ngettext: function(context, singular, plural, n) {
            // argument normalization
            switch(arguments.length) {
                case 0:
                case 1:
                case 2:
                    throw TypeError("ngettext takes at least 3 arguments");
                break;

                case 3:
                    n = plural;
                    plural = singular;
                    singular = context;
                    context = null;
                break;
            }

            return defaultPluralFunc(n) ? plural : singular;
        }
    };

    gettext.TextDomain = TextDomain;
    gettext.translation = function(name) {
        return new TextDomain(name);
    }

}(gettext));
