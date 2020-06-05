import babel from "@rollup/plugin-babel";
import resolve from "@rollup/plugin-node-resolve";
import glsl from "rollup-plugin-glsl";
import { eslint } from "rollup-plugin-eslint";
import { string } from "rollup-plugin-string";
import { terser } from "rollup-plugin-terser";

const pkg = require("./package.json");
const date = (new Date()).toDateString();

// Meta settings.

const banner = `/**
 * ${pkg.name} v${pkg.version} build ${date}
 * ${pkg.homepage}
 * Copyright ${date.slice(-4)} ${pkg.author.name}
 * @license ${pkg.license}
 */`;

const production = (process.env.NODE_ENV === "production");
const external = Object.keys(pkg.peerDependencies);
const globals = Object.assign({}, ...external.map((value) => ({
	[value]: value.replace(/-/g, "").toUpperCase()
})));

// Plugin settings.

const settings = {

	babel: {
		babelHelpers: "bundled"
	},
	eslint: {
		include: ["src/**/*.js", "demo/**/*.js"]
	},
	glsl: {
		include: ["**/*.frag", "**/*.vert"],
		compress: production,
		sourceMap: false
	},
	string: {
		include: ["**/*.tmp"]
	}

};

// Bundle configurations.

const worker = {

	input: "src/images/smaa/utils/worker.js",
	plugins: [resolve(), eslint(settings.eslint)].concat(
		production ? [terser(), babel(settings.babel)] : []
	),
	output: {
		file: "src/images/smaa/utils/worker.tmp",
		format: "iife"
	}

}

const lib = {

	module: {
		input: "src/index.js",
		external,
		plugins: [
			resolve(),
			eslint(settings.eslint),
			glsl(settings.glsl),
			string(settings.string)
		],
		output: [
			{
				file: pkg.module,
				format: "esm",
				globals,
				banner
			}, {
				file: pkg.main,
				format: "esm",
				globals
			}, {
				file: pkg.main.replace(".js", ".min.js"),
				format: "esm",
				globals
			}
		]
	},

	main: {
		input: pkg.main,
		external,
		plugins: [babel(settings.babel)],
		output: {
			file: pkg.main,
			format: "umd",
			name: pkg.name.replace(/-/g, "").toUpperCase(),
			globals,
			banner
		}
	},

	min: {
		input: pkg.main.replace(".js", ".min.js"),
		external,
		plugins: [terser(), babel(settings.babel)],
		output: {
			file: pkg.main.replace(".js", ".min.js"),
			format: "umd",
			name: pkg.name.replace(/-/g, "").toUpperCase(),
			globals,
			banner
		}
	}

};

const demo = {

	module: {
		input: "demo/src/index.js",
		plugins: [
			resolve(),
			eslint(settings.eslint),
			glsl(settings.glsl),
			string(settings.string)
		],
		output: [
			{
				file: "public/demo/index.js",
				format: "esm"
			}, {
				file: "public/demo/index.min.js",
				format: "esm"
			}
		]
	},

	main: {
		input: production ? "public/demo/index.js" : "demo/src/index.js",
		plugins: production ? [babel(settings.babel)] : [
			resolve(),
			eslint(settings.eslint),
			glsl(settings.glsl),
			string(settings.string)
		],
		output: {
			file: "public/demo/index.js",
			format: "iife"
		}
	},

	min: {
		input: "public/demo/index.min.js",
		plugins: [terser(), babel(settings.babel)],
		output: {
			file: "public/demo/index.min.js",
			format: "iife"
		}
	}

};

export default [worker].concat(production ? [
	lib.module, lib.main, lib.min,
	demo.module, demo.main, demo.min
] : [demo.main]);
