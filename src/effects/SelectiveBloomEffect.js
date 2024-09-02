import {
	BasicDepthPacking,
	Color,
	NotEqualDepth,
	EqualDepth,
	RGBADepthPacking,
	SRGBColorSpace,
	WebGLRenderTarget
} from "three";

import { Selection } from "../core/Selection.js";
import { DepthTestStrategy } from "../enums/DepthTestStrategy.js";
import { EffectAttribute } from "../enums/EffectAttribute.js";
import { DepthMaskMaterial } from "../materials/DepthMaskMaterial.js";
import { ClearPass } from "../passes/ClearPass.js";
import { DepthPass } from "../passes/DepthPass.js";
import { ShaderPass } from "../passes/ShaderPass.js";
import { BloomEffect } from "./BloomEffect.js";

/**
 * A selective bloom effect.
 *
 * This effect applies bloom to selected objects only.
 */

export class SelectiveBloomEffect extends BloomEffect {

	/**
	 * Constructs a new selective bloom effect.
	 *
	 * @param {Scene} scene - The main scene.
	 * @param {Camera} camera - The main camera.
	 * @param {Object} [options] - The options. See {@link BloomEffect} for details.
	 */

	constructor(scene, camera, options) {

		super(options);

		this.setAttributes(this.getAttributes() | EffectAttribute.DEPTH);

		/**
		 * The main camera.
		 *
		 * @type {Camera}
		 * @private
		 */

		this.camera = camera;

		/**
		 * A depth pass.
		 *
		 * @type {DepthPass}
		 * @private
		 */

		this.depthPass = new DepthPass(scene, camera);

		/**
		 * A clear pass.
		 *
		 * @type {ClearPass}
		 * @private
		 */

		this.clearPass = new ClearPass(true, false, false);
		this.clearPass.overrideClearColor = new Color(0x000000);

		/**
		 * A depth mask pass.
		 *
		 * @type {ShaderPass}
		 * @private
		 */

		this.depthMaskPass = new ShaderPass(new DepthMaskMaterial());

		const depthMaskMaterial = this.depthMaskMaterial;
		depthMaskMaterial.copyCameraSettings(camera);
		depthMaskMaterial.depthBuffer1 = this.depthPass.texture;
		depthMaskMaterial.depthPacking1 = RGBADepthPacking;
		depthMaskMaterial.depthMode = EqualDepth;

		/**
		 * A render target.
		 *
		 * @type {WebGLRenderTarget}
		 * @private
		 */

		this.renderTargetMasked = new WebGLRenderTarget(1, 1, { depthBuffer: false });
		this.renderTargetMasked.texture.name = "Bloom.Masked";

		/**
		 * A selection of objects.
		 *
		 * @type {Selection}
		 * @readonly
		 */

		this.selection = new Selection();

		/**
		 * Backing data for {@link inverted}.
		 *
		 * @type {Boolean}
		 * @private
		 */

		this._inverted = false;

		/**
		 * Backing data for {@link ignoreBackground}.
		 *
		 * @type {Boolean}
		 * @private
		 */

		this._ignoreBackground = false;

	}

	set mainScene(value) {

		this.depthPass.mainScene = value;

	}

	set mainCamera(value) {

		this.camera = value;
		this.depthPass.mainCamera = value;
		this.depthMaskMaterial.copyCameraSettings(value);

	}

	/**
	 * Returns the selection.
	 *
	 * @deprecated Use selection instead.
	 * @return {Selection} The selection.
	 */

	getSelection() {

		return this.selection;

	}

	/**
	 * The depth mask material.
	 *
	 * @type {DepthMaskMaterial}
	 * @private
	 */

	get depthMaskMaterial() {

		return this.depthMaskPass.fullscreenMaterial;

	}

	/**
	 * Indicates whether the selection should be considered inverted.
	 *
	 * @type {Boolean}
	 */

	get inverted() {

		return this._inverted;

	}

	set inverted(value) {

		this._inverted = value;
		this.depthMaskMaterial.depthMode = value ? NotEqualDepth : EqualDepth;

	}

