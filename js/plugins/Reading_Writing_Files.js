/*
* @plugindesc xxxxx   
*/

(function() {  

	var params = PluginManager.parameters("my_plugin");
	var text = params["Text Param"];
	var number = params["Number Param"];
    var file = params["File Param"];
	
	console.log(text);
	console.log(number);
	console.log(file);

})();
