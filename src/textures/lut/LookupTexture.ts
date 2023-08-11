import {
	Color,
	Data3DTexture,
	DataTexture,
	FloatType,
	LinearFilter,
	LinearSRGBColorSpace,
	RGBAFormat,
	SRGBColorSpace,
	Texture,
	UnsignedByteType,
	Vector3
} from "three";

import { RawImageData } from "../RawImageData.js";
import workerProgram from "temp/lut/worker.txt";

/**
 * LUT input domain bounds.
 */

export interface LUTDomainBounds {

	/**
	 * The lower bounds of the input domain.
	 */

	domainMin: Vector3;

	/**
	 * The upper bounds of the input domain.
	 */

	domainMax: Vector3;

}

const c = new Color();

/**
 * A 3D lookup texture (LUT).
 *
 * This texture can be used as-is in a WebGL 2 context. It can also be converted into a 2D texture.
 */

export class LookupTexture extends Data3DTexture implements LUTDomainBounds {

	domainMin: Vector3;
	domainMax: Vector3;

	/**
	 * Constructs a cubic 3D lookup texture.
	 *
	 * @param data - The pixel data. The default format is RGBA.
	 * @param size - The sidelength.
	 */

	constructor(data: BufferSource, size: number) {

		super(data, size, size, size);

		this.type = FloatType;
		this.minFilter = LinearFilter;
		this.unpackAlignment = 1;
		this.needsUpdate = true;

		this.domainMin = new Vector3(0, 0, 0);
		this.domainMax = new Vector3(1, 1, 1);

	}

	/**
	 * Scales this LUT up to a given target size using tetrahedral interpolation.
	 *
	 * @param size - The target sidelength.
	 * @param [transferData=true] - Extra fast mode. Set to false to keep the original data intact.
	 * @return A promise that resolves with a new LUT upon completion.
	 */

	async scaleUp(size: number, transferData = true): Promise<LookupTexture> {

		const image = this.image;
		let promise;

		if(size <= image.width) {

			promise = Promise.reject(new Error("The target size must be greater than the current size"));

		} else {

			promise = new Promise<LookupTexture>((resolve, reject) => {

				const workerURL = URL.createObjectURL(new Blob([workerProgram], {
					type: "text/javascript"
				}));

				const worker = new Worker(workerURL);
				worker.addEventListener("error", (event) => reject(event.error));
				worker.addEventListener("message", (event: MessageEvent<ArrayBufferView>) => {

					const lut = new LookupTexture(event.data, size);
					lut.colorSpace = this.colorSpace;
					lut.type = this.type;
					lut.name = this.name;

					URL.revokeObjectURL(workerURL);
					resolve(lut);

				});

				const transferList = transferData ? [image.data.buffer] : [];

				worker.postMessage({
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
	 * @param lut - A LUT. Must have the same dimensions, type and format as this LUT.
	 * @return This texture.
	 */

	applyLUT(lut: LookupTexture): this {

		const img0 = this.image;
		const img1 = lut.image;

		const size0 = Math.min(img0.width, img0.height, img0.depth);
		const size1 = Math.min(img1.width, img1.height, img1.depth);

		if(size0 !== size1) {

			throw new Error("Size mismatch");

		} else if(lut.type !== FloatType || this.type !== FloatType) {

			throw new Error("Both LUTs must be FloatType textures");

		} else if(lut.format !== RGBAFormat || this.format !== RGBAFormat) {

			throw new Error("Both LUTs must be RGBA textures");

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
	 * @return This texture.
	 */

	convertToUint8(): this {

		if(this.type === FloatType) {

			const img = this.image;
			const floatData = img.data;
			const uint8Data = new Uint8Array(floatData.length);

			for(let i = 0, l = floatData.length; i < l; ++i) {

				uint8Data[i] = floatData[i] * 255 + 0.5;

			}

			this.source.data = uint8Data;
			this.type = UnsignedByteType;
			this.needsUpdate = true;

		}

		return this;

	}

	/**
	 * Converts the LUT data into float data.
	 *
	 * @return This texture.
	 */

	convertToFloat(): this {

		if(this.type === UnsignedByteType) {

			const img = this.image;
			const uint8Data = img.data;
			const floatData = new Float32Array(uint8Data.length);

			for(let i = 0, l = uint8Data.length; i < l; ++i) {

				floatData[i] = uint8Data[i] / 255;

			}

			this.source.data = floatData;
			this.type = FloatType;
			this.needsUpdate = true;

		}

		return this;

	}

	/**
	 * Converts the output of this LUT into sRGB color space.
	 *
	 * @return This texture.
	 */

	convertLinearToSRGB(): this {

		const img = this.image;
		const data = img.data;

		if(this.type === FloatType) {

			for(let i = 0, l = data.length; i < l; i += 4) {

				c.fromArray(data, i).convertLinearToSRGB().toArray(data, i);

			}

			this.colorSpace = SRGBColorSpace;
			this.needsUpdate = true;

		} else {

			throw new Error("Color space conversion requires FloatType data");

		}

		return this;

	}

	/**
	 * Converts the output of this LUT into linear color space.
	 *
	 * @return This texture.
	 */

	convertSRGBToLinear(): this {

		const img = this.image;
		const data = img.data;

		if(this.type === FloatType) {

			for(let i = 0, l = data.length; i < l; i += 4) {

				c.fromArray(data, i).convertSRGBToLinear().toArray(data, i);

			}

			this.colorSpace = LinearSRGBColorSpace;
			this.needsUpdate = true;

		} else {

			throw new Error("Color space conversion requires FloatType data");

		}

		return this;

	}

	/**
	 * Converts this LUT into a 2D data texture.
	 *
	 * Custom {@link LUTDomainBounds} are stored as `userData.domainBounds`.
	 *
	 * @return The texture.
	 */

	toDataTexture(): DataTexture {

		const img = this.image;
		const width = img.width;
		const height = img.height * img.depth;

		const texture = new DataTexture(img.data, width, height);
		texture.name = this.name;
		texture.type = this.type;
		texture.format = this.format;
		texture.colorSpace = this.colorSpace;
		texture.minFilter = LinearFilter;
		texture.magFilter = LinearFilter;
		texture.wrapS = this.wrapS;
		texture.wrapT = this.wrapT;
		texture.generateMipmaps = false;
		texture.needsUpdate = true;

		const userData = texture.userData as Record<string, unknown>;
		userData.domainBounds = {
			domainMin: this.domainMin,
			domainMax: this.domainMax
		};

		return texture;

	}

	/**
	 * Creates a new 3D LUT by copying a given LUT.
	 *
	 * Common image-based textures will be converted into 3D data textures.
	 *
	 * @param texture - The LUT. Assumed to be cubic.
	 * @return A new 3D LUT.
	 */

	static from(texture: Texture): LookupTexture {

		const image = texture.image as ImageData;
		const { width, height } = image;
		const size = Math.min(width, height);

		let data: Uint8Array | Uint8ClampedArray;

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
		lut.colorSpace = texture.colorSpace;
		lut.type = texture.type;
		lut.name = texture.name;

		const userData = texture.userData as Record<string, unknown>;

		if(userData.domainBounds !== undefined) {

			const domainData = userData.domainBounds as LUTDomainBounds;
			lut.domainMin.copy(domainData.domainMin);
			lut.domainMax.copy(domainData.domainMax);

		}

		return lut;

	}

	/**
	 * Creates a neutral 3D LUT.
	 *
	 * @param size - The sidelength.
	 * @return A neutral 3D LUT.
	 */

	static createNeutral(size: number): LookupTexture {

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
