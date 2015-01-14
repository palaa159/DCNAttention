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
            res.send(contents);
        });
    })
    .get('/of/autopilot', function(req, res) {
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
            // res.send(contents);
            fake_valuate(contents, res);
        });
    })
    .post('/of/updatecontent', function(req, res) {
        // get objectId and updated value
        var data = req.body;
        parse.updateObject(CONTENT_DATABASE, data, res);
    });

// FOR SOCIAL VALUATION

/* Fake valuate content
    
    loop category
    pick a pair
    add some value to it
    push to db
    interval of 15 sec

*/
var id = 0;
var id_to_title;

function fake_valuate(contents, res) {
    // console.log(contents);
    // random a cat_id 1-7
    if (id === 7) {
        id = 1;
    } else {
        id++;
    }
    console.log('Picking id: ' + id);
    // pick 2 in contents to compete
    // get cat_id of id
    var cat_contents = [];
    contents.forEach(function(content) {
        if (content.cat_id === id) {
            id_to_title = content.category;
            cat_contents.push(content);
        }
    });
    console.log('content in cat length: ' + cat_contents.length);
    // console.log(cat_contents);
    // pick 2
    var tmp_range = [];
    for (var i = 0; i < cat_contents.length; i++) {
        // console.log(i);
        tmp_range.push(i);
        // console.log(tmp_range);
    }
    console.log('tmp_range = ');
    console.log(tmp_range);
    var rand_content_1 = tmp_range[Math.floor(Math.random() * tmp_range.length)];
    // remove
    tmp_range.splice(tmp_range.indexOf(rand_content_1), 1);
    var rand_content_2 = tmp_range[Math.floor(Math.random() * tmp_range.length)];

    console.log('Pairing completed');
    console.log(rand_content_1, rand_content_2);
    cat_contents[rand_content_1].face_val_history.push({
        ts: new Date().getTime(),
        val: (((Math.random() * 2) + 1) / 3).toFixed(2)
    });
    cat_contents[rand_content_2].face_val_history.push({
        ts: new Date().getTime(),
        val: (((Math.random() * 2) + 1) / 3).toFixed(2)
    });
    cat_contents[rand_content_1].social_val_history.push({
        ts: new Date().getTime(),
        val: (((Math.random() * 5) + 1) / 3).toFixed(2)
    });
    cat_contents[rand_content_2].social_val_history.push({
        ts: new Date().getTime(),
        val: (((Math.random() * 5) + 1) / 3).toFixed(2)
    });
    var toUpdate_1 = {
        objectId: cat_contents[rand_content_1].objectId,
        data: {
            face_val_history: cat_contents[rand_content_1].face_val_history,
            social_val_history: cat_contents[rand_content_1].social_val_history,
            face_val: calculateVal(cat_contents[rand_content_1].face_val_history),
            social_val: calculateVal(cat_contents[rand_content_1].social_val_history)
        }
    };
    var toUpdate_2 = {
        objectId: cat_contents[rand_content_2].objectId,
        data: {
            face_val_history: cat_contents[rand_content_2].face_val_history,
            social_val_history: cat_contents[rand_content_2].social_val_history,
            face_val: calculateVal(cat_contents[rand_content_2].face_val_history),
            social_val: calculateVal(cat_contents[rand_content_2].social_val_history)
        }
    };
    var toUpdate = [toUpdate_1, toUpdate_2];
    parse.updateObjectAutopilot('content_dummy', toUpdate, res, id_to_title);
}

// fake_valuate();

/*
    init server
*/
http.createServer(app).listen(app.get('port'), function() {
    console.log();
    console.log('  DCN Server Running  '.white.inverse);
    var listeningString = '  Listening on port ' + app.get('port') + "  ";
    console.log(listeningString.cyan.inverse);
});

// Helpers
function calculateVal(arr) {
    var totVal = 0;
    arr.forEach(function(item) {
        totVal += parseFloat(item.val);
    });
    return totVal;
}