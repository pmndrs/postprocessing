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

	this.disposables.push(this.material);

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

	this.disposables.push(this.renderTarget);

	/**
	 * The quad mesh to use for rendering.
	 *
	 * @property quad
	 * @type Mesh
	 * @private
	 */

	this.quad = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), null);
	this.scene.add(this.quad);

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
	this.quad.material = this.material;

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

	this.renderTarget.setSize(width, height);

	if(this.renderTarget.width <= 0) { this.renderTarget.width = 1; }
	if(this.renderTarget.height <= 0) { this.renderTarget.height = 1; }

};
