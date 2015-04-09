var express      = require('express');
var serveStatic  = require('serve-static');
var logger       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var usersCo      = require('./modules/users-connection');
var Users        = require('./modules/users');
var PeerServer   = require('peer').PeerServer;

var app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());


app.use(serveStatic('public', {}));

var server = app.listen(9001);


var serverPeer = PeerServer({port: 8001, path: '/peerjs'});

app.get('*', function (req, res, next) {
  res.sendfile(__dirname + '/public/views/index.html');
});

serverPeer.on('connection', function(id) { console.log("Hello ! !" + id); });


var users = new Users();

var usersCo = new usersCo(server, users);