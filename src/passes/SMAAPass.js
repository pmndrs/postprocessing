import {
	LinearFilter,
	NearestFilter,
	RGBAFormat,
	RGBFormat,
	Texture,
	WebGLRenderTarget
} from "three";

import { SMAABlendMaterial, SMAAColorEdgesMaterial, SMAAWeightsMaterial } from "../materials";
import { Pass } from "./Pass.js";

import searchImageDataUrl from "../materials/images/smaa/searchImageDataUrl.js";
import areaImageDataUrl from "../materials/images/smaa/areaImageDataUrl.js";

/**
 * Subpixel Morphological Antialiasing (SMAA) v2.8.
 *
 * Preset: SMAA 1x Medium (with color edge detection).
 *  https://github.com/iryoku/smaa/releases/tag/v2.8
 */

export class SMAAPass extends Pass {

	/**
	 * Constructs a new SMAA pass.
	 *
	 * @param {Image} searchImage - The SMAA search image. Preload this image using the {@link searchImageDataUrl}.
	 * @param {Image} areaImage - The SMAA area image. Preload this image using the {@link areaImageDataUrl}.
	 */

	constructor(searchImage, areaImage) {

		super();

		/**
		 * The name of this pass.
		 */

		this.name = "SMAAPass";

		/**
		 * This pass renders to the write buffer.
		 */

		this.needsSwap = true;

		/**
		 * A render target for the color edge detection.
		 *
		 * @type {WebGLRenderTarget}
		 * @private
		 */

		this.renderTargetColorEdges = new WebGLRenderTarget(1, 1, {
			minFilter: LinearFilter,
			format: RGBFormat,
			stencilBuffer: false,
			depthBuffer: false
		});

		this.renderTargetColorEdges.texture.name = "SMAA.ColorEdges";
		this.renderTargetColorEdges.texture.generateMipmaps = false;

		/**
		 * A render target for the SMAA weights.
		 *
		 * @type {WebGLRenderTarget}
		 * @private
		 */

		this.renderTargetWeights = this.renderTargetColorEdges.clone();

		this.renderTargetWeights.texture.name = "SMAA.Weights";
		this.renderTargetWeights.texture.format = RGBAFormat;

		/**
		 * SMAA color edge detection shader material.
		 *
		 * @type {SMAAColorEdgesMaterial}
		 * @private
		 */

		this.colorEdgesMaterial = new SMAAColorEdgesMaterial();

		/**
		 * SMAA weights shader material.
		 *
		 * @type {SMAAWeightsMaterial}
		 * @private
		 */

		this.weightsMaterial = new SMAAWeightsMaterial();

		this.weightsMaterial.uniforms.tDiffuse.value = this.renderTargetColorEdges.texture;

		/**
		 * The SMAA search texture.
		 *
		 * @type {Texture}
		 * @private
		 */

		this.searchTexture = new Texture(searchImage);

		this.searchTexture.name = "SMAA.Search";
		this.searchTexture.magFilter = NearestFilter;
		this.searchTexture.minFilter = NearestFilter;
		this.searchTexture.format = RGBAFormat;
		this.searchTexture.generateMipmaps = false;
		this.searchTexture.needsUpdate = true;
		this.searchTexture.flipY = false;

		this.weightsMaterial.uniforms.tSearch.value = this.searchTexture;

		/**
		 * The SMAA area texture.
		 *
		 * @type {Texture}
		 * @private
		 */

		this.areaTexture = new Texture(areaImage);

		this.areaTexture.name = "SMAA.Area";
		this.areaTexture.minFilter = LinearFilter;
		this.areaTexture.format = RGBAFormat;
		this.areaTexture.generateMipmaps = false;
		this.areaTexture.needsUpdate = true;
		this.areaTexture.flipY = false;

		this.weightsMaterial.uniforms.tArea.value = this.areaTexture;

		/**
		 * SMAA blend shader material.
		 *
		 * @type {SMAABlendMaterial}
		 * @private
		 */

		this.blendMaterial = new SMAABlendMaterial();

		this.blendMaterial.uniforms.tWeights.value = this.renderTargetWeights.texture;

		this.quad.material = this.blendMaterial;

	}

	/**
	 * Antialiases the scene.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
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

		renderer.render(this.scene, this.camera, this.renderToScreen ? null : writeBuffer);

	}

	/**
	 * Updates this pass with the renderer's size.
	 *
	 * @param {Number} width - The width.
	 * @param {Number} height - The height.
	 */

	setSize(width, height) {

		this.renderTargetColorEdges.setSize(width, height);
		this.renderTargetWeights.setSize(width, height);

		this.colorEdgesMaterial.uniforms.texelSize.value.copy(
			this.weightsMaterial.uniforms.texelSize.value.copy(
				this.blendMaterial.uniforms.texelSize.value.set(
					1.0 / width, 1.0 / height)));

	}

	/**
	 * The SMAA search image, encoded as a base64 data url.
	 *
	 * Use this image data to create an Image instance and use it together with
	 * the area image to create an SMAAPass.
	 *
	 * @type {String}
	 * @example
	 * const searchImage = new Image();
	 * searchImage.addEventListener("load", progress);
	 * searchImage.src = SMAAPass.searchImageDataUrl;
	 */

	static get searchImageDataUrl() {

		return searchImageDataUrl;

	}

	/**
	 * The SMAA area image, encoded as a base64 data url.
	 *
	 * Use this image data to create an Image instance and use it together with
	 * the search image to create an SMAAPass.
	 *
	 * @type {String}
	 * @example
	 * const areaImage = new Image();
	 * areaImage.addEventListener("load", progress);
	 * areaImage.src = SMAAPass.areaImageDataUrl;
	 */

	static get areaImageDataUrl() {

		return areaImageDataUrl;

	}

}
