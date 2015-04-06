var express      = require('express.io');
var serveStatic  = require('serve-static');
var path         = require('path');
var favicon      = require('serve-favicon');
var logger       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var io           = require('socket.io')(); 

var app = express();

// app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());



app.use(serveStatic('public', {}));

app.get('*', function (req, res, next) {
  res.sendfile(__dirname + '/public/views/index.html'); // Renvoie le fichier index de la SPA.
});

io.sockets.on('connection', function(socket){
  console.log('CONNNNNNNECTION');
});


var server = app.listen(9000);

io.listen(server);