import { createRequire } from "module";
import { hideBin } from "yargs/helpers";
import { glsl } from "esbuild-plugin-glsl";
import esbuild from "esbuild";
import yargs from "yargs";

const require = createRequire(import.meta.url);
const pkg = require("./package");
const date = (new Date()).toDateString();
const production = (process.env.NODE_ENV === "production");
const globalName = pkg.name.replace(/-/g, "").toUpperCase();
const external = Object.keys(pkg.peerDependencies);
const { argv } = yargs(hideBin(process.argv))
	.option("watch", { alias: "w", type: "boolean" });

const banner = `/**
 * ${pkg.name} v${pkg.version} build ${date}
 * ${pkg.homepage}
 * Copyright ${date.slice(-4)} ${pkg.author.name}
 * @license ${pkg.license}
 */`;

// @todo Remove in next major release.
const requireShim = `if(typeof window === "object"&&!window.require)window.require=()=>window.THREE;`;
const footer = `if(typeof module==="object"&&module.exports)module.exports=${globalName};`;

const common = {
	bundle: true,
	plugins: [glsl({ minify: production })],
	loader: {
		".worker": "text",
		".png": "dataurl"
	}
};

const workers = [{
	entryPoints: ["src/images/lut/worker.js"],
	outfile: "tmp/lut.worker",
	format: "iife",
	minify: production,
	watch: argv.watch
}, {
	entryPoints: ["src/images/smaa/worker.js"],
	outfile: "tmp/smaa.worker",
	format: "iife",
	minify: production,
	watch: argv.watch
}];

const demo = [{
	entryPoints: ["demo/src/index.js"],
	outfile: "public/demo/index.js",
	format: "iife",
	minify: production,
	watch: argv.watch
}];

const lib = [{
	entryPoints: ["src/index.js"],
	outfile: `build/${pkg.name}.esm.js`,
	format: "esm",
	external,
	banner
}, {
	entryPoints: ["src/index.js"],
	outfile: `build/${pkg.name}.js`,
	banner: `${banner}\n${requireShim}`,
	format: "iife",
	globalName,
	external,
	footer
}, {
	entryPoints: ["src/index.js"],
	outfile: `build/${pkg.name}.min.js`,
	banner: `${banner}\n${requireShim}`,
	format: "iife",
	minify: true,
	globalName,
	external,
	footer
}];

for(const configs of [workers, demo, lib]) {

	const t0 = Date.now();
	await Promise.all(configs.map(c => esbuild.build(Object.assign(c, common))
		.then(() => console.log(`Built ${c.outfile} in ${Date.now() - t0}ms`))
		.catch(() => process.exit(1))));

}
