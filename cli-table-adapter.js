var Public = require('./src/public.js');

var Table = function(options){

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

	//style - padding
	if(options['padding-left']){
		options.paddingLeft = options['padding-left'];
	}
	
	if(options['padding-right']){
		options.paddingRight = options['padding-right'];
	}
	
	//style - color
	options.style = options.style || {};
	if(options.style.head && options.style.head instanceof Array){
		options.headerColor = options.style.head[0];	
	}

	if(options.style.body && options.style.body instanceof Array){
		options.color = options.style.body[0];	
	}
	
	//@todo style - border color
	
	//inherited from prototype
	this.setup(header,[],[],options);

	//inherited from prototype
	this.toString = this.render.bind(this);

}

Table.prototype.__proto__ = Public;
module.exports = Table;
