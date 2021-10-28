import { Mesh, RGBFormat } from "three";

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

			if(node instanceof Mesh) {

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
	 * Sets the anisotropy of the given object's textures.
	 *
	 * @param {Object3D} object - A 3D object.
	 * @param {Number} anisotropy - The anisotropy.
	 */

	static setAnisotropy(object, anisotropy) {

		object.traverse((node) => {

			if(node instanceof Mesh) {

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

	/**
	 * Sets the format of the given object's opaque textures to RGBFormat.
	 *
	 * @param {Object3D} object - A 3D object.
	 */

	static setRGBFormat(object) {

		object.traverse((node) => {

			if(node instanceof Mesh) {

				const m = node.material;
				const transparent = (m.transparent || m.alphaTest > 0);

				if(!transparent) {

					const maps = [
						m.map,
						m.emissiveMap,
						m.specularMap
					];

					for(const map of maps) {

						if(map !== undefined && map !== null) {

							map.format = RGBFormat;

						}

					}

				}

			}

		});

	}

}
