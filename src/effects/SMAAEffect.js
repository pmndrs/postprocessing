import {
	BasicDepthPacking,
	Color,
	LinearFilter,
	NearestFilter,
	Texture,
	Uniform,
	Vector2,
	WebGLRenderTarget
} from "three";

import { EdgeDetectionMaterial, EdgeDetectionMode, SMAAWeightsMaterial } from "../materials";
import { ClearPass, ShaderPass } from "../passes";
import { BlendFunction } from "./blending/BlendFunction";
import { Effect, EffectAttribute } from "./Effect";

import searchImageDataURL from "../images/smaa/searchImageDataURL";
import areaImageDataURL from "../images/smaa/areaImageDataURL";

import fragmentShader from "./glsl/smaa/shader.frag";
import vertexShader from "./glsl/smaa/shader.vert";

/**
 * An enumeration of SMAA presets.
 *
 * @type {Object}
 * @property {Number} LOW - Results in around 60% of the maximum quality.
 * @property {Number} MEDIUM - Results in around 80% of the maximum quality.
 * @property {Number} HIGH - Results in around 95% of the maximum quality.
 * @property {Number} ULTRA - Results in around 99% of the maximum quality.
 */

export const SMAAPreset = {
	LOW: 0,
	MEDIUM: 1,
	HIGH: 2,
	ULTRA: 3
};

/**
 * Subpixel Morphological Antialiasing (SMAA).
 *
 * https://github.com/iryoku/smaa/releases/tag/v2.8
 */

export class SMAAEffect extends Effect {

	/**
	 * Constructs a new SMAA effect.
	 *
	 * @param {Image} searchImage - The SMAA search image. Preload this image using the {@link SMAAImageLoader}.
	 * @param {Image} areaImage - The SMAA area image. Preload this image using the {@link SMAAImageLoader}.
	 * @param {SMAAPreset} [preset=SMAAPreset.HIGH] - An SMAA quality preset.
	 * @param {EdgeDetectionMode} [edgeDetectionMode=EdgeDetectionMode.COLOR] - The edge detection mode.
	 */

	constructor(searchImage, areaImage, preset = SMAAPreset.HIGH, edgeDetectionMode = EdgeDetectionMode.COLOR) {

		super("SMAAEffect", fragmentShader, {
			vertexShader,
			blendFunction: BlendFunction.NORMAL,
			attributes: EffectAttribute.CONVOLUTION | EffectAttribute.DEPTH,
			uniforms: new Map([
				["weightMap", new Uniform(null)]
			])
		});

		/**
		 * A render target for the edge detection.
		 *
		 * @type {WebGLRenderTarget}
		 * @private
		 */

		this.renderTargetEdges = new WebGLRenderTarget(1, 1, {
			minFilter: LinearFilter,
			stencilBuffer: false,
			depthBuffer: false
		});

		this.renderTargetEdges.texture.name = "SMAA.Edges";

		/**
		 * A render target for the edge weights.
		 *
		 * @type {WebGLRenderTarget}
		 * @private
		 */

		this.renderTargetWeights = this.renderTargetEdges.clone();
		this.renderTargetWeights.texture.name = "SMAA.Weights";
		this.uniforms.get("weightMap").value = this.renderTargetWeights.texture;

		/**
		 * A clear pass for the edges buffer.
		 *
		 * @type {ClearPass}
		 * @private
		 */

		this.clearPass = new ClearPass(true, false, false);
		this.clearPass.setOverrideClearColor(new Color(0x000000));
		this.clearPass.setOverrideClearAlpha(1.0);

		/**
		 * An edge detection pass.
		 *
		 * @type {ShaderPass}
		 * @private
		 */

		this.edgeDetectionPass = new ShaderPass(new EdgeDetectionMaterial(new Vector2(), edgeDetectionMode));

		/**
		 * An SMAA weights pass.
		 *
		 * @type {ShaderPass}
		 * @private
		 */

		this.weightsPass = new ShaderPass(new SMAAWeightsMaterial());

		const searchTexture = new Texture(searchImage);
		searchTexture.name = "SMAA.Search";
		searchTexture.magFilter = NearestFilter;
		searchTexture.minFilter = NearestFilter;
		searchTexture.generateMipmaps = false;
		searchTexture.needsUpdate = true;
		searchTexture.flipY = true;

		const areaTexture = new Texture(areaImage);
		areaTexture.name = "SMAA.Area";
		areaTexture.magFilter = LinearFilter;
		areaTexture.minFilter = LinearFilter;
		areaTexture.generateMipmaps = false;
		areaTexture.needsUpdate = true;
		areaTexture.flipY = false;

		const weightsMaterial = this.weightsPass.getFullscreenMaterial();
		weightsMaterial.setLookupTextures(searchTexture, areaTexture);

		this.applyPreset(preset);

	}

