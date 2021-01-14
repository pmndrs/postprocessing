import {
	Color,
	ClampToEdgeWrapping,
	DataTexture,
	DataTexture3D,
	FloatType,
	LinearFilter,
	LinearEncoding,
	RGBFormat,
	RGBAFormat,
	sRGBEncoding,
	UnsignedByteType,
	Vector3
} from "three";

import { RawImageData } from "../RawImageData";
import { LUTOperation } from "../lut/LUTOperation";
import workerProgram from "../../../tmp/lut.worker";

/**
 * A color.
 *
 * @type {Color}
 * @private
 */

const c = new Color();

/**
 * A 3D lookup texture (LUT).
 *
 * This texture can be used as-is in a WebGL 2 context. It can also be converted
 * into a regular 2D texture for backwards compatibility.
 */

export class LookupTexture3D extends DataTexture3D {

	/**
	 * Constructs a cubic 3D lookup texture.
	 *
	 * @param {TypedArray} data - The data.
	 * @param {Number} size - The sidelength.
	 */

	constructor(data, size) {

		super(data, size, size, size);

		this.type = FloatType;
		this.format = RGBFormat;
		this.encoding = LinearEncoding;
		this.minFilter = LinearFilter;
		this.magFilter = LinearFilter;
		this.wrapS = ClampToEdgeWrapping;
		this.wrapT = ClampToEdgeWrapping;
		this.wrapR = ClampToEdgeWrapping;
		this.unpackAlignment = 1;

		/**
		 * The lower bounds of the input domain.
		 *
		 * @type {Vector3}
		 */

		this.domainMin = new Vector3(0.0, 0.0, 0.0);

		/**
		 * The upper bounds of the input domain.
		 *
		 * @type {Vector3}
		 */

		this.domainMax = new Vector3(1.0, 1.0, 1.0);

	}

	/**
	 * Indicates that this is an instance of LookupTexture3D.
	 *
	 * @type {Boolean}
	 */

	get isLookupTexture3D() {

		return true;

	}

	/**
	 * Scales this LUT up to a given target size using tetrahedral interpolation.
	 *
	 * @param {Number} size - The target sidelength.
	 * @param {Boolean} [transferData=true] - Extra fast mode. Set to false to keep the original data intact.
	 * @return {Promise<LookupTexture3D>} A promise that resolves with a new LUT upon completion.
	 */

	scaleUp(size, transferData = true) {

		const image = this.image;
		let promise;

		if(size <= image.width) {

			promise = Promise.reject(new Error("The target size must be greater than the current size"));

		} else {

			const workerURL = URL.createObjectURL(new Blob([workerProgram], { type: "text/javascript" }));
			const worker = new Worker(workerURL);

			promise = new Promise((resolve, reject) => {

				worker.addEventListener("error", (event) => reject(event.error));
				worker.addEventListener("message", (event) => {

					const lut = new LookupTexture3D(event.data, size);
					lut.encoding = this.encoding;
					lut.type = this.type;
					lut.name = this.name;

					URL.revokeObjectURL(workerURL);
					resolve(lut);

				});

				const transferList = transferData ? [image.data.buffer] : [];

				worker.postMessage({
					operation: LUTOperation.SCALE_UP,
					data: image.data,
					size
				}, transferList);

			});

		}

		return promise;

	}

	/**
	 * Applies the given LUT to this one.
	 *
	 * @param {LookupTexture3D} lut - A LUT. Must have the same dimensions, type and format as this LUT.
	 * @return {LookupTexture3D} This texture.
	 */

	applyLUT(lut) {

		const img0 = this.image;
		const img1 = lut.image;

		const size0 = Math.min(img0.width, img0.height, img0.depth);
		const size1 = Math.min(img1.width, img1.height, img1.depth);

		if(size0 !== size1) {

			console.error("Size mismatch");

		} else if(lut.type !== FloatType || this.type !== FloatType) {

			console.error("Both LUTs must be FloatType textures");

		} else if(lut.format !== RGBFormat || this.format !== RGBFormat) {

			console.error("Both LUTs must be RGB textures");

		} else {

			const data0 = img0.data;
			const data1 = img1.data;
			const size = size0;
			const s = size - 1;

			for(let i = 0, l = size ** 3; i < l; ++i) {

				const i3 = i * 3;
				const r = data0[i3 + 0] * s;
				const g = data0[i3 + 1] * s;
				const b = data0[i3 + 2] * s;
				const iRGB = Math.round(r + g * size + b * size * size) * 3;

				data0[i3 + 0] = data1[iRGB + 0];
				data0[i3 + 1] = data1[iRGB + 1];
				data0[i3 + 2] = data1[iRGB + 2];

			}

			this.needsUpdate = true;

		}

		return this;

	}

