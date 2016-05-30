var Merge = require("merge");
var Style = require("./style.js");
var Format = require("./format.js");
var Render = {};

/**
 * Converts arrays of data into arrays of cell strings
 */
Render.stringifyData = function(Config,data){
	
	var sections = {
				header : [],
				body : [],
				footer : []
			},
			output = '',
			marginLeft = Array(Config.marginLeft + 1).join('\ '),
			borderStyle = Config.borderCharacters[Config.borderStyle],
			borders = [];

	//because automattic/cli-table syntax infers table type based on 
	//how rows are passed (array of arrays, objects, etc)
	Config.rowFormat = Render.getRowFormat(data[0] || []);
	
	//now translate them
	data = Render.transformRows(Config,data);
		
	Config.table.columnWidths = Format.getColumnWidths(Config,data);
	
	//stringify header 
	if(!Config.headerEmpty){
		sections.header = Config.table.header.map(function(row){
			return Render.buildRow(Config,row,'header');
		});
	}
	else{
		sections.header = [];
	}

	//stringify body
	sections.body = data.map(function(row){
		return Render.buildRow(Config,row,'body');
	});

	//stringify footer
	sections.footer = (Config.table.footer instanceof Array && Config.table.footer.length > 0) ? [Config.table.footer] : [];
	
	sections.footer = sections.footer.map(function(row){
		return Render.buildRow(Config,row,'footer');
	});

	//add borders
	for(var a=0;a<3;a++){
		borders.push('');
		Config.table.columnWidths.forEach(function(w,i,arr){
			borders[a] += Array(w).join(borderStyle[a].h) +
				((i+1 !== arr.length) ? borderStyle[a].j : borderStyle[a].r);
		});
		borders[a] = borderStyle[a].l + borders[a];
		borders[a] = borders[a].split('');
		borders[a][borders[a].length1] = borderStyle[a].r;
		borders[a] = borders[a].join('');
		borders[a] = marginLeft + borders[a] + '\n';
	}
	
	//top horizontal border
	output += borders[0];

	//rows
	var row;
	Object.keys(sections).forEach(function(p,i){
		
		while(sections[p].length){
			
			row = sections[p].shift();
		
			if(row.length === 0) {break}

			row.forEach(function(line){
				output = output 
					+ marginLeft 
					+ borderStyle[1].v
					+	line.join(borderStyle[1].v) 
					+ borderStyle[1].v
					+ '\n';
			});
		
			//Adds bottom horizontal row border
			switch(true){
				//If end of body and no footer, skip
				case(sections[p].length === 0 
						 && i === 1 
						 && sections.footer.length === 0):
					break;
				//if end of footer, skip
				case(sections[p].length === 0 
						 && i === 2):
					break;
				default:
					output += borders[1];
			}	
		}
	});
	
	//Bottom horizontal border
	output += borders[2];
	
	//remove all rows in prototype array
	this.splice(0,this.length);
	
	return Array(Config.marginTop + 1).join('\n') + output;
};

Render.buildRow = function(config,row,rowType){

	var minRowHeight = 0;
	var difL = config.table.columnWidths.length - row.length;

	if(difL > 0){
		//add empty element to array
		row = row.concat(Array.apply(null, new Array(difL))
													//.map(function(){return null})); 
													.map(function(){return ''})); 
	}
	else if(difL < 0){
		//truncate array
		row.length = config.table.columnWidths.length;
	}

	//get row as array of cell arrays
	var cArrs = row.map(function(cell,index){
		
		var c = Render.buildCell(config,cell,index,rowType);
		var cellArr = c.cellArr;
		
		if(rowType === 'header'){
			config.table.columnInnerWidths.push(c.width);
		}
	
		minRowHeight = (minRowHeight < cellArr.length) ? 
			cellArr.length : minRowHeight;
	
		return cellArr;
	});

	//Adjust minRowHeight to reflect vertical row padding
	minRowHeight = (rowType === 'header') ? minRowHeight :
		minRowHeight + (config.paddingBottom + config.paddingTop);

	//convert array of cell arrays to array of lines
	var lines = Array.apply(null,{length:minRowHeight})
									 .map(Function.call,function(){return []});

	cArrs.forEach(function(cellArr,a){
		var whiteline = Array(config.table.columnWidths[a]).join('\ ');
		
		if(rowType ==='body'){
			//Add whitespace for top padding
			for(var i=0; i<config.paddingTop; i++){
				cellArr.unshift(whiteline);
			}
			
			//Add whitespace for bottom padding
			for(i=0; i<config.paddingBottom; i++){
				cellArr.push(whiteline);
			}
		}	
		for(var b=0; b<minRowHeight; b++){	
			lines[b].push((typeof cellArr[b] !== 'undefined') ? 
										cellArr[b] : whiteline);
		}
	});

	return lines;
}

