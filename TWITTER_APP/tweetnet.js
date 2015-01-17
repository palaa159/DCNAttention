/****
 *
 * EXPRESS SERVER WITH MONGODB CLIENT
 * ==============================================
 *
 * >> WITH FRONTEND
 *
 * In terminal, run:
 *
 *   $ npm install     (to download/install the necessary modules)
 *   $ node app.js     (to launch this node app)
 *
 */

var colors = require('colors');
var util = require('util');
var Twitter = require('node-twitter');
var nodemailer = require('nodemailer');

/****
 * TWITTER configuration
 * ==============================================
 *
 */
var twitterStreamClient = new Twitter.StreamClient(
    'bAVZ7rBZ2QMqboXEtMPnRpCvK',
    'pje8rlOyGV9Rn7NRYJ9K7hZ5i8kZwmoBtD2MJQ8hCzqEE7amjy',
    '15753430-HEgWgh8CnqtrJe5QcNR3C0jPt3E9yRdwUmMPYQecX',
    'whPI5kbExfxoiBOt8v8WtJsg6oezGFU0sXdInsEoNJtlx'
);

twitterStreamClient.on('close', function() {
    console.log('Connection closed.');
});
twitterStreamClient.on('end', function() {
    console.log('End of Line.');
});
twitterStreamClient.on('error', function(error) {
    console.log('Error: ' + (error.code ? error.code + ' ' + error.message : error.message));
});
twitterStreamClient.on('tweet', function(tweet) {
    console.log("incoming tweet:".cyan);
    console.log("tweet.user.screen_name: " + tweet.user.screen_name);
    console.log("tweet.text: " + tweet.text);
    //  console.log(tweet); //
    console.log("----------------------------");
    // mail this
    if (tweet.text.toLowerCase().indexOf('payattention') > -1 && tweet.text.toLowerCase().indexOf('dcn') > -1) {
        console.log('Match!');
        sendMail(tweet);
    }
});

twitterStreamClient.start(['dcnlive']);

// test
// sendMail({
//     user: {
//         screen_name: 'apon'
//     },
//     text: 'blah #goo'
// });

function sendMail(data) {
    console.log('SENDING EMAIL');
    // create reusable transporter object using SMTP transport
    var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'dcnattention@gmail.com',
            pass: 'dcn4tt3nt10n!'
        }
    });

    // NB! No need to recreate the transporter object. You can use
    // the same transporter object for all e-mails

    // setup e-mail data with unicode symbols
    var mailOptions = {
        from: data.user.screen_name, // sender address
        to: 'dcnattention@gmail.com', // list of receivers
        subject: 'New content submitted from: ' + data.user.screen_name, // Subject line
        text: data.text, // plaintext body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Message sent: ' + info.response);
        }
    });
}