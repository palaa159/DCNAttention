var Kaiseki = require('kaiseki');
// Parse: NOW
var APP_ID = 'QKfYTUm0IwXbry5b5Mm4pUlrd3jizA8L6pkCmfwa',
    REST_KEY = 'cGN5GZgtOYuf2Ktcm3VQd1NqDLGl7e1t1OaszbNB';

var kaiseki = new Kaiseki(APP_ID, REST_KEY);

/* RATINGS
 */
var RATE_FB = 1,
    RATE_TWIT = 1,
    RATE_PIN = 1,
    RATE_LINKED = 1,
    RATE_GOOG = 1;


module.exports = {
    saveObject: function(classname, obj) {
        kaiseki.createObject(classname, obj, function(err, res, body, success) {
            if (err) {
                console.log(err);
            }
        });
    },
    getObjectBulk: function(classname, cb) {
        kaiseki.getObjects(classname, function(err, res, body, success) {
            // build text\n
            // console.log(body);
            var bodyText = '';
            body.forEach(function(item) {
                // console.log(item.link);
                if (item.link) {
                    bodyText += item.link + '\n';
                }
            });
            cb(bodyText);
        });
    },
    getObjects: function(classname, cb) {
        kaiseki.getObjects(classname, function(err, res, body, success) {
            cb(null, body);
        });
    },
    getMediaPublishers: function(classname, cb) {
        kaiseki.getObjects(classname, function(err, res, body, success) {
            cb(body);
        });
    },
    getObjectsByCat: function(classname, cat, cb) {
        console.log('get by cat ' + cat);
        var params = {
            where: {
                cat_id: cat
            },
            order: '-name'
        };
        kaiseki.getObjects(classname, params, function(err, res, body, success) {
            // console.log(body);
            if (success) {
                cb(body);
            }
        });

    },
    updateSocVal: function(classname, data) {
        kaiseki.getObjects(classname, function(err, res, body, success) {
            if (success) {
                console.log('Updating Social Value');
                // console.log(body); // []
                var tmpArray = [];
                var tmpData = data.data;
                // for(var k in tmpData) {
                //     console.log(tmpData[k].Facebook.share_count);
                // }
                //Facebook.share_count
                body.forEach(function(item) {
                    // get oId, title, later we update using updateObjects
                    for (var k in tmpData) {
                        var allSocVal = parseFloat((RATE_FB * tmpData[k].Facebook.share_count) + (RATE_GOOG * tmpData[k].GooglePlusOne) + (RATE_LINKED * tmpData[k].LinkedIn) + (RATE_PIN * tmpData[k].Pinterest) + (RATE_TWIT * tmpData[k].Twitter));
                        if (item.link === k) {
                            tmpArray.push({
                                objectId: item.objectId,
                                data: {
                                    fb_counts: parseInt(tmpData[k].Facebook.share_count) || 0,
                                    twitter_counts: parseInt(tmpData[k].Twitter) || 0,
                                    google_counts: parseInt(tmpData[k].GooglePlusOne) || 0,
                                    pinterest_counts: parseInt(tmpData[k].Pinterest) || 0,
                                    linkedin_counts: parseInt(tmpData[k].LinkedIn) || 0,
                                    val_history: processValHistory(item.val_history, allSocVal), // current - last
                                    social_val: allSocVal || 0
                                }

                            });
                        }
                    }
                });
                // Update to Parse
                // console.log(tmpArray);
                kaiseki.updateObjects(classname, tmpArray, function(err, res, body, success) {
                    console.log(err);
                    console.log(body);
                    console.log(success);
                });
            }
        });
    },
    updateObject: function(classname, data, res) {
        kaiseki.updateObject(classname, data.objectId, {
            face_val: data.val
        }, function(err, res, body, success) {
            if (!err) {
                res.send(body.face_val);
            }
        });
    },
    updateObjectAutopilot: function(classname, array, res_s, cat_title) {
        console.log(array);
        kaiseki.updateObjects(classname, array, function(err, res, body, success) {
            console.log(err);
            console.log(body);
            // res_s.status(404);
            res_s.header('Content-Type', 'text/plain');
            res_s.send('updating ' + cat_title + '\n' + JSON.stringify(array));
            res_s.end();
        });
    }
};

// Helpers
function processValHistory(arraybefore, now_val) {
    arraybefore.push({
        ts: new Date().getTime(),
        // non-cumulative
        face_val: 0,
        // BELOW IS WRONG
        // SEARCH FOR LAST ARRAY THAT IS NOT 0
        // AND WHY THERE ARE -1s?????
        social_val: now_val - arraybefore[arraybefore.length - 1].social_val
    });
    return arraybefore;
}