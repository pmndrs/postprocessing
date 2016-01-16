import { Pass } from "./pass";
import THREE from "three";

/**
 * A pass that renders a given scene directly on screen
 * or into the read buffer for further processing.
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

	/**
	 * Render to screen flag.
	 *
	 * @property renderToScreen
	 * @type Boolean
	 * @default false
	 */

	this.renderToScreen = false;

}

RenderPass.prototype = Object.create(Pass.prototype);
RenderPass.prototype.constructor = RenderPass;

/**
 * Used for saving the original clear color during rendering.
 *
 * @property clearColor
 * @type Color
 * @private
 * @static
 */

var clearColor = new THREE.Color();

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
	var clearAlpha;

	this.scene.overrideMaterial = this.overrideMaterial;

	if(clear) {

		clearColor.copy(renderer.getClearColor());
		clearAlpha = renderer.getClearAlpha();

		renderer.setClearColor(this.clearColor, this.clearAlpha);

	}

	if(this.renderToScreen) {

		renderer.render(this.scene, this.camera);

	} else {

		renderer.render(this.scene, this.camera, readBuffer, this.clear);

	}

	if(clear) {

		renderer.setClearColor(clearColor, clearAlpha);

	}

	this.scene.overrideMaterial = null;

};
