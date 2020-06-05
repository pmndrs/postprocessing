/**
 * A flag that indicates whether the override material workaround is enabled.
 *
 * @type {Boolean}
 * @private
 */

let workaroundEnabled = false;

/**
 * An override material manager.
 *
 * Includes a workaround that fixes override materials for skinned meshes and
 * instancing. Doesn't fix uniforms such as normal maps and displacement maps.
 * Using the workaround may have a negative impact on performance if the scene
 * contains a lot of meshes.
 *
 * @implements {Disposable}
 */

export class OverrideMaterialManager {

	/**
	 * Constructs a new override material manager.
	 *
	 * @param {Material} [material=null] - An override material.
	 */

	constructor(material = null) {

		/**
		 * Keeps track of original materials.
		 *
		 * @type {Map<Object3D, Material>}
		 * @private
		 */

		this.originalMaterials = new Map();

		/**
		 * The override material.
		 *
		 * @type {Material}
		 * @private
		 */

		this.material = null;

		/**
		 * A clone of the override material.
		 *
		 * @type {Material}
		 * @private
		 */

		this.materialInstanced = null;

		/**
		 * A clone of the override material.
		 *
		 * @type {Material}
		 * @private
		 */

		this.materialSkinning = null;

		this.setMaterial(material);

	}

	/**
	 * Sets the override material.
	 *
	 * @param {Material} material - The material.
	 */

	setMaterial(material) {

		this.disposeMaterials();

		if(material !== null) {

			this.material = material;

			this.materialInstanced = material.clone();
			this.materialInstanced.uniforms = Object.assign({}, material.uniforms);

			this.materialSkinning = material.clone();
			this.materialSkinning.uniforms = Object.assign({}, material.uniforms);
			this.materialSkinning.skinning = true;

		}

	}

	/**
	 * Renders the scene with the override material.
	 *
	 * @private
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {Scene} scene - A scene.
	 * @param {Camera} camera - A camera.
	 */

	render(renderer, scene, camera) {

		const material = this.material;
		const materialSkinning = this.materialSkinning;
		const materialInstanced = this.materialInstanced;
		const originalMaterials = this.originalMaterials;

		const shadowMapEnabled = renderer.shadowMap.enabled;
		const sortObjects = renderer.sortObjects;

		// Ignore shadows and transparency.
		renderer.shadowMap.enabled = false;
		renderer.sortObjects = false;

		if(workaroundEnabled) {

			let meshCount = 0;

			// Replace materials of all meshes with the correct override materials.
			scene.traverse((node) => {

				if(node.isMesh) {

					originalMaterials.set(node, node.material);

					if(node.isInstancedMesh) {

						node.material = materialInstanced;

					} else if(node.isSkinnedMesh) {

						node.material = materialSkinning;

					} else {

						node.material = material;

					}

					++meshCount;

				}

			});

			renderer.render(scene, camera);

			for(const entry of originalMaterials) {

				entry[0].material = entry[1];

			}

			if(meshCount !== originalMaterials.size) {

				originalMaterials.clear();

			}

		} else {

			const overrideMaterial = scene.overrideMaterial;
			scene.overrideMaterial = material;
			renderer.render(scene, camera);
			scene.overrideMaterial = overrideMaterial;

		}

		renderer.shadowMap.enabled = shadowMapEnabled;
		renderer.sortObjects = sortObjects;

	}

	/**
	 * Deletes cloned override materials.
	 *
	 * @private
	 */

	disposeMaterials() {

		if(this.materialInstanced !== null) {

			this.materialInstanced.dispose();

		}

		if(this.materialSkinning !== null) {

			this.materialSkinning.dispose();

		}

	}

	/**
	 * Performs cleanup tasks.
	 */

	dispose() {

		this.originalMaterials.clear();
		this.disposeMaterials();

	}

	/**
	 * Indicates whether the override material workaround is enabled.
	 *
	 * @type {Boolean}
	 */

	static get workaroundEnabled() {

		return workaroundEnabled;

	}

	/**
	 * Enables or disables the override material workaround globally.
	 *
	 * This only affects post processing passes and effects.
	 *
	 * @type {Boolean}
	 */

	static set workaroundEnabled(value) {

		workaroundEnabled = value;

	}

}
