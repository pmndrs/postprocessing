import { createRequire } from "module";
import { glsl } from "esbuild-plugin-glsl";
import tsPaths from "esbuild-ts-paths";
import glob from "tiny-glob";
import esbuild from "esbuild";

const require = createRequire(import.meta.url);
const pkg = require("./package");

const minify = process.argv.includes("-m");
const watch = process.argv.includes("-w");
const plugins = [glsl({ minify }), tsPaths()];
const external = ["three", "spatial-controls", "tweakpane"];

const date = new Date();
const banner = `/**
 * ${pkg.name} v${pkg.version} build ${date.toDateString()}
 * ${pkg.homepage}
 * Copyright 2015-${date.getFullYear()} ${pkg.author.name}
 * @license ${pkg.license}
 */`;

await esbuild.build({
	entryPoints: await glob("src/**/worker.js"),
	outExtension: { ".js": ".txt" },
	outdir: "tmp",
	target: "es6",
	logLevel: "info",
	format: "iife",
	bundle: true,
	minify,
	watch
}).catch(() => process.exit(1));

await esbuild.build({
	entryPoints: ["demo/src/index.js"],
	outdir: "public/demo",
	target: "es6",
	logLevel: "info",
	format: "iife",
	bundle: true,
	plugins,
	minify,
	watch
}).catch(() => process.exit(1));

await esbuild.build({
	entryPoints: ["manual/assets/js/libs/vendor.js"],
	outdir: "manual/assets/js/dist/libs",
	globalName: "VENDOR",
	target: "es6",
	logLevel: "info",
	format: "iife",
	bundle: true,
	minify
}).catch(() => process.exit(1));

await esbuild.build({
	entryPoints: ["manual/assets/js/src/index.js"]
		.concat(await glob("manual/assets/js/src/demos/*.js")),
	outdir: "manual/assets/js/dist",
	logLevel: "info",
	format: "iife",
	target: "es6",
	bundle: true,
	external,
	plugins,
	minify,
	watch
}).catch(() => process.exit(1));

await esbuild.build({
	entryPoints: ["src/index.js"],
	outfile: `build/${pkg.name}.esm.js`,
	banner: { js: banner },
	logLevel: "info",
	format: "esm",
	target: "es2019",
	bundle: true,
	external,
	plugins
}).catch(() => process.exit(1));

await esbuild.build({
	entryPoints: ["src/index.js"],
	outfile: `build/${pkg.name}.mjs`,
	banner: { js: banner },
	logLevel: "info",
	format: "esm",
	target: "es2019",
	bundle: true,
	external,
	plugins
}).catch(() => process.exit(1));

// @todo Remove in next major release.
const globalName = pkg.name.replace(/-/g, "").toUpperCase();
const requireShim = `if(typeof window==="object"&&!window.require)window.require=()=>window.THREE;`;
const footer = `if(typeof module==="object"&&module.exports)module.exports=${globalName};`;

await esbuild.build({
	entryPoints: ["src/index.js"],
	outfile: `build/${pkg.name}.js`,
	banner: { js: `${banner}\n${requireShim}` },
	footer: { js: footer },
	logLevel: "info",
	format: "iife",
	target: "es6",
	bundle: true,
	globalName,
	external,
	plugins
}).catch(() => process.exit(1));

await esbuild.build({
	entryPoints: ["src/index.js"],
	outfile: `build/${pkg.name}.min.js`,
	banner: { js: `${banner}\n${requireShim}` },
	footer: { js: footer },
	logLevel: "info",
	format: "iife",
	target: "es6",
	bundle: true,
	globalName,
	external,
	plugins,
	minify
}).catch(() => process.exit(1));
