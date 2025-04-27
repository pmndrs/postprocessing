import {
	DataTexture,
	RedFormat,
	RGFormat,
	RGBAFormat,
	UnsignedByteType
} from "three";

/**
 * Generates noise.
 *
 * @private
 * @param {Number} size - The linear texture size, i.e. total number of pixels.
 * @param {Number} format - The texture format.
 * @param {Number} type - The texture type.
 * @return {TypedArray} The noise data.
 */

function getNoise(size, format, type) {

	const channels = new Map([
		[RedFormat, 1],
		[RGFormat, 2],
		[RGBAFormat, 4]
	]);

	let data;

	if(!channels.has(format)) {

		console.error("Invalid noise texture format");

	}

	if(type === UnsignedByteType) {

		data = new Uint8Array(size * channels.get(format));

		for(let i = 0, l = data.length; i < l; ++i) {

			data[i] = Math.random() * 255 + 0.5;

		}

	} else {

		data = new Float32Array(size * channels.get(format));

		for(let i = 0, l = data.length; i < l; ++i) {

			data[i] = Math.random();

		}

	}

	return data;

}

/**
 * A simple noise texture.
 */

export class NoiseTexture extends DataTexture {

	/**
	 * Constructs a new noise texture.
	 *
	 * Supported formats are `RGBAFormat`, `RedFormat` and `RGFormat`.
	 *
	 * @param {Number} width - The width.
	 * @param {Number} height - The height.
	 * @param {Number} [format=RedFormat] - The texture format.
	 * @param {Number} [type=UnsignedByteType] - The texture type.
	 */

	constructor(width, height, format = RedFormat, type = UnsignedByteType) {

		super(getNoise(width * height, format, type), width, height, format, type);
		this.needsUpdate = true;

	}

}
