import { SMAAAreaImageData } from "./SMAAAreaImageData.js";
import { SMAASearchImageData } from "./SMAASearchImageData.js";

/**
 * Generates the SMAA area and search lookup tables.
 *
 * @category Textures
 */

self.addEventListener("message", () => {

	const areaImageData = SMAAAreaImageData.generate();
	const searchImageData = SMAASearchImageData.generate();

	self.postMessage({ areaImageData, searchImageData }, [
		areaImageData.data.buffer,
		searchImageData.data.buffer
	]);

	close();

});
