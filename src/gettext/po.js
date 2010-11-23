/**
 * This file contains functionality to parse, build, and serialize PO(T) files.
 * Supported serialization formats are PO(T) and JSON.
 *
 * @author David Aurelio <dev@david-aurelio.com>
 */

var gettext = gettext || {};

/**
 * Contains functionality to parse, build and serialize PO(T) files.
 *
 * - gettext.po.parse() parses a sting in PO file format
 * - gettext.po.File and gettext.po.Entry can be used to build a PO file
 *   structure.
 * - gettext.po.File.toJSON returns JSON data for use with gettext.translate.*
 *
 * @namespace
 */
gettext.po = {};


/**
 * Comment types used in PO(T) files.
 *
 * @type Array
 */
gettext.po.commentTypes = [
    [ " ", "translatorComments", /# (.*)/ ],
    [ ". ", "extractedComments", /#[.][ ]?(.*)/ ],
    [ ": ", "references", /#:[ ]?(.*)/ ],
    [ ", ", "flags", /#,[ ]?(.*)/],
    [ "| ", "previous", /#[|][ ]?(.*)/ ]
];
gettext.po.commentTypes[" "] = gettext.po.commentTypes[0];
gettext.po.commentTypes["."] = gettext.po.commentTypes[1];
gettext.po.commentTypes[":"] = gettext.po.commentTypes[2];
gettext.po.commentTypes[","] = gettext.po.commentTypes[3];
gettext.po.commentTypes["|"] = gettext.po.commentTypes[4];


/* ------------------------------------------ ESCAPING/UNESCAPING OF STRINGS */
(function(po) {
    var escapes = [
        [ "\\", "\\\\" ], // needs to be the first entry to avoid improper replaces
        [ "\n", "\\n" ],
        [ "\t", "\\t" ],
        [ '"', '\\"' ],

        // The following chars make xgettext throw warnings, but are supported
        [ "\v", "\\v" ],
        [ "\b", "\\b" ],
        [ "\r", "\\r" ],
        [ "\f", "\\f" ],
        [ "\u0007", "\\a" ]
    ];

    /**
     * Escapes a string for use in PO(T) files
     *
     * @param {String}
     * @returns {String}
     */
    po.escapeStr = function(str) {
        var escaped = "" + str;

        for (var i = 0, pair, from, to; (pair = escapes[i]); i += 1) {
            from = pair[0];
            to = pair[1];
            while (escaped.indexOf(from) !== -1) {
                escaped = escaped.replace(from, to);
            }
        }

        return escaped;
    };

    /**
     * Unescapes a string extracted from a PO(T) file
     *
     * @param {String}
     * @returns {String}
     */
    po.unescapeStr = function(str) {
        var unescaped = "" + str;

        for (var i = 0, pair, from, to; (pair = escapes[i]); i += 1) {
            from = pair[1];
            to = pair[0];
            while (unescaped.indexOf(from) !== -1) {
                unescaped = unescaped.replace(from, to);
            }
        }

        return unescaped;
    };
}(gettext.po));


/* -------------------------------------------------- CLASSES / CONSTRUCTORS */
(function(po) {
    /**
     * Represents a PO(T) file. Can be serialized to PO format and JSON.
     *
     * @class
     */
    po.File = function() {
        this.entries = [];
        this.meta = {};
        this.comment = "";
    };

    /**
     * Adds an entry to the file, with special treatment for the meta entry
     *
     * @param {gettext.po.Entry} The entry to add.
     * @returns {gettext.po.File}
     */
    po.File.prototype.addEntry = function(entry) {
        if (entry.isMeta()) {
            this.setMetaFromEntry(entry);
        }
        else {
            this.entries.push(entry);
        }

        return this;
    };

    /**
     * Sets the metadata of the file from a {@link gettext.po.Entry}
     *
     * @param {gettext.po.Entry} The entry that contains metadata.
     * @returns {gettext.po.File}
     */
    po.File.prototype.setMetaFromEntry = function(entry) {
        var meta = entry.msgstr[0].replace(/^\n+|\n+$/, "").split("\n");

        // comments
        this.comment = entry.getCommentString();

        // meta
        for (var i = 0, iLen = meta.length, m, name; i < iLen; i += 1) {
            if (meta[i].indexOf(": ") === -1) {
                throw new Error("Illegal meta entry: " + m);
            }

            m = meta[i].split(": ");
            name = m.shift();
            this.meta[name] = m.join(": ");
        }

        return this;
    };

    /**
     * Serializes the file to PO file format.
     *
     * @returns {String}
     */
    po.File.prototype.toString = function() {
        var out = [];

        // comment
        if (this.comment) {
            out.push(this.comment);
        }

        // metadata
        out.push('msgid ""');
        out.push('msgstr ""');
        for (var name in this.meta) {
            out.push('"' + name + ': ' + po.escapeStr(this.meta[name]) + '\\n"');
        }

        // entries
        out.push("");
        out = out.concat(this.entries);

        return out.join("\n");
    };


    /**
     * Serializes the file to JSON.
     *
     * The JSON format returned can be used with {@link gettext.translate}.
     *
     * @returns {String}
     */
    po.File.prototype.toJSON = function() {
        var catalog = { plural : this.meta["Plural-Forms"] || null, msg : {} };

        for (var i = 0, entry, msgid; (entry = this.entries[i]); i += 1) {
            if  (entry.msgctxt == null) { // null or undefined
                msgid = entry.msgid;
            }
            else {
                msgid = entry.msgctxt + "\x04" + entry.msgid;
            }

            catalog.msg[msgid] = entry.msgstr;
        }

        return JSON.stringify(catalog);
    }

    /**
     * Represents a PO(T) file message entry.
     *
     * @class
     */
    po.Entry = function() {
        /**
         * Comments added by the translator
         * @type Array
         */
        this.translatorComments = [];

        /**
         * Comments extracted from the original source code.
         *
         * Extracted comments are hints for the translator.
         * @type Array
         */
        this.extractedComments = [];

        /**
         * Locations of the message in the source code.
         * @type Array
         */
        this.references = [];

        /**
         * Flags describing the interpolation format used in the message, and
         * whether the message is fuzzy.
         * @type Array
         */
        this.flags = [];

        /**
         * The previous untranslated string, after the programmer has
         * made changes.
         * @type Array
         */
        this.previous = [];

        /**
         * The context of the message.
         *
         * Note: no message context (null) is different from an empty message
         * context (empty string) in gettext.
         *
         * @type String|null
         */
        this.msgctxt = null;

        /**
         * The message used in the source code.
         * @type String
         */
        this.msgid = "";

        /**
         * The plural message used in the source code.
         *
         * This property is only used if the message has a plural version
         *
         * @type String
         */
        this.msgid_plural = null;

        /**
         * The translation of the message.
         *
         * Always an array, even when only the singular form is translated
         *
         * @type Array
         */
        this.msgstr = [];
    };

    /**
     * Returns whether the message has a pluralized version.
     *
     * @returns {Boolean}
     */
    po.Entry.prototype.isPlural = function() {
        return this.msgid_plural !== null;
    };

    /**
     * Returns whether the entry is a meta entry
     *
     * @returns {Boolean}
     */
    po.Entry.prototype.isMeta = function() {
        return this.msgid === "";
    };

    /**
     * Returns a property of the entry.
     *
     * This method is primarily used by {@link gettext.po.parse}.
     *
     * @param {String} name The name of the property to return.
     * @param {Number} [id] If the property is an array, only the index given
     *                      will be returned.
     */
    po.Entry.prototype.get = function(name, idx) {
        idx = parseInt(idx, 10);
        if (this.hasOwnProperty(name)) {
            if (this[name] && this[name].constructor == Array && !isNaN(idx)) {
                return this[name][idx];
            }
            else {
                return this[name];
            }
        }
        else {
            throw new Error("Unknown entry property: " + name);
        }
    };

    /**
     * Sets a property of the entry.
     *
     * This method is primarily used by {@link gettext.po.parse}.
     *
     * @param {String} name The name of the property to set.
     * @param {Number} [idx] Required, if the property is an array.
     * @param {String} value The value to set the property to.
     */
    po.Entry.prototype.set = function(name, idx, value) {
        // normalize arguments
        if (arguments.length === 2) {
            value = idx;
            idx = undefined;
        }
        else if (arguments.length > 2) {
            idx = idx || 0;
        }
        idx = parseInt(idx, 10);

        if (this.hasOwnProperty(name)) {
            if (this[name] && this[name].constructor == Array) {
                if (isNaN(idx)) {
                    throw new TypeError(name + " is an array, therefore the idx parameter is required");
                }
                this[name][idx] = value;
            }
            else {
                this[name] = value;
            }
        }
        else {
            throw new Error("Unknown entry property: " + name);
        }
    };

    /**
     * Appends a value to a property of the entry.
     *
     * This method is primarily used by {@link gettext.po.parse}.
     *
     * @param {String} name The name of the property to which to append.
     * @param {Number} [idx] Required, if the property is an array.
     * @param {String} value
     */
    po.Entry.prototype.append = function(name, idx, value) {
        // normalize arguments
        if (arguments.length === 2) {
            value = idx;
            idx = undefined;
        }
        else if (arguments.length > 2) {
            idx = idx || 0;
        }
        idx = parseInt(idx, 10);

        var existing = this.get(name, idx) || "";
        this.set(name, idx, existing + value);

        return this;
    };

    /**
     * Returns all entry comments in PO file format.
     *
     * @returns {String}
     */
    po.Entry.prototype.getCommentString = function() {
        var out = [];

        var prefix, name;
        for (var i=0, commentType; (commentType = gettext.po.commentTypes[i]); i += 1) {
            prefix = "#" + commentType[0];
            name = commentType[1];

            if (this[name].length) {
                out.push(prefix + this[name].join("\n" + prefix));
            }
        }

        return out.join("\n");
    };

    /**
     * Returns the entry in PO file format
     *
     * @returns {String}
     */
    po.Entry.prototype.toString = function() {
        var props = [ "msgctxt", "msgid", "msgid_plural" ],
            out = [ this.getCommentString() ];

        for (var i = 0, name; name = props[i]; i += 1) {
            if (this[name] !== null) {
                out.push(name + ' "' + po.escapeStr(this[name]) + '"');
            }
        }

        var strCount = this.msgstr.length;
        if (strCount > 1) {
            for (var i = 0; i < strCount; i += 1) {
                out.push("msgstr[" + i + '] "' + po.escapeStr(this.msgstr[i]) + '"');
            }
        }
        else {
            out.push('msgstr "' + po.escapeStr(this.msgstr[0]) + '"');
        }

        out.push("");

        return out.join("\n");
    };
}(gettext.po));


/* --------------------------------------------------- MAIN PARSING FUNCTION */
(function(po){
    var reLines = /[ \f\t\v]*(?:\r\n?|\n)[ \f\t\v]*/;

    var entryParts = {
        COMMENTS : 1,
        DATA : 2
    };

    var entryProps = [
        /^(msgctxt)\s+"(.*)"$/,
        /^(msgid)\s+"(.*)"$/,
        /^(msgid_plural)\s+"(.*)"$/,
        /^(msgstr)(?:\[(\d+)\])?\s+"(.*)"$/
    ];


    /**
     * Parses a string in PO file format.
     *
     * @methodOf gettext.po
     * @param {String} source A string in PO file format
     * @returns {gettext.po.File}
     * @throws {Error}
     */
    po.parse = function(source) {
        // split into lines w/content, clearing leading + trailing whitespace
        var lines = source.split(reLines),
            file = new po.File(),
            entry = new po.Entry(),
            entryPart = entryParts.COMMENTS;

        if (lines.length == 1 && !lines[0]) {
            return file;
        }

        // parse lines
        for (var i = 0, iLen = lines.length, dataArgs = null, line; i < iLen; i += 1) {
            line = lines[i];

            if (!/\S/.test(line)) {
                continue; // empty line
            }

            else if (line.slice(0, 2) === "#~") { //TODO: Add support for obsolete entries
                continue;
            }

            else if (line.charAt(0) === "#") {

                // a comment following a line of data means that a new entry begins
                if (entryPart === entryParts.DATA) {
                    file.addEntry(entry);
                    entry = new po.Entry();
                    dataArgs = null;
                    entryPart = entryParts.COMMENTS;
                }

                // empty comment line
                if (line === "#") {
                    entry.translatorComments.push("");
                }
                else {
                    var commentType = gettext.po.commentTypes[line.charAt(1)];

                    if (typeof commentType === "undefined") {
                        throw new Error("Unknown comment start on line " + (i+1) + ": " + line);
                    }

                    var propName = commentType[1],
                        reMatch = commentType[2];

                    entry[propName].push(line.match(reMatch)[1]);
                }
            }

            // message data
            else if (line.slice(0, 3) === "msg") {
                var valid = false;
                entryPart = entryParts.DATA;

                for (var j = 0, re, match; (re = entryProps[j]); j += 1) {
                    if ((match = line.match(re))) {
                        dataArgs = match.slice(1);
                        valid = true;

                        dataArgs.push(po.unescapeStr(dataArgs.pop()));
                        entry.set.apply(entry, dataArgs);
                        break;
                    }
                }

                if (!valid) {
                    throw new Error("Illegal PO format on line " + (i + 1));
                }
            }
            else if (line.charAt(0) == '"' && line.slice(-1) == '"' && dataArgs) {
                dataArgs[dataArgs.length-1] = po.unescapeStr(line.slice(1, -1));
                entry.append.apply(entry, dataArgs);
            }
            else {
                throw new Error("Illegal PO format on line " + (i + 1));
            }
        }

        file.entries.push(entry);

        return file;
    };
}(gettext.po));
