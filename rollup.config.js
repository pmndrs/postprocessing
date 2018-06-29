import babel from "rollup-plugin-babel";
import minify from "rollup-plugin-babel-minify";
import resolve from "rollup-plugin-node-resolve";
import string from "rollup-plugin-string";

const pkg = require("./package.json");
const date = (new Date()).toDateString();

const banner = `/**
 * ${pkg.name} v${pkg.version} build ${date}
 * ${pkg.homepage}
 * Copyright ${date.slice(-4)} ${pkg.author.name}, ${pkg.license}
 */`;

const lib = {

	input: pkg.module,
	output: {
		file: "build/bundle.js",
		format: "umd",
		name: pkg.name.replace(/-/g, "").toUpperCase(),
		banner: banner,
		globals: {
			three: "THREE"
		}
	},

	external: ["three"],

	plugins: [resolve(), string({
		include: ["**/*.frag", "**/*.vert"]
	})].concat(process.env.BABEL_ENV === "production" ?
		[babel(), minify({
			bannerNewLine: true,
			sourceMap: false,
			comments: false
		})] : []
	)

};

const demo = {

	input: "demo/src/index.js",
	output: {
		file: "public/demo/index.js",
		format: "iife",
		globals: {
			"three": "THREE"
		}
	},

	external: ["three"],

	plugins: [resolve(), string({
		include: ["**/*.frag", "**/*.vert"]
	})].concat(process.env.BABEL_ENV === "production" ?
		[babel(), minify({
			sourceMap: false,
			comments: false
		})] : []
	)

};

export default [lib, demo];
