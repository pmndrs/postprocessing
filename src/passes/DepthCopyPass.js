import {
	BasicDepthPacking,
	FloatType,
	NearestFilter,
	RGBADepthPacking,
	UnsignedByteType,
	WebGLRenderTarget
} from "three";

import { DepthCopyMaterial } from "../materials/DepthCopyMaterial.js";
import { Pass } from "./Pass.js";

/**
 * A pass that copies depth into a render target.
 */

export class DepthCopyPass extends Pass {

	/**
	 * Constructs a new depth save pass.
	 *
	 * @param {Object} [options] - The options.
	 * @param {DepthPackingStrategies} [options.depthPacking=RGBADepthPacking] - The output depth packing.
	 */

	constructor({ depthPacking = RGBADepthPacking } = {}) {

		super("DepthCopyPass");

		const material = new DepthCopyMaterial();
		material.outputDepthPacking = depthPacking;
		this.fullscreenMaterial = material;
		this.needsDepthTexture = true;
		this.needsSwap = false;

		/**
		 * The render target.
		 *
		 * @type {WebGLRenderTarget}
		 * @readonly
		 */

		this.renderTarget = new WebGLRenderTarget(1, 1, {
			type: (depthPacking === RGBADepthPacking) ? UnsignedByteType : FloatType,
			minFilter: NearestFilter,
			magFilter: NearestFilter,
			depthBuffer: false
		});

		this.renderTarget.texture.name = "DepthCopyPass.Target";

	}

	/**
	 * The output depth texture.
	 *
	 * @type {Texture}
	 */

	get texture() {

		return this.renderTarget.texture;

	}

	/**
	 * Returns the output depth texture.
	 *
	 * @deprecated Use texture instead.
	 * @return {Texture} The texture.
	 */

	getTexture() {

		return this.renderTarget.texture;

	}

	/**
	 * The output depth packing.
	 *
	 * @type {DepthPackingStrategies}
	 */

	get depthPacking() {

		return this.fullscreenMaterial.outputDepthPacking;

	}

	/**
	 * Returns the output depth packing.
	 *
	 * @deprecated Use depthPacking instead.
	 * @return {DepthPackingStrategies} The depth packing.
	 */

	getDepthPacking() {

		return this.fullscreenMaterial.outputDepthPacking;

	}

	/**
	 * Sets the depth texture.
	 *
	 * @param {Texture} depthTexture - A depth texture.
	 * @param {DepthPackingStrategies} [depthPacking=BasicDepthPacking] - The depth packing.
	 */

	setDepthTexture(depthTexture, depthPacking = BasicDepthPacking) {

		this.fullscreenMaterial.depthBuffer = depthTexture;
		this.fullscreenMaterial.inputDepthPacking = depthPacking;

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
