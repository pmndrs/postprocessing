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

	Pass.call(this, new THREE.Scene(), new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1));

	/**
	 * Copy shader material.
	 *
	 * @property material
	 * @type {CopyMaterial}
	 * @private
	 */

	this.material = new CopyMaterial();
	this.material.uniforms.tDiffuse.value = texture;
	this.material.uniforms.opacity.value = (opacity !== undefined) ? opacity : 1.0;

	/**
	 * The quad mesh to render.
	 *
	 * @property quad
	 * @type {Mesh}
	 */

	this.quad = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), null);
	this.scene.add(this.quad);

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

	this.quad.material = this.material;
	renderer.render(this.scene, this.camera, readBuffer);

};
