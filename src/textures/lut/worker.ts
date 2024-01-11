import { TetrahedralUpscaler } from "./TetrahedralUpscaler.js";

/**
 * A LUT request message.
 */

interface LUTMessage {

	data: Uint8Array | Float32Array;
	size: number;

}

/**
 * Performs long-running LUT transformations.
 *
 * @param event - A message event.
 * @category Textures
 */

self.addEventListener("message", (event: MessageEvent<LUTMessage>) => {

	const request = event.data;
	const data = TetrahedralUpscaler.expand(request.data, request.size);

	const ctx = (self as unknown) as Worker;
	ctx.postMessage(data, [data.buffer]);
	close();

});
