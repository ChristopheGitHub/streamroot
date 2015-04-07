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
        console.log('connection');

        var username = "";

        socket.on('clientSendUsername', function (data) {
            self._users.addUser(data, function (err) {
                if(err){
                    socket.emit('serverUsernameAlreadyTaken');
                } else {
                    socket.emit('serverUsernameSaved');
                    username = data.login;
                    var message = {
                        directory: self._users.getList(),
                        username: username
                    };
                    socket.broadcast.emit('serverUserConnection', message);
                }
            });
        });

        socket.on('clientAskDirectory', function(){
            var directory = self._users.getList();
            socket.emit('serverSendDirectory', directory);
        });

        socket.on('disconnect', function(){
            var message = {
                directory: self._users.getList(),
                username: username
            };
            io.sockets.emit('serverUserDisconnection', message);
        });
    });
};

module.exports = IoModule;


