import pkg from "./package.json" with { type: "json" };
import esbuild from "esbuild";
import { glsl } from "esbuild-plugin-glsl";
import { glob } from "node:fs/promises";

const banner = `/**
 * ${pkg.name} v${pkg.version} build ${new Date().toDateString()}
 * ${pkg.homepage}
 * Copyright 2015 ${pkg.author.name}
 * @license ${pkg.license}
 */`;

const workers = {
	entryPoints: await Array.fromAsync(glob("./src/**/worker.ts")),
	outExtension: { ".js": ".txt" },
	outdir: "./temp",
	logLevel: "info",
	format: "iife",
	target: "es6",
	bundle: true
};

const lib = {
	entryPoints: ["./src/index.ts"],
	outfile: "./dist/index.js",
	banner: { js: banner },
	external: ["three"],
	plugins: [glsl()],
	logLevel: "info",
	format: "esm",
	bundle: true
};

if(process.argv.includes("-w")) {

	const ctxWorkers = await esbuild.context(workers);
	await ctxWorkers.watch();

	const ctxLib = await esbuild.context(lib);
	await ctxLib.watch();

} else {

	await esbuild.build(workers);
	await esbuild.build(lib);

}
