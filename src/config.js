var Chalk = require('chalk');
var Config = {
	defaultValue : (function(){
		return (typeof Chalk !== 'undefined') ? Chalk.red("#ERR") : "#ERR";
	}()),
	marginTop : 1,
	marginLeft : 2,
	maxWidth : 20,
	formatter : null,
	headerAlign : "center",
	footerAlign : "center",
	align : "center",
	paddingRight : 0,
	paddingLeft : 0,
	paddingBottom : 0,
	paddingTop : 0,
	color : false,
	headerColor : false,
	footerColor : false,
	borderStyle : 1,
	borderCharacters : [
		[
			{v: " ", l: " ", j: " ", h: " ", r: " "},
			{v: " ", l: " ", j: " ", h: " ", r: " "},
			{v: " ", l: " ", j: " ", h: " ", r: " "}
		],
		[
			{v: "│", l: "┌", j: "┬", h: "─", r: "┐"},
			{v: "│", l: "├", j: "┼", h: "─", r: "┤"},
			{v: "│", l: "└", j: "┴", h: "─", r: "┘"}
		],
		[
			{v: "|", l: "+", j: "+", h: "-", r: "+"},
			{v: "|", l: "+", j: "+", h: "-", r: "+"},
			{v: "|", l: "+", j: "+", h: "-", r: "+"}
		]
	]
};

Config.GUTTER = 1;
//save so cell options can be merged into column options
Config.columnOptions = []; 
Config.headerEmpty = false;
Config.table = {
	columns : [],
	columnWidths : [],
	columnInnerWidths : [],
	header : [],
	body : [],
	footer : [],
	height : 0
};

module.exports = Config;
