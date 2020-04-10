import {
	Color,
	LinearFilter,
	MeshBasicMaterial,
	RGBFormat,
	Scene,
	UnsignedByteType,
	WebGLRenderTarget
} from "three";

import { Selection } from "../core";
import { ClearPass, RenderPass } from "../passes";
import { BloomEffect } from "./BloomEffect.js";

/**
 * A selective bloom effect.
 *
 * This effect applies bloom only to selected objects by using layers. Make sure
 * to enable the selection layer for all relevant lights:
 *
 * `lights.forEach((l) => l.layers.enable(bloomEffect.selection.layer));`
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

		/**
		 * The main scene.
		 *
		 * @type {Scene}
		 * @private
		 */

		this.scene = scene;

		/**
		 * The main camera.
		 *
		 * @type {Camera}
		 * @private
		 */

		this.camera = camera;

		/**
		 * A clear pass.
		 *
		 * @type {ClearPass}
		 * @private
		 */

		this.clearPass = new ClearPass(true, true, false);
		this.clearPass.overrideClearColor = new Color(0x000000);

		/**
		 * A render pass.
		 *
		 * @type {RenderPass}
		 * @private
		 */

		this.renderPass = new RenderPass(scene, camera);
		this.renderPass.clear = false;

		/**
		 * A render pass that renders all objects solid black.
		 *
		 * @type {RenderPass}
		 * @private
		 */

		this.blackoutPass = new RenderPass(scene, camera, new MeshBasicMaterial({ color: 0x000000 }));
		this.blackoutPass.clear = false;

		/**
		 * A render pass that only renders the background of the main scene.
		 *
		 * @type {RenderPass}
		 * @private
		 */

		this.backgroundPass = (() => {

			const backgroundScene = new Scene();
			const pass = new RenderPass(backgroundScene, camera);

			backgroundScene.background = scene.background;
			pass.clear = false;

			return pass;

		})();

		/**
		 * A render target.
		 *
		 * @type {WebGLRenderTarget}
		 * @private
		 */

		this.renderTargetSelection = new WebGLRenderTarget(1, 1, {
			minFilter: LinearFilter,
			magFilter: LinearFilter,
			stencilBuffer: false,
			depthBuffer: true
		});

		this.renderTargetSelection.texture.name = "Bloom.Selection";
		this.renderTargetSelection.texture.generateMipmaps = false;

		/**
		 * A selection of objects.
		 *
		 * @type {Selection}
		 */

		this.selection = new Selection();

		/**
		 * Indicates whether the selection should be considered inverted.
		 *
		 * @type {Boolean}
		 */

		this.inverted = false;

	}

	/**
	 * Indicates whether the scene background should be ignored.
	 *
	 * @type {Boolean}
	 */

	get ignoreBackground() {

		return !this.backgroundPass.enabled;

	}

	/**
	 * Enables or disables background rendering.
	 *
	 * @type {Boolean}
	 */

	set ignoreBackground(value) {

		this.backgroundPass.enabled = !value;

	}

	/**
	 * Updates this effect.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
	 * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
	 */

	update(renderer, inputBuffer, deltaTime) {

		const scene = this.scene;
		const camera = this.camera;
		const selection = this.selection;
		const renderTarget = this.renderTargetSelection;

		const background = scene.background;
		const mask = camera.layers.mask;

		this.clearPass.render(renderer, renderTarget);

		if(!this.ignoreBackground) {

			this.backgroundPass.render(renderer, renderTarget);

		}

		scene.background = null;

		if(this.inverted) {

			camera.layers.set(selection.layer);
			this.blackoutPass.render(renderer, renderTarget);
			camera.layers.mask = mask;

			selection.setVisible(false);
			this.renderPass.render(renderer, renderTarget);
			selection.setVisible(true);

		} else {

			selection.setVisible(false);
			this.blackoutPass.render(renderer, renderTarget);
			selection.setVisible(true);

			camera.layers.set(selection.layer);
			this.renderPass.render(renderer, renderTarget);
			camera.layers.mask = mask;

		}

		scene.background = background;
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

		this.backgroundPass.setSize(width, height);
		this.blackoutPass.setSize(width, height);
		this.renderPass.setSize(width, height);

		this.renderTargetSelection.setSize(
			this.resolution.width,
			this.resolution.height
		);

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

		this.backgroundPass.initialize(renderer, alpha, frameBufferType);
		this.blackoutPass.initialize(renderer, alpha, frameBufferType);
		this.renderPass.initialize(renderer, alpha, frameBufferType);

		if(!alpha && frameBufferType === UnsignedByteType) {

			this.renderTargetSelection.texture.format = RGBFormat;

		}

		if(frameBufferType !== undefined) {

			this.renderTargetSelection.texture.type = frameBufferType;

		}

	}

}
