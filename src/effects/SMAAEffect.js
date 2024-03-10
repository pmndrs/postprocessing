import {
	BasicDepthPacking,
	Color,
	LinearFilter,
	LoadingManager,
	NearestFilter,
	Texture,
	Uniform,
	WebGLRenderTarget
} from "three";

import { BlendFunction } from "../enums/BlendFunction.js";
import { EdgeDetectionMode } from "../enums/EdgeDetectionMode.js";
import { EffectAttribute } from "../enums/EffectAttribute.js";
import { PredicationMode } from "../enums/PredicationMode.js";
import { SMAAPreset } from "../enums/SMAAPreset.js";
import { EdgeDetectionMaterial } from "../materials/EdgeDetectionMaterial.js";
import { SMAAWeightsMaterial } from "../materials/SMAAWeightsMaterial.js";
import { ClearPass } from "../passes/ClearPass.js";
import { ShaderPass } from "../passes/ShaderPass.js";
import { Effect } from "./Effect.js";

import searchImageDataURL from "../textures/smaa/searchImageDataURL.js";
import areaImageDataURL from "../textures/smaa/areaImageDataURL.js";

import fragmentShader from "./glsl/smaa.frag";
import vertexShader from "./glsl/smaa.vert";

/**
 * Subpixel Morphological Antialiasing (SMAA).
 *
 * https://github.com/iryoku/smaa/releases/tag/v2.8
 */

export class SMAAEffect extends Effect {

	/**
	 * Constructs a new SMAA effect.
	 *
	 * @param {Object} [options] - The options.
	 * @param {BlendFunction} [options.blendFunction=BlendFunction.SRC] - The blend function of this effect.
	 * @param {SMAAPreset} [options.preset=SMAAPreset.MEDIUM] - The quality preset.
	 * @param {EdgeDetectionMode} [options.edgeDetectionMode=EdgeDetectionMode.COLOR] - The edge detection mode.
	 * @param {PredicationMode} [options.predicationMode=PredicationMode.DISABLED] - The predication mode.
	 */

	constructor({
		blendFunction = BlendFunction.SRC,
		preset = SMAAPreset.MEDIUM,
		edgeDetectionMode = EdgeDetectionMode.COLOR,
		predicationMode = PredicationMode.DISABLED
	} = {}) {

		super("SMAAEffect", fragmentShader, {
			vertexShader,
			blendFunction,
			attributes: EffectAttribute.CONVOLUTION | EffectAttribute.DEPTH,
			uniforms: new Map([
				["weightMap", new Uniform(null)]
			])
		});

		// TODO Added for backward-compatibility.
		let searchImage, areaImage;

		if(arguments.length > 1) {

			searchImage = arguments[0];
			areaImage = arguments[1];

			if(arguments.length > 2) {

				preset = arguments[2];

			}

			if(arguments.length > 3) {

				edgeDetectionMode = arguments[3];

			}

		}

		/**
		 * A render target for the edge detection.
		 *
		 * @type {WebGLRenderTarget}
		 * @private
		 */

		this.renderTargetEdges = new WebGLRenderTarget(1, 1, { depthBuffer: false });
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
		this.clearPass.overrideClearColor = new Color(0x000000);
		this.clearPass.overrideClearAlpha = 1;

		/**
		 * An edge detection pass.
		 *
		 * @type {ShaderPass}
		 * @private
		 */

		this.edgeDetectionPass = new ShaderPass(new EdgeDetectionMaterial());
		this.edgeDetectionMaterial.edgeDetectionMode = edgeDetectionMode;
		this.edgeDetectionMaterial.predicationMode = predicationMode;

		/**
		 * An SMAA weights pass.
		 *
		 * @type {ShaderPass}
		 * @private
		 */

		this.weightsPass = new ShaderPass(new SMAAWeightsMaterial());

		// Load the lookup textures.
		const loadingManager = new LoadingManager();
		loadingManager.onLoad = () => {

			const searchTexture = new Texture(searchImage);
			searchTexture.name = "SMAA.Search";
			searchTexture.magFilter = NearestFilter;
			searchTexture.minFilter = NearestFilter;
			searchTexture.generateMipmaps = false;
			searchTexture.needsUpdate = true;
			searchTexture.flipY = true;
			this.weightsMaterial.searchTexture = searchTexture;

			const areaTexture = new Texture(areaImage);
			areaTexture.name = "SMAA.Area";
			areaTexture.magFilter = LinearFilter;
			areaTexture.minFilter = LinearFilter;
			areaTexture.generateMipmaps = false;
			areaTexture.needsUpdate = true;
			areaTexture.flipY = false;
			this.weightsMaterial.areaTexture = areaTexture;

			this.dispatchEvent({ type: "load" });

		};

		loadingManager.itemStart("search");
		loadingManager.itemStart("area");

		if(searchImage !== undefined && areaImage !== undefined) {

			// Use the provided images.
			loadingManager.itemEnd("search");
			loadingManager.itemEnd("area");

		} else if(typeof Image !== "undefined") {

			// Load the lookup textures.
			searchImage = new Image();
			areaImage = new Image();
			searchImage.addEventListener("load", () => loadingManager.itemEnd("search"));
			areaImage.addEventListener("load", () => loadingManager.itemEnd("area"));
			searchImage.src = searchImageDataURL;
			areaImage.src = areaImageDataURL;

		}

		this.applyPreset(preset);

	}

