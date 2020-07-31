var fs = require('fs');

module.exports = function (app) {
    app.get('/index', function (req, res) {
        res.render('index.html');
    });
    app.get('/about', function (req, res) {
        res.render('about.html');

    });
    app.get('/', function (req, res) {
        res.render('dashboard.html');
    });

};