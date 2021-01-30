import { BackSide, DoubleSide, FrontSide } from "three";

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
		 * Override materials for meshes that use standard front side triangles.
		 *
		 * @type {Material[]}
		 * @private
		 */

		this.materials = null;

		/**
		 * Override materials for meshes that use back side triangles.
		 *
		 * @type {Material[]}
		 * @private
		 */

		this.materialsBackSide = null;

		/**
		 * Override materials for meshes that use double sided triangles.
		 *
		 * @type {Material[]}
		 * @private
		 */

		this.materialsDoubleSide = null;

		this.setMaterial(material);

		/**
		 * The current mesh count.
		 *
		 * @type {Number}
		 * @private
		 */

		this.meshCount = 0;

		/**
		 * Assigns an appropriate override material to a given mesh.
		 *
		 * @param {Object3D} node - A scene node.
		 * @private
		 */

		this.replaceMaterial = (node) => {

			if(node.isMesh) {

				let materials;

				switch(node.material.side) {

					case DoubleSide:
						materials = this.materialsDoubleSide;
						break;

					case BackSide:
						materials = this.materialsBackSide;
						break;

					default:
						materials = this.materials;
						break;

				}

				this.originalMaterials.set(node, node.material);

				if(node.isSkinnedMesh) {

					node.material = materials[2];

				} else if(node.isInstancedMesh) {

					node.material = materials[1];

				} else {

					node.material = materials[0];

				}

				++this.meshCount;

			}

		};

	}

	/**
	 * Sets the override material.
	 *
	 * @param {Material} material - The material.
	 */

	setMaterial(material) {

		this.disposeMaterials();
		this.material = material;

		if(material !== null) {

			// Create materials for simple, skinned and instanced meshes.
			const materials = this.materials = [
				material.clone(),
				material.clone(),
				material.clone()
			];

			for(const m of materials) {

				m.uniforms = Object.assign({}, material.uniforms);
				m.side = FrontSide;

			}

			materials[2].skinning = true;

			// Create additional materials for meshes that use BackSide.
			this.materialsBackSide = materials.map((m) => {

				const c = m.clone();
				c.uniforms = Object.assign({}, material.uniforms);
				c.side = BackSide;
				return c;

			});

			// Create additional materials for meshes that use DoubleSide.
			this.materialsDoubleSide = materials.map((m) => {

				const c = m.clone();
				c.uniforms = Object.assign({}, material.uniforms);
				c.side = DoubleSide;
				return c;

			});

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

		// Ignore shadows.
		const shadowMapEnabled = renderer.shadowMap.enabled;
		renderer.shadowMap.enabled = false;

		if(workaroundEnabled) {

			const originalMaterials = this.originalMaterials;

			this.meshCount = 0;
			scene.traverse(this.replaceMaterial);
			renderer.render(scene, camera);

			for(const entry of originalMaterials) {

				entry[0].material = entry[1];

			}

			if(this.meshCount !== originalMaterials.size) {

				originalMaterials.clear();

			}

		} else {

			const overrideMaterial = scene.overrideMaterial;
			scene.overrideMaterial = this.material;
			renderer.render(scene, camera);
			scene.overrideMaterial = overrideMaterial;

		}

		renderer.shadowMap.enabled = shadowMapEnabled;

	}

	/**
	 * Deletes cloned override materials.
	 *
	 * @private
	 */

	disposeMaterials() {

		if(this.material !== null) {

			const materials = this.materials
				.concat(this.materialsBackSide)
				.concat(this.materialsDoubleSide);

			for(const m of materials) {

				m.dispose();

			}

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
