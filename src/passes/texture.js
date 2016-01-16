import { CopyMaterial } from "../materials";
import { Pass } from "./pass";
import THREE from "three";

/**
 * A texture pass.
 *
 * @class TexturePass
 * @constructor
 * @extends Pass
 * @param {Texture} texture - The texture.
 * @param {Number} [opacity] - The opacity to apply to the texture.
 */

export function TexturePass(texture, opacity) {

	Pass.call(this);

	/**
	 * Copy shader material.
	 *
	 * @property material
	 * @type CopyMaterial
	 * @private
	 */

	this.material = new CopyMaterial();
	this.material.uniforms.tDiffuse.value = texture;
	this.material.uniforms.opacity.value = (opacity === undefined) ? 1.0 : THREE.Math.clamp(opacity, 0.0, 1.0);

	// Set the material of the rendering quad.
	this.quad.material = this.material;

}

TexturePass.prototype = Object.create(Pass.prototype);
TexturePass.prototype.constructor = TexturePass;

/**
 * Renders the scene.
 *
 * @method render
 * @param {WebGLRenderer} renderer - The renderer to use.
 * @param {WebGLRenderTarget} writeBuffer - The write buffer.
 * @param {WebGLRenderTarget} readBuffer - The read buffer.
 * @param {Number} delta - The render delta time.
 */

TexturePass.prototype.render = function(renderer, writeBuffer, readBuffer, delta) {

	renderer.render(this.scene, this.camera, readBuffer);

};
