import {
	DataTexture,
	RedFormat,
	RGFormat,
	RGBAFormat,
	TextureDataType,
	UnsignedByteType,
	PixelFormat,
	TypedArray
} from "three";

import { createSeededRandom } from "../utils/functions/rand.js";

/**
 * Generates noise.
 *
 * @param size - The total number of pixels.
 * @param format - The texture format.
 * @param type - The texture type.
 * @param random - A function that returns values in the range `[0, 1)`.
 * @return The noise data.
 */

function getNoise(size: number, format: PixelFormat, type: TextureDataType, random: () => number): TypedArray {

	const channels = new Map<PixelFormat, number>([
		[RedFormat, 1],
		[RGFormat, 2],
		[RGBAFormat, 4]
	]);

	const c = channels.get(format);
	let data: Uint8Array | Float32Array;

	if(c === undefined) {

		throw new Error(`Texture format not supported: ${format}`);

	}

	if(type === UnsignedByteType) {

		data = new Uint8Array(size * c);

		for(let i = 0, l = data.length; i < l; ++i) {

			data[i] = random() * 255 + 0.5;

		}

	} else {

		data = new Float32Array(size * c);

		for(let i = 0, l = data.length; i < l; ++i) {

			data[i] = random();

		}

	}

	return data;

}

/**
 * A noise texture.
 *
 * @category Textures
 */

export class NoiseTexture extends DataTexture {

	/**
	 * Constructs a new noise texture.
	 *
	 * Supported texture formats: `RGBAFormat`, `RedFormat`, `RGFormat`.
	 *
	 * @param width - The width.
	 * @param height - The height.
	 * @param format - The texture format. Default is `RGBAFormat`.
	 * @param type - The texture type.
	 * @param seed - A seed that makes the generated noise deterministic. When not defined, a random value is used.
	 */

	constructor(width: number, height: number, format = RGBAFormat, type = UnsignedByteType, seed?: number) {

		const random = (seed === undefined) ? () => Math.random() : createSeededRandom(seed);
		super(getNoise(width * height, format, type, random), width, height, format, type);

		this.needsUpdate = true;

	}

}
