import {
	SMAABlendMaterial,
	SMAAColorEdgesMaterial,
	SMAAWeightsMaterial
} from "../materials";

import { Pass } from "./pass";
import THREE from "three";

/**
 * Subpixel Morphological Antialiasing (SMAA) v2.8.
 *
 * Preset: SMAA 1x Medium (with color edge detection).
 *  https://github.com/iryoku/smaa/releases/tag/v2.8
 *
 * @class SMAAPass
 * @constructor
 * @extends Pass
 * @param {Image} Image - This pass requires an Image class to create internal textures. Provide window.Image in a browser environment.
 */

export class SMAAPass extends Pass {

	constructor(Image) {

		super();

		this.needsSwap = true;

		/**
		 * A render target for the color edge detection.
		 *
		 * @property renderTargetColorEdges
		 * @type WebGLRenderTarget
		 * @private
		 */

		this.renderTargetColorEdges = new THREE.WebGLRenderTarget(1, 1, {
			minFilter: THREE.LinearFilter,
			format: THREE.RGBFormat,
			generateMipmaps: false,
			stencilBuffer: false,
			depthBuffer: false
		});

		/**
		 * A render target for the SMAA weights.
		 *
		 * @property renderTargetWeights
		 * @type Material
		 * @private
		 */

		this.renderTargetWeights = this.renderTargetColorEdges.clone();

		this.renderTargetWeights.texture.format = THREE.RGBAFormat;

		/**
		 * SMAA color edge detection shader material.
		 *
		 * @property colorEdgesMaterial
		 * @type SMAAColorEdgesMaterial
		 * @private
		 */

		this.colorEdgesMaterial = new SMAAColorEdgesMaterial();

		/**
		 * SMAA weights shader material.
		 *
		 * @property weightsMaterial
		 * @type SMAAWeightsMaterial
		 * @private
		 */

		this.weightsMaterial = new SMAAWeightsMaterial();

		let areaImage = new Image();
		areaImage.src = this.weightsMaterial.areaImage;

		let areaTexture = new THREE.Texture();
		areaTexture.image = areaImage;
		areaTexture.minFilter = THREE.LinearFilter;
		areaTexture.format = THREE.RGBFormat;
		areaTexture.generateMipmaps = false;
		areaTexture.needsUpdate = true;
		areaTexture.flipY = false;

		let searchImage = new Image();
		searchImage.src = this.weightsMaterial.searchImage;

		let searchTexture = new THREE.Texture();
		searchTexture.image = searchImage;
		searchTexture.magFilter = THREE.NearestFilter;
		searchTexture.minFilter = THREE.NearestFilter;
		searchTexture.generateMipmaps = false;
		searchTexture.needsUpdate = true;
		searchTexture.flipY = false;

		this.weightsMaterial.uniforms.tDiffuse.value = this.renderTargetColorEdges.texture;
		this.weightsMaterial.uniforms.tArea.value = areaTexture;
		this.weightsMaterial.uniforms.tSearch.value = searchTexture;

		/**
		 * SMAA blend shader material.
		 *
		 * @property blendMaterial
		 * @type SMAABlendMaterial
		 * @private
		 */

		this.blendMaterial = new SMAABlendMaterial();

		this.blendMaterial.uniforms.tWeights.value = this.renderTargetWeights.texture;

		this.quad.material = this.blendMaterial;

	}

	/**
	 * Antialiases the scene.
	 *
	 * @method render
	 * @param {WebGLRenderer} renderer - The renderer to use.
	 * @param {WebGLRenderTarget} readBuffer - The read buffer.
	 * @param {WebGLRenderTarget} writeBuffer - The write buffer.
	 */

	render(renderer, readBuffer, writeBuffer) {

		// Detect color edges.
		this.quad.material = this.colorEdgesMaterial;
		this.colorEdgesMaterial.uniforms.tDiffuse.value = readBuffer.texture;
		renderer.render(this.scene, this.camera, this.renderTargetColorEdges, true);

		// Compute edge weights.
		this.quad.material = this.weightsMaterial;
		renderer.render(this.scene, this.camera, this.renderTargetWeights, false);

		// Apply the antialiasing filter to the colors.
		this.quad.material = this.blendMaterial;
		this.blendMaterial.uniforms.tDiffuse.value = readBuffer.texture;

		if(this.renderToScreen) {

			renderer.render(this.scene, this.camera);

		} else {

			renderer.render(this.scene, this.camera, writeBuffer, false);

		}

	}

	/**
	 * Adjusts the format and size of the render targets.
	 *
	 * @method initialise
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {Boolean} alpha - Whether the renderer uses the alpha channel or not.
	 */

	initialise(renderer, alpha) {

		let size = renderer.getSize();
		this.setSize(size.width, size.height);

	}

	/**
	 * Updates this pass with the renderer's size.
	 *
	 * @method setSize
	 * @param {Number} width - The width.
	 * @param {Number} height - The height.
	 */

	setSize(width, height) {

		this.renderTargetColorEdges.setSize(width, height);
		this.renderTargetWeights.setSize(width, height);

		this.colorEdgesMaterial.uniforms.texelSize.value.copy(
			this.weightsMaterial.uniforms.texelSize.value.copy(
				this.blendMaterial.uniforms.texelSize.value.set(1.0 / width, 1.0 / height)
		));

	}

}
