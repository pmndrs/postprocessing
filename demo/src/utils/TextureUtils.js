/**
 * A collection of texture utility functions.
 */

export class TextureUtils {

	/**
	 * Initializes all textures of the given object.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {Object3D} object - A 3D object.
	 */

	static initializeTextures(renderer, object) {

		object.traverse((node) => {

			if(node.isMesh) {

				const m = node.material;

				const maps = [
					m.map,
					m.lightMap,
					m.aoMap,
					m.emissiveMap,
					m.bumpMap,
					m.normalMap,
					m.displacementMap,
					m.roughnessMap,
					m.metalnessMap,
					m.alphaMap
				];

				for(const map of maps) {

					if(map !== undefined && map !== null) {

						renderer.initTexture(map);

					}

				}

			}

		});

	}

	/**
	 * Sets the the anisotropy of the given object's textures.
	 *
	 * @param {Object3D} object - A 3D object.
	 * @param {Number} anisotropy - The anisotropy.
	 */

	static setAnisotropy(object, anisotropy) {

		object.traverse((node) => {

			if(node.isMesh) {

				const m = node.material;

				const maps = [
					m.map,
					m.emissiveMap,
					m.specularMap,
					m.bumpMap,
					m.normalMap,
					m.roughnessMap,
					m.metalnessMap
				];

				for(const map of maps) {

					if(map !== undefined && map !== null) {

						map.anisotropy = anisotropy;

					}

				}

			}

		});

	}

}
