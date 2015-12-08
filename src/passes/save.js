import { CopyMaterial } from "../materials";
import { Pass } from "./pass";
import THREE from "three";

/**
 * A save pass.
 *
 * @class SavePass
 * @constructor
 * @extends Pass
 * @param {Scene} renderTarget - The render target.
 */

export function SavePass(renderTarget) {

	Pass.call(this, new THREE.Scene(), new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1));

	/**
	 * Copy shader material.
	 *
	 * @property material
	 * @type {CopyMaterial}
	 * @private
	 */

	this.material = new CopyMaterial();

	/**
	 * The render target.
	 *
	 * @property renderTarget
	 * @type {WebGLRenderTarget}
	 */

	this.renderTarget = renderTarget;

	if(this.renderTarget === undefined) {

		this.renderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
			minFilter: THREE.LinearFilter,
			magFilter: THREE.LinearFilter,
			format: THREE.RGBFormat,
			stencilBuffer: false
		});

	}

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
