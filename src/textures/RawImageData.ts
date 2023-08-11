/**
 * Creates a new canvas from raw image data.
 *
 * @param width - The image width.
 * @param height - The image height.
 * @param data - The image data.
 * @return The canvas.
 */

function createCanvas(width: number, height: number, data: ArrayLike<number> | HTMLImageElement): HTMLCanvasElement {

	const canvas = document.createElement("canvas");
	const context = canvas.getContext("2d");

	canvas.width = width;
	canvas.height = height;

	if(context === null) {

		return canvas;

	} else if(data instanceof Image) {

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
 * @group Textures
 */

export class RawImageData implements ImageData {

	colorSpace: PredefinedColorSpace;

	/**
	 * The width of the image.
	 */

	width: number;

	/**
	 * The height of the image.
	 */

	height: number;

	/**
	 * The RGBA image data.
	 */

	data: Uint8ClampedArray;

	/**
	 * Constructs a new image data container.
	 *
	 * @param width - The width of the image.
	 * @param height - The height of the image.
	 * @param data - The image data.
	 */

	constructor(width = 0, height = 0, data: Uint8ClampedArray) {

		this.colorSpace = "srgb";
		this.width = width;
		this.height = height;
		this.data = data;

	}

	/**
	 * Creates a canvas from this image data.
	 *
	 * @return The canvas.
	 */

	toCanvas(): HTMLCanvasElement {

		if(typeof document === "undefined") {

			throw new Error("Failed to create canvas");

		}

		return createCanvas(this.width, this.height, this.data);

	}

	/**
	 * Creates a new image data container.
	 *
	 * @param image - An image or plain image data.
	 * @return The image data.
	 */

	static from(image: ImageData | HTMLImageElement): RawImageData {

		const { width, height } = image;
		let data: Uint8ClampedArray;

		if(image instanceof Image) {

			const canvas = createCanvas(width, height, image);
			const context = canvas.getContext("2d");

			if(canvas === null || context === null) {

				throw new Error("Failed to create canvas");

			}

			data = context.getImageData(0, 0, width, height).data;

		} else {

			data = image.data;

		}

		return new RawImageData(width, height, data);

	}

}
