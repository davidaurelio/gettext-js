(function(shellArgs) {
    var fileName = shellArgs[0];
    if (!fileName) {
        throw new Error("Please specify a file name as argument.");
    }

    var fileContents = readFile(fileName);
    load("../src/3rdparty/json.js", "../src/gettext/po.js");

    var po = gettext.po.parse(fileContents);
    print(po.toJSON());
}(arguments));
