'use strict';


var io = require('socket.io')();

var IoModule = function (server, users) {
	if(!(this instanceof IoModule)) {
		return new IoModule(server, users);
	}

	this._users = users;

	io.listen(server);
	this._initialize();
};

IoModule.prototype._initialize = function () {
    var self = this;

    io.sockets.on('connection', function(socket){
        console.log('CONNECTION');

        socket.on('login', function (data) {
            self._users.addUser(data, function (err) {
                if(err){
                    socket.emit('loginNotOk');
                } else {
                    socket.emit('loginOk');
                }
            });
        });
    });
};

module.exports = IoModule;


