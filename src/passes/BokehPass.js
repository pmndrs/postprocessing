import { BokehMaterial } from "../materials";
import { Pass } from "./Pass.js";

/**
 * A Depth of Field (DoF) pass using a bokeh shader.
 *
 * This pass requires a {@link EffectComposer#depthTexture}.
 */

export class BokehPass extends Pass {

	/**
	 * Constructs a new bokeh pass.
	 *
	 * @param {PerspectiveCamera} camera - The main camera. Used to obtain the aspect ratio and the near and far plane settings.
	 * @param {Object} [options] - Additional parameters.
	 * @param {Number} [options.focus=1.0] - Focus distance.
	 * @param {Number} [options.aperture=0.025] - Camera aperture scale. Bigger values for shallower depth of field.
	 * @param {Number} [options.maxBlur=1.0] - Maximum blur strength.
	 */

	constructor(camera, options = {}) {

		super();

		/**
		 * The name of this pass.
		 */

		this.name = "BokehPass";

		/**
		 * This pass renders to the write buffer.
		 */

		this.needsSwap = true;

		/**
		 * A bokeh shader material.
		 *
		 * @type {BokehMaterial}
		 * @private
		 */

		this.bokehMaterial = new BokehMaterial(camera, options);

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

		this.bokehMaterial.uniforms.aspect.value = width / height;

	}

}
