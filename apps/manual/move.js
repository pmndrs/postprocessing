import * as fs from "node:fs/promises";
import * as path from "node:path";

const src = path.join(import.meta.dirname, "public", "manual");
const dest = path.join(import.meta.dirname, "..", "..", "public", "manual");

try {

	await fs.rm(dest, { recursive: true, force: true });
	await fs.rename(src, dest);

} catch(error) {

	console.log(error);

}
