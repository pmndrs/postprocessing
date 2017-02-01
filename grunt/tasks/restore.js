module.exports = function(grunt) {

	grunt.registerTask("restore", ["copy:restore", "clean:backup"]);

};
