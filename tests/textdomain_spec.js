foounit.require(':spec/spec-helper');
foounit.load(':src/gettext');
foounit.load(':src/gettext/TextDomain');

// Include your source file here
// foounit.load(':src/example.js');     // loads a file in global scope
// foounit.require(':src/example.js');  // loads a file in functional scope

describe('basic gettext.translation()', function() {
	var translation;
	before(function() {
		translation = gettext.translation();
	})

	// check basic usage of translation object: gettext() method
	it('.gettext() returns a string', function() {
		expect(typeof translation.gettext("foo")).to(be, 'string');
	});

	// check whether `gettext()` returns the same string
	it('.gettext("foo") returns "foo"', function() {
		expect(translation.gettext("foo")).to(be, 'foo');
	});

	// check whether `gettext()` returns the same string when called with a context
	it('.gettext("context", "foo") returns "foo"', function() {
		expect(translation.gettext("context", "foo")).to(be, 'foo');
	});


	// check basic usage of translation object: ngettext() method
	it('.ngettext() returns a string', function() {
		expect(typeof translation.ngettext("foo", "foos", 1)).to(be, 'string');
	});

	it('.ngettext("foo", "foos", 0) returns "foos"', function() {
		expect(translation.ngettext('foo', 'foos', 0)).to(be, 'foos');
	});

	it('.ngettext("foo", "foos", 1) returns "foo"', function() {
		expect(translation.ngettext('foo', 'foos', 1)).to(be, 'foo');
	});

	it('.ngettext("foo", "foos", 2) returns "foos"', function() {
		expect(translation.ngettext('foo', 'foos', 2)).to(be, 'foos');
	});
});

