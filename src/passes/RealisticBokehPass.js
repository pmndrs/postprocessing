import { RealisticBokehMaterial } from "../materials";
import { Pass } from "./Pass.js";

/**
 * An advanced Depth of Field (DoF) pass.
 *
 * Yields more realistic results but is also more demanding.
 *
 * This pass requires a {@link EffectComposer#depthTexture}.
 */

export class RealisticBokehPass extends Pass {

	/**
	 * Constructs a new bokeh pass.
	 *
	 * @param {PerspectiveCamera} camera - The main camera. Used to obtain the focal length and the near and far plane settings.
	 * @param {Object} [options] - Additional parameters. See {@link RealisticBokehMaterial} for details.
	 */

	constructor(camera, options = {}) {

		super("RealisticBokehPass");

		this.material = new RealisticBokehMaterial(camera, options);

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
		this.material.uniforms.tDepth.value = inputBuffer.depthTexture;

		renderer.render(this.scene, this.camera, this.renderToScreen ? null : outputBuffer);

	}

	/**
	 * Updates the size of this pass.
	 *
	 * @param {Number} width - The width.
	 * @param {Number} height - The height.
	 */

	setSize(width, height) {

		this.material.setTexelSize(1.0 / width, 1.0 / height);

	}

}
