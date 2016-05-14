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
			adapter = require('./default-adapter.js');	
		}
	return adapter;
})()
