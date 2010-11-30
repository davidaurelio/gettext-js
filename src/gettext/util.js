/** @requires gettext */

gettext.util = {
    bind: function(context, func) {
        return function() {
            return func.apply(context, arguments);
        };
    }
};
