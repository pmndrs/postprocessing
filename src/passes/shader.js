import { Pass } from "./pass";
import THREE from "three";

/**
 * A shader pass.
 *
 * Used to render simple shader materials as 2D filters.
 *
 * @class ShaderPass
 * @constructor
 * @extends Pass
 * @param {ShaderMaterial} material - The shader material to use.
 * @param {String} [textureID=tDiffuse] - The texture uniform identifier.
 */

export function ShaderPass(material, textureID) {

	Pass.call(this);

	/**
	 * The texture id used to set the read buffer render 
	 * texture in the shader.
	 *
	 * @property textureID
	 * @type String
	 * @default tDiffuse
	 */

	this.textureID = (textureID !== undefined) ? textureID : "tDiffuse";

	/**
	 * The shader material to use for rendering.
	 *
	 * @property material
	 * @type ShaderMaterial
	 */

	this.material = (material !== undefined) ? material : null;

	/**
	 * Render to screen flag.
	 *
	 * @property renderToScreen
	 * @type Boolean
	 * @default false
	 */

	this.renderToScreen = false;

	// Swap read and write buffer when done.
	this.needsSwap = true;

	/**
	 * The quad mesh to use for rendering the 2D effect.
	 *
	 * @property quad
	 * @type Mesh
	 * @private
	 */

	this.quad = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), this.material);
	this.scene.add(this.quad);

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
 * @param {Number} delta - The render delta time.
 */

ShaderPass.prototype.render = function(renderer, writeBuffer, readBuffer, delta) {

	if(this.material.uniforms[this.textureID] !== undefined) {

		this.material.uniforms[this.textureID].value = readBuffer;

	}

	if(this.renderToScreen) {

		renderer.render(this.scene, this.camera);

	} else {

		renderer.render(this.scene, this.camera, writeBuffer, this.clear);

	}

};
