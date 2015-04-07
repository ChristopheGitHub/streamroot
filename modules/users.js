'use strict';

var Users = function () {
	if(!(this instanceof Users)) {
		return new Users();
	}

	this._users = {};
};

Users.prototype.addUser = function (data, callback) {	
	if (this.isLoginTaken(data.login)) {
		return callback(new Error('loginTaken'));
	} else {
		var _user = {
			username: data.login,
			peerId: data.peerId
		};
		this._users[data.login] = _user;
		return callback(null);
	}
};

Users.prototype.isLoginTaken = function(login) {
	return (login in this._users) ? true : false;
};

Users.prototype.getList = function(){
	return this._users;
};

module.exports = Users;