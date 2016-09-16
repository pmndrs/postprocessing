import { Pass } from "./pass.js";

/**
 * A shader pass.
 *
 * Used to render any shader material as a 2D filter.
 *
 * @class ShaderPass
 * @submodule passes
 * @extends Pass
 * @constructor
 * @param {ShaderMaterial} material - The shader material to use.
 * @param {String} [textureID="tDiffuse"] - The texture uniform identifier.
 */

export class ShaderPass extends Pass {

	constructor(material, textureID = "tDiffuse") {

		super();

		this.needsSwap = true;

		/**
		 * The shader material to use for rendering.
		 *
		 * @property material
		 * @type ShaderMaterial
		 */

		this.material = material;

		this.quad.material = this.material;

		/**
		 * The name of the color sampler uniform of the given material.
		 *
		 * @property textureID
		 * @type String
		 * @default "tDiffuse"
		 */

		this.textureID = textureID;

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

		if(this.material.uniforms[this.textureID] !== undefined) {

			this.material.uniforms[this.textureID].value = readBuffer.texture;

		}

		if(this.renderToScreen) {

			renderer.render(this.scene, this.camera);

		} else {

			renderer.render(this.scene, this.camera, writeBuffer, this.clear);

		}

	}

}
