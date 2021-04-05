import { createRequire } from "module";
import { glsl } from "esbuild-plugin-glsl";
import esbuild from "esbuild";

const require = createRequire(import.meta.url);
const pkg = require("./package");
const date = (new Date()).toDateString();
const external = Object.keys(pkg.peerDependencies || {});
const minify = (process.env.NODE_ENV === "production");
const watch = process.argv.includes("-w");
const plugins = [glsl({ minify })];
const banner = `/**
 * ${pkg.name} v${pkg.version} build ${date}
 * ${pkg.homepage}
 * Copyright ${date.slice(-4)} ${pkg.author.name}
 * @license ${pkg.license}
 */`;

await esbuild.build({
	entryPoints: [
		"src/images/lut/worker.js",
		"src/images/smaa/worker.js"
	],
	outExtension: { ".js": ".txt" },
	outdir: "tmp",
	logLevel: "info",
	format: "iife",
	bundle: true,
	minify,
	watch
}).catch(() => process.exit(1));

await esbuild.build({
	entryPoints: ["demo/src/index.js"],
	outdir: "public/demo",
	logLevel: "info",
	format: "iife",
	bundle: true,
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
	bundle: true,
	globalName,
	external,
	plugins,
	minify
}).catch(() => process.exit(1));
