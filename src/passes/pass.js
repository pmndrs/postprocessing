import THREE from "three";

/**
 * An abstract render pass.
 *
 * @class Pass
 * @constructor
 * @param {Scene} scene - The scene to render.
 * @param {Camera} camera - The camera to use to render the scene.
 */

export function Pass(scene, camera) {

	/**
	 * The scene to render.
	 *
	 * @property scene
	 * @type {Scene}
	 */

	this.scene = scene;

	/**
	 * The camera to render with.
	 *
	 * @property camera
	 * @type {Camera}
	 */

	this.camera = camera;

	/**
	 * Enabled flag.
	 *
	 * @property enabled
	 * @type {Boolean}
	 * @default true
	 */

	this.enabled = true;

	/**
	 * Clear flag.
	 *
	 * @property clear
	 * @type {Boolean}
	 * @default true
	 */

	this.clear = true;

	/**
	 * Render target swap flag.
	 *
	 * @property needsSwap
	 * @type {Boolean}
	 * @default false
	 */

	this.needsSwap = false;

}

/**
 * Renders the scene.
 * This is an abstract method.
 *
 * @method render
 * @param {WebGLRenderer} renderer - The renderer to use.
 * @param {WebGLRenderTarget} writeBuffer - The write buffer.
 * @param {WebGLRenderTarget} readBuffer - The read buffer.
 * @param {Number} delta - The render delta time.
 */

Pass.prototype.render = function(renderer, writeBuffer, readBuffer, delta) {};
