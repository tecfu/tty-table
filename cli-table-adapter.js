var Public = require('./src/public.js');

var Table = function(options){

	options = options || {};

	//translations
	
	//header	
	var header = [];	
	if(options.head && options.head instanceof Array){
		options.head.forEach(function(val){
			header.push({
				value : val	
			});
		});
	}

	//colWidths
	if(options.colWidths){
		options.colWidths.forEach(function(val,i){
			header[i].width = val;		
		});
	}

	//colAligns
	if(options.colAligns){
		options.colAligns.forEach(function(val,i){
			header[i].align = val;		
			header[i].headerAlign = val;
		});
	}

	//style
	options.style = options.style || {};

	//style - padding
	if(options.style['padding-left']){
		options.paddingLeft = options.style['padding-left'];
	}
	
	if(options.style['padding-right']){
		options.paddingRight = options.style['padding-right'];
	}
	
	//style - colors
	if(options.style.head && options.style.head instanceof Array){
		options.headerColor = options.style.head[0];	
	}

	if(options.style.body && options.style.body instanceof Array){
		options.color = options.style.body[0];	
	}
	
	//style - compact
	if(options.style.compact){
		options.compact = true;
	}

	//@todo style - border color
	
	//inherited from prototype
	this.setup(header,[],[],options);

	//inherited from prototype
	this.toString = this.render.bind(this);

}

Table.prototype.__proto__ = Public;
module.exports = Table;
