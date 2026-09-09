import esbuild from "esbuild";
import { glob } from "node:fs/promises";

await esbuild.build({
	entryPoints: await Array.fromAsync(glob("./test/e2e/pages/*.ts")),
	outdir: "./test/e2e/pages/dist",
	logLevel: "info",
	format: "iife",
	bundle: true
});
