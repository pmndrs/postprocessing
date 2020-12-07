import babel from "@rollup/plugin-babel";
import resolve from "@rollup/plugin-node-resolve";
import glsl from "rollup-plugin-glsl";
import { string } from "rollup-plugin-string";
import { terser } from "rollup-plugin-terser";
import pkg from "./package.json";

const date = (new Date()).toDateString();
const production = (process.env.NODE_ENV === "production");
const external = Object.keys(pkg.peerDependencies);
const globals = Object.assign({}, ...external.map((value) => ({
	[value]: value.replace(/-/g, "").toUpperCase()
})));

const banner = `/**
 * ${pkg.name} v${pkg.version} build ${date}
 * ${pkg.homepage}
 * Copyright ${date.slice(-4)} ${pkg.author.name}
 * @license ${pkg.license}
 */`;

const babelSettings = {
	babelHelpers: "bundled"
};

function createPlugins(plugins = []) {

	return [
		resolve(),
		glsl({
			sourceMap: false,
			compress: production,
			include: ["**/*.frag", "**/*.vert"]
		}),
		string({
			include: ["**/*.tmp"]
		})
	].concat(plugins);

}

const worker = {
	smaa: {
		input: "src/images/smaa/worker.js",
		plugins: createPlugins(production ? [
			babel(babelSettings),
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
		plugins: createPlugins(),
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
		plugins: createPlugins([babel(babelSettings)]),
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
		plugins: createPlugins(),
		output: {
			dir: "public/demo",
			entryFileNames: "[name].js",
			format: "esm"
		}
	},
	main: {
		input: production ? "public/demo/index.js" : "demo/src/index.js",
		plugins: production ? [babel(babelSettings)] : createPlugins(),
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
