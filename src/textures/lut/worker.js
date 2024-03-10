import { LUTOperation } from "../../enums/LUTOperation.js";
import { TetrahedralUpscaler } from "./TetrahedralUpscaler.js";

/**
 * Performs long-running LUT transformations.
 *
 * @private
 * @param {Event} event - A message event.
 */

self.addEventListener("message", (event) => {

	const request = event.data;
	let data = request.data;

	switch(request.operation) {

		case LUTOperation.SCALE_UP:
			data = TetrahedralUpscaler.expand(data, request.size);
			break;

	}

	postMessage(data, [data.buffer]);
	close();

});
