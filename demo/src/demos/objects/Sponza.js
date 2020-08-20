import { AmbientLight, CameraHelper, DirectionalLight } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
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
