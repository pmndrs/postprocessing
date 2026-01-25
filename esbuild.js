import pkg from "./package.json" with { type: "json" };
import esbuild from "esbuild";
import { glsl } from "esbuild-plugin-glsl";
import glob from "tiny-glob";

const minify = process.argv.includes("-m");
const external = ["three", "spatial-controls", "tweakpane", "@tweakpane/plugin-essentials"];
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
	logLevel: "info",
	format: "iife",
	target: "es6",
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
	logLevel: "info",
	format: "iife",
	target: "es6",
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

const inline = {
	entryPoints: await glob("./manual/assets/js/src/inline/*.ts"),
	outdir: "./manual/assets/js/dist/inline",
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
	const ctxManual = await esbuild.context(manual);
	await ctxManual.watch();
	const ctxInline = await esbuild.context(inline);
	await ctxInline.watch();

} else {

	await esbuild.build(workers);
	await esbuild.build(lib);
	await esbuild.build(manual);
	await esbuild.build(inline);

}
