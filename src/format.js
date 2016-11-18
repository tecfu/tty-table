var StripAnsi = require("strip-ansi");
var Wrap = require("word-wrap");
var Wcwidth = require("wcwidth");
var Format = {};

Format.calculateLength = function(line) {
	//return StripAnsi(line.replace(/[^\x00-\xff]/g,'XX')).length;
	return Wcwidth(line);
}

Format.wrapCellContent = function(
	config,
	cellValue,
	columnIndex,
	cellOptions,
	rowType
){
	
	//coerce cell value to string
	var string = cellValue.toString(); 

	//ANSI chararacters that demarcate the start of a line
	var startAnsiRegexp = /^(\033\[[0-9;]*m)+/;

	//store matching ANSI characters
	var startMatches = string.match(startAnsiRegexp) || [''];

	//remove ANSI start-of-line chars 
	string = string.replace(startAnsiRegexp,'');

	//ANSI chararacters that demarcate the end of a line
	var endAnsiRegexp = /(\033\[[0-9;]*m)+$/;

	//store matching ANSI characters so can be later re-attached
	var endMatches = string.match(endAnsiRegexp) || [''];

	//remove ANSI end-of-line chars 
	string = string.replace(endAnsiRegexp,'');

	var alignTgt;

	switch(rowType){
		case('header'):
			alignTgt = "headerAlign"
			break;
		case('body'):
			alignTgt = "align"
			break;
		default:
			alignTgt = "footerAlign"
			break;
	}

	//equalize padding for centered lines 
	if(cellOptions[alignTgt] === 'center'){	
		cellOptions.paddingLeft = cellOptions.paddingRight =
			Math.max(cellOptions.paddingRight,cellOptions.paddingLeft,0);
	}

	var columnWidth = config.table.columnWidths[columnIndex];
	
	//innerWidth is the width available for text within the cell
	var innerWidth = columnWidth -
	 cellOptions.paddingLeft -
	 cellOptions.paddingRight -
	 config.GUTTER; 
	
	switch(true){
		//no wrap, truncate
		case(typeof config.truncate === 'string' && config.truncate.length > 0):
			string = Format.handleTruncatedValue(
				string,
				cellOptions,
				innerWidth
			);
			break;
		//asian characters
		case(string.length < Format.calculateLength(string)):
			string = Format.handleAsianChars(
				string,
				cellOptions,
				innerWidth
			);
			break;
		//latin characters
		default:
			string = Format.handleLatinChars(string,cellOptions,innerWidth);
	}

	//break string into array of lines
	var strArr = string.split('\n');

	//format each line
	strArr = strArr.map(function(line){

		line = line.trim();	
	
		var lineLength = Format.calculateLength(line);

		//alignment 
		if(lineLength < columnWidth){
			var emptySpace = columnWidth - lineLength; 
			switch(true){
				case(cellOptions[alignTgt] === 'center'):
					emptySpace --;
					var padBoth = Math.floor(emptySpace / 2), 
							padRemainder = emptySpace % 2;
					line = Array(padBoth + 1).join(' ') + 
						line +
						Array(padBoth + 1 + padRemainder).join(' ');
					break;
				case(cellOptions[alignTgt] === 'right'):
					line = Array(emptySpace - cellOptions.paddingRight).join(' ') + 
								 line + 
								 Array(cellOptions.paddingRight + 1).join(' ');
					break;
				default:
					line = Array(cellOptions.paddingLeft + 1).join(' ') +
								 line + Array(emptySpace - cellOptions.paddingLeft).join(' ');
			}
		}
		
		//put ANSI color codes BACK on the beginning and end of string
		line = startMatches[0] + line;
		line = line + endMatches[0];

		return line;
	});

	string = strArr.join('\n');
	
	return {
		output : string,
		width : innerWidth
	};
}

Format.handleTruncatedValue = function(string,cellOptions,innerWidth){
	var outstring = string;
	if(innerWidth < outstring.length){
		outstring = outstring.substring(0,innerWidth - cellOptions.truncate.length);
		outstring = outstring + cellOptions.truncate;
	}
	return outstring;
}

Format.handleAsianChars = function(string,cellOptions,innerWidth){
	var count = 0;
	var start = 0;
	var characters = string.split('');

	var outstring = characters.reduce(function (prev, cellValue, i) {
		count += Format.calculateLength(cellValue);
		if (count > innerWidth) {
			prev.push(string.slice(start, i));
			start = i;
			count = 0;
		} else if (characters.length === i + 1) {
			prev.push(string.slice(start));
		}
		return prev;
	}, []).join('\n');

	return outstring;
}

Format.handleLatinChars = function(string,cellOptions,innerWidth){
	var outstring = Wrap(string,{
		width : innerWidth - 
						cellOptions.paddingLeft -
						cellOptions.paddingRight,
		trim : true,
		indent : ''
	});

	return outstring;
}

Format.getColumnWidths = function(config,rows){
	
	var widths = [];
	var source; //source of columns	
	
	//check widths on header settings if exists
	if(config.table.header[0] && config.table.header[0].length > 0){
		source = config.table.header[0];
	}
	else if(rows.length > 0){
		source = rows[0];
	}
	else {
		return [];
	}
	
	widths = source.map(function(cell){
		if(typeof cell === 'object' && typeof cell.width !=='undefined'){
			return cell.width;
		}
		else{
			return config.width;
		}
	});

	//check to make sure widths will fit the current display, or resize.
	var totalWidth = widths.reduce(function(prev,curr){
		return prev + curr;
	});
	
	//add marginLeft to totalWidth
	totalWidth += config.marginLeft;

	//check process exists in case we are in browser
	if(process && process.stdout && totalWidth > process.stdout.columns){
		//recalculate proportionately to fit size
		var prop = process.stdout.columns / totalWidth;
	
		prop = prop.toFixed(2)-0.01;
	
		widths = widths.map(function(value){
			return Math.floor(prop*value);
		});
	}

	return widths;
}

module.exports = Format;
