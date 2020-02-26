import { AmbientLight, CameraHelper, DirectionalLight } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

/**
 * Creates lights.
 *
 * @private
 * @param {Boolean} shadowCameraHelper - Determines whether a shadow camera helper should be created.
 * @return {Object3D[]} The lights, light targets and, optionally, a shadow camera helper.
 */

function createLights(shadowCameraHelper) {

	const ambientLight = new AmbientLight(0x111111);
	const directionalLight = new DirectionalLight(0xffffff, 1);

	directionalLight.position.set(4, 18, 3);
	directionalLight.target.position.set(0, 7, 0);
	directionalLight.castShadow = true;
	directionalLight.shadow.mapSize.width = 2048;
	directionalLight.shadow.mapSize.height = 2048;
	directionalLight.shadow.camera.top = 20;
	directionalLight.shadow.camera.right = 20;
	directionalLight.shadow.camera.bottom = -20;
	directionalLight.shadow.camera.left = -20;
	directionalLight.shadow.camera.far = 32;

	return [ambientLight, directionalLight, directionalLight.target].concat(
		shadowCameraHelper ? [new CameraHelper(directionalLight.shadow.camera)] : []
	);

}

/**
 * Loads the Sponza model.
 *
 * @private
 * @param {Map} assets - A collection of assets. The model will be stored as "sponza".
 * @param {LoadingManager} manager - A loading manager.
 * @param {Number} anisotropy - The texture anisotropy.
 */

function load(assets, manager, anisotropy) {

	const gltfLoader = new GLTFLoader(manager);
	const sponzaURL = "models/sponza/scene.gltf";

	gltfLoader.load(sponzaURL, (gltf) => {

		gltf.scene.traverse((object) => {

			if(object.isMesh) {

				const { map = null, normalMap = null } = object.material;

				if(map !== null) {

					object.material.map.anisotropy = anisotropy;

				}

				if(normalMap !== null) {

					object.material.normalMap.anisotropy = anisotropy;

				}

				object.castShadow = object.receiveShadow = true;

			}

		});

		assets.set("sponza", gltf.scene);

	});

}

/**
 * The Sponza model.
 */

export class Sponza {

	/**
	 * Creates lights.
	 *
	 * @param {Boolean} [shadowCameraHelper=false] - Determines whether a shadow camera helper should be created.
	 * @return {Object3D[]} The lights, light targets and, optionally, a shadow camera helper.
	 */

	static createLights(shadowCameraHelper = false) {

		return createLights(shadowCameraHelper);

	}

	/**
	 * Loads the Sponza model.
	 *
	 * @param {Map} assets - A collection of assets. The model will be stored as "sponza".
	 * @param {LoadingManager} manager - A loading manager.
	 * @param {Number} anisotropy - The texture anisotropy.
	 */

	static load(assets, manager, anisotropy) {

		load(assets, manager, anisotropy);

	}

}
