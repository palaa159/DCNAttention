var CONTENT_DATABASE = 'payattention';
var bulk_id = 'e1a160357d5c7b4f30ba3639354c9e1f57360f55';

var http = require('http'),
    path = require('path'),
    util = require('util'),
    express = require('express'),
    fs = require('fs'),
    colors = require('colors'),
    async = require('async'),
    bodyParser = require('body-parser'),
    parse = require('./modules/parse.js'),
    autopilot = require('./modules/autopilot'),
    schedule = require('node-schedule');

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

var restdebug = function(msg) {
    util.log('REST Debug: '.bold.cyan + ' ' + (msg).white);
};

var appdebug = function(msg) {
    util.log('APP Debug: '.bold.magenta + ' ' + (msg).white);
};

/*
    Routing configs
*/
app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
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
    .get('/market', function(req, res) {
        console.log('--> Hitting Mobile stock market');
        res.redirect('datavis.html');
    })
    // .get('/datavis', function(req, res) {
    //     console.log('--> Hitting Big screen display');
    //     res.render('client/datavis.ejs');
    // })
    .get('/util/add', function(req, res) {
        console.log('--> Hitting Add content');
        res.render('client/add.ejs');
    });

// FOR OFX FACETRACKER
app
    .get('/api/getcontents', function(req, res) {
        // console.log(req.query)
        // async 
        async.parallel({
            contents: function(callback) {
                parse.getObjects(CONTENT_DATABASE, callback);
                // callback(null, 1);
            }
        }, function(err, results) {
            // var cats = results.categories;
            var contents = results.contents;
            res.json(contents);
        });
    })
    .get('/api/getContentsByCatId', function(req, res) {
        var cat = req.query.id;
        parse.getObjectsByCat(CONTENT_DATABASE, cat, function(d) {
            res.json(d);
        });
    })
    .get('/api/getMediaPublishers', function(req, res) {
        parse.getMediaPublishers('media_companies', function(d) {
            res.json(d);
        });
    })
    .get('/api/autopilot', function(req, res) {
        async.parallel({
            contents: function(callback) {
                parse.getObjects(CONTENT_DATABASE, callback);
                // callback(null, 1);
            }
        }, function(err, results) {
            var contents = results.contents;
            // res.send(contents);
            autopilot.fake_valuate(parse, CONTENT_DATABASE, contents, res);
        });
    })
    .get('/api/resetHistory', function(req, res) {
        parse.resetHistory(CONTENT_DATABASE, res);
    })
    .get('/api/getBulkId', function(req, res) {
        getBulkId(res);
    })
    .get('/api/updateSocVal', function(req, res) {
        updateSocVal(bulk_id);
        res.send('updated');
    })
    .get('/api/showing', function(req, res) {
        var dataToGab = req.query;
        // socket io to Gabriel
        io.sockets.emit('showing', dataToGab);
        iodebug('Data passed to SocketIO clients.');
        res.json({
            '200': 'OK'
        });
        restdebug('Respond to client with {"200": "OK"}');
    })
    .get('/api/updateface', function(req, res) {
        var dataFromJoe = req.query;
        // id = objectId, val = face value
        //
        res.json({
            '200': 'OK'
        });
        restdebug('Respond to client with {"200": "OK"}');
    })
    .post('/api/updatecontent', function(req, res) {
        // get objectId and updated value
        var data = req.body;
        parse.updateObject(CONTENT_DATABASE, data, res);
    });

// FOR SOCIAL VALUATION

// http://plus.sharedcount.com/bulk?bulk_id=b890b7126b0b61c07aff2d1f30961106c2a11f92&apikey=55a4d6fb1ce6d387f94943a7b9b9c8550016990e

/////
/////
/////
/////
// FUNCTIONS
//

function init() {
    getBulkId();
    var j = schedule.scheduleJob('0,30 * * * *', function() {
        getBulkId();
    });
}

function updateSocVal(bulk_id) {
    appdebug('updating ' + bulk_id);
    // get all data
    var url = 'http://plus.sharedcount.com/bulk?apikey=55a4d6fb1ce6d387f94943a7b9b9c8550016990e&bulk_id=' + bulk_id;
    http.get(url, function(res) {
        // console.log("Got response: " + res.statusCode);
        var result = '';
        res.on('data', function(d) {
            result += d.toString();
        });
        res.on('end', function() {
            var tmp = JSON.parse(result);
            // console.log(tmp);
            parse.updateSocVal(CONTENT_DATABASE, tmp);
            appdebug('Scraped Social values and updated to Parse');
        });

    }).on('error', function(e) {
        appdebug("Got error: " + e.message);
    });
}

function getBulkId(res) {
    parse.getObjectBulk(CONTENT_DATABASE, function(data) {
        // console.log('data'.red + data); // --> text
        var data_count = (data.match(/\n/g) || []).length;
        restdebug(('URL counts: ' + data_count).bold.white);
        // get bulk id
        var options = {
            hostname: 'plus.sharedcount.com',
            path: '/bulk?apikey=55a4d6fb1ce6d387f94943a7b9b9c8550016990e',
            method: 'POST'
        };
        var req = http.request(options, function(res_post) {
            // console.log('STATUS: ' + res_post.statusCode);
            // console.log('HEADERS: ' + JSON.stringify(res_post.headers));
            res_post.setEncoding('utf8');
            res_post.on('data', function(chunk) {
                // res.json(JSON.parse(chunk));
                // bulk request 
                bulk_id = JSON.parse(chunk).bulk_id;
                appdebug('bulk id: '.white + (bulk_id).red);
                if (res) {
                    res.send(bulk_id + ' UPDATED');
                }
                setTimeout(function() {
                    updateSocVal(bulk_id);
                }, 5 * 1000);
            });
        });
        req.on('error', function(e) {
            console.log('problem with request: ' + e.message);
        });
        req.write(data);
        req.end();
    });
}

// Helpers
function calculateVal(arr, which) {
    var totVal = 0;
    arr.forEach(function(item) {
        totVal += parseFloat(item[which]);
    });
    return totVal;
}

/*
    init server
*/
var server = http.createServer(app).listen(app.get('port'), function() {
    console.log();
    console.log('  DCN Server Running  '.white.inverse);
    var listeningString = '  Listening on port ' + app.get('port') + "  ";
    console.log(listeningString.cyan.inverse);
    init();
});

// Socket.io

var io = require('socket.io').listen(server);
var iodebug = function(msg) {
    util.log('SocketIO Debug'.yellow.bold + ': ' + (msg).white);
};
io.sockets.on('connection', function(socket) {
    iodebug('A client ' + socket.id + ' has connected.');
});
