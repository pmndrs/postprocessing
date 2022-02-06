import {
	BasicDepthPacking,
	Color,
	LinearFilter,
	NotEqualDepth,
	EqualDepth,
	RGBADepthPacking,
	WebGLRenderTarget
} from "three";

import { Selection } from "../core/Selection";
import { DepthMaskMaterial, DepthTestStrategy } from "../materials";
import { ClearPass, DepthPass, ShaderPass } from "../passes";
import { BloomEffect } from "./BloomEffect";
import { EffectAttribute } from "./Effect";

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
		this.clearPass.setOverrideClearColor(new Color(0x000000));

		/**
		 * A depth mask pass.
		 *
		 * @type {ShaderPass}
		 * @private
		 */

		this.depthMaskPass = new ShaderPass(new DepthMaskMaterial());

		const depthMaskMaterial = this.depthMaskPass.getFullscreenMaterial();
		depthMaskMaterial.setDepthBuffer1(this.depthPass.getTexture(), RGBADepthPacking);
		depthMaskMaterial.setDepthMode(EqualDepth);

		/**
		 * A render target.
		 *
		 * @type {WebGLRenderTarget}
		 * @private
		 */

		this.renderTargetMasked = new WebGLRenderTarget(1, 1, {
			minFilter: LinearFilter,
			magFilter: LinearFilter,
			stencilBuffer: false,
			depthBuffer: false
		});

		this.renderTargetMasked.texture.name = "Bloom.Masked";
		this.renderTargetMasked.texture.generateMipmaps = false;

		/**
		 * A selection of objects.
		 *
		 * @type {Selection}
		 * @deprecated Use getSelection() instead.
		 */

		this.selection = new Selection();
		this.selection.setLayer(11);

	}

	/**
	 * Returns the selection.
	 *
	 * The default layer of this selection is 11.
	 *
	 * @return {Selection} The selection.
	 */

	getSelection() {

		return this.selection;

	}

	/**
	 * Returns the depth mask material.
	 *
	 * @return {DepthMaskMaterial} The material.
	 * @private
	 */

	getDepthMaskMaterial() {

		return this.depthMaskPass.getFullscreenMaterial();

	}

	/**
	 * Indicates whether the selection should be considered inverted.
	 *
	 * @type {Boolean}
	 * @deprecated Use isInverted() instead.
	 */

	get inverted() {

		return this.isInverted;

	}

	/**
	 * Inverts the selection.
	 *
	 * @type {Boolean}
	 * @deprecated Use setInverted() instead.
	 */

	set inverted(value) {

		this.setInverted(value);

	}

	/**
	 * Indicates whether the mask is inverted.
	 *
	 * @return {Boolean} Whether the mask is inverted.
	 */

	isInverted() {

		return (this.getDepthMaskMaterial().getDepthMode() === NotEqualDepth);

	}

	/**
	 * Enables or disable mask inversion.
	 *
	 * @param {Boolean} value - Whether the mask should be inverted.
	 */

	setInverted(value) {

		this.getDepthMaskMaterial().setDepthMode(value ? NotEqualDepth : EqualDepth);

	}

	/**
	 * Indicates whether the background colors will be ignored.
	 *
	 * @type {Boolean}
	 * @deprecated Use isBackgroundDisabled() instead.
	 */

	get ignoreBackground() {

		return this.isBackgroundDisabled();

	}

	/**
	 * @type {Boolean}
	 * @deprecated Use setBackgroundDisabled() instead.
	 */

	set ignoreBackground(value) {

		this.setBackgroundDisabled(value);

	}

	/**
	 * Indicates whether the background is disabled.
	 *
	 * @return {Boolean} Whether the background is disabled.
	 */

	isBackgroundDisabled() {

		const material = this.getDepthMaskMaterial();
		return (material.getMaxDepthStrategy() === DepthTestStrategy.DISCARD_MAX_DEPTH);

	}

	/**
	 * Enables or disables the background.
	 *
	 * @param {Boolean} value - Whether the background should be disabled.
	 */

	setBackgroundDisabled(value) {

		const material = this.getDepthMaskMaterial();
		material.setMaxDepthStrategy(value ? DepthTestStrategy.DISCARD_MAX_DEPTH : DepthTestStrategy.KEEP_MAX_DEPTH);

	}

	/**
	 * Sets the depth texture.
	 *
	 * @param {Texture} depthTexture - A depth texture.
	 * @param {DepthPackingStrategies} [depthPacking=BasicDepthPacking] - The depth packing.
	 */

	setDepthTexture(depthTexture, depthPacking = BasicDepthPacking) {

		this.depthMaskPass.getFullscreenMaterial().setDepthBuffer0(depthTexture, depthPacking);

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
		const renderTarget = this.renderTargetMasked;

		// Render depth of selected objects.
		const mask = camera.layers.mask;
		camera.layers.set(selection.getLayer());
		this.depthPass.render(renderer);
		camera.layers.mask = mask;

		// Discard colors based on depth.
		this.clearPass.render(renderer, renderTarget);
		this.depthMaskPass.render(renderer, inputBuffer, renderTarget);

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

		this.clearPass.setSize(width, height);
		this.depthPass.setSize(width, height);
		this.depthMaskPass.setSize(width, height);

		this.renderTargetMasked.setSize(width, height);

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

		if(frameBufferType !== undefined) {

			this.renderTargetMasked.texture.type = frameBufferType;

		}

	}

}
