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
                    var directory = self._users.getList();
                    socket.broadcast.emit('newUser', directory);
                }
            });
        });

        socket.on('getList', function(){
            var directory = self._users.getList();
            socket.emit('directory', directory);
        });
    });
};

module.exports = IoModule;


