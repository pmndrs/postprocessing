import babel from "@rollup/plugin-babel";
import resolve from "@rollup/plugin-node-resolve";
import glsl from "rollup-plugin-glsl";
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
	smaa: {
		input: "src/images/smaa/worker.js",
		plugins: [resolve()].concat(production ? [
			babel(settings.babel),
			terser()
		] : []),
		output: {
			dir: "src/images/smaa",
			entryFileNames: "[name].tmp",
			format: "iife"
		}
	}
}

const lib = {
	module: {
		input: "src/index.js",
		plugins: [
			resolve(),
			glsl(settings.glsl),
			string(settings.string)
		],
		external,
		output: {
			dir: "build",
			entryFileNames: pkg.name + ".esm.js",
			format: "esm",
			banner
		}
	},
	main: {
		input: "src/index.js",
		plugins: [
			resolve(),
			babel(settings.babel),
			glsl(settings.glsl),
			string(settings.string)
		],
		external,
		output: [{
			dir: "build",
			entryFileNames: pkg.name + ".js",
			format: "umd",
			name: pkg.name.replace(/-/g, "").toUpperCase(),
			globals,
			banner
		}, {
			dir: "build",
			entryFileNames: pkg.name + ".min.js",
			format: "umd",
			name: pkg.name.replace(/-/g, "").toUpperCase(),
			plugins: [terser()],
			globals,
			banner
		}]
	}
};

const demo = {
	module: {
		input: "demo/src/index.js",
		plugins: [
			resolve(),
			glsl(settings.glsl),
			string(settings.string)
		],
		output: {
			dir: "public/demo",
			entryFileNames: "[name].js",
			format: "esm"
		}
	},
	main: {
		input: production ? "public/demo/index.js" : "demo/src/index.js",
		plugins: production ? [babel(settings.babel)] : [
			resolve(),
			glsl(settings.glsl),
			string(settings.string)
		],
		output: [{
			dir: "public/demo",
			entryFileNames: "[name].js",
			format: "iife"
		}].concat(production ? [{
			dir: "public/demo",
			entryFileNames: "[name].min.js",
			format: "iife",
			plugins: [terser()]
		}] : [])
	}
};

export default [worker.smaa].concat(production ? [
	lib.module, lib.main, demo.module, demo.main
] : [demo.main]);
