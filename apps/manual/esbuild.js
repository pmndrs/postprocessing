import esbuild from "esbuild";
import { glsl } from "esbuild-plugin-glsl";
import { glob } from "node:fs/promises";

const minify = process.argv.includes("-m");
const external = ["three", "spatial-controls", "tweakpane", "@tweakpane/plugin-essentials"];
const plugins = [glsl()];

const manual = {
	entryPoints: ["./assets/js/src/index.ts"]
		.concat(await Array.fromAsync(glob("./assets/js/src/demos/*.ts"))),
	outdir: "./assets/js/dist",
	logLevel: "info",
	format: "iife",
	target: "es6",
	bundle: true,
	external,
	plugins,
	minify
};

const inline = {
	entryPoints: await Array.fromAsync(glob("./assets/js/src/inline/*.ts")),
	outdir: "./assets/js/dist/inline",
	logLevel: "info",
	format: "iife",
	target: "es6",
	bundle: true,
	external,
	plugins,
	minify
};

const vendor = {
	entryPoints: ["./assets/js/libs/vendor.ts"],
	outdir: "./assets/js/dist/libs",
	globalName: "VENDOR",
	logLevel: "info",
	format: "iife",
	target: "es6",
	bundle: true,
	minify
};

await esbuild.build(vendor);

if(process.argv.includes("-w")) {

	const ctxManual = await esbuild.context(manual);
	await ctxManual.watch();

	const ctxInline = await esbuild.context(inline);
	await ctxInline.watch();

} else {

	await esbuild.build(manual);
	await esbuild.build(inline);

}
