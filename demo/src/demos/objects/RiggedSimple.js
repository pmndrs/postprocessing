import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

/**
 * The tag under which the asset is stored.
 */

export const tag = "rigged-simple";

/**
 * Loads a simple rigged model.
 *
 * @param {Map} assets - A collection of assets.
 * @param {LoadingManager} manager - A loading manager.
 */

export function load(assets, manager) {

	const gltfLoader = new GLTFLoader(manager);
	const url = "models/rigged-simple/RiggedSimple.gltf";

	gltfLoader.load(url, (gltf) => {

		gltf.scene.traverse((object) => {

			if(object.isMesh) {

				object.castShadow = object.receiveShadow = true;

			}

		});

		gltf.scene.scale.multiplyScalar(0.2);

		assets.set(tag, gltf);

	});

}
