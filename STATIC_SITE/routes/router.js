/* 
	ROUTER.JS
	routing everthingy
*/

module.exports = function(router, util, bodyParser, moment) {
    router.use(function(req, res, next) {
        console.log('-------------------------'.white);
        console.log('ROUTING STARTS'.bold);
        console.log('-------------------------'.white);
        console.log(req.method, util.inspect(req.url));
        req.url.toLowerCase();
        next();
    });

    router
    // HOMEPAGE
    .route('/').get(function(req, res, next) {
        res.render('index.ejs', {
            title: 'Digital Content Next'
        });
    })
    // STOCK MARKET
    .route('/stock').get(function(req, res, next) {
        res.render('stock.ejs', {
            title: 'Digital Content Next'
        });
    })
    // URL SUBMISSION?
    .route('/submit').get(function(req, res, next) {
        res.render('submission.ejs', {
            title: 'Digital Content Next'
        });
    });

    /* SITE UTILS
     */


    // 404
    router.route('*')
        .all(function(req, res) {
            res.send('404 Page.');
        });
};