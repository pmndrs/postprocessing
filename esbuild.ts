import { BuildOptions, BuildResult, startService } from "esbuild";
import { watch } from "chokidar";
import * as path from "path";
import * as yargs from "yargs";
import configGroups from "./esbuild.config";

const { argv } = yargs.options({ watch: { alias: "w", type: "boolean" } });

async function build(changedFile: string = null): Promise<void> {

	const service = await startService();
	const f = (changedFile !== null) ? path.normalize(changedFile) : null;

	for(const configs of configGroups) {

		const t0 = Date.now();
		const promises: Promise<void>[] = configs.map((c: BuildOptions) => {

			let p: Promise<void> = null;

			if(path.normalize(c.outfile) !== f) {

				p = service.build(c).then((result) => {

					console.log(`Built ${c.outfile} in ${Date.now() - t0}ms`);
					result.warnings.forEach((w) => console.warn(w.text,
						`${w.location.line}:${w.location.column} ${w.location.file}`));

				}).catch((e) => console.error(`Failed to build ${c.outfile}`));

			}

			return p;

		});

		await Promise.all(promises);

	}

	service.stop();

}

if(argv.watch) {

	const configs: BuildOptions[] = configGroups.reduce((a: BuildOptions[], b: BuildOptions[]) => a.concat(b), []);
	const entryPoints: string[] = configs.reduce((a: string[], b: BuildOptions) => a.concat(b.entryPoints), []);
	const directories = [...new Set(entryPoints.map((f: string) => path.dirname(f).split("/").shift()))];
	console.log(`Watching ${directories.join(", ").replace(/,\s([^,]*)$/, " and $1")} for changes…\n`);

	const watcher = watch(directories);
	watcher.on("change", (f: string) => void build(f));

}

void build();
