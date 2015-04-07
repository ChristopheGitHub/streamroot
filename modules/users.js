'use strict';

var Users = function () {
	if(!(this instanceof Users)) {
		return new Users();
	}

	this._users = {};
};

Users.prototype.addUser = function (login, callback) {	
	if (this.isLoginTaken(login)) {
		return callback(new Error('loginTaken'));
	} else {
		var _user = {};
		this._users[login] = _user;
		return callback(null);
	}
};

Users.prototype.isLoginTaken = function(login) {
	if(login in this._users){
		return true;
	} else {
		return false;
	}
};

module.exports = Users;