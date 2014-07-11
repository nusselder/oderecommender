var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var redis = require('redis');
//var redisclient = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST);
//// todo, read port from env and pass as arg; maybe tot auth?
var redis_client = redis.createClient();

var routes = require('./routes/index');
var train = require('./routes/train');
var recommend = require('./routes/recommend');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Before routing, add a link to the database (redis in this case),
// so we have this handy. It won't be to heavy an app anyway...?
app.use(function(req,res,next){req.redis_client=redis_client;next();});

app.use('/', routes);
app.use('/train', train);
app.use('/recommend', recommend);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
