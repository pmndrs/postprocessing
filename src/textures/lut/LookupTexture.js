import {
	Color,
	ClampToEdgeWrapping,
	DataTexture,
	Data3DTexture,
	FloatType,
	LinearFilter,
	LinearSRGBColorSpace,
	RGBAFormat,
	SRGBColorSpace,
	UnsignedByteType,
	Vector3
} from "three";

import { LUTOperation } from "../../enums/LUTOperation.js";
import { RawImageData } from "../RawImageData.js";
import workerProgram from "../../../temp/lut/worker.txt";

const c = /* @__PURE__ */ new Color();

/**
 * A 3D lookup texture (LUT).
 *
 * This texture can be used as-is in a WebGL 2 context. It can also be converted into a 2D texture.
 */

export class LookupTexture extends Data3DTexture {

	/**
	 * Constructs a cubic 3D lookup texture.
	 *
	 * @param {TypedArray} data - The pixel data. The default format is RGBA.
	 * @param {Number} size - The sidelength.
	 */

	constructor(data, size) {

		super(data, size, size, size);

		this.type = FloatType;
		this.format = RGBAFormat;
		this.minFilter = LinearFilter;
		this.magFilter = LinearFilter;
		this.wrapS = ClampToEdgeWrapping;
		this.wrapT = ClampToEdgeWrapping;
		this.wrapR = ClampToEdgeWrapping;
		this.unpackAlignment = 1;
		this.needsUpdate = true;

		this.colorSpace = LinearSRGBColorSpace;

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
	 * @deprecated
	 */

	get isLookupTexture3D() {

		return true;

	}

	/**
	 * Scales this LUT up to a given target size using tetrahedral interpolation.
	 *
	 * @param {Number} size - The target sidelength.
	 * @param {Boolean} [transferData=true] - Extra fast mode. Set to false to keep the original data intact.
	 * @return {Promise<LookupTexture>} A promise that resolves with a new LUT upon completion.
	 */

	scaleUp(size, transferData = true) {

		const image = this.image;
		let promise;

		if(size <= image.width) {

			promise = Promise.reject(new Error("The target size must be greater than the current size"));

		} else {

			promise = new Promise((resolve, reject) => {

				const workerURL = URL.createObjectURL(new Blob([workerProgram], {
					type: "text/javascript"
				}));

				const worker = new Worker(workerURL);
				worker.addEventListener("error", (event) => reject(event.error));
				worker.addEventListener("message", (event) => {

					const lut = new LookupTexture(event.data, size);
					this.colorSpace = lut.colorSpace;
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
	 * @param {LookupTexture} lut - A LUT. Must have the same dimensions, type and format as this LUT.
	 * @return {LookupTexture} This texture.
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

		} else if(lut.format !== RGBAFormat || this.format !== RGBAFormat) {

			console.error("Both LUTs must be RGBA textures");

		} else {

			const data0 = img0.data;
			const data1 = img1.data;
			const size = size0;
			const sizeSq = size ** 2;
			const s = size - 1;

			for(let i = 0, l = size ** 3; i < l; ++i) {

				const i4 = i * 4;
				const r = data0[i4 + 0] * s;
				const g = data0[i4 + 1] * s;
				const b = data0[i4 + 2] * s;
				const iRGB = Math.round(r + g * size + b * sizeSq) * 4;

				data0[i4 + 0] = data1[iRGB + 0];
				data0[i4 + 1] = data1[iRGB + 1];
				data0[i4 + 2] = data1[iRGB + 2];

			}

			this.needsUpdate = true;

		}

		return this;

	}

	/**
	 * Converts the LUT data into unsigned byte data.
	 *
	 * This is a lossy operation which should only be performed after all other transformations have been applied.
	 *
	 * @return {LookupTexture} This texture.
	 */

	convertToUint8() {

		if(this.type === FloatType) {

			const floatData = this.image.data;
			const uint8Data = new Uint8Array(floatData.length);

			for(let i = 0, l = floatData.length; i < l; ++i) {

				uint8Data[i] = floatData[i] * 255 + 0.5;

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
	 * @return {LookupTexture} This texture.
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
	 * Converts this LUT into RGBA data.
	 *
	 * @deprecated LUTs are RGBA by default since three r137.
	 * @return {LookupTexture} This texture.
	 */

	convertToRGBA() {

		console.warn("LookupTexture", "convertToRGBA() is deprecated, LUTs are now RGBA by default");
		return this;

	}

	/**
	 * Converts the output of this LUT into sRGB color space.
	 *
	 * @return {LookupTexture} This texture.
	 */

	convertLinearToSRGB() {

		const data = this.image.data;

		if(this.type === FloatType) {

			for(let i = 0, l = data.length; i < l; i += 4) {

				c.fromArray(data, i).convertLinearToSRGB().toArray(data, i);

			}

			this.colorSpace = SRGBColorSpace;
			this.needsUpdate = true;

		} else {

			console.error("Color space conversion requires FloatType data");

		}

		return this;

	}

	/**
	 * Converts the output of this LUT into linear color space.
	 *
	 * @return {LookupTexture} This texture.
	 */

	convertSRGBToLinear() {

		const data = this.image.data;

		if(this.type === FloatType) {

			for(let i = 0, l = data.length; i < l; i += 4) {

				c.fromArray(data, i).convertSRGBToLinear().toArray(data, i);

			}

			this.colorSpace = LinearSRGBColorSpace;
			this.needsUpdate = true;

		} else {

			console.error("Color space conversion requires FloatType data");

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
		texture.minFilter = LinearFilter;
		texture.magFilter = LinearFilter;
		texture.wrapS = this.wrapS;
		texture.wrapT = this.wrapT;
		texture.generateMipmaps = false;
		texture.needsUpdate = true;

		this.colorSpace = texture.colorSpace;

		return texture;

	}

	/**
	 * Creates a new 3D LUT by copying a given LUT.
	 *
	 * Common image-based textures will be converted into 3D data textures.
	 *
	 * @param {Texture} texture - The LUT. Assumed to be cubic.
	 * @return {LookupTexture} A new 3D LUT.
	 */

	static from(texture) {

		const image = texture.image;
		const { width, height } = image;
		const size = Math.min(width, height);

		let data;

		if(image instanceof Image) {

			// Convert the image into RGBA Uint8 data.
			const rawImageData = RawImageData.from(image);
			const src = rawImageData.data;

			// Horizontal layout?
			if(width > height) {

				data = new Uint8Array(src.length);

				// Slices -> Rows -> Columns.
				for(let z = 0; z < size; ++z) {

					for(let y = 0; y < size; ++y) {

						for(let x = 0; x < size; ++x) {

							// Source: horizontal arrangement. Swap Y and Z.
							const i4 = (x + z * size + y * size * size) * 4;

							// Target: vertical arrangement.
							const j4 = (x + y * size + z * size * size) * 4;

							data[j4 + 0] = src[i4 + 0];
							data[j4 + 1] = src[i4 + 1];
							data[j4 + 2] = src[i4 + 2];
							data[j4 + 3] = src[i4 + 3];

						}

					}

				}

			} else {

				// Same layout: convert from Uint8ClampedArray to Uint8Array.
				data = new Uint8Array(src.buffer);

			}

		} else {

			data = image.data.slice();

		}

		const lut = new LookupTexture(data, size);
		lut.type = texture.type;
		lut.name = texture.name;

		texture.colorSpace = lut.colorSpace;

		return lut;

	}

	/**
	 * Creates a neutral 3D LUT.
	 *
	 * @param {Number} size - The sidelength.
	 * @return {LookupTexture} A neutral 3D LUT.
	 */

	static createNeutral(size) {

		const data = new Float32Array(size ** 3 * 4);
		const sizeSq = size ** 2;
		const s = 1.0 / (size - 1.0);

		for(let r = 0; r < size; ++r) {

			for(let g = 0; g < size; ++g) {

				for(let b = 0; b < size; ++b) {

					const i4 = (r + g * size + b * sizeSq) * 4;
					data[i4 + 0] = r * s;
					data[i4 + 1] = g * s;
					data[i4 + 2] = b * s;
					data[i4 + 3] = 1.0;

				}

			}

		}

		const lut = new LookupTexture(data, size);
		lut.name = "neutral";

		return lut;

	}

}
