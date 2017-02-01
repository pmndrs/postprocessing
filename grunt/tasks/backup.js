module.exports = function(grunt) {

	grunt.registerTask("backup", ["restore", "copy:backup"]);

};