	/**
	 * Converts the LUT data into unsigned byte data.
	 *
	 * This is a lossy operation which should only be performed after all other
	 * transformations have been applied.
	 *
	 * @return {LookupTexture3D} This texture.
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
			this.needsUpdate = true;

		}

		return this;

	}

	/**
	 * Converts the LUT data into float data.
	 *
	 * @return {LookupTexture3D} This texture.
	 */

	convertToFloat() {

		if(this.type === UnsignedByteType) {

			const uint8Data = this.image.data;
			const floatData = new Float32Array(uint8Data.length);

			for(let i = 0, l = uint8Data.length; i < l; ++i) {

				floatData[i] = uint8Data[i] / 255;

			}

			this.image.data = floatData;
			this.type = FloatType;
			this.needsUpdate = true;

		}

		return this;

	}

	/**
	 * Converts the output of this LUT into sRGB color space.
	 *
	 * @return {LookupTexture3D} This texture.
	 */

	convertLinearToSRGB() {

		const data = this.image.data;

		if(this.type === FloatType) {

			const stride = (this.format === RGBAFormat) ? 4 : 3;

			for(let i = 0, l = data.length; i < l; i += stride) {

				c.fromArray(data, i).convertLinearToSRGB().toArray(data, i);

			}

			this.encoding = sRGBEncoding;
			this.needsUpdate = true;

		} else {

			console.error("Color space conversion requires FloatType data");

		}

		return this;

	}

	/**
	 * Converts the output of this LUT into linear color space.
	 *
	 * @return {LookupTexture3D} This texture.
	 */

	convertSRGBToLinear() {

		const data = this.image.data;

		if(this.type === FloatType) {

			const stride = (this.format === RGBAFormat) ? 4 : 3;

			for(let i = 0, l = data.length; i < l; i += stride) {

				c.fromArray(data, i).convertSRGBToLinear().toArray(data, i);

			}

			this.encoding = LinearEncoding;
			this.needsUpdate = true;

		} else {

			console.error("Color space conversion requires FloatType data");

		}

		return this;

	}

	/**
	 * Converts the LUT data into RGBA data.
	 *
	 * @return {LookupTexture3D} This texture.
	 */

	convertToRGBA() {

		if(this.format === RGBFormat) {

			const size = this.image.width;
			const rgbData = this.image.data;
			const rgbaData = new rgbData.constructor(size ** 3 * 4);
			const maxValue = (this.type === FloatType) ? 1.0 : 255;

			for(let i = 0, j = 0, l = rgbData.length; i < l; i += 3, j += 4) {

				rgbaData[j + 0] = rgbData[i + 0];
				rgbaData[j + 1] = rgbData[i + 1];
				rgbaData[j + 2] = rgbData[i + 2];
				rgbaData[j + 3] = maxValue;

			}

			this.image.data = rgbaData;
			this.format = RGBAFormat;
			this.needsUpdate = true;

		}

		return this;

	}

	/**
	 * Converts this LUT into a 2D data texture.
	 *
	 * Please note that custom input domains are not carried over to 2D textures.
	 *
	 * @return {DataTexture} The texture.
	 */

	toDataTexture() {

		const width = this.image.width;
		const height = this.image.height * this.image.depth;

		const texture = new DataTexture(this.image.data, width, height);
		texture.name = this.name;
		texture.type = this.type;
		texture.format = this.format;
		texture.encoding = this.encoding;
		texture.minFilter = LinearFilter;
		texture.magFilter = LinearFilter;
		texture.wrapS = this.wrapS;
		texture.wrapT = this.wrapT;
		texture.generateMipmaps = false;

		return texture;

	}

	/**
	 * Creates a new 3D LUT by copying a given LUT.
	 *
	 * Common image-based textures will be converted into 3D data textures.
	 *
	 * @param {Texture} texture - The LUT. Assumed to be cubic.
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
	 * @param {Number} size - The sidelength.
	 * @return {LookupTexture3D} A neutral 3D LUT.
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

		const lut = new LookupTexture3D(data, size);
		lut.name = "neutral";

		return lut;

	}

}
