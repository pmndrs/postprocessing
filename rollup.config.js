import babel from "rollup-plugin-babel";
import minify from "rollup-plugin-babel-minify";
import commonjs from "rollup-plugin-commonjs";
import glsl from "rollup-plugin-glsl";
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
const external = ["three"];

const lib = {

	esm: {

		input: "src/index.js",
		external: external,
		plugins: [resolve(), glsl({
			include: ["**/*.frag", "**/*.vert"],
			compress: production,
			sourceMap: false
		})],
		output: [{
			file: pkg.main,
			format: "esm",
			globals: globals
		}].concat(!production ? [] : [
			{
				file: pkg.module,
				format: "esm",
				banner: banner,
				globals: globals
			}, {
				file: pkg.main.replace(".js", ".min.js"),
				format: "esm",
				globals: globals
			}
		])

	},

	umd: {

		input: pkg.main,
		external: external,
		plugins: production ? [babel()] : [],
		output: {
			file: pkg.main,
			format: "umd",
			name: pkg.name.replace(/-/g, "").toUpperCase(),
			banner: banner,
			globals: globals
		}

	}

};

const demo = {

	esm: {

		input: "demo/src/index.js",
		external: external,
		plugins: [resolve(), commonjs(), glsl({
			include: ["**/*.frag", "**/*.vert"],
			sourceMap: false
		})],
		output: [{
			file: "public/demo/index.js",
			format: "esm",
			globals: globals
		}].concat(!production ? [] : [{
			file: "public/demo/index.min.js",
			format: "esm",
			globals: globals
		}])

	},

	iife: {

		input: "public/demo/index.js",
		external: external,
		plugins: production ? [babel()] : [],
		output: {
			file: "public/demo/index.js",
			format: "iife",
			globals: globals
		}

	}

};

export default [lib.esm, lib.umd, demo.esm, demo.iife].concat(production ? [{

		input: lib.esm.output[2].file,
		external: external,
		plugins: [babel(), minify({
			bannerNewLine: true,
			comments: false
		})],
		output: {
			file: lib.esm.output[2].file,
			format: "umd",
			name: pkg.name.replace(/-/g, "").toUpperCase(),
			banner: banner,
			globals: globals
		}

	}, {

		input: demo.esm.output[1].file,
		external: external,
		plugins: [babel(), minify({
			comments: false
		})],
		output: {
			file: demo.esm.output[1].file,
			format: "iife",
			globals: globals
		}

}] : []);
