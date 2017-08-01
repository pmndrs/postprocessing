import { DepthMaterial } from "../materials";
import { Pass } from "./Pass.js";

/**
 * A depth pass.
 *
 * Reads the depth from a depth texture and renders it.
 *
 * This pass requires a {@link EffectComposer#depthTexture}.
 */

export class DepthPass extends Pass {

	/**
	 * Constructs a new depth pass.
	 *
	 * @param {PerspectiveCamera} camera - The main camera. Used to obtain the near and far plane settings.
	 */

	constructor(camera) {

		super();

		/**
		 * The name of this pass.
		 */

		this.name = "DepthPass";

		/**
		 * This pass renders to the write buffer.
		 */

		this.needsSwap = true;

		/**
		 * A depth shader material.
		 *
		 * @type {DepthMaterial}
		 * @private
		 */

		this.depthMaterial = new DepthMaterial(camera);

		this.quad.material = this.depthMaterial;

	}

	/**
	 * Renders the effect.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {WebGLRenderTarget} readBuffer - The read buffer.
	 * @param {WebGLRenderTarget} writeBuffer - The write buffer.
	 */

	render(renderer, readBuffer, writeBuffer) {

		this.depthMaterial.uniforms.tDepth.value = readBuffer.depthTexture;

		renderer.render(this.scene, this.camera, this.renderToScreen ? null : writeBuffer);

	}

}
