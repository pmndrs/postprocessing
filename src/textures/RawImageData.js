/**
 * Creates a new canvas from raw image data.
 *
 * @private
 * @param {Number} width - The image width.
 * @param {Number} height - The image height.
 * @param {Uint8ClampedArray<ArrayBuffer>|Image} data - The image data.
 * @return {Canvas} The canvas.
 */

function createCanvas(width, height, data) {

	const canvas = document.createElement("canvas");
	const context = canvas.getContext("2d");

	canvas.width = width;
	canvas.height = height;

	if(data instanceof Image) {

		context.drawImage(data, 0, 0);

	} else {

		const imageData = context.createImageData(width, height);
		imageData.data.set(data);
		context.putImageData(imageData, 0, 0);

	}

	return canvas;

}

/**
 * A container for raw RGBA image data.
 *
 * @implements {ImageData}
 */

export class RawImageData {

	/**
	 * Constructs a new image data container.
	 *
	 * @param {Number} [width=0] - The width of the image.
	 * @param {Number} [height=0] - The height of the image.
	 * @param {Uint8ClampedArray<ArrayBuffer>} [data=null] - The image data.
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
		 * The RGBA image data.
		 *
		 * @type {Uint8ClampedArray<ArrayBuffer>}
		 */

		this.data = data;

	}

	/**
	 * Creates a canvas from this image data.
	 *
	 * @return {Canvas} The canvas, or null if it couldn't be created.
	 */

	toCanvas() {

		return (typeof document === "undefined") ? null : createCanvas(this.width, this.height, this.data);

	}

	/**
	 * Creates a new image data container.
	 *
	 * @param {ImageData|Image} image - An image or plain image data.
	 * @return {RawImageData} The image data.
	 */

	static from(image) {

		const { width, height } = image;
		let data;

		if(image instanceof Image) {

			const canvas = createCanvas(width, height, image);

			if(canvas !== null) {

				const context = canvas.getContext("2d");
				data = context.getImageData(0, 0, width, height).data;

			}

		} else {

			data = image.data;

		}

		return new RawImageData(width, height, data);

	}

}
