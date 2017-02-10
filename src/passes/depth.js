import { DepthMaterial } from "../materials";
import { Pass } from "./pass.js";

/**
 * A depth pass.
 *
 * Reads the depth from a depth texture and renders it.
 *
 * This pass requires a depth texture. See
 * {{#crossLink "EffectComposer/depthTexture:attribute"}}{{/crossLink}}.
 *
 * @class DepthPass
 * @submodule passes
 * @extends Pass
 * @constructor
 * @param {PerspectiveCamera} camera - The main camera. Used to obtain the near and far plane settings.
 */

export class DepthPass extends Pass {

	constructor(camera) {

		super();

		/**
		 * A depth shader material.
		 *
		 * @property depthMaterial
		 * @type DepthMaterial
		 * @private
		 */

		this.depthMaterial = new DepthMaterial(camera);

		this.quad.material = this.depthMaterial;

	}

	/**
	 * Renders the effect.
	 *
	 * @method render
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {WebGLRenderTarget} readBuffer - The read buffer.
	 */

	render(renderer, readBuffer) {

		this.depthMaterial.uniforms.tDepth.value = readBuffer.depthTexture;

		renderer.render(this.scene, this.camera, this.renderToScreen ? null : readBuffer, this.clear);

	}

	/**
	 * Checks if the renderer uses logarithmic depth.
	 *
	 * @method initialise
	 * @param {WebGLRenderer} renderer - The renderer.
	 */

	initialise(renderer) {

		if(renderer.capabilities.logarithmicDepthBuffer) {

			this.depthMaterial.defines.USE_LOGDEPTH = "1";

		}

	}

}
