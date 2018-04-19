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

		super();

		/**
		 * The name of this pass.
		 */

		this.name = "RealisticBokehPass";

		/**
		 * A bokeh shader material.
		 *
		 * @type {RealisticBokehMaterial}
		 * @private
		 */

		this.bokehMaterial = new RealisticBokehMaterial(camera, options);

		this.quad.material = this.bokehMaterial;

	}

	/**
	 * Renders the effect.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {WebGLRenderTarget} readBuffer - The read buffer.
	 * @param {WebGLRenderTarget} writeBuffer - The write buffer.
	 */

	render(renderer, readBuffer, writeBuffer) {

		this.bokehMaterial.uniforms.tDiffuse.value = readBuffer.texture;
		this.bokehMaterial.uniforms.tDepth.value = readBuffer.depthTexture;

		renderer.render(this.scene, this.camera, this.renderToScreen ? null : writeBuffer);

	}

	/**
	 * Updates this pass with the renderer's size.
	 *
	 * @param {Number} width - The width.
	 * @param {Number} height - The height.
	 */

	setSize(width, height) {

		this.bokehMaterial.setTexelSize(1.0 / width, 1.0 / height);

	}

}
