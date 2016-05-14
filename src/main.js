module.exports = (function(){
	//adapter to support multiple syntaxes	
	var adapter;
	switch(true){
		case(require.main === module):
			//running directly in terminal
			adapter = require('./terminal-adapter.js');
			break;
		case(arguments[0] === 'cli-table'):
			//automattic/cli-table adapter
			adapter = require('./cli-table-adapter.js');
			break;
		default:
			//default adapter
			var start = new Date();	
			adapter = require('./default-adapter.js');	
			var time = new Date() - start;
			console.log('TIME: '+time);
		}
	return adapter;
})()
