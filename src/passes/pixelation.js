import { PixelationMaterial } from "../materials";
import { Pass } from "./pass.js";

/**
 * A pixelation pass.
 *
 * @class PixelationPass
 * @submodule passes
 * @extends Pass
 * @constructor
 * @param {Number} [intensity=30.0] - The intensity of the effect.
 */

export class PixelationPass extends Pass {

	constructor(intensity = 30.0) {

		super();

		this.name = "PixellationPass";
		this.needsSwap = true;

		/**
		 * A pixelation shader material.
		 *
		 * @property pixelationMaterial
		 * @type PixelationMaterial
		 * @private
		 */

		this.pixelationMaterial = new PixelationMaterial();

		this.intensity = intensity;

		this.quad.material = this.pixelationMaterial;

	}

	/**
	 * The intensity of the effect.
	 *
	 * @property intensity
	 * @type Number
	 * @default 1.0
	 */

	get intensity() { return this.pixelationMaterial.uniforms.intensity.value; }

	set intensity(x) {

		if(typeof x === "number") {

			this.pixelationMaterial.uniforms.intensity.value = x;

		}

	}

	/**
	 * Renders the effect.
	 *
	 * @method render
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {WebGLRenderTarget} readBuffer - The read buffer.
	 * @param {WebGLRenderTarget} writeBuffer - The write buffer.
	 */

	render(renderer, readBuffer, writeBuffer) {

		this.pixelationMaterial.uniforms.tDiffuse.value = readBuffer.texture;

		renderer.render(this.scene, this.camera, this.renderToScreen ? null : writeBuffer);

	}

	/**
	 * Updates this pass with the renderer's size.
	 *
	 * @method setSize
	 * @param {Number} width - The width.
	 * @param {Number} height - The height.
	 */

	setSize(width, height) {

		this.pixelationMaterial.uniforms.resolution.value.set(width, height);

	}

}
