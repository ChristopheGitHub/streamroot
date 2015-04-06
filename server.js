var express      = require('express.io');
var path         = require('path');
var favicon      = require('serve-favicon');
var logger       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');

var app = express();

// app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());




app.use(express.static(path.join(__dirname, 'public')));


app.get('*', function (req, res, next) {
  res.sendFile(__dirname + '/index.html'); // Renvoie le fichier index de la SPA.
});


var server = app.listen(9000);