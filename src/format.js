var StripAnsi = require("strip-ansi");
var Wrap = require("word-wrap");
var Format = {};

Format.calculateLength = function(line) {
	return StripAnsi(line.replace(/[^\x00-\xff]/g,'XX')).length;
}

Format.wrapCellContent = function(config,cellValue,columnIndex,cellOptions,
																 rowType){

	//remove ANSI color codes from the beginning and end of string
	var string = cellValue.toString(), 
			startAnsiRegexp = /^(\033\[[0-9;]*m)+/,
			endAnsiRegexp = /(\033\[[0-9;]*m)+$/,
			startMatches = string.match(startAnsiRegexp),
			endMatches = string.match(endAnsiRegexp),
			startFound = false,
			endFound = false;
	
	if(startMatches instanceof Array && startMatches.length > 0){
		startFound = true;
		string = string.replace(startAnsiRegexp,'');
	}

	if(endMatches instanceof Array && endMatches.length > 0){
		endFound = true;	
		string = string.replace(endAnsiRegexp,'');
	}

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

	//Equalize padding for centered lines 
	if(cellOptions[alignTgt] === 'center'){	
		cellOptions.paddingLeft = cellOptions.paddingRight =
			Math.max(cellOptions.paddingRight,cellOptions.paddingLeft,0);
	}

	var width = config.table.columnWidths[columnIndex],
			innerWidth = width - cellOptions.paddingLeft -
									cellOptions.paddingRight -
									config.GUTTER; //border/gutter
	
			if (string.length < Format.calculateLength(string)) {
		//Wrap Asian characters
		var count = 0;
		var start = 0;
		var characters = string.split('');

		string = characters.reduce(function (prev, cellValue, i) {
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
	} else {
		string = Wrap(string,{
			width : innerWidth - 
							cellOptions.paddingLeft -
							cellOptions.paddingRight,
			trim : true,
			indent : ''
		});
	}

	//Break string into array of lines
	var strArr = string.split('\n');

	//Format each line
	strArr = strArr.map(function(line){

		line = line.trim();	
		var lineLength = Format.calculateLength(line);

		//alignment 
		if(lineLength < width){
			var emptySpace = width - lineLength; 
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
		if(startFound){
			line = startMatches[0] + line;
		}
		if(endFound){
			line = line + endMatches[0];
		}

		return line;
	});

	string = strArr.join('\n');
	
	return {
		output : string,
		width : innerWidth
	};
}

Format.getColumnWidths = function(config,header){
	
	var widths = [];
	
	//check for manually set widths
	widths = header.map(function(cell){
		if(typeof cell === 'object' && typeof cell.width !=='undefined'){
			return cell.width;
		}
		else{
			return config.maxWidth;
		}
	});

	//Check to make sure widths will fit the current display, or resize.
	var totalWidth = widths.reduce(function(prev,curr){
		return prev+curr;
	});
	//Add marginLeft to totalWidth
	totalWidth += config.marginLeft;

	//Check process exists in case we are in bheaderser
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
