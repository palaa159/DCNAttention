/* this node app will hopefully route:
*/

var http = require('http'),
    path = require('path'),
    util = require('util'),
    express = require('express'),
    fs = require('fs'),
    colors = require('colors'),
    _ = require('underscore'),
    m = require('moment'),
    bodyParser = require('body-parser');

// end of dependencies

/*
	Express configs
*/

var app = express(),
    port = 3333;
app.locals.title = 'Digital Content Next: Attention Market';

app.use(express.static(path.join(__dirname, 'public')));
app.set('port', process.env.PORT || port);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({
    extended: true
}));

/*
	Routing configs
*/
var router = express.Router();
require('./routes/router.js')(router, util, bodyParser, m);
app.use('/', router);

/*
	init server
*/
http.createServer(app).listen(app.get('port'), function() {
    console.log();
    console.log('  DCN Server Running  '.white.inverse);
    var listeningString = '  Listening on port ' + app.get('port') + "  ";
    console.log(listeningString.cyan.inverse);
});
