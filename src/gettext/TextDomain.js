(function(gettext) {
    function defaultPluralFunc(n){
        return +(n != 1);
    }

    function TextDomain() {
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
