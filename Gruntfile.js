module.exports = function(grunt) {

	grunt.initConfig({

		date: grunt.template.today("mmm dd yyyy"),
		pkg: grunt.file.readJSON("package.json"),

		banner: "/**\n" +
			" * <%= pkg.name %> v<%= pkg.version %> build <%= date %>\n" +
			" * <%= pkg.homepage %>\n" +
			" * Copyright <%= date.slice(-4) %> <%= pkg.author.name %>, <%= pkg.license %>\n" + 
			" */\n",

		jshint: {
			options: {
				jshintrc: true
			},
			files: ["Gruntfile.js", "src/**/*.js", "test/**/*.js"]
		},

		rollup: {
			options: {
				globals: {three: "THREE"},
				external: ["three"],
				plugins: [
					require("rollup-plugin-node-resolve")({
						jsnext: true
					}),
					require("rollup-plugin-string")({
						include: [
							"**/*.frag",
							"**/*.vert"
						]
					}),
					require("rollup-plugin-babel")({
						exclude: [
							"node_modules/**"
						]
					})
				]
			},
			dist: {
				options: {
					format: "umd",
					moduleName: "<%= pkg.name.toUpperCase() %>",
					banner: "<%= banner %>"
				},
				src: "src/index.js",
				dest: "build/<%= pkg.name %>.js"
			}
		},

		uglify: {
			options: {
				banner: "<%= banner %>"
			},
			dist: {
				files: {
					"build/<%= pkg.name %>.min.js": ["build/<%= pkg.name %>.js"]
				}
			}
		},

		nodeunit: {
			options: {
				reporter: "default"
			},
			src: ["test/**/*.js"]
		},

		lemon: {
			options: {
				extensions: {
					".frag": "utf8",
					".vert": "utf8"
				}
			},
			materials: {
				src: "src/materials/*/index.js"
			}
		},

		copy: {
			backup: {
				expand: true,
				cwd: "src",
				src: "materials/*/index.js",
				dest: "backup",
				filter: "isFile"
			},
			restore: {
				expand: true,
				cwd: "backup",
				src: "**",
				dest: "src",
				filter: "isFile"
			},
			bundle: {
				expand: false,
				src: ["build/<%= pkg.name %>.js"],
				dest: "public/<%= pkg.name %>.js",
				filter: "isFile"
			}
		},

		clean: {
			backup: ["backup"]
		},

		yuidoc: {
			compile: {
				name: "<%= pkg.name %>",
				description: "<%= pkg.description %>",
				version: "<%= pkg.version %>",
				url: "<%= pkg.homepage %>",
				options: {
					paths: "src",
					outdir: "docs"
				}
			}
		}

	});

	grunt.loadNpmTasks("grunt-contrib-nodeunit");
	grunt.loadNpmTasks("grunt-contrib-jshint");
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks("grunt-contrib-yuidoc");
	grunt.loadNpmTasks("grunt-contrib-clean");
	grunt.loadNpmTasks("grunt-contrib-copy");
	grunt.loadNpmTasks("grunt-rollup");
	grunt.loadNpmTasks("grunt-lemon");

	grunt.registerTask("default", ["build", "nodeunit"]);
	grunt.registerTask("build", ["jshint", "rollup", "copy:bundle"]);
	grunt.registerTask("test", ["jshint", "nodeunit"]);

	grunt.registerTask("backup", ["restore", "copy:backup"]);
	grunt.registerTask("restore", ["copy:restore", "clean:backup"]);
	grunt.registerTask("prepublish", ["backup", "lemon"]);
	grunt.registerTask("postpublish", ["restore"]);

};
