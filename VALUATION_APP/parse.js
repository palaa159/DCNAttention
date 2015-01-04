var Kaiseki = require('kaiseki'),
    moment = require('moment');

// Parse: DCNATTENTION
var APP_ID = 'QKfYTUm0IwXbry5b5Mm4pUlrd3jizA8L6pkCmfwa',
    REST_KEY = 'cGN5GZgtOYuf2Ktcm3VQd1NqDLGl7e1t1OaszbNB';

var kaiseki = new Kaiseki(APP_ID, REST_KEY);

// var classname = ;

module.exports = {
    saveObject: function(classname, obj) {
        kaiseki.createObject(classname, obj, function(err, res, body, success) {
            if(err) {
                console.log(err);
            }
        });
    }
};