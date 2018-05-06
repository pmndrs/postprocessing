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

		this.material = new FilmMaterial(options);

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
	 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
	 * @param {WebGLRenderTarget} outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
	 * @param {Number} [delta] - The time between the last frame and the current one in seconds.
	 * @param {Boolean} [stencilTest] - Indicates whether a stencil mask is active.
	 */

	render(renderer, inputBuffer, outputBuffer, delta, stencilTest) {

		this.material.uniforms.tDiffuse.value = inputBuffer.texture;
		this.material.uniforms.time.value += delta;

		renderer.render(this.scene, this.camera, this.renderToScreen ? null : outputBuffer);

	}

	/**
	 * Updates the size of this pass.
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
