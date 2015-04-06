'use strict';

var Users = function () {
	if(!(this instanceof Users)) {
		return new Users();
	}

	this._users = [];
};

Users.prototype.addUser = function (login, callback) {	
	if (this.isLoginTaken(login)) {
		return callback(new Error('loginTaken'));
	} else {
		var _user = {
			login: login
		};

		this._users.push(_user);
		return callback(null);
	}
};

Users.prototype.isLoginTaken = function(login) {
	if(this._users.length > 0) {
		for (var i = 0; i < this._users.length; i++) {
			if (this._users[i].login == login)
				return true ;
		}
	}
	return false;
};

module.exports = Users;