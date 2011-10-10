var testutils = {
    getTextfile: function(path, encoding, callback) {
        if (typeof encoding != 'string') {
            callback = encoding;
            encoding = void 0;
        }

        switch (foounit.hostenv.type) {
            case 'node':
                testutils.getTextfileNode(path, encoding, callback);
                break;

            case 'browser':
                testutils.getTextfileBrowser(path, encoding, callback);
                break;

            default:
                throw Error('Unknown environment: ' + foounit.hostenv.type);
        }
    },

    getTextfileBrowser: function(path, encoding, callback) {
        var x = new XMLHttpRequest();
        x.overrideMimeType('text/plain;charset=' +
                            (encoding ? encoding : 'x-user-defined'));
        x.open('GET', path);
        x.onreadystatechange = function() {
            if (this.readyState == 4) {
                var error = /^[23]/.test(this.status) ? null : Error(this.status);
                callback(error, this.responseText);
            }
        }
        x.onerror = function() {;
            callback(Error("connection error"));
        };
        x.send();
        x = null;
    },

    getTextfileNode: function(path, encoding, callback) {
        path = foounit.translatePath(':spec/' + path);
        var fs = foounit.require('fs');
        fs.readFile(path, encoding, callback);
    },

    keys: Object.keys || function(object) {
        if (typeof object != 'object') {
            throw TypeError("Object.keys called on non-object");
        }
        var keys = [];
        for (var key in object) {
            if (object.hasOwnProperty(key)) {
                keys.push(key);
            }
        }

        return keys;
    }
};
