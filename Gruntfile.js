const loadGruntConfig = require("load-grunt-config");
const timeGrunt = require("time-grunt");
const path = require("path");

module.exports = function(grunt) {

	const date = grunt.template.today("mmm dd yyyy");

	timeGrunt(grunt);

	loadGruntConfig(grunt, {

		configPath: path.join(process.cwd(), "grunt/config"),

		jitGrunt: {
			customTasksDir: "grunt/tasks",
			staticMappings: {
				esdoc: "@vanruesc/grunt-esdoc"
			}
		},

		data: {
			banner: "/**\n" +
				" * <%= package.name %> v<%= package.version %> build " + date + "\n" +
				" * <%= package.homepage %>\n" +
				" * Copyright " + date.slice(-4) + " <%= package.author.name %>, <%= package.license %>\n" +
				" */\n"
		}

	});

};
