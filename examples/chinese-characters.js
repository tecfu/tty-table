var Table = require('../');

var header = [
	{
		value : "项目",
	},
	{
		value : "价格",
	},
	{
		value : "有机",
	}
];

//Example with arrays as rows 
var rows = [
	["汉堡包",2.50,null],
	["特制的酱汁",0.10],
	["2玉米饼, 大米和豆类, 奶酪",9.80,""],
	["苹果片",1.00,"yes"],
	[null,1.50,"no"],
	["意大利粉, 火腿, 意大利干酪",3.75,"no"]
];

var t1 = Table(header,rows,{
	borderStyle : 1,
	paddingBottom : 0,
	paddingLeft: 2,
	paddingRight: 1,
	headerAlign : "right",
	align : "center",
	color : "white"
});

str1 = t1.render();
console.log(str1);
