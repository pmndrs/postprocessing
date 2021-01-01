import {
	Color,
	ClampToEdgeWrapping,
	DataTexture,
	DataTexture3D,
	FloatType,
	LinearFilter,
	LinearEncoding,
	RGBFormat,
	sRGBEncoding,
	UnsignedByteType
} from "three";

/**
 * A color.
 *
 * @type {Color}
 * @private
 */

const c = new Color();

/**
 * A 3D lookup texture (LUT).
 */

export class LookupTexture3D extends DataTexture3D {

	/**
	 * Constructs a cubic 3D lookup texture.
	 *
	 * LUTs are usually stored as sRGB textures and may need to be converted into
	 * linear color space via `convertSRGBToLinear()`.
	 *
	 * @param {TypedArray} data - The data.
	 * @param {Number} size - The sidelength.
	 */

	constructor(data, size) {

		super(data, size, size, size);

		this.format = RGBFormat;
		this.type = FloatType;
		this.encoding = LinearEncoding;
		this.magFilter = LinearFilter;
		this.wrapS = ClampToEdgeWrapping;
		this.wrapT = ClampToEdgeWrapping;
		this.wrapR = ClampToEdgeWrapping;
		this.unpackAlignment = 1;

	}

	/**
	 * Converts the LUT data into unsigned byte data.
	 *
	 * This is a lossy process so `convertSRGBToLinear` should be called first.
	 *
	 * @private
	 * @return {Uint8Array} The low precision data.
	 */

	convertToUint8() {

		if(this.type === FloatType) {

			const floatData = this.image.data;
			const uint8Data = new Uint8ClampedArray(floatData.length);

			for(let i = 0, l = floatData.length; i < l; ++i) {

				uint8Data[i] = floatData[i] * 255;

			}

			this.image.data = uint8Data;
			this.type = UnsignedByteType;

		}

		return this;

	}

	/**
	 * Converts this LUT into linear color space.
	 *
	 * Linear LUTs skip the gamma correction step in the fragment shader.
	 *
	 * @return {LookupTexture3D} This texture.
	 */

	convertSRGBToLinear() {

		const data = this.image.data;

		if(this.encoding === sRGBEncoding) {

			for(let i = 0, l = data.length; i < l; i += 3) {

				c.fromArray(data, i).convertSRGBToLinear().toArray(data, i);

			}

			this.encoding = LinearEncoding;

		}

		return this;

	}

	/**
	 * Creates a new 2D data texture from this 3D LUT.
	 *
	 * @return {DataTexture} The texture.
	 */

	toDataTexture() {

		const width = this.image.width;
		const height = this.image.height * this.image.depth;

		const texture = new DataTexture(this.image.data, width, height);
		texture.format = this.format;
		texture.type = this.type;
		texture.encoding = this.encoding;
		texture.magFilter = this.magFilter;
		texture.wrapS = this.wrapS;
		texture.wrapT = this.wrapT;

		return texture;

	}

	/**
	 * Creates a new 3D LUT by copying a given LUT.
	 *
	 * Common image-based textures will be converted into 3D data textures.
	 *
	 * @param {Texture} texture - The LUT. Assumed to have cubic dimensions.
	 * @return {LookupTexture3D} A new 3D LUT.
	 */

	static from(texture) {

		const image = texture.image;
		const { width, height } = image;
		const size = Math.min(width, height);

		let data;

		if(image instanceof Image) {

			// Convert the image into RGBA Uint8 data.
			const rawImageData = RawImageData.from(image);
			data = rawImageData.data;

			// Convert to 3D texture format (RGB).
			const rearrangedData = new Uint8Array(size ** 3 * 3);

			// Horizontal arrangement?
			if(width > height) {

				// Slices -> Rows -> Columns.
				for(let z = 0; z < size; ++z) {

					for(let y = 0; y < size; ++y) {

						for(let x = 0; x < size; ++x) {

							// Source: horizontal arrangement (RGBA). Swap Y and Z.
							const i4 = (x + z * size + y * size * size) * 4;

							// Target: vertical arrangement (RGB).
							const i3 = (x + y * size + z * size * size) * 3;

							rearrangedData[i3 + 0] = data[i4 + 0];
							rearrangedData[i3 + 1] = data[i4 + 1];
							rearrangedData[i3 + 2] = data[i4 + 2];

						}

					}

				}

			} else {

				// Convert to RGB.
				for(let i = 0, l = size ** 3; i < l; ++i) {

					const i4 = i * 4;
					const i3 = i * 3;

					rearrangedData[i3 + 0] = data[i4 + 0];
					rearrangedData[i3 + 1] = data[i4 + 1];
					rearrangedData[i3 + 2] = data[i4 + 2];

				}

			}

			data = rearrangedData;

		} else {

			data = image.data.slice();

		}

		const lut = new LookupTexture3D(data, size);
		lut.type = texture.type;
		lut.encoding = texture.encoding;
		lut.name = texture.name;

		return lut;

	}

	/**
	 * Creates a neutral 3D LUT.
	 *
	 * @param {Number} size - The size of the cubic LUT texture.
	 * @return {LookupTexture3D} The neutral 3D LUT.
	 */

	static createNeutral(size) {

		const data = new Float32Array(size ** 3 * 3);
		const s = 1.0 / (size - 1.0);

		for(let r = 0; r < size; ++r) {

			for(let g = 0; g < size; ++g) {

				for(let b = 0; b < size; ++b) {

					const i3 = (r + g * size + b * size * size) * 3;
					data[i3 + 0] = r * s;
					data[i3 + 1] = g * s;
					data[i3 + 2] = b * s;

				}

			}

		}

		return new LookupTexture3D(data, size);

	}

}
