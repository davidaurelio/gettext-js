(function(gettext){
var escapes = [
    "\\", "\\\\", // needs to be the first entry to avoid improper replaces
    "\n", "\\n",
    "\t", "\\t",
    '"', '\\"',

    // The following chars make xgettext throw warnings, but are supported
    "\v", "\\v",
    "\b", "\\b",
    "\r", "\\r",
    "\f", "\\f",
    "\u0007", "\\a"
];

var escapeREs = [
    /\\/g, /\\\\/g, // needs to be the first entry to avoid improper replaces
    /\n/g, /\\n/g,
    /\t/g, /\\t/g,
    /"/g, /\\"/g,

    // The following chars make xgettext throw warnings, but are supported
    /\v/g, /\\v/g,
    /\b/g, /\\b/g,
    /\r/g, /\\r/g,
    /\f/g, /\\f/g,
    /\u0007/g, /\\a/g
];

/**
 * Escapes a string for use in PO(T) files
 *
 * @param {string} string The string to be escaped.
 * @returns {string} The escaped string.
 */
function escape(string) {
    string += "";
    var i = 0, from, to;
    while((from = escapeREs[i++]) && (to = escapes[i++])){
        string = string.replace(from, to);
    }

    return string;
}

/**
 * Unescapes a string extracted from a PO(T) file.
 *
 * @param {string} string The string to be unescaped.
 * @returns {string} The unescaped string.
 */
function unescape(string) {
    string += "";
    var i = 0, from, to;
    while((to = escapes[i++]) && (from = escapeREs[i++])){
        string = string.replace(from, to);
    }

    return string;
}

var commentTypes = {
    '.': 'extractedComments',
    ',': 'flags',
    '|': 'previous',
    ':': 'references'
};

gettext.pocatalog = {
    /**
     * Parses the contents of a po file into an object.
     *
     * The object structure is described in the file 'catalog-schema.json'.
     *
     * @param {string} pofile The contents of a .po file as string.
     * @param {boolean} sparse Whether to produce a sparse object, containing
     *                         only information needed at runtime.
     *                         The object will only contain the plural function
     *                         and message entries, which are represented by
     *                         simple arrays (singulars / plurals) without
     *                         meta data.
     * @returns {Object} A message catalog as object.
     */
    parse: function(pofile, sparse) {
        // split into single lines and remove leading whitespace in each line
        pofile = pofile.replace(/^\s+/, '').split(/(?:\r?\n)[ \f\t\v]*/);

        var catalog = {messages: {}};
        if (!sparse) {
            catalog.meta = {};
        }
        var entry, msgid = [/* 0: context, 1: singular */], state, hasMeta;
        var dataType, lastDataType, lastMsgStrIndex, match, data;

        /** @const */
        var STATE_CLEAN = 0;

        /** @const */
        var STATE_COMMENTS = 1;

        /** @const */
        var STATE_DATA = 2;

        function finishEntry() {
            // if we have a singular message, add the entry
            if (msgid[1]) {
                var key = 0 in msgid ? msgid.join('\x04') : msgid[1];
                catalog.messages[key] = entry;
            }
            // empty message id --> meta entry
            else if (msgid[1] == "" && !hasMeta) {
                hasMeta = true;
                var lines = entry[0].split('\n');

                for (var j = 0, line; (line = lines[j++]); ) {
                    line = line.split(':');
                    if (line.length == 1) {
                        throw Error("Illegal PO format on line " + (i + 1));
                    }
                    var key = line.shift();
                    line = line.join(":").replace(/^\s+/, '');
                    if (key == "Plural-Forms") {
                        catalog.plural = line;
                    }
                    else if (!sparse) {
                        catalog.meta[key] = line;
                    }
                }
            }

            entry = sparse ? [] : {};
            lastDataType = '';
            state = STATE_CLEAN;
            msgid.length = lastMsgStrIndex = 0;
        }

        for (var i = 0, len = pofile.length; i < len; i++) {
            var line = pofile[i];
            if (!/\S/.test(line)) { // empty line, skip
                continue;
            }

            if (/^#~/.test(line)) { //TODO: add support for obsolete entries
                finishEntry(); // just start a new entry for now
            }

            // comments
            if (line.charAt(0) == '#') {
                // if no comments precede, the current entry is finished
                if (state != STATE_COMMENTS) {
                    // initialize new entry
                    finishEntry();

                    state = STATE_COMMENTS;
                }

                if (sparse) { // no meta data is added when sparse is requested
                    continue;
                }

                var commentType = line.charAt(1);
                var idx = commentType in commentTypes ? 2 : 1;
                var comment = line.slice(idx).replace(/^\s+/, '');
                if(commentType in commentTypes){
                    var property = commentTypes[commentType];
                    (entry[property] || (entry[property] = [])).push(comment);
                }
                else if ('translatorComments' in entry) {
                    entry.translatorComments += '\n' + comment;
                }
                else {
                    entry.translatorComments = comment;
                }
            }

            // message data
            else if ((match = /^msg(ctxt|id|id_plural|str)(?:\[(\d+)\])?\s+"(.*)"\s*$/.exec(line))) {
                dataType = match[1];
                if (dataType == 'ctxt' && state != STATE_COMMENTS ||
                    dataType == 'id' && lastDataType != 'ctxt') {

                    finishEntry();
                }
                lastDataType = dataType;
                state = STATE_DATA;
                data = unescape(match[3]);
                switch (dataType) {
                    case 'ctxt':
                        msgid[0] = data;
                        break;

                    case "id":
                        msgid[1] = data;
                        break;

                    case "id_plural":
                        // only keep track of the plural message for non-sparse format
                        if (!sparse) {
                            entry.msgid_plural = data;
                        }
                        break;

                    case "str":
                        lastMsgStrIndex = match[2] || 0;
                        entry[lastMsgStrIndex] = data;
                        break;

                    default:
                        throw Error("Illegal PO format on line " + (i + 1));
                        break;
                }
            }

            else if ((match = /^"(.*)"$/.exec(line))) {
                data = unescape(match[1]);
                if (state != STATE_DATA) {
                    throw Error("Illegal PO format on line " + (i + 1));
                }
                switch (lastDataType) {
                    case 'ctxt':
                        msgid[0] += data;
                        break;

                    case 'id':
                        msgid[1] += data;
                        break;

                    case 'id_plural':
                        entry.msgid_plural += data;
                        break;

                    case 'str':
                        entry[lastMsgStrIndex] += data;
                        break;

                    default:
                        throw Error("Illegal PO format on line " + (i + 1));
                        break;
                }
            }

            else {
                throw Error("Illegal PO format on line " + (i + 1));
            }
        }

        finishEntry();

        return catalog;
    },

    /**
     * Stringifies a catalog object.
     *
     * Turns an object conforming to the schema in 'catalog-schema.json' into
     * a string conforming to .po file format.
     *
     * @param {Object} catalog The catalog object.
     * @returns {string} A string in .po file format.
     */
    write: function(catalog) {

    }
}

}(gettext));
