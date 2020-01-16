/**
 * Creates a new canvas from raw image data.
 *
 * @private
 * @param {Number} width - The image width.
 * @param {Number} height - The image height.
 * @param {Uint8ClampedArray} data - The image data.
 * @return {Canvas} The canvas.
 */

function createCanvas(width, height, data) {

	const canvas = document.createElementNS("http://www.w3.org/1999/xhtml", "canvas");
	const context = canvas.getContext("2d");

	const imageData = context.createImageData(width, height);
	imageData.data.set(data);

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
	 */

	constructor(width = 0, height = 0, data = null) {

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
			this.data
		);

	}

	/**
	 * Creates a new image data container.
	 *
	 * @param {Object} data - Raw image data.
	 * @return {RawImageData} The image data.
	 */

	static from(data) {

		return new RawImageData(data.width, data.height, data.data);

	}

}
