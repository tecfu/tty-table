var Public = require('./public.js');

var Table = function(options){

	//inherit from Array
	Table.prototype.toString = Public.render;

	//option translations
	
	//translate header	
	this.header = [];	
	if(options.head){
		options.head.forEach(function(val){
			this.header.push({
				value : val	
			});
		});
	}

	//translate columnWidths
	if(options.columnWidths){
		options.columnWidths.forEach(function(val,i){
			this.header[i].width = val;		
		});
	}
	
	//@todo translate styles


	this.toString = Public.render();

}.apply(null,arguments);

module.exports = Table;
