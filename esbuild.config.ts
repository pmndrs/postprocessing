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
const requireShim = `if(typeof window === "object"&&!window.require)window.require=()=>window.THREE;`;
const footer = `if(typeof module==="object"&&module.exports)module.exports=${globalName};`;

function config(infile: string, outfile: string, format: string, minify = false): BuildOptions {

	const lib = (infile === "src/index.js");
	const iife = (format === "iife");
	const header = (!lib || !iife) ? banner : banner + "\n" + requireShim;

	return {
		entryPoints: [infile],
		external: lib ? external : [],
		globalName: lib ? globalName : "",
		banner: lib ? header : "",
		footer: (lib && iife) ? footer : "",
		plugins: [glsl({ minify })],
		loader: {
			".png": "dataurl",
			".worker": "text"
		},
		bundle: true,
		outfile,
		minify,
		format
	} as BuildOptions;

}

const workerConfigs = [
	config("src/images/lut/worker.js", "tmp/lut.worker", "iife", production),
	config("src/images/smaa/worker.js", "tmp/smaa.worker", "iife", production)
];

const demoConfigs = [
	config("demo/src/index.js", "public/demo/index.js", "iife", production)
];

const libConfigs = production ? [
	config("src/index.js", `build/${pkg.name}.esm.js`, "esm"),
	config("src/index.js", `build/${pkg.name}.js`, "iife"),
	config("src/index.js", `build/${pkg.name}.min.js`, "iife", true)
] : [];

export const sourceDirectories = ["src", "demo/src"];
export const configLists = [workerConfigs, demoConfigs, libConfigs];
