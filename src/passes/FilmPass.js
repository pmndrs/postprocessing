import { Vector2 } from "three";
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

		this.setFullscreenMaterial(new FilmMaterial(options));

		/**
		 * The original resolution.
		 *
		 * @type {Vector2}
		 * @private
		 */

		this.resolution = new Vector2();

		/**
		 * The amount of scanlines, relative to the screen height.
		 *
		 * @type {Number}
		 * @private
		 */

		this.scanlineDensity = (options.scanlineDensity === undefined) ? 1.25 : options.scanlineDensity;

		/**
		 * The grid scale, relative to the screen height.
		 *
		 * @type {Number}
		 * @private
		 */

		this.gridScale = (options.gridScale === undefined) ? 1.0 : Math.max(options.gridScale, 1e-6);

		/**
		 * The grid line width.
		 *
		 * @type {Number}
		 * @private
		 */

		this.gridLineWidth = (options.gridLineWidth === undefined) ? 0.0 : Math.max(options.gridLineWidth, 0.0);

	}

	/**
	 * Returns the current scanline density.
	 *
	 * @return {Number} The scanline density.
	 */

	getScanlineDensity() {

		return this.scanlineDensity;

	}

	/**
	 * Sets the scanline density.
	 *
	 * @param {Number} density - The new scanline density.
	 */

	setScanlineDensity(density) {

		this.scanlineDensity = density;
		this.setSize(this.resolution.x, this.resolution.y);

	}

	/**
	 * Returns the current grid scale.
	 *
	 * @return {Number} The grid scale.
	 */

	getGridScale() {

		return this.gridScale;

	}

	/**
	 * Sets the grid scale.
	 *
	 * @param {Number} scale - The new grid scale.
	 */

	setGridScale(scale) {

		this.gridScale = scale;
		this.setSize(this.resolution.x, this.resolution.y);

	}

	/**
	 * Returns the current grid line width.
	 *
	 * @return {Number} The grid line width.
	 */

	getGridLineWidth() {

		return this.gridLineWidth;

	}

	/**
	 * Sets the grid line width.
	 *
	 * @param {Number} lineWidth - The new grid line width.
	 */

	setGridLineWidth(lineWidth) {

		this.gridLineWidth = lineWidth;
		this.setSize(this.resolution.x, this.resolution.y);

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

		const uniforms = this.getFullscreenMaterial().uniforms;

		uniforms.tDiffuse.value = inputBuffer.texture;
		uniforms.time.value += delta;

		renderer.render(this.scene, this.camera, this.renderToScreen ? null : outputBuffer);

	}

	/**
	 * Updates the size of this pass.
	 *
	 * @param {Number} width - The width.
	 * @param {Number} height - The height.
	 */

	setSize(width, height) {

		// Remember the original resolution.
		this.resolution.set(width, height);

		const aspect = width / height;
		const gridScale = this.gridScale * (height * 0.125);

		const uniforms = this.getFullscreenMaterial().uniforms;
		uniforms.scanlineCount.value = Math.round(height * this.scanlineDensity);
		uniforms.gridScale.value.set(aspect * gridScale, gridScale);
		uniforms.gridLineWidth.value = (gridScale / height) + this.gridLineWidth;

	}

}