	/**
	 * Returns the edges texture for debugging purposes.
	 *
	 * @return {Texture} The texture.
	 */

	getEdgesTexture() {

		return this.renderTargetEdges.texture;

	}

	/**
	 * Returns the edge weights texture for debugging purposes.
	 *
	 * @return {Texture} The texture.
	 */

	getWeightsTexture() {

		return this.renderTargetWeights.texture;

	}

	/**
	 * The internal edge detection material.
	 *
	 * @type {EdgeDetectionMaterial}
	 * @deprecated Use getEdgeDetectionMaterial() instead.
	 */

	get edgeDetectionMaterial() {

		return this.getEdgeDetectionMaterial();

	}

	/**
	 * The internal edge detection material.
	 *
	 * @type {EdgeDetectionMaterial}
	 * @deprecated Use getEdgeDetectionMaterial() instead.
	 */

	get colorEdgesMaterial() {

		return this.getEdgeDetectionMaterial();

	}

	/**
	 * Returns the edge detection material.
	 *
	 * @return {EdgeDetectionMaterial} The material.
	 */

	getEdgeDetectionMaterial() {

		return this.edgeDetectionPass.getFullscreenMaterial();

	}

	/**
	 * The internal edge weights material.
	 *
	 * @type {SMAAWeightsMaterial}
	 * @deprecated Use getWeightsMaterial() instead.
	 */

	get weightsMaterial() {

		return this.weightsPass.getFullscreenMaterial();

	}

	/**
	 * Returns the edge weights material.
	 *
	 * @return {SMAAWeightsMaterial} The material.
	 */

	getWeightsMaterial() {

		return this.weightsPass.getFullscreenMaterial();

	}

	/**
	 * Sets the edge detection sensitivity.
	 *
	 * See {@link EdgeDetectionMaterial#setEdgeDetectionThreshold} for more details.
	 *
	 * @deprecated Use applyPreset() or getEdgeDetectionMaterial() instead.
	 * @param {Number} threshold - The edge detection sensitivity. Range: [0.05, 0.5].
	 */

	setEdgeDetectionThreshold(threshold) {

		this.getEdgeDetectionMaterial().setEdgeDetectionThreshold(threshold);

	}

	/**
	 * Sets the maximum amount of horizontal/vertical search steps.
	 *
	 * See {@link SMAAWeightsMaterial#setOrthogonalSearchSteps} for more details.
	 *
	 * @deprecated Use applyPreset() or getWeightsMaterial() instead.
	 * @param {Number} steps - The search steps. Range: [0, 112].
	 */

	setOrthogonalSearchSteps(steps) {

		this.getWeightsMaterial().setOrthogonalSearchSteps(steps);

	}

	/**
	 * Applies the given quality preset.
	 *
	 * @param {SMAAPreset} preset - The preset.
	 */

