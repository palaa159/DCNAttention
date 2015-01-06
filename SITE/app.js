var http = require('http'),
    path = require('path'),
    util = require('util'),
    express = require('express'),
    fs = require('fs'),
    colors = require('colors'),
    async = require('async'),
    bodyParser = require('body-parser'),
    parse = require('./modules/parse.js');

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
    .get('/util/add', function(req, res) {
        console.log('--> Hitting Add content');
        res.render('client/add.ejs');
    });

// FOR OFX FACETRACKER
var CONTENT_DATABASE = 'content_dummy';
app
    .get('/of/getcontents', function(req, res) {
        // async 
        async.parallel({
            contents: function(callback) {
                parse.getObjects(CONTENT_DATABASE, callback);
                // callback(null, 1);
            },
            categories: function(callback) {
                parse.getObjects('categories', callback);
                // callback(null, 2);
            }
        }, function(err, results) {
            var cats = results.categories;
            var contents = results.contents;
            contents.forEach(function(content) {
                cats.forEach(function(cat) {
                    if(content.category === cat.title) {
                        content.category = {
                            cat_id: cat.cat_id,
                            title: cat.title
                        };
                    }
                });
            });
            res.send(contents);
        });
    })
    .post('/of/updatecontent', function(req, res) {
        // get objectId and updated value
        var data = req.body;
        parse.updateObject(CONTENT_DATABASE, data, res);
    });

// FOR SOCIAL VALUATION


/*
	init server
*/
http.createServer(app).listen(app.get('port'), function() {
    console.log();
    console.log('  DCN Server Running  '.white.inverse);
    var listeningString = '  Listening on port ' + app.get('port') + "  ";
    console.log(listeningString.cyan.inverse);
});