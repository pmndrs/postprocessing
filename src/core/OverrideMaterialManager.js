import { BackSide, DoubleSide, FrontSide, ShaderMaterial } from "three";

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
 * Includes a workaround that fixes override materials for skinned meshes and instancing. Doesn't fix uniforms such as
 * normal maps and displacement maps. Using the workaround may have a negative impact on performance if the scene
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
		 * The main override material.
		 *
		 * @type {Material}
		 * @private
		 */

		this.material = null;

		/**
		 * Override materials for meshes with front side triangles.
		 *
		 * @type {Material[]}
		 * @private
		 */

		this.materials = null;

		/**
		 * Override materials for meshes with back side triangles.
		 *
		 * @type {Material[]}
		 * @private
		 */

		this.materialsBackSide = null;

		/**
		 * Override materials for meshes with double sided triangles.
		 *
		 * @type {Material[]}
		 * @private
		 */

		this.materialsDoubleSide = null;

		/**
		 * Override materials for flat shaded meshes with front side triangles.
		 *
		 * @type {Material[]}
		 * @private
		 */

		this.materialsFlatShaded = null;

		/**
		 * Override materials for flat shaded meshes with back side triangles.
		 *
		 * @type {Material[]}
		 * @private
		 */

		this.materialsFlatShadedBackSide = null;

		/**
		 * Override materials for flat shaded meshes with double sided triangles.
		 *
		 * @type {Material[]}
		 * @private
		 */

		this.materialsFlatShadedDoubleSide = null;

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

				if(node.material.flatShading) {

					switch(node.material.side) {

						case DoubleSide:
							materials = this.materialsFlatShadedDoubleSide;
							break;

						case BackSide:
							materials = this.materialsFlatShadedBackSide;
							break;

						default:
							materials = this.materialsFlatShaded;
							break;

					}

				} else {

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
	 * Clones the given material.
	 *
	 * @private
	 * @param {Material} material - The material.
	 * @return {Material} The cloned material.
	 */

	cloneMaterial(material) {

		if(!(material instanceof ShaderMaterial)) {

			// No uniforms.
			return material.clone();

		}

		const uniforms = material.uniforms;
		const textureUniforms = new Map();

		for(const key in uniforms) {

			const value = uniforms[key].value;

			if(value.isRenderTargetTexture) {

				// Three logs warnings about cloning render target textures since r151.
				uniforms[key].value = null;
				textureUniforms.set(key, value);

			}

		}

		const clone = material.clone();

		for(const entry of textureUniforms) {

			// Restore and copy references to textures.
			uniforms[entry[0]].value = entry[1];
			clone.uniforms[entry[0]].value = entry[1];

		}

		return clone;

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

			// Create materials for simple, instanced and skinned meshes.
			const materials = this.materials = [
				this.cloneMaterial(material),
				this.cloneMaterial(material),
				this.cloneMaterial(material)
			];

			// FrontSide
			for(const m of materials) {

				m.uniforms = Object.assign({}, material.uniforms);
				m.side = FrontSide;

			}

			materials[2].skinning = true;

			// BackSide
			this.materialsBackSide = materials.map((m) => {

				const c = this.cloneMaterial(m);
				c.uniforms = Object.assign({}, material.uniforms);
				c.side = BackSide;
				return c;

			});

			// DoubleSide
			this.materialsDoubleSide = materials.map((m) => {

				const c = this.cloneMaterial(m);
				c.uniforms = Object.assign({}, material.uniforms);
				c.side = DoubleSide;
				return c;

			});

			// FrontSide & flatShading
			this.materialsFlatShaded = materials.map((m) => {

				const c = this.cloneMaterial(m);
				c.uniforms = Object.assign({}, material.uniforms);
				c.flatShading = true;
				return c;

			});

			// BackSide & flatShading
			this.materialsFlatShadedBackSide = materials.map((m) => {

				const c = this.cloneMaterial(m);
				c.uniforms = Object.assign({}, material.uniforms);
				c.flatShading = true;
				c.side = BackSide;
				return c;

			});

			// DoubleSide & flatShading
			this.materialsFlatShadedDoubleSide = materials.map((m) => {

				const c = this.cloneMaterial(m);
				c.uniforms = Object.assign({}, material.uniforms);
				c.flatShading = true;
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
				.concat(this.materialsDoubleSide)
				.concat(this.materialsFlatShaded)
				.concat(this.materialsFlatShadedBackSide)
				.concat(this.materialsFlatShadedDoubleSide);

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
