import { Pass } from "./pass";
import THREE from "three";

/**
 * A shader pass.
 *
 * Used to render any shader material as a 2D filter.
 *
 * @class ShaderPass
 * @constructor
 * @extends Pass
 * @param {ShaderMaterial} material - The shader material to use.
 * @param {String} [textureID="tDiffuse"] - The texture uniform identifier.
 */

export function ShaderPass(material, textureID) {

	Pass.call(this);

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

	// Swap read and write buffer when done.
	this.needsSwap = true;

	// Set the material of the rendering quad.
	this.quad.material = this.material;

}

ShaderPass.prototype = Object.create(Pass.prototype);
ShaderPass.prototype.constructor = ShaderPass;

/**
 * Renders the scene.
 *
 * @method render
 * @param {WebGLRenderer} renderer - The renderer to use.
 * @param {WebGLRenderTarget} writeBuffer - The write buffer.
 * @param {WebGLRenderTarget} readBuffer - The read buffer.
 */

ShaderPass.prototype.render = function(renderer, writeBuffer, readBuffer) {

	if(this.material.uniforms[this.textureID] !== undefined) {

		this.material.uniforms[this.textureID].value = readBuffer;

	}

	if(this.renderToScreen) {

		renderer.render(this.scene, this.camera);

	} else {

		renderer.render(this.scene, this.camera, writeBuffer, this.clear);

	}

};
