import { DepthMaterial } from "../materials";
import { Pass } from "./pass.js";

/**
 * A depth pass.
 *
 * Reads the depth from a depth texture and renders it.
 *
 * This pass requires a
 * {{#crossLink "EffectComposer/depthTexture:property"}}{{/crossLink}}.
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

		this.name = "DepthPass";

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

		renderer.render(this.scene, this.camera, this.renderToScreen ? null : readBuffer);

	}

}
