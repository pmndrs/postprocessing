import { SMAAAreaImageData } from "./SMAAAreaImageData.js";
import { SMAASearchImageData } from "./SMAASearchImageData.js";

/**
 * Handles messages from the main thread.
 *
 * @private
 * @param {Event} event - A message event.
 */

self.addEventListener("message", function onMessage(event) {

	const areaImageData = SMAAAreaImageData.generate();
	const searchImageData = SMAASearchImageData.generate();

	postMessage({ areaImageData, searchImageData },
		[areaImageData.data.buffer, searchImageData.data.buffer]);

	close();

});
