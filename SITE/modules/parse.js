var Kaiseki = require('kaiseki');
// Parse: NOW
var APP_ID = 'QKfYTUm0IwXbry5b5Mm4pUlrd3jizA8L6pkCmfwa',
    REST_KEY = 'cGN5GZgtOYuf2Ktcm3VQd1NqDLGl7e1t1OaszbNB';

var kaiseki = new Kaiseki(APP_ID, REST_KEY);

// var classname = ;

module.exports = {
    saveObject: function(classname, obj) {
        kaiseki.createObject(classname, obj, function(err, res, body, success) {
            if (err) {
                console.log(err);
            }
        });
    },
    getObjects: function(classname, cb) {
        kaiseki.getObjects(classname, function(err, res, body, success) {
            cb(null, body);
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
    }
};