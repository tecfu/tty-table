var Public = require('./public.js');

var Table = function(options){

	//option translations
	
	//translate header	
	var header = [];	
	if(options.head && options.head instanceof Array){
		options.head.forEach(function(val){
			header.push({
				value : val	
			});
		});
	}

	//translate colWidths
	if(options.colWidths){
		options.colWidths.forEach(function(val,i){
			header[i].width = val;		
		});
	}

	//@todo translate all other options
	options = {};
	
	//inherited from prototype
	this.setup(header,[],[],options);

	//inherited from prototype
	this.toString = this.render.bind(this);

}

Table.prototype.__proto__ = Public;
module.exports = Table;
