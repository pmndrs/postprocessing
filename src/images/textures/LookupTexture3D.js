import {
	Color,
	ClampToEdgeWrapping,
	DataTexture,
	DataTexture3D,
	FloatType,
	LinearFilter,
	LinearEncoding,
	RGBFormat,
	sRGBEncoding
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

	}

	/**
	 * The current texture type.
	 *
	 * @type {Number}
	 */

	/*get type() {

		return this.type;

	}*/

	/**
	 * Sets the texture type.
	 *
	 * @type {Number}
	 */

	/*set type(value) {

		this.type = value;
		this.data = (value === FloatType) ?
			this.highPrecisionData :
			this.createLowPrecisionData();

	}*/

	/**
	 * Creates a low precision version of the LUT data if it doesn't exist yet.
	 *
	 * @private
	 * @return {Uint8Array} The low precision data.
	 */

	createLowPrecisionData() {

		const data = this.image.data;
		let lowPrecisionData = data;

		if(data instanceof Float32Array) {

			lowPrecisionData = new Uint8Array(data.length);

			for(let i = 0, l = data.length; i < l; ++i) {

				lowPrecisionData[i] = data[i++] * 255;

			}

			console.log("Created low precision data", lowPrecisionData);

		}

		return lowPrecisionData;

	}

	/**
	 * Converts this lookup texture into linear color space.
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

	toTexture2D() {

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
	 * Creates neutral 3D LUT data.
	 *
	 * @param {Number} size - The size of the cubic LUT texture.
	 * @return {Float32Array} The neutral 3D LUT data.
	 */

	static createNeutralData(size) {

		const data = new Float32Array(size * size * size * 3);

		for(let r = 0; r < size; ++r) {

			for(let g = 0; g < size; ++g) {

				for(let b = 0; b < size; ++b) {

					const i = r + g * size + b * size * size;
					data[i * 3 + 0] = r / (size - 1.0);
					data[i * 3 + 1] = g / (size - 1.0);
					data[i * 3 + 2] = b / (size - 1.0);

				}

			}

		}

		return data;

	}

}
