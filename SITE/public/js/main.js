/* Your code starts here */

var app = app || {};

app.main = (function() {
    var init = function() {
        console.log('app init');
        FastClick.attach(document.body);
        // app starts running here
        Parse.initialize("QKfYTUm0IwXbry5b5Mm4pUlrd3jizA8L6pkCmfwa", "E18sG2Fj3VbsVNUNGRpfzJOdb3xa2LciztSoZ97z");
    };

    return {
        init: init
    };
})();

app.main.init();