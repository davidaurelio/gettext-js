foounit.require(':spec/spec-helper');
typeof gettext == 'undefined' && foounit.load(':src/gettext');
foounit.load(':src/gettext/pocatalog');
foounit.load(':spec/testutils');
foounit.load(':spec/jsv');

describe('PO file parsing', function() {
    var catalogSchema;
    testutils.getTextfile('../catalog-schema.json', 'utf-8', function(error, data) {
        if (error) {
            throw error;
        }
        catalogSchema = JSON.parse(data);
    });

    describe('default PO-file with comments', function() {
        var catalog, sparseCatalog;
        before(function() {
            testutils.getTextfile('lang/de/LC_MESSAGES/simple.po', 'utf-8', function(error, pofile) {
                if (error) {
                    throw error;
                }
                catalog = gettext.pocatalog.parse(pofile);
                sparseCatalog = gettext.pocatalog.parse(pofile, true);
            });
        });

        function isReady() {
            expect(catalogSchema).toNot(beUndefined);
            expect(catalog).toNot(beUndefined);
        }

        it('parses into a valid structure', function() {
            waitFor(isReady);
            run(function() {
                var env = JSV.createEnvironment();
                expect(env.validate(catalog, catalogSchema).errors.length).to(be, 0);
                expect(env.validate(sparseCatalog, catalogSchema).errors.length).to(be, 0);
            });
        });

        it('has messages from the original PO file', function() {
           waitFor(isReady);
           run(function() {
                expect("This is a message" in catalog.messages).to(beTrue);
                expect("This is a message" in sparseCatalog.messages).to(beTrue);
                expect(catalog.messages["This is another message"][1]).to(be, "Dies sind andere Nachrichten");
                expect(sparseCatalog.messages["This is another message"][1]).to(be, "Dies sind andere Nachrichten");
                expect(catalog.messages["This contains \u2026 unicode."][0]).to(be, "Das hier enthält \u2026 Unicode.");
                expect(sparseCatalog.messages["This contains \u2026 unicode."][0]).to(be, "Das hier enthält \u2026 Unicode.");
            });
        });

        it('has the correct plural function entry', function() {
            waitFor(isReady);
            run(function() {
                expect(catalog.plural).to(be, 'nplurals=2; plural=(n != 1);');
                expect(sparseCatalog.plural).to(be, 'nplurals=2; plural=(n != 1);');
            });
        });
    });

    describe('sparse PO-file without comments', function() {
        var catalog, sparseCatalog;
        before(function() {
            testutils.getTextfile('lang/de/LC_MESSAGES/sparse.po', 'utf-8', function(error, pofile) {
                if (error) {
                    throw error;
                }
                catalog = gettext.pocatalog.parse(pofile);
                sparseCatalog = gettext.pocatalog.parse(pofile, true);
            });
        });

        function isReady() {
            expect(catalogSchema).toNot(beUndefined);
            expect(catalog).toNot(beUndefined);
        }

        it('parses into a valid structure', function() {
            waitFor(isReady);
            run(function() {
                var env = JSV.createEnvironment();
                expect(env.validate(catalog, catalogSchema).errors.length).to(be, 0);
                expect(env.validate(sparseCatalog, catalogSchema).errors.length).to(be, 0);
            });
        });

        it('has messages from the original PO file', function() {
           waitFor(isReady);
           run(function() {
                expect("This is a message" in catalog.messages).to(beTrue);
                expect("This is a message" in sparseCatalog.messages).to(beTrue);
                expect(catalog.messages["This is another message"][1]).to(be, "Dies sind andere Nachrichten");
                expect(sparseCatalog.messages["This is another message"][1]).to(be, "Dies sind andere Nachrichten");
                expect(catalog.messages["This contains \u2026 unicode."][0]).to(be, "Das hier enthält \u2026 Unicode.");
                expect(sparseCatalog.messages["This contains \u2026 unicode."][0]).to(be, "Das hier enthält \u2026 Unicode.");
            });
        });
    });


});
