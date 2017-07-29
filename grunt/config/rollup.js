const resolve = require("rollup-plugin-node-resolve");
const string = require("rollup-plugin-string");
const babel = require("rollup-plugin-babel");

module.exports = function(grunt) {

	return {

		options: {
			globals: {
				"three": "THREE",
				"stats.js": "Stats",
				"dat.gui": "dat"
			},
			external: [
				"three",
				"stats.js",
				"dat.gui"
			],
			plugins() {
				return [
					resolve({
						jsnext: true
					}),
					string({
						include: [
							"**/*.frag",
							"**/*.vert"
						]
					})
				].concat(grunt.option("production") ? [babel()] : []);
			}
		},

		lib: {
			options: {
				format: "umd",
				moduleName: "<%= package.name.replace(/-/g, \"\").toUpperCase() %>",
				banner: "<%= banner %>"
			},
			src: "<%= package.module %>",
			dest: "build/<%= package.name %>.js"
		},

		demo: {
			options: {
				format: "iife"
			},
			src: "demo/index.js",
			dest: "public/index.js"
		}

	};

};
