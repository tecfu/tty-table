var Public = require('./public.js');
module.exports = (function(){
	return function(){
		Public.setup(arguments);	
		this.toString = Public.render();
	}.apply(null,arguments);
})()
