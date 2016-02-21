import { Pass } from "./pass";
import THREE from "three";

/**
 * A pass that renders a given scene directly on screen
 * or into the readBuffer for further processing.
 *
 * @class RenderPass
 * @constructor
 * @extends Pass
 * @param {Scene} scene - The scene to render.
 * @param {Camera} camera - The camera to use to render the scene.
 * @param {Material} [overrideMaterial] - An override material for the scene.
 * @param {Color} [clearColor] - A clear color.
 * @param {Number} [clearAlpha] - A clear alpha value.
 */

export function RenderPass(scene, camera, overrideMaterial, clearColor, clearAlpha) {

	Pass.call(this, scene, camera, null);

	/**
	 * Override material.
	 *
	 * @property overrideMaterial
	 * @type Material
	 */

	this.overrideMaterial = (overrideMaterial !== undefined) ? overrideMaterial : null;

	/**
	 * Clear color.
	 *
	 * @property clearColor
	 * @type Color
	 */

	this.clearColor = (clearColor !== undefined) ? clearColor : null;

	/**
	 * Clear alpha.
	 *
	 * @property clearAlpha
	 * @type Number
	 */

	this.clearAlpha = (clearAlpha === undefined) ? 1.0 : THREE.Math.clamp(clearAlpha, 0.0, 1.0);

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
 * Used for saving the original clear color during rendering.
 *
 * @property CLEAR_COLOR
 * @type Color
 * @private
 * @static
 */

const CLEAR_COLOR = new THREE.Color();

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

	let clearAlpha;

	this.scene.overrideMaterial = this.overrideMaterial;

	if(this.clearColor !== null) {

		CLEAR_COLOR.copy(renderer.getClearColor());
		clearAlpha = renderer.getClearAlpha();
		renderer.setClearColor(this.clearColor, this.clearAlpha);

	}

	if(this.renderToScreen) {

		renderer.render(this.scene, this.camera);

	} else {

		renderer.render(this.scene, this.camera, readBuffer, this.clear);

	}

	if(this.clearColor !== null) {

		renderer.setClearColor(CLEAR_COLOR, clearAlpha);

	}

	this.scene.overrideMaterial = null;

};
