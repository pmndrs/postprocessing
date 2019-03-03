import babel from "rollup-plugin-babel";
import minify from "rollup-plugin-babel-minify";
import commonjs from "rollup-plugin-commonjs";
import resolve from "rollup-plugin-node-resolve";
import { string } from "rollup-plugin-string";

const pkg = require("./package.json");
const date = (new Date()).toDateString();

const banner = `/**
 * ${pkg.name} v${pkg.version} build ${date}
 * ${pkg.homepage}
 * Copyright ${date.slice(-4)} ${pkg.author.name}, ${pkg.license}
 */`;

const production = (process.env.NODE_ENV === "production");
const globals = { three: "THREE" };
const external = ["three"];

const lib = {

	esm: {

		input: "src/index.js",
		output: {
			file: pkg.module,
			format: "esm",
			banner: banner,
			globals: globals
		},

		external: external,
		plugins: [resolve(), string({
			include: ["**/*.frag", "**/*.vert"]
		})]

	},

	umd: {

		input: "src/index.js",
		output: {
			file: pkg.main,
			format: "umd",
			name: pkg.name.replace(/-/g, "").toUpperCase(),
			banner: banner,
			globals: globals
		},

		external: external,
		plugins: [resolve(), string({
			include: ["**/*.frag", "**/*.vert"]
		})].concat(production ? [babel()] : [])

	}

};

const demo = {

	iife: {

		input: "demo/src/index.js",
		output: {
			file: "public/demo/index.js",
			format: "iife",
			globals: globals
		},

		external: external,
		plugins: [resolve(), commonjs(), string({
			include: ["**/*.frag", "**/*.vert"]
		})].concat(production ? [babel()] : [])

	}

};

export default [lib.esm, lib.umd, demo.iife].concat(production ? [{

		input: lib.umd.input,
		output: {
			file: lib.umd.output.file.replace(".js", ".min.js"),
			format: "umd",
			name: pkg.name.replace(/-/g, "").toUpperCase(),
			banner: banner,
			globals: globals
		},

		external: external,
		plugins: [resolve(), string({
			include: ["**/*.frag", "**/*.vert"]
		}), babel(), minify({
			bannerNewLine: true,
			comments: false
		})]

	}, {

		input: demo.iife.input,
		output: {
			file: demo.iife.output.file.replace(".js", ".min.js"),
			format: "iife",
			globals: globals
		},

		external: external,
		plugins: [resolve(), commonjs(), string({
			include: ["**/*.frag", "**/*.vert"]
		}), babel(), minify({
			comments: false
		})]

}] : []);
