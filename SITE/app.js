var http = require('http'),
    path = require('path'),
    util = require('util'),
    express = require('express'),
    fs = require('fs'),
    colors = require('colors'),
    bodyParser = require('body-parser');

// end of dependencies

/*
	Express configs
*/

var app = express(),
    port = 80;
app.locals.title = 'Digital Content Next: Attention Market #PayAttention';

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
app.use(function(req, res, next) {
    console.log('--------------'.white);
    console.log('METHOD: '.white.bold + req.method + ', '.white.bold + req.url);
    // console.log('vvv'.white);
    next();
});

// FOR STATIC SITE
app
    .get('/', function(req, res) {
        console.log('--> Hitting homepage');
        res.render('client/home.ejs');
    })
    .get('/stock', function(req, res) {
        console.log('--> Hitting Mobile stock market');
        res.render('client/stock.ejs');
    })
    .get('/about', function(req, res) {
        console.log('--> Hitting About');
        res.render('client/about.ejs');
    })
    .get('/big', function(req, res) {
        console.log('--> Hitting Big screen display');
        res.render('client/big.ejs');
    })
    .get('/add', function(req, res) {
        console.log('--> Hitting Add content');
        res.render('client/add.ejs');
    });

//


/*
	init server
*/
http.createServer(app).listen(app.get('port'), function() {
    console.log();
    console.log('  DCN Server Running  '.white.inverse);
    var listeningString = '  Listening on port ' + app.get('port') + "  ";
    console.log(listeningString.cyan.inverse);
});