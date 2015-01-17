var parse = require('./parse');

var bulk_id = 'e1a160357d5c7b4f30ba3639354c9e1f57360f55';

module.exports = function(http){
    var module = {};

    module.getBulkId = function(CONTENT_DATABASE, res) {
        parse.getObjectBulk(CONTENT_DATABASE, function(data) {
            // console.log('data'.red + data); // --> text
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
                    console.log('bulk id:'.white);
                    console.log((bulk_id).red);
                    if (res) {
                        res.send(bulk_id + ' UPDATED');
                    }
                    // updateSocVal(bulk_id);
                });
            });
            req.on('error', function(e) {
                console.log('problem with request: ' + e.message);
            });
            req.write(data);
            req.end();
        });
    };

    module.updateSocVal = function(CONTENT_DATABASE) {
        console.log('updating ' + bulk_id);
        // get all data
        var url = 'http://plus.sharedcount.com/bulk?apikey=55a4d6fb1ce6d387f94943a7b9b9c8550016990e&bulk_id=' + bulk_id;
        http.get(url, function(res) {
            console.log("Got response: " + res.statusCode);
            var result = '';
            res.on('data', function(d) {
                result += d.toString();
            });
            res.on('end', function() {
                var tmp = JSON.parse(result);
                console.log(tmp);
                parse.updateSocVal(CONTENT_DATABASE, tmp);
            });

        }).on('error', function(e) {
            console.log("Got error: " + e.message);
        });
    };

    return module;
};