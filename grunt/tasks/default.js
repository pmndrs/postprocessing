module.exports = function(grunt) {

	grunt.registerTask("default", grunt.option("production") ?
		["build", "nodeunit", "uglify"] :
		["build", "nodeunit"]
	);

};
