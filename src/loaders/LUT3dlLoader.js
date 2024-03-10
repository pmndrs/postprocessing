import { FileLoader, Loader, LoadingManager } from "three";
import { LookupTexture } from "../textures/lut/LookupTexture.js";

/**
 * A 3D LUT loader that supports the .3dl file format.
 *
 * Based on an implementation by Garrett Johnson:
 * https://github.com/gkjohnson/threejs-sandbox/tree/master/3d-lut
 *
 * For more details see:
 * http://download.autodesk.com/us/systemdocs/help/2011/lustre/index.html?url=./files/WSc4e151a45a3b785a24c3d9a411df9298473-7ffd.htm,topicNumber=d0e9492
 *
 * @deprecated Use `three/addons/loaders/LUT3dlLoader.js` instead.
 */

export class LUT3dlLoader extends Loader {

	/**
	 * Loads a LUT.
	 *
	 * @param {String} url - The URL of the 3dl-file.
	 * @param {Function} [onLoad] - A callback that receives the loaded lookup texture.
	 * @param {Function} [onProgress] - A progress callback that receives the XMLHttpRequest instance.
	 * @param {Function} [onError] - An error callback that receives the URL of the file that failed to load.
	 * @return {Promise<LookupTexture>} A promise that returns the lookup texture.
	 */

	load(url, onLoad = () => {}, onProgress = () => {}, onError = null) {

		const externalManager = this.manager;
		const internalManager = new LoadingManager();

		const loader = new FileLoader(internalManager);
		loader.setPath(this.path);
		loader.setResponseType("text");

		return new Promise((resolve, reject) => {

			internalManager.onError = (url) => {

				externalManager.itemError(url);

				if(onError !== null) {

					onError(`Failed to load ${url}`);
					resolve();

				} else {

					reject(`Failed to load ${url}`);

				}

			};

			externalManager.itemStart(url);

			loader.load(url, (data) => {

				try {

					const result = this.parse(data);
					externalManager.itemEnd(url);
					onLoad(result);
					resolve(result);

				} catch(e) {

					console.error(e);
					internalManager.onError(url);

				}

			}, onProgress);

		});

	}

	/**
	 * Parses the given data.
	 *
	 * @param {String} input - The LUT data.
	 * @return {LookupTexture} The lookup texture.
	 * @throws {Error} Fails if the data is invalid.
	 */

	parse(input) {

		const regExpGridInfo = /^[\d ]+$/m;
		const regExpDataPoints = /^([\d.e+-]+) +([\d.e+-]+) +([\d.e+-]+) *$/gm;

		// The first line describes the positions of values on the LUT grid.
		let result = regExpGridInfo.exec(input);

		if(result === null) {

			throw new Error("Missing grid information");

		}

		const gridLines = result[0].trim().split(/\s+/g).map((n) => Number(n));
		const gridStep = gridLines[1] - gridLines[0];
		const size = gridLines.length;
		const sizeSq = size ** 2;

		for(let i = 1, l = gridLines.length; i < l; ++i) {

			if(gridStep !== (gridLines[i] - gridLines[i - 1])) {

				throw new Error("Inconsistent grid size");

			}

		}

		const data = new Float32Array(size ** 3 * 4);
		let maxValue = 0.0;
		let index = 0;

		while((result = regExpDataPoints.exec(input)) !== null) {

			const r = Number(result[1]);
			const g = Number(result[2]);
			const b = Number(result[3]);

			maxValue = Math.max(maxValue, r, g, b);

			const bLayer = index % size;
			const gLayer = Math.floor(index / size) % size;
			const rLayer = Math.floor(index / (sizeSq)) % size;

			// b grows first, then g, then r.
			const d4 = (bLayer * sizeSq + gLayer * size + rLayer) * 4;
			data[d4 + 0] = r;
			data[d4 + 1] = g;
			data[d4 + 2] = b;
			data[d4 + 3] = 1.0;

			++index;

		}

		// Determine the bit depth and scale the values to [0.0, 1.0].
		const bits = Math.ceil(Math.log2(maxValue));
		const maxBitValue = Math.pow(2, bits);

		for(let i = 0, l = data.length; i < l; i += 4) {

			data[i + 0] /= maxBitValue;
			data[i + 1] /= maxBitValue;
			data[i + 2] /= maxBitValue;

		}

		return new LookupTexture(data, size);

	}

}
