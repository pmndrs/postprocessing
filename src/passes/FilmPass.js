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
	 * @param {Object} [options] - The options. See {@link FilmMaterial} for more options.
	 * @param {Number} [options.scanlineDensity=1.25] - The scanline density, relative to the screen height.
	 * @param {Number} [options.gridScale=1.0] - The grid scale, relative to the screen height.
	 * @param {Number} [options.gridLineWidth=0.0] - The grid line width. This value will be added to the base line width.
	 */

	constructor(options = {}) {

		super("FilmPass");

		/**
		 * Film shader material.
		 *
		 * @type {FilmMaterial}
		 * @private
		 */

		this.material = new FilmMaterial(options);

		this.quad.material = this.material;

		/**
		 * The amount of scanlines, relative to the screen height.
		 *
		 * You need to call {@link EffectComposer#setSize} after changing this
		 * value.
		 *
		 * @type {Number}
		 */

		this.scanlineDensity = (options.scanlineDensity === undefined) ? 1.25 : options.scanlineDensity;

		/**
		 * The grid scale, relative to the screen height.
		 *
		 * You need to call {@link EffectComposer#setSize} after changing this
		 * value.
		 *
		 * @type {Number}
		 */

		this.gridScale = (options.gridScale === undefined) ? 1.0 : Math.max(options.gridScale, 1e-6);

		/**
		 * The grid line width.
		 *
		 * You need to call {@link EffectComposer#setSize} after changing this
		 * value.
		 *
		 * @type {Number}
		 */

		this.gridLineWidth = (options.gridLineWidth === undefined) ? 0.0 : Math.max(options.gridLineWidth, 0.0);

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

		const aspect = width / height;
		const gridScale = this.gridScale * (height * 0.125);

		this.material.uniforms.scanlineCount.value = Math.round(height * this.scanlineDensity);
		this.material.uniforms.gridScale.value.set(aspect * gridScale, gridScale);
		this.material.uniforms.gridLineWidth.value = (gridScale / height) + this.gridLineWidth;

	}

}
