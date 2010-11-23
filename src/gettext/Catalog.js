gettext.Catalog = function(data) {
    /** @type {Object} */
    this._messages = data.msg;
    this._setPluralFunction(data.plural);
}

gettext.Catalog.prototype = {
    getMessage: function(msgctxt, msgid, msgid_plural, n) {
        var messages = this._messages;
        n = this._pluralFunc(n);

        if (null !== msgctxt && typeof msgctxt !== "undefined") {
            msgid = msgctxt + "\x04" + msgid;
        }

        if (messages && messages.hasOwnProperty(msgid)) {
            return messages[msgid][n];
        }

        return n === 0 ? msgid : msgid_plural;
    },

    _pluralFunc: function(n) {
        return n === 1 ? 0 : 1;
    },

    _setPluralFunction: function(pluralForms) {
        var match = /plural[ \v\t\f]*=(.*);/.exec(pluralForms);
        if (match) {
            try {
                this._pluralFunc = new Function("n", "return (" + match[1] + ") >> 0");
                // "(expr) >> 0" casts to number and might be more efficient
                // than "Number(expr)"
            } catch(e) {
                throw new Error("Could not parse plural function: " + match[1]);
            }
        }
        else {
            delete this._pluralFunc;
        }
    }
};