	/**
	 * Indicates whether the mask is inverted.
	 *
	 * @deprecated Use inverted instead.
	 * @return {Boolean} Whether the mask is inverted.
	 */

	isInverted() {

		return this.inverted;

	}

	/**
	 * Enables or disable mask inversion.
	 *
	 * @deprecated Use inverted instead.
	 * @param {Boolean} value - Whether the mask should be inverted.
	 */

	setInverted(value) {

		this.inverted = value;

	}

	/**
	 * Indicates whether the background colors will be ignored.
	 *
	 * @type {Boolean}
	 */

	get ignoreBackground() {

		return this._ignoreBackground;

	}

	set ignoreBackground(value) {

		this._ignoreBackground = value;
		this.depthMaskMaterial.maxDepthStrategy = value ?
			DepthTestStrategy.DISCARD_MAX_DEPTH :
			DepthTestStrategy.KEEP_MAX_DEPTH;

	}

	/**
	 * Indicates whether the background is disabled.
	 *
	 * @deprecated Use ignoreBackground instead.
	 * @return {Boolean} Whether the background is disabled.
	 */

	isBackgroundDisabled() {

		return this.ignoreBackground;

	}

	/**
	 * Enables or disables the background.
	 *
	 * @deprecated Use ignoreBackground instead.
	 * @param {Boolean} value - Whether the background should be disabled.
	 */

	setBackgroundDisabled(value) {

		this.ignoreBackground = value;

	}

	/**
	 * Sets the depth texture.
	 *
	 * @param {Texture} depthTexture - A depth texture.
	 * @param {DepthPackingStrategies} [depthPacking=BasicDepthPacking] - The depth packing.
	 */

	setDepthTexture(depthTexture, depthPacking = BasicDepthPacking) {

		this.depthMaskMaterial.depthBuffer0 = depthTexture;
		this.depthMaskMaterial.depthPacking0 = depthPacking;

	}

	/**
	 * Updates this effect.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
	 * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
	 */

	update(renderer, inputBuffer, deltaTime) {

		const camera = this.camera;
		const selection = this.selection;
		const inverted = this.inverted;
		let renderTarget = inputBuffer;

		if(this.ignoreBackground || !inverted || selection.size > 0) {

			// Render depth of selected objects.
			const mask = camera.layers.mask;
			camera.layers.set(selection.layer);
			this.depthPass.render(renderer);
			camera.layers.mask = mask;

			// Discard colors based on depth.
			renderTarget = this.renderTargetMasked;
			this.clearPass.render(renderer, renderTarget);
			this.depthMaskPass.render(renderer, inputBuffer, renderTarget);

		}

		// Render the bloom texture as usual.
		super.update(renderer, renderTarget, deltaTime);

	}

	/**
	 * Updates the size of internal render targets.
	 *
	 * @param {Number} width - The width.
	 * @param {Number} height - The height.
	 */

	setSize(width, height) {

		super.setSize(width, height);
		this.renderTargetMasked.setSize(width, height);
		this.depthPass.setSize(width, height);

	}

	/**
	 * Performs initialization tasks.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {Boolean} alpha - Whether the renderer uses the alpha channel.
	 * @param {Number} frameBufferType - The type of the main frame buffers.
	 */

	initialize(renderer, alpha, frameBufferType) {

		super.initialize(renderer, alpha, frameBufferType);

		this.clearPass.initialize(renderer, alpha, frameBufferType);
		this.depthPass.initialize(renderer, alpha, frameBufferType);
		this.depthMaskPass.initialize(renderer, alpha, frameBufferType);

		if(renderer !== null && renderer.capabilities.logarithmicDepthBuffer) {

			this.depthMaskPass.fullscreenMaterial.defines.LOG_DEPTH = "1";

		}

		if(frameBufferType !== undefined) {

			this.renderTargetMasked.texture.type = frameBufferType;

			if(renderer !== null && renderer.outputColorSpace === SRGBColorSpace) {

				this.renderTargetMasked.texture.colorSpace = SRGBColorSpace;

			}

		}

	}

}
