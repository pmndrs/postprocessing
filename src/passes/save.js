import { CopyMaterial } from "../materials";
import { Pass } from "./pass";
import THREE from "three";

/**
 * A save pass that renders the result from a previous 
 * pass to an arbitrary render target.
 *
 * @class SavePass
 * @constructor
 * @extends Pass
 * @param {Scene} renderTarget - The render target to use for saving the read buffer.
 */

export function SavePass(renderTarget) {

	Pass.call(this);

	/**
	 * Copy shader material.
	 *
	 * @property material
	 * @type CopyMaterial
	 * @private
	 */

	this.material = new CopyMaterial();

	/**
	 * The render target.
	 *
	 * @property renderTarget
	 * @type WebGLRenderTarget
	 * @private
	 */

	if(renderTarget === undefined) {

		renderTarget = new THREE.WebGLRenderTarget(1, 1, {
			minFilter: THREE.LinearFilter,
			magFilter: THREE.LinearFilter,
			format: THREE.RGBFormat,
			stencilBuffer: false
		});

	}

	this.renderTarget = renderTarget;
	this.renderTarget.texture.generateMipmaps = false;

	// Set the material of the rendering quad.
	this.quad.material = this.material;

}

SavePass.prototype = Object.create(Pass.prototype);
SavePass.prototype.constructor = SavePass;

/**
 * Renders the scene.
 *
 * @method render
 * @param {WebGLRenderer} renderer - The renderer to use.
 * @param {WebGLRenderTarget} writeBuffer - The write buffer.
 * @param {WebGLRenderTarget} readBuffer - The read buffer.
 * @param {Number} delta - The render delta time.
 */

SavePass.prototype.render = function(renderer, writeBuffer, readBuffer, delta) {

	this.material.uniforms.tDiffuse.value = readBuffer;

	renderer.render(this.scene, this.camera, this.renderTarget, this.clear);

};

/**
 * Updates this pass with the main render target's size.
 *
 * @method setSize
 * @param {Number} width - The width.
 * @param {Number} height - The height.
 */

SavePass.prototype.setSize = function(width, height) {

	if(width <= 0) { width = 1; }
	if(height <= 0) { height = 1; }

	this.renderTarget.setSize(width, height);

};
