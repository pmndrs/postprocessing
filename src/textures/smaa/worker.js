import { SMAAAreaImageData } from "./SMAAAreaImageData.js";
import { SMAASearchImageData } from "./SMAASearchImageData.js";

/**
 * Generates the SMAA area and search lookup tables.
 *
 * @private
 * @param {Event} event - A message event.
 */

self.addEventListener("message", (event) => {

	const areaImageData = SMAAAreaImageData.generate();
	const searchImageData = SMAASearchImageData.generate();

	postMessage({ areaImageData, searchImageData }, [
		areaImageData.data.buffer,
		searchImageData.data.buffer
	]);

	close();

});
