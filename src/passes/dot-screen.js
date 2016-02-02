import { DotScreenMaterial } from "../materials";
import { Pass } from "./pass";
import THREE from "three";

/**
 * A render pass.
 *
 * @class DotScreenPass
 * @constructor
 * @extends Pass
 * @param {Object} [options] - The options.
 * @param {Number} [patternSize=1.0] - The pattern size.
 * @param {Number} [angle=1.57] - The angle of the pattern.
 * @param {Number} [scale=1.0] - The scale of the overall effect.
 */

export function DotScreenPass(options) {

	Pass.call(this);

	if(options === undefined) { options = {}; }

	/**
	 * Dot screen shader material description.
	 *
	 * @property material
	 * @type DotScreenMaterial
	 * @private
	 */

	this.material = new DotScreenMaterial();

	if(options.angle !== undefined) { this.material.uniforms.angle.value = options.angle; }
	if(options.scale !== undefined) { this.material.uniforms.scale.value = options.scale; }

	// Swap read and write buffer when done.
	this.needsSwap = true;

}

DotScreenPass.prototype = Object.create(Pass.prototype);
DotScreenPass.prototype.constructor = DotScreenPass;

/**
 * Renders the scene.
 *
 * @method render
 * @param {WebGLRenderer} renderer - The renderer to use.
 * @param {WebGLRenderTarget} writeBuffer - The write buffer.
 * @param {WebGLRenderTarget} readBuffer - The read buffer.
 * @param {Number} delta - The render delta time.
 */

DotScreenPass.prototype.render = function(renderer, writeBuffer, readBuffer, delta) {

	this.material.uniforms.tDiffuse.value = readBuffer;
	this.quad.material = this.material;

	if(this.renderToScreen) {

		renderer.render(this.scene, this.camera);

	} else {

		renderer.render(this.scene, this.camera, writeBuffer, false);

	}

};

/**
 * Sets the pattern size relative to the render size.
 *
 * @method setSize
 * @param {Number} width - The width.
 * @param {Number} heght - The height.
 */

DotScreenPass.prototype.setSize = function(width, height) {

	if(width <= 0) { width = 1; }
	if(height <= 0) { height = 1; }

	this.material.uniforms.offsetRepeat.value.z = width;
	this.material.uniforms.offsetRepeat.value.w = height;

};
