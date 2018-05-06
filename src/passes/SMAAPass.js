import {
	Color,
	LinearFilter,
	NearestFilter,
	RGBAFormat,
	RGBFormat,
	Texture,
	WebGLRenderTarget
} from "three";

import { ColorEdgesMaterial, SMAABlendMaterial, SMAAWeightsMaterial } from "../materials";
import { ClearPass } from "./ClearPass.js";
import { Pass } from "./Pass.js";

import searchImageDataURL from "../materials/images/smaa/searchImageDataURL.js";
import areaImageDataURL from "../materials/images/smaa/areaImageDataURL.js";

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
	 * @param {Image} searchImage - The SMAA search image. Preload this image using the {@link searchImageDataURL}.
	 * @param {Image} areaImage - The SMAA area image. Preload this image using the {@link areaImageDataURL}.
	 */

	constructor(searchImage, areaImage) {

		super("SMAAPass");

		/**
		 * A clear pass for the color edges buffer.
		 *
		 * @type {ClearPass}
		 * @private
		 */

		this.clearPass = new ClearPass({
			clearColor: new Color(0x000000),
			clearAlpha: 1.0
		});

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
		 * Color edge detection shader material.
		 *
		 * @type {ColorEdgesMaterial}
		 * @private
		 */

		this.colorEdgesMaterial = new ColorEdgesMaterial();

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

	}

	/**
	 * Renders the effect.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
	 * @param {WebGLRenderTarget} outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
	 * @param {Number} [delta] - The time between the last frame and the current one in seconds.
	 * @param {Boolean} [stencilTest] - Indicates whether a stencil mask is active.
	 */

	render(renderer, inputBuffer, outputBuffer, delta, stencilTest) {

		// Detect color edges.
		this.material = this.colorEdgesMaterial;
		this.colorEdgesMaterial.uniforms.tDiffuse.value = inputBuffer.texture;
		this.clearPass.render(renderer, null, this.renderTargetColorEdges);
		renderer.render(this.scene, this.camera, this.renderTargetColorEdges);

		// Compute edge weights.
		this.material = this.weightsMaterial;
		renderer.render(this.scene, this.camera, this.renderTargetWeights);

		// Apply the antialiasing filter to the colors.
		this.material = this.blendMaterial;
		this.blendMaterial.uniforms.tDiffuse.value = inputBuffer.texture;

		renderer.render(this.scene, this.camera, this.renderToScreen ? null : outputBuffer);

	}

	/**
	 * Updates the size of this pass.
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
	 * The SMAA search image, encoded as a base64 data URL.
	 *
	 * Use this image data to create an Image instance and use it together with
	 * the area image to create an SMAAPass.
	 *
	 * @type {String}
	 * @example
	 * const searchImage = new Image();
	 * searchImage.addEventListener("load", progress);
	 * searchImage.src = SMAAPass.searchImageDataURL;
	 */

	static get searchImageDataURL() {

		return searchImageDataURL;

	}

	/**
	 * The SMAA area image, encoded as a base64 data URL.
	 *
	 * Use this image data to create an Image instance and use it together with
	 * the search image to create an SMAAPass.
	 *
	 * @type {String}
	 * @example
	 * const areaImage = new Image();
	 * areaImage.addEventListener("load", progress);
	 * areaImage.src = SMAAPass.areaImageDataURL;
	 */

	static get areaImageDataURL() {

		return areaImageDataURL;

	}

}
