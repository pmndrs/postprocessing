import { AmbientLight, CameraHelper, DirectionalLight } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { TextureUtils } from "../../utils/TextureUtils";

/**
 * The tag under which the asset is stored.
 */

export const tag = "sponza";

/**
 * Creates lights.
 *
 * @param {Boolean} [shadowCameraHelper=false] - Determines whether a shadow camera helper should be created.
 * @return {Object3D[]} The lights, light targets and, optionally, a shadow camera helper.
 */

export function createLights(shadowCameraHelper = false) {

	const ambientLight = new AmbientLight(0x111111);
	const directionalLight = new DirectionalLight(0xffffff, 1);

	directionalLight.position.set(4, 18, 3);
	directionalLight.target.position.set(0, 7, 0);
	directionalLight.castShadow = true;
	directionalLight.shadow.mapSize.width = 2048;
	directionalLight.shadow.mapSize.height = 2048;
	directionalLight.shadow.bias = 0.001;
	directionalLight.shadow.normalBias = 0.02;
	directionalLight.shadow.camera.top = 20;
	directionalLight.shadow.camera.right = 20;
	directionalLight.shadow.camera.bottom = -20;
	directionalLight.shadow.camera.left = -20;
	directionalLight.shadow.camera.far = 32;

	if(window.innerWidth < 720) {

		directionalLight.shadow.mapSize.width = 512;
		directionalLight.shadow.mapSize.height = 512;
		directionalLight.shadow.normalBias = 0.1;

	} else if(window.innerWidth < 1280) {

		directionalLight.shadow.mapSize.width = 1024;
		directionalLight.shadow.mapSize.height = 1024;
		directionalLight.shadow.normalBias = 0.033;

	}

	return [ambientLight, directionalLight, directionalLight.target].concat(
		shadowCameraHelper ? [new CameraHelper(directionalLight.shadow.camera)] : []
	);

}

/**
 * Loads the Sponza model.
 *
 * @param {Map} assets - A collection of assets.
 * @param {LoadingManager} manager - A loading manager.
 * @param {Number} anisotropy - The texture anisotropy.
 */

export function load(assets, manager, anisotropy) {

	const gltfLoader = new GLTFLoader(manager);
	const url = "models/sponza/Sponza.gltf";

	gltfLoader.load(url, (gltf) => {

		gltf.scene.traverse((object) => {

			if(object.isMesh) {

				object.castShadow = object.receiveShadow = true;

			}

		});

		TextureUtils.setAnisotropy(gltf.scene, anisotropy);
		assets.set(tag, gltf.scene);

	});

}
