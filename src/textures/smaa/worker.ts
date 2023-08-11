import { SMAAAreaImageData } from "./SMAAAreaImageData.js";
import { SMAASearchImageData } from "./SMAASearchImageData.js";

/**
 * Generates the SMAA area and search lookup tables.
 */

self.addEventListener("message", () => {

	const areaImageData = SMAAAreaImageData.generate();
	const searchImageData = SMAASearchImageData.generate();

	const ctx = (self as unknown) as Worker;
	ctx.postMessage({ areaImageData, searchImageData }, [
		areaImageData.data.buffer,
		searchImageData.data.buffer
	]);

	close();

});
