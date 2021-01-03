import { FileLoader, Loader, LoadingManager, sRGBEncoding, Vector3 } from "three";
import { LookupTexture3D } from "../images/textures/LookupTexture3D";

/**
 * A 3D LUT loader that supports the .cube file format.
 *
 * Based on an implementation by Garrett Johnson:
 * https://github.com/gkjohnson/threejs-sandbox/tree/master/3d-lut
 *
 * For more details see:
 * https://wwwimages2.adobe.com/content/dam/acom/en/products/speedgrade/cc/pdfs/cube-lut-specification-1.0.pdf
 */

export class LUTCubeLoader extends Loader {

	/**
	 * Loads a LUT.
	 *
	 * @param {String} url - The URL of the CUBE-file.
	 * @param {Function} [onLoad] - A function to call when the loading process is done.
	 * @param {Function} [onProgress] - A function to call when an error occurs.
	 * @param {Function} [onError] - A function to call when an error occurs.
	 * @return {Promise<LookupTexture3D>} A promise that returns the lookup texture.
	 */

	load(url, onLoad = () => {}, onProgress = () => {}, onError = () => {}) {

		const externalManager = this.manager;
		const internalManager = new LoadingManager();

		const loader = new FileLoader(internalManager);
		loader.setPath(this.path);
		loader.setResponseType("text");

		return new Promise((resolve, reject) => {

			internalManager.onError = (error) => {

				externalManager.itemError(url);
				onError(error);
				reject(error);

			};

			externalManager.itemStart(url);

			loader.load(url, (data) => {

				try {

					const result = this.parse(data);
					externalManager.itemEnd(url);
					onLoad(result);
					resolve(result);

				} catch(error) {

					internalManager.onError(error);

				}

			}, onProgress);

		});

	}

	/**
	 * Parses the given data.
	 *
	 * @param {String} input - The LUT data.
	 * @return {LookupTexture3D} The lookup texture.
	 * @throws {Error} Fails if the data is invalid.
	 */

	parse(input) {

		const regExpTitle = /TITLE +"([^"]*)"/;
		const regExpSize = /LUT_3D_SIZE +(\d+)/;
		const regExpDomainMin = /DOMAIN_MIN +([\d.]+) +([\d.]+) +([\d.]+)/;
		const regExpDomainMax = /DOMAIN_MAX +([\d.]+) +([\d.]+) +([\d.]+)/;
		const regExpDataPoints = /^([\d.]+) +([\d.]+) +([\d.]+) *$/gm;

		let result = regExpTitle.exec(input);
		const title = (result !== null) ? result[1] : null;

		result = regExpSize.exec(input);

		if(result === null) {

			throw Error("Missing LUT_3D_SIZE information");

		}

		const size = Number(result[1]);
		const data = new Float32Array(size ** 3 * 3);

		const domainMin = new Vector3(0, 0, 0);
		const domainMax = new Vector3(1, 1, 1);

		result = regExpDomainMin.exec(input);

		if(result !== null) {

			domainMin.set(Number(result[1]), Number(result[2]), Number(result[3]));

		}

		result = regExpDomainMax.exec(input);

		if(result !== null) {

			domainMax.set(Number(result[1]), Number(result[2]), Number(result[3]));

		}

		if(domainMin.x !== 0 || domainMin.y !== 0 || domainMin.z !== 0 ||
			domainMax.x !== 1 || domainMax.y !== 1 || domainMax.z !== 1) {

			throw Error("Non-normalized input domain not supported");

		}

		let i = 0;

		while((result = regExpDataPoints.exec(input)) !== null) {

			data[i++] = Number(result[1]);
			data[i++] = Number(result[2]);
			data[i++] = Number(result[3]);

		}

		const lut = new LookupTexture3D(data, size, size, size);
		lut.encoding = sRGBEncoding;

		if(title !== null) {

			lut.name = title;

		}

		return lut;

	}

}
