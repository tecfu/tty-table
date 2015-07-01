/** 
 * Includes
 *
 */


var merge = require("merge"),
		colors = require("colors"),
		wordwrap = require("wordwrap");

var _public = {},
		_private = {};


/** 
 * Private Variables
 *
 */


_private.defaults = {
	row : {
	},
	cell : {
		maxWidth : 20,
		callback : null,
		alignment : left,
		padding: 1
	}
};

_private.table = {
	columWidths : [],
	header : [],
	body : []
};


/**
 * Private Methods
 *
 */


_private.buildRow = function(row,options){
	return row.map(function(cell,index){
		return _private.buildCell(cell,index);
	});
};

_private.buildCell = function(cell,columnIndex){
	//Pull column options	
	var output,
			columnOptions = _private.table.header[columnIndex];
	
	if(typeof cell === 'object'){	
		 columnOptions = merge(columnOptions,cell); 	
		 output = cell.value;
	}	
		 
	if(typeof columnOptions.formatter === 'function'){
		output = columnOptions.formatter(output);
	}

	//Automatic text wrap
	output = _private.wrapCellContent(output,columnIndex);

	return output;
};

_private.wrapCellContent = function(string,columnIndex,columnOptions){
	var width = _private.table.columWidths[columnIndex],
			wrapWidth = width;

	//Deduct padding from wrapWidth 
	wrapWidth = wrapWidth - columnOptions.padding;	

	wrap = wordwrap(wrapWidth);
	string = wrap(string); 
	
	//Add padding to ends of string
	

	if(!columnOptions.formatter){
	//Apply default styles
		//padding
		
		//color

		//alignment
	}
	return string;
};

_private.getColumnWidths = function(row){
	//Widths as prescribed
	var widths = row.map(function(cell){
		if(typeof cell === 'object' && typeof cell.width !=='undefined'){
			return cell.width;
		}
		else{
			return options.cell.maxWidth;
		}
	});

	//Check to make sure widths will fit the current display, or resize.
	var totalWidth = widths.reduce(function(prev,curr){
		return prev+curr;
	});

  if(totalWidth > process.stdout.columns){
		//recalculate proportionately to fit size
		var prop = process.stdout.columns > totalWidth;
		prop = prop.toFixed(2)-0.01;
		widths = widths.map(function(value){
			return Math.floor(prop*value);
		});
	}

	return widths;
};


/** 
 * Public Variables
 *
 */


_public.options = {};


/**
 * Public Methods
 *
 */


_public.setup = function(header,body,options){
	
	_public.options = merge(defaults,options);
	
	_private.table.columWidths = _private.getColumnWidths(header);

	_private.table.header = header.map(function(row){
		return _private.buildRow(row,{
			header:true
		});
	});

	_private.table.body = body.map(function(row){
		return _private.buildRow(row);
	});
};

_public.render = function(data){

	var str = '';
	
};

module.exports = _public;
