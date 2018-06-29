/**
 * Creates a new canvas from raw image data.
 *
 * @private
 * @param {Number} width - The image width.
 * @param {Number} height - The image height.
 * @param {Uint8ClampedArray} data - The image data.
 * @param {Number} channels - The color channels used for a single pixel.
 * @return {Canvas} The canvas.
 */

function createCanvas(width, height, data, channels) {

	const canvas = document.createElementNS("http://www.w3.org/1999/xhtml", "canvas");
	const context = canvas.getContext("2d");

	const imageData = context.createImageData(width, height);
	const target = imageData.data;

	let x, y;
	let i, j;

	for(y = 0; y < height; ++y) {

		for(x = 0; x < width; ++x) {

			i = (y * width + x) * 4;
			j = (y * width + x) * channels;

			target[i] = (channels > 0) ? data[j] : 0;
			target[i + 1] = (channels > 1) ? data[j + 1] : 0;
			target[i + 2] = (channels > 2) ? data[j + 2] : 0;
			target[i + 3] = (channels > 3) ? data[j + 3] : 255;

		}

	}

	canvas.width = width;
	canvas.height = height;

	context.putImageData(imageData, 0, 0);

	return canvas;

}

/**
 * A container for raw image data.
 */

export class RawImageData {

	/**
	 * Constructs a new image data container.
	 *
	 * @param {Number} [width=0] - The width of the image.
	 * @param {Number} [height=0] - The height of the image.
	 * @param {Uint8ClampedArray} [data=null] - The image data.
	 * @param {Number} [channels=4] - The amount of color channels used per pixel. Range [1, 4].
	 */

	constructor(width = 0, height = 0, data = null, channels = 4) {

		/**
		 * The width of the image.
		 *
		 * @type {Number}
		 */

		this.width = width;

		/**
		 * The height of the image.
		 *
		 * @type {Number}
		 */

		this.height = height;

		/**
		 * The image data.
		 *
		 * @type {Uint8ClampedArray}
		 */

		this.data = data;

		/**
		 * The amount of color channels used per pixel. Range [1, 4].
		 *
		 * @type {Number}
		 */

		this.channels = channels;

	}

	/**
	 * Creates a canvas from this image data.
	 *
	 * @return {Canvas} The canvas or null if it couldn't be created.
	 */

	toCanvas() {

		return (typeof document === "undefined") ? null : createCanvas(
			this.width,
			this.height,
			this.data,
			this.channels
		);

	}

}
