var Merge = require("merge");
var Style = require("./style.js");
var Format = require("./format.js");
var Render = {};

Render.buildRow = function(config,row,rowType){

	var minRowHeight = 0;
	
	//support both rows passed as an array 
	//and rows passed as an object
	if(typeof row === 'object' && !(row instanceof Array)){
		row =	config.table.columns.map(function(object){
			return row[object.value] || null;		
		});
	}
	else{
		//equalize array lengths
		var difL = config.table.columnWidths.length - row.length;
		if(difL > 0){
			//add empty element to array
			row = row.concat(Array.apply(null, new Array(difL))
														.map(function(){return null})); 
		}
		else if(difL < 0){
			//truncate array
			row.length = config.table.columnWidths.length;
		}
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
		minRowHeight + 
		(config.paddingBottom + 
		 config.paddingTop);

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
			cellOptions = Merge(true,
													config,
													(rowType === 'body') ? 
														config.columnOptions[columnIndex] : {}, //ignore columnOptions for footer
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
debugger;				
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

module.exports = Render;