	/**
	 * The edges texture.
	 *
	 * @type {Texture}
	 */

	get edgesTexture() {

		return this.renderTargetEdges.texture;

	}

	/**
	 * Returns the edges texture.
	 *
	 * @deprecated Use edgesTexture instead.
	 * @return {Texture} The texture.
	 */

	getEdgesTexture() {

		return this.edgesTexture;

	}

	/**
	 * The edge weights texture.
	 *
	 * @type {Texture}
	 */

	get weightsTexture() {

		return this.renderTargetWeights.texture;

	}

	/**
	 * Returns the edge weights texture.
	 *
	 * @deprecated Use weightsTexture instead.
	 * @return {Texture} The texture.
	 */

	getWeightsTexture() {

		return this.weightsTexture;

	}

	/**
	 * The edge detection material.
	 *
	 * @type {EdgeDetectionMaterial}
	 */

	get edgeDetectionMaterial() {

		return this.edgeDetectionPass.fullscreenMaterial;

	}

	/**
	 * The edge detection material.
	 *
	 * @type {EdgeDetectionMaterial}
	 * @deprecated Use edgeDetectionMaterial instead.
	 */

	get colorEdgesMaterial() {

		return this.edgeDetectionMaterial;

	}

	/**
	 * Returns the edge detection material.
	 *
	 * @deprecated Use edgeDetectionMaterial instead.
	 * @return {EdgeDetectionMaterial} The material.
	 */

	getEdgeDetectionMaterial() {

		return this.edgeDetectionMaterial;

	}

	/**
	 * The edge weights material.
	 *
	 * @type {SMAAWeightsMaterial}
	 */

	get weightsMaterial() {

		return this.weightsPass.fullscreenMaterial;

	}

	/**
	 * Returns the edge weights material.
	 *
	 * @deprecated Use weightsMaterial instead.
	 * @return {SMAAWeightsMaterial} The material.
	 */

	getWeightsMaterial() {

		return this.weightsMaterial;

	}

	/**
	 * Sets the edge detection sensitivity.
	 *
	 * See {@link EdgeDetectionMaterial#setEdgeDetectionThreshold} for more details.
	 *
	 * @deprecated Use edgeDetectionMaterial instead.
	 * @param {Number} threshold - The edge detection sensitivity. Range: [0.05, 0.5].
	 */

	setEdgeDetectionThreshold(threshold) {

		this.edgeDetectionMaterial.edgeDetectionThreshold = threshold;

	}

	/**
	 * Sets the maximum amount of horizontal/vertical search steps.
	 *
	 * See {@link SMAAWeightsMaterial#setOrthogonalSearchSteps} for more details.
	 *
	 * @deprecated Use weightsMaterial instead.
	 * @param {Number} steps - The search steps. Range: [0, 112].
	 */

	setOrthogonalSearchSteps(steps) {

		this.weightsMaterial.orthogonalSearchSteps = steps;

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
				edgeDetectionMaterial.edgeDetectionThreshold = 0.15;
				weightsMaterial.orthogonalSearchSteps = 4;
				weightsMaterial.diagonalDetection = false;
				weightsMaterial.cornerDetection = false;
				break;

			case SMAAPreset.MEDIUM:
				edgeDetectionMaterial.edgeDetectionThreshold = 0.1;
				weightsMaterial.orthogonalSearchSteps = 8;
				weightsMaterial.diagonalDetection = false;
				weightsMaterial.cornerDetection = false;
				break;

			case SMAAPreset.HIGH:
				edgeDetectionMaterial.edgeDetectionThreshold = 0.1;
				weightsMaterial.orthogonalSearchSteps = 16;
				weightsMaterial.diagonalSearchSteps = 8;
				weightsMaterial.cornerRounding = 25;
				weightsMaterial.diagonalDetection = true;
				weightsMaterial.cornerDetection = true;
				break;

			case SMAAPreset.ULTRA:
				edgeDetectionMaterial.edgeDetectionThreshold = 0.05;
				weightsMaterial.orthogonalSearchSteps = 32;
				weightsMaterial.diagonalSearchSteps = 16;
				weightsMaterial.cornerRounding = 25;
				weightsMaterial.diagonalDetection = true;
				weightsMaterial.cornerDetection = true;
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

		this.edgeDetectionMaterial.depthBuffer = depthTexture;
		this.edgeDetectionMaterial.depthPacking = depthPacking;

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

		this.edgeDetectionMaterial.setSize(width, height);
		this.weightsMaterial.setSize(width, height);
		this.renderTargetEdges.setSize(width, height);
		this.renderTargetWeights.setSize(width, height);

	}

	/**
	 * Deletes internal render targets and textures.
	 */

	dispose() {

		const { searchTexture, areaTexture } = this.weightsMaterial;

		if(searchTexture !== null && areaTexture !== null) {

			searchTexture.dispose();
			areaTexture.dispose();

		}

		super.dispose();

	}

	/**
	 * The SMAA search image, encoded as a base64 data URL.
	 *
	 * @type {String}
	 * @deprecated
	 */

	static get searchImageDataURL() {

		return searchImageDataURL;

	}

	/**
	 * The SMAA area image, encoded as a base64 data URL.
	 *
	 * @type {String}
	 * @deprecated
	 */

	static get areaImageDataURL() {

		return areaImageDataURL;

	}

}
