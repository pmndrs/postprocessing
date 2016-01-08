import { Pass } from "./pass";
import THREE from "three";

/**
 * A render pass.
 *
 * @class RenderPass
 * @constructor
 * @extends Pass
 * @param {Scene} scene - The scene to render.
 * @param {Camera} camera - The camera to use to render the scene.
 * @param {Material} overrideMaterial - An override material for the scene.
 * @param {Color} clearColor - A clear color.
 * @param {Number} clearAlpha - A clear alpha value.
 */

export function RenderPass(scene, camera, overrideMaterial, clearColor, clearAlpha) {

	Pass.call(this, scene, camera);

	/**
	 * Override material.
	 *
	 * @property overrideMaterial
	 * @type Material
	 */

	this.overrideMaterial = overrideMaterial;

	/**
	 * Clear color.
	 *
	 * @property clearColor
	 * @type Color
	 */

	this.clearColor = clearColor;

	/**
	 * Clear alpha.
	 *
	 * @property clearAlpha
	 * @type Number
	 */

	this.clearAlpha = (clearAlpha === undefined) ? 1.0 : THREE.Math.clamp(clearAlpha, 0.0, 1.0);

	/**
	 * Old clear color.
	 *
	 * @property oldClearColor
	 * @type Color
	 * @private
	 */

	this.oldClearColor = new THREE.Color();

	/**
	 * Old clear alpha.
	 *
	 * @property oldClearAlpha
	 * @type Number
	 * @private
	 */

	this.oldClearAlpha = 1.0;

	/**
	 * Clear flag.
	 *
	 * @property clear
	 * @type Boolean
	 * @default true
	 */

	this.clear = true;

}

RenderPass.prototype = Object.create(Pass.prototype);
RenderPass.prototype.constructor = RenderPass;

/**
 * Renders the scene.
 *
 * @method render
 * @param {WebGLRenderer} renderer - The renderer to use.
 * @param {WebGLRenderTarget} writeBuffer - The write buffer.
 * @param {WebGLRenderTarget} readBuffer - The read buffer.
 * @param {Number} delta - The render delta time.
 */

RenderPass.prototype.render = function(renderer, writeBuffer, readBuffer, delta) {

	var clear = this.clearColor !== undefined;

	this.scene.overrideMaterial = this.overrideMaterial;

	if(clear) {

		this.oldClearColor.copy(renderer.getClearColor());
		this.oldClearAlpha = renderer.getClearAlpha();

		renderer.setClearColor(this.clearColor, this.clearAlpha);

	}

	renderer.render(this.scene, this.camera, readBuffer, this.clear);

	if(clear) {

		renderer.setClearColor(this.oldClearColor, this.oldClearAlpha);

	}

	this.scene.overrideMaterial = null;

};
