import {
	FloatType,
	NearestFilter,
	RGBADepthPacking,
	UnsignedByteType,
	WebGLRenderTarget
} from "three";

import { DepthCopyMaterial } from "../materials";
import { Pass } from "./Pass";

/**
 * A pass that copies depth into a render target.
 */

export class DepthSavePass extends Pass {

	/**
	 * Constructs a new depth save pass.
	 *
	 * @param {Object} [options] - The options.
	 * @param {Number} [options.depthPacking=RGBADepthPacking] - The output depth packing.
	 */

	constructor({ depthPacking = RGBADepthPacking } = {}) {

		super("DepthSavePass");

		const material = new DepthCopyMaterial();
		material.setOutputDepthPacking(depthPacking);
		this.setFullscreenMaterial(material);
		this.needsDepthTexture = true;
		this.needsSwap = false;

		/**
		 * The render target.
		 *
		 * @type {WebGLRenderTarget}
		 */

		this.renderTarget = new WebGLRenderTarget(1, 1, {
			type: (depthPacking === RGBADepthPacking) ? UnsignedByteType : FloatType,
			minFilter: NearestFilter,
			magFilter: NearestFilter,
			stencilBuffer: false,
			depthBuffer: false
		});

		this.renderTarget.texture.name = "DepthSavePass.Target";

	}

	/**
	 * The depth texture.
	 *
	 * @type {Texture}
	 */

	get texture() {

		return this.renderTarget.texture;

	}

	/**
	 * The output depth packing.
	 *
	 * @type {Texture}
	 */

	get depthPacking() {

		return this.getFullscreenMaterial().getOutputDepthPacking();

	}

	/**
	 * Sets the depth texture.
	 *
	 * @param {Texture} depthTexture - A depth texture.
	 * @param {Number} [depthPacking=0] - The depth packing.
	 */

	setDepthTexture(depthTexture, depthPacking = 0) {

		const material = this.getFullscreenMaterial();
		material.uniforms.depthBuffer.value = depthTexture;
		material.inputDepthPacking = depthPacking;

	}

	/**
	 * Copies depth from a depth texture.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
	 * @param {WebGLRenderTarget} outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
	 * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
	 * @param {Boolean} [stencilTest] - Indicates whether a stencil mask is active.
	 */

	render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest) {

		renderer.setRenderTarget(this.renderToScreen ? null : this.renderTarget);
		renderer.render(this.scene, this.camera);

	}

	/**
	 * Updates the size of this pass.
	 *
	 * @param {Number} width - The width.
	 * @param {Number} height - The height.
	 */

	setSize(width, height) {

		this.renderTarget.setSize(width, height);

	}

}
