import {
	LinearFilter,
	LuminanceFormat,
	RGBAFormat,
	WebGLRenderTarget
} from "three";

import { LuminanceMaterial } from "../materials";
import { Resizer } from "../core/Resizer";
import { Pass } from "./Pass";

/**
 * A pass that renders luminance.
 */

export class LuminancePass extends Pass {

	/**
	 * Constructs a new luminance pass.
	 *
	 * @param {Object} [options] - The options. See {@link LuminanceMaterial} for additional options.
	 * @param {Number} [options.width=Resizer.AUTO_SIZE] - The render width.
	 * @param {Number} [options.height=Resizer.AUTO_SIZE] - The render height.
	 * @param {WebGLRenderTarget} [options.renderTarget] - A custom render target.
	 */

	constructor({
		width = Resizer.AUTO_SIZE,
		height = Resizer.AUTO_SIZE,
		renderTarget,
		luminanceRange,
		colorOutput
	} = {}) {

		super("LuminancePass");

		this.setFullscreenMaterial(new LuminanceMaterial(colorOutput, luminanceRange));
		this.needsSwap = false;

		/**
		 * The luminance render target.
		 *
		 * @type {WebGLRenderTarget}
		 */

		this.renderTarget = renderTarget;

		if(this.renderTarget === undefined) {

			this.renderTarget = new WebGLRenderTarget(1, 1, {
				minFilter: LinearFilter,
				magFilter: LinearFilter,
				format: colorOutput ? RGBAFormat : LuminanceFormat,
				stencilBuffer: false,
				depthBuffer: false
			});

			this.renderTarget.texture.name = "LuminancePass.Target";
			this.renderTarget.texture.generateMipmaps = false;

		}

		/**
		 * The resolution.
		 *
		 * @type {Resizer}
		 */

		this.resolution = new Resizer(this, width, height);

	}

	/**
	 * The luminance texture.
	 *
	 * If `colorOutput` is enabled, the scenes colors will multiplied by their
	 * respective luminance values and stored as RGB. Luminance will be stored
	 * as alpha.
	 *
	 * @type {Texture}
	 */

	get texture() {

		return this.renderTarget.texture;

	}

	/**
	 * Renders the luminance.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
	 * @param {WebGLRenderTarget} outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
	 * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
	 * @param {Boolean} [stencilTest] - Indicates whether a stencil mask is active.
	 */

	render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest) {

		const material = this.getFullscreenMaterial();
		material.uniforms.inputBuffer.value = inputBuffer.texture;
		renderer.setRenderTarget(this.renderToScreen ? null : this.renderTarget);
		renderer.render(this.scene, this.camera);

	}

	/**
	 * Updates the size of this pass.
	 *
	 * @param {Number} width - The width.
	 * @param {Number} height - The height.
	 */

	setSize(width, height) {

		const resolution = this.resolution;
		resolution.base.set(width, height);

		this.renderTarget.setSize(resolution.width, resolution.height);

	}

}
