'use strict';

// Filter needed because of the structure of directory, beeing a map and not an array
angular.module('chat').filter('PeopleFilter', function(){
	var compare = function(stra, strb){
		stra = ("" + stra).toLowerCase();
		strb = ("" + strb).toLowerCase();
		return stra.indexOf(strb) !== -1;
	};

	return function(input, query) {
		var res = [];

		angular.forEach(input, function(person){
			if(person.banned === query.banned && person.hidden === 'false') {	
				if(compare(person.username, query.name)){
					res.push(person);
				}
			}
		});

		return res;
	};
});