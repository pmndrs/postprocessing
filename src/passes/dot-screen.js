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
 * @param {Vector2} [tSize=(256.0, 256.0)] - The pattern texture size.
 * @param {Vector2} [center=(0.5, 0.5)] - The center.
 * @param {Number} [angle=1.57] - The angle.
 * @param {Number} [scale=1.0] - The scale.
 */

export function DotScreenPass(options) {

	Pass.call(this);

	/**
	 * Dot screen shader material description.
	 *
	 * @property material
	 * @type DotScreenMaterial
	 * @private
	 */

	this.material = new DotScreenMaterial();
	this.materials.push(this.material);

	if(options !== undefined) {

		if(options.tSize !== undefined) { this.material.uniforms.tSize.value.copy(options.tSize); }
		if(options.center !== undefined) { this.material.uniforms.center.value.copy(options.center); }
		if(options.angle !== undefined) { this.material.uniforms.angle.value = options.angle; }
		if(options.scale !== undefined) { this.material.uniforms.scale.value = options.scale; }

	}

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

	this.quad = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), null);
	this.scene.add(this.quad);

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
	this.material.uniforms.tSize.value.set(readBuffer.width, readBuffer.height);

	this.quad.material = this.material;

	if(this.renderToScreen) {

		renderer.render(this.scene, this.camera);

	} else {

		renderer.render(this.scene, this.camera, writeBuffer, false);

	}

};
