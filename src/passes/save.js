import { CopyMaterial } from "../materials";
import { Pass } from "./pass";
import THREE from "three";

/**
 * A save pass that renders the result from a previous 
 * pass (readBuffer) to an arbitrary render target.
 *
 * @class SavePass
 * @constructor
 * @extends Pass
 * @param {Scene} [renderTarget] - The render target to use for saving the read buffer.
 * @param {Boolean} [resize] - Whether the render target should adjust to the size of the read/write buffer.
 */

export function SavePass(renderTarget, resize) {

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

	/**
	 * Indicates whether the render target should be resized when
	 * the size of the composer's read/write buffer changes.
	 *
	 * @property resize
	 * @type Boolean
	 * @default true
	 */

	this.resize = (resize !== undefined) ? resize : true;

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
 * @param {WebGLRenderTarget} buffer - The read/write buffer.
 */

SavePass.prototype.render = function(renderer, buffer) {

	this.material.uniforms.tDiffuse.value = buffer;
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

	if(this.resize) {

		if(width <= 0) { width = 1; }
		if(height <= 0) { height = 1; }

		this.renderTarget.setSize(width, height);

	}

};
