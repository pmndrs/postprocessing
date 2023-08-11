import pkg from "./package.json" assert { type: "json" };
import esbuild from "esbuild";
import { glsl } from "esbuild-plugin-glsl";
import glob from "tiny-glob";

const minify = process.argv.includes("-m");
const external = ["three", "spatial-controls", "tweakpane"];
const plugins = [glsl({ minify })];
const date = new Date();
const banner = `/**
 * ${pkg.name} v${pkg.version} build ${date.toDateString()}
 * ${pkg.homepage}
 * Copyright 2015 ${pkg.author.name}
 * @license ${pkg.license}
 */`;

// #region Library

const workers = {
	entryPoints: await glob("./src/**/worker.ts"),
	outExtension: { ".js": ".txt" },
	outdir: "./temp",
	target: "es6",
	logLevel: "info",
	format: "iife",
	bundle: true,
	minify
};

const lib = {
	entryPoints: ["./src/index.ts"],
	outfile: "./dist/index.js",
	banner: { js: banner },
	logLevel: "info",
	format: "esm",
	bundle: true,
	external,
	plugins
};

// #endregion

// #region Manual

const vendor = {
	entryPoints: ["./manual/assets/js/libs/vendor.ts"],
	outdir: "./manual/assets/js/dist/libs",
	globalName: "VENDOR",
	target: "es6",
	logLevel: "info",
	format: "iife",
	bundle: true,
	minify
};

const manual = {
	entryPoints: ["./manual/assets/js/src/index.ts"]
		.concat(await glob("./manual/assets/js/src/demos/*.ts")),
	outdir: "./manual/assets/js/dist",
	logLevel: "info",
	format: "iife",
	target: "es6",
	bundle: true,
	external,
	plugins,
	minify
};

// #endregion

await esbuild.build(vendor);

if(process.argv.includes("-w")) {

	const ctxWorkers = await esbuild.context(workers);
	await ctxWorkers.watch();
	// const ctxManual = await esbuild.context(manual);
	// await ctxManual.watch();

} else {

	await esbuild.build(workers);
	await esbuild.build(lib);
	// await esbuild.build(manual);

}

