import { Pass } from "./pass";
import THREE from "three";

/**
 * A shader pass.
 *
 * @class ShaderPass
 * @constructor
 * @extends Pass
 * @param {Scene} renderTarget - The render target.
 */

export function ShaderPass(shader, textureID) {

	Pass.call(this, new THREE.Scene(), new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1));

	/**
	 * The texture id used to set the read buffer render 
	 * texture in the shader.
	 *
	 * @property textureID
	 * @type {String}
	 * @default "tDiffuse"
	 */

	this.textureID = (textureID !== undefined) ? textureID : "tDiffuse";

	/**
	 * The shader to use for rendering.
	 *
	 * @property shader
	 * @type {ShaderMaterial}
	 */

	this.shader = shader;

	/**
	 * Render to screen flag.
	 *
	 * @property renderToScreen
	 * @type {Boolean}
	 */

	this.renderToScreen = false;

	// Request swapping.
	this.needsSwap = true;

	// Don't clear in this pass.
	this.clear = false;

	/**
	 * The quad mesh to render.
	 *
	 * @property quad
	 * @type {Mesh}
	 */

	this.quad = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), null);
	this.scene.add(this.quad);

}

/**
 * Renders the scene.
 *
 * @method render
 * @param {WebGLRenderer} renderer - The renderer to use.
 * @param {WebGLRenderTarget} writeBuffer - The write buffer.
 * @param {WebGLRenderTarget} readBuffer - The read buffer.
 * @param {Number} delta - The render delta time.
 */

ShaderPass.prototype.render = function(renderer, writeBuffer, readBuffer, delta) {

	if(this.shader.material.uniforms[this.textureID] !== undefined) {

		this.shader.material.uniforms[this.textureID].value = readBuffer;

	}

	this.quad.material = this.shader.material;

	if (this.renderToScreen) {

		renderer.render(this.scene, this.camera);

	} else {

		renderer.render(this.scene, this.camera, writeBuffer, this.clear);

	}

};