Render.buildCell = function(config,cell,columnIndex,rowType){
	var cellValue, 
			cellOptions = Merge(true,config,
													(rowType === 'body') ? 
													config.columnSettings[columnIndex] : {}, //ignore columnSettings for footer
													cell);		
	
	if(rowType === 'header'){
		config.table.columns.push(cellOptions);
		cellValue = cellOptions.alias || cellOptions.value || '';
	}	
	else{
		//set cellValue
		switch(true){	
			case(typeof cell === 'undefined' || cell === null):
				//replace undefined/null cell values with placeholder
				cellValue = config.defaultValue;
				break;
			case(typeof cell === 'object' && typeof cell.value !== 'undefined'):	
				cellValue = cell.value;
				break;
			default:
				//cell is assumed to be a scalar
				cellValue = cell;
		}
		
		//run formatter
		if(typeof cellOptions.formatter === 'function'){
			cellValue = cellOptions.formatter(cellValue);
		}
	}
	
	//colorize cellValue
	cellValue = Style.colorizeCell(cellValue,cellOptions,rowType);	

	//textwrap cellValue
	var WrapObj  = Format.wrapCellContent(config,cellValue,columnIndex,
																				cellOptions,rowType);
	cellValue = WrapObj.output;

	//return as array of lines
	return {
		cellArr : cellValue.split('\n'),
		width : WrapObj.width
	};
};

Render.getRowFormat = function(row){
	var type;
	
	//rows passed as an object
	if(typeof row === 'object' && !(row instanceof Array)){
		var keys = Object.keys(row);
		if(keys.length === 1){
			//detected cross table
			var key = keys[0];
			if(row[key] instanceof Array){
				type = 'automattic-cross';
			}
			//detected vertical table
			else{
				type = 'automattic-vertical';	
			}
		}
		else {
			//detected horizontal table
			type = 'o-horizontal';
		}
	}
	//rows passed as an array
	else{
		type = 'a-horizontal';	
	}

	return type;
};

//@todo For rotating horizontal data into a vertical table
//Assumes all rows are same length
Render.verticalizeMatrix = function(config,inputArray){

	//Grow to # arrays equal to number of columns in input array
	var outputArray = [];
	var headers = config.table.columns;

	//create a row for each heading, and prepend the row
	//with the heading name
	headers.forEach(function(name){
		outputArray.push([name]);
	});

	inputArray.forEach(function(row){
		row.forEach(function(element,index){
			outputArray[index].push(element);	
		});
	});

	return outputArray;
} 

/**
 * Transforms input data arrays to base rendering structure.
 */
Render.transformRows = function(config,rows){

	var output = [];
	switch(config.rowFormat){
		case('automattic-cross'):
			//@todo assign header styles to first column
			output = rows.map(function(obj){
				var arr = [];
				var key = Object.keys(obj)[0];
				arr.push(key);
				return arr.concat(obj[key]);
			});
			break;
		case('automattic-vertical'):	
			//@todo assign header styles to first column
			output = rows.map(function(value){
				var key = Object.keys(value)[0];
				return [key,value[key]];
			}); 
			break;
		case('o-horizontal'):
			output = rows.map(function(row){	
				//requires that column names are specified in header
				return config.table.header[0].map(function(object){
					return row[object.value] || null;		
				});
			});
			break;
		case('a-horizontal'):
			output = rows;
			break;
		default:
	}

	return output;
}

module.exports = Render;
