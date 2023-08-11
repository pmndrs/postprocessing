import { FileLoader, Loader, LoadingManager, Vector3 } from "three";
import { LookupTexture } from "../textures/lut/LookupTexture.js";

/**
 * A 3D LUT loader that supports the .cube file format.
 *
 * Based on an implementation by Garrett Johnson.
 * @see https://github.com/gkjohnson/threejs-sandbox/tree/master/3d-lut
 * @see https://wwwimages2.adobe.com/content/dam/acom/en/products/speedgrade/cc/pdfs/cube-lut-specification-1.0.pdf
 * @group Loaders
 */

export class LUTCubeLoader extends Loader {

	/**
	 * Loads a LUT.
	 *
	 * @param url - The URL of the CUBE-file.
	 * @param onLoad - A callback that receives the loaded lookup texture.
	 * @param onProgress - A progress callback that receives the XMLHttpRequest instance.
	 * @param onError - An error callback that receives the URL of the file that failed to load.
	 * @return A promise that returns the lookup texture.
	 */

	async load(url: string, onLoad = (_: LookupTexture) => {}, onProgress = () => {},
		onError = (_: string) => {}): Promise<LookupTexture> {

		const externalManager = this.manager;
		const internalManager = new LoadingManager();

		const loader = new FileLoader(internalManager);
		loader.setPath(this.path);
		loader.setResponseType("text");

		return new Promise((resolve, reject) => {

			internalManager.onError = (url) => {

				externalManager.itemError(url);

				if(onError) {

					onError(`Failed to load ${url}`);

				}

				reject(new Error(`Failed to load ${url}`));

			};

			externalManager.itemStart(url);

			loader.load(url, (data) => {

				try {

					const result = this.parse(data as string);
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
	 * @param input - The LUT data.
	 * @return The lookup texture.
	 */

	parse(input: string): LookupTexture {

		const regExpTitle = /TITLE +"([^"]*)"/;
		const regExpSize = /LUT_3D_SIZE +(\d+)/;
		const regExpDomainMin = /DOMAIN_MIN +([\d.]+) +([\d.]+) +([\d.]+)/;
		const regExpDomainMax = /DOMAIN_MAX +([\d.]+) +([\d.]+) +([\d.]+)/;
		const regExpDataPoints = /^([\d.e+-]+) +([\d.e+-]+) +([\d.e+-]+) *$/gm;

		let result = regExpTitle.exec(input);
		const title = (result !== null) ? result[1] : null;

		result = regExpSize.exec(input);

		if(result === null) {

			throw new Error("Missing LUT_3D_SIZE information");

		}

		const size = Number(result[1]);
		const data = new Float32Array(size ** 3 * 4);

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

		if(domainMin.x > domainMax.x || domainMin.y > domainMax.y || domainMin.z > domainMax.z) {

			domainMin.set(0, 0, 0);
			domainMax.set(1, 1, 1);

			throw new Error("Invalid input domain");

		}

		let i = 0;

		while((result = regExpDataPoints.exec(input)) !== null) {

			data[i++] = Number(result[1]);
			data[i++] = Number(result[2]);
			data[i++] = Number(result[3]);
			data[i++] = 1.0;

		}

		const lut = new LookupTexture(data, size);
		lut.domainMin.copy(domainMin);
		lut.domainMax.copy(domainMax);

		if(title !== null) {

			lut.name = title;

		}

		return lut;

	}

}
