import { FilmMaterial } from "../materials";
import { Pass } from "./Pass.js";

/**
 * A film pass.
 *
 * Provides various cinematic effects.
 */

export class FilmPass extends Pass {

	/**
	 * Constructs a new film pass.
	 *
	 * @param {Object} [options] - The options. See {@link FilmMaterial} for details.
	 */

	constructor(options = {}) {

		super();

		/**
		 * The name of this pass.
		 */

		this.name = "FilmPass";

		/**
		 * This pass renders to the write buffer.
		 */

		this.needsSwap = true;

		/**
		 * Film shader material.
		 *
		 * @type {FilmMaterial}
		 * @private
		 */

		this.material = new FilmMaterial(options);

		this.quad.material = this.material;

		/**
		 * The amount of scanlines in percent, relative to the screen height.
		 *
		 * You need to call {@link EffectComposer#setSize} after changing this
		 * value.
		 *
		 * @type {Number}
		 */

		this.scanlineDensity = (options.scanlineDensity === undefined) ? 1.25 : options.scanlineDensity;

	}

	/**
	 * Renders the effect.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {WebGLRenderTarget} readBuffer - The read buffer.
	 * @param {WebGLRenderTarget} writeBuffer - The write buffer.
	 * @param {Number} delta - The render delta time.
	 */

	render(renderer, readBuffer, writeBuffer, delta) {

		this.material.uniforms.tDiffuse.value = readBuffer.texture;
		this.material.uniforms.time.value += delta;

		renderer.render(this.scene, this.camera, this.renderToScreen ? null : writeBuffer);

	}

	/**
	 * Adjusts the scanline count using the renderer's height.
	 *
	 * @param {Number} width - The width.
	 * @param {Number} height - The height.
	 */

	setSize(width, height) {

		this.material.uniforms.scanlineCount.value = Math.round(height * this.scanlineDensity);

	}

}