	applyPreset(preset) {

		const edgeDetectionMaterial = this.edgeDetectionMaterial;
		const weightsMaterial = this.weightsMaterial;

		switch(preset) {

			case SMAAPreset.LOW:
				edgeDetectionMaterial.setEdgeDetectionThreshold(0.15);
				weightsMaterial.setOrthogonalSearchSteps(4);
				weightsMaterial.setDiagonalDetectionEnabled(false);
				weightsMaterial.setCornerRoundingEnabled(false);
				break;

			case SMAAPreset.MEDIUM:
				edgeDetectionMaterial.setEdgeDetectionThreshold(0.1);
				weightsMaterial.setOrthogonalSearchSteps(8);
				weightsMaterial.setDiagonalDetectionEnabled(false);
				weightsMaterial.setCornerRoundingEnabled(false);
				break;

			case SMAAPreset.HIGH:
				edgeDetectionMaterial.setEdgeDetectionThreshold(0.1);
				weightsMaterial.setOrthogonalSearchSteps(16);
				weightsMaterial.setDiagonalSearchSteps(8);
				weightsMaterial.setCornerRounding(25);
				weightsMaterial.setDiagonalDetectionEnabled(true);
				weightsMaterial.setCornerRoundingEnabled(true);
				break;

			case SMAAPreset.ULTRA:
				edgeDetectionMaterial.setEdgeDetectionThreshold(0.05);
				weightsMaterial.setOrthogonalSearchSteps(32);
				weightsMaterial.setDiagonalSearchSteps(16);
				weightsMaterial.setCornerRounding(25);
				weightsMaterial.setDiagonalDetectionEnabled(true);
				weightsMaterial.setCornerRoundingEnabled(true);
				break;

		}

	}

	/**
	 * Sets the depth texture.
	 *
	 * @param {Texture} depthTexture - A depth texture.
	 * @param {DepthPackingStrategies} [depthPacking=BasicDepthPacking] - The depth packing.
	 */

	setDepthTexture(depthTexture, depthPacking = BasicDepthPacking) {

		this.edgeDetectionMaterial.setDepthBuffer(depthTexture, depthPacking);

	}

	/**
	 * Updates this effect.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
	 * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
	 */

	update(renderer, inputBuffer, deltaTime) {

		this.clearPass.render(renderer, this.renderTargetEdges);
		this.edgeDetectionPass.render(renderer, inputBuffer, this.renderTargetEdges);
		this.weightsPass.render(renderer, this.renderTargetEdges, this.renderTargetWeights);

	}

	/**
	 * Updates the size of internal render targets.
	 *
	 * @param {Number} width - The width.
	 * @param {Number} height - The height.
	 */

	setSize(width, height) {

		const edgeDetectionMaterial = this.edgeDetectionPass.getFullscreenMaterial();
		const weightsMaterial = this.weightsPass.getFullscreenMaterial();

		edgeDetectionMaterial.setSize(width, height);
		weightsMaterial.setSize(width, height);

		this.renderTargetEdges.setSize(width, height);
		this.renderTargetWeights.setSize(width, height);

	}

	/**
	 * Deletes internal render targets and textures.
	 */

	dispose() {

		const uniforms = this.weightsPass.getFullscreenMaterial().uniforms;
		uniforms.searchTexture.value.dispose();
		uniforms.areaTexture.value.dispose();

		super.dispose();

	}

	/**
	 * The SMAA search image, encoded as a base64 data URL.
	 *
	 * Use this image data to create an Image instance for the {@link SMAAEffect}.
	 *
	 * @type {String}
	 * @deprecated Use SMAAImageLoader instead.
	 * @example
	 * const searchImage = new Image();
	 * searchImage.addEventListener("load", progress);
	 * searchImage.src = SMAAEffect.searchImageDataURL;
	 */

	static get searchImageDataURL() {

		return searchImageDataURL;

	}

	/**
	 * The SMAA area image, encoded as a base64 data URL.
	 *
	 * Use this image data to create an Image instance for the {@link SMAAEffect}.
	 *
	 * @type {String}
	 * @deprecated Use SMAAImageLoader instead.
	 * @example
	 * const areaImage = new Image();
	 * areaImage.addEventListener("load", progress);
	 * areaImage.src = SMAAEffect.areaImageDataURL;
	 */

	static get areaImageDataURL() {

		return areaImageDataURL;

	}

}
