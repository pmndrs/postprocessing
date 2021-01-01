import { BuildOptions } from "esbuild";
import glsl from "esbuild-plugin-glsl";
import * as pkg from "./package.json";

const date = (new Date()).toDateString();
const production = (process.env.NODE_ENV === "production");
const globalName = pkg.name.replace(/-/g, "").toUpperCase();
const external = Object.keys(pkg.peerDependencies);

const banner = `/**
 * ${pkg.name} v${pkg.version} build ${date}
 * ${pkg.homepage}
 * Copyright ${date.slice(-4)} ${pkg.author.name}
 * @license ${pkg.license}
 */`;

// @todo Remove in next major release.
const footer = `if(typeof module==="object"&&module.exports)module.exports=${globalName};`;

function config(entryPoint: string, outfile: string, format: string, minify = false): BuildOptions {

	const lib = (entryPoint === "src/index.js");
	const iife = (format === "iife");

	return {
		entryPoints: [entryPoint],
		outfile,
		globalName: lib ? globalName : "",
		external: lib ? external : [],
		banner: lib ? banner : "",
		footer: (lib && iife) ? footer : "",
		plugins: [glsl({ minify: lib })],
		loader: {
			".png": "dataurl",
			".worker": "text"
		},
		bundle: true,
		minify,
		format
	} as BuildOptions;

}

export const configGroups = [
	[
		config("src/images/lut/worker.js", "tmp/lut.worker", "iife", production),
		config("src/images/smaa/worker.js", "tmp/smaa.worker", "iife", production)
	],
	production ? [
		config("src/index.js", `build/${pkg.name}.esm.js`, "esm"),
		config("src/index.js", `build/${pkg.name}.js`, "iife"),
		config("src/index.js", `build/${pkg.name}.min.js`, "iife", true),
		config("demo/src/index.js", "public/demo/index.js", "iife"),
		config("demo/src/index.js", "public/demo/index.min.js", "iife", true)
	] : [
		config("demo/src/index.js", "public/demo/index.js", "iife")
	]
];

export const sourceDirectories = ["src", "demo/src"];
