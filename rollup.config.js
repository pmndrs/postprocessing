import babel from "rollup-plugin-babel";
import commonjs from "rollup-plugin-commonjs";
import glsl from "rollup-plugin-glsl";
import minify from "rollup-plugin-babel-minify";
import resolve from "rollup-plugin-node-resolve";

const pkg = require("./package.json");
const date = (new Date()).toDateString();

const banner = `/**
 * ${pkg.name} v${pkg.version} build ${date}
 * ${pkg.homepage}
 * Copyright ${date.slice(-4)} ${pkg.author.name}, ${pkg.license}
 */`;

const production = (process.env.NODE_ENV === "production");
const globals = { three: "THREE" };

const lib = {

	module: {
		input: "src/index.js",
		external: Object.keys(globals),
		plugins: [resolve(), glsl({
			include: ["**/*.frag", "**/*.vert"],
			compress: production,
			sourceMap: false
		})],
		output: [{
			file: pkg.module,
			format: "esm",
			banner: banner,
			globals: globals
		}, {
			file: pkg.main,
			format: "esm",
			globals: globals
		}, {
			file: pkg.main.replace(".js", ".min.js"),
			format: "esm",
			globals: globals
		}]
	},

	main: {
		input: pkg.main,
		external: Object.keys(globals),
		plugins: [babel()],
		output: {
			file: pkg.main,
			format: "umd",
			name: pkg.name.replace(/-/g, "").toUpperCase(),
			banner: banner,
			globals: globals
		}
	},

	min: {
		input: pkg.main.replace(".js", ".min.js"),
		external: Object.keys(globals),
		plugins: [minify({
			bannerNewLine: true,
			comments: false
		}), babel()],
		output: {
			file: pkg.main.replace(".js", ".min.js"),
			format: "umd",
			name: pkg.name.replace(/-/g, "").toUpperCase(),
			banner: banner,
			globals: globals
		}
	}

};

const demo = {

	module: {
		input: "demo/src/index.js",
		external: Object.keys(globals),
		plugins: [resolve(), commonjs(), glsl({
			include: ["**/*.frag", "**/*.vert"],
			compress: production,
			sourceMap: false
		})],
		output: [{
			file: "public/demo/index.js",
			format: "esm",
			globals: globals
		}].concat(production ? [{
			file: "public/demo/index.min.js",
			format: "esm",
			globals: globals
		}] : [])
	},

	main: {
		input: production ? "public/demo/index.js" : "demo/src/index.js",
		external: Object.keys(globals),
		plugins: production ? [babel()] : [resolve(), commonjs(), glsl({
			include: ["**/*.frag", "**/*.vert"],
			compress: false,
			sourceMap: false
		})],
		output: [{
			file: "public/demo/index.js",
			format: "iife",
			globals: globals
		}]
	},

	min: {
		input: "public/demo/index.min.js",
		external: Object.keys(globals),
		plugins: [minify({
			comments: false
		}), babel()],
		output: {
			file: "public/demo/index.min.js",
			format: "iife",
			globals: globals
		}
	}

};

export default (production ? [
	lib.module, lib.main, lib.min,
	demo.module, demo.main, demo.min
] : [demo.main]);
