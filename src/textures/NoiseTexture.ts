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

/**
 * Generates noise.
 *
 * @param size - The total number of pixels.
 * @param format - The texture format.
 * @param type - The texture type.
 * @return The noise data.
 */

function getNoise(size: number, format: PixelFormat, type: TextureDataType): TypedArray {

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

			data[i] = Math.random() * 255 + 0.5;

		}

	} else {

		data = new Float32Array(size * c);

		for(let i = 0, l = data.length; i < l; ++i) {

			data[i] = Math.random();

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
	 * Supported texture formats: `RGBAFormat`, `LuminanceFormat`, `RedFormat`, `RGFormat`.
	 *
	 * @param width - The width.
	 * @param height - The height.
	 * @param format - The texture format. Default is `RGBAFormat`.
	 * @param type - The texture type.
	 */

	constructor(width: number, height: number, format = RGBAFormat, type = UnsignedByteType) {

		super(getNoise(width * height, format, type), width, height, format, type);

		this.needsUpdate = true;

	}

}
