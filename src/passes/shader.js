import { Pass } from "./pass";
import THREE from "three";

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

	constructor(material, textureID) {

		super();

		this.needsSwap = true;

		/**
		 * The name of the color sampler uniform of the given material.
	   * The read buffer will be bound to this.
		 *
		 * @property textureID
		 * @type String
		 * @default "tDiffuse"
		 */

		this.textureID = (textureID !== undefined) ? textureID : "tDiffuse";

		/**
		 * The shader material to use for rendering.
		 *
		 * @property material
		 * @type ShaderMaterial
		 */

		this.material = (material !== undefined) ? material : null;

		this.quad.material = this.material;

	}

	/**
	 * Renders the effect.
	 *
	 * @method render
	 * @param {WebGLRenderer} renderer - The renderer to use.
	 * @param {WebGLRenderTarget} buffer - The read/write buffer.
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
