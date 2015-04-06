var express      = require('express.io');
var serveStatic  = require('serve-static');
var path         = require('path');
var favicon      = require('serve-favicon');
var logger       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var usersCo      = require('./modules/users-connection');
var Users        = require('./modules/users');

var app = express();

// app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());



app.use(serveStatic('public', {}));

app.get('*', function (req, res, next) {
  res.sendfile(__dirname + '/public/views/index.html');
});


var server = app.listen(9000);

var users = new Users();

var usersCo = new usersCo(server, users);