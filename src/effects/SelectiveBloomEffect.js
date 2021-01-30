import {
	LinearFilter,
	NotEqualDepth,
	EqualDepth,
	RGBADepthPacking,
	RGBFormat,
	UnsignedByteType,
	WebGLRenderTarget
} from "three";

import { Selection } from "../core/Selection";
import { DepthMaskMaterial } from "../materials";
import { ClearPass, DepthPass, ShaderPass } from "../passes";
import { BloomEffect } from "./BloomEffect";
import { EffectAttribute } from "./Effect";

/**
 * A selective bloom effect.
 *
 * This effect applies bloom to selected objects only.
 *
 * Attention: If you don't need to limit bloom to a subset of objects, consider
 * using the {@link BloomEffect} instead for better performance.
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

		/**
		 * A depth mask pass.
		 *
		 * @type {ShaderPass}
		 * @private
		 */

		this.depthMaskPass = new ShaderPass(new DepthMaskMaterial());

		const depthMaskMaterial = this.depthMaskMaterial;
		depthMaskMaterial.uniforms.depthBuffer1.value = this.depthPass.texture;
		depthMaskMaterial.defines.DEPTH_PACKING_1 = RGBADepthPacking.toFixed(0);
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
		 */

		this.selection = new Selection();

	}

	/**
	 * The depth mask material.
	 *
	 * @type {DepthMaskMaterial}
	 * @private
	 */

	get depthMaskMaterial() {

		return this.depthMaskPass.getFullscreenMaterial();

	}

	/**
	 * Indicates whether the selection should be considered inverted.
	 *
	 * @type {Boolean}
	 */

	get inverted() {

		return (this.depthMaskMaterial.getDepthMode() === NotEqualDepth);

	}

	/**
	 * Inverts the selection.
	 *
	 * @type {Boolean}
	 */

	set inverted(value) {

		this.depthMaskMaterial.setDepthMode(value ? NotEqualDepth : EqualDepth);

	}

	/**
	 * Indicates whether the background colors will be discarded.
	 *
	 * @type {Boolean}
	 */

	get ignoreBackground() {

		return !this.depthMaskMaterial.keepFar;

	}

	/**
	 * If enabled, the background colors will be discarded.
	 *
	 * @type {Boolean}
	 */

	set ignoreBackground(value) {

		this.depthMaskMaterial.keepFar = !value;

	}

	/**
	 * Sets the depth texture.
	 *
	 * @param {Texture} depthTexture - A depth texture.
	 * @param {Number} [depthPacking=0] - The depth packing.
	 */

	setDepthTexture(depthTexture, depthPacking = 0) {

		const material = this.depthMaskPass.getFullscreenMaterial();
		material.uniforms.depthBuffer0.value = depthTexture;
		material.defines.DEPTH_PACKING_0 = depthPacking.toFixed(0);
		material.needsUpdate = true;

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
		camera.layers.set(selection.layer);
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

		if(!alpha && frameBufferType === UnsignedByteType) {

			this.renderTargetMasked.texture.format = RGBFormat;

		}

		if(frameBufferType !== undefined) {

			this.renderTargetMasked.texture.type = frameBufferType;

		}

	}

}
