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

        var username = "";

        socket.on('login', function (data) {
            self._users.addUser(data, function (err) {
                if(err){
                    socket.emit('loginNotOk');
                } else {
                    socket.emit('loginOk');
                    username = data.login;
                    // var directory = self._users.getList();
                    var message = {
                        directory: self._users.getList(),
                        username: username
                    };
                    socket.broadcast.emit('newUser', message);
                }
            });
        });

        socket.on('getList', function(){
            var directory = self._users.getList();
            socket.emit('directory', directory);
        });

        socket.on('disconnect', function(){
            var message = {
                directory: self._users.getList(),
                username: username
            };
            io.sockets.emit('user disconnected', message);
        });
    });
};

module.exports = IoModule;


