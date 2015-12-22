import THREE from "three";

/**
 * An abstract render pass.
 *
 * @class Pass
 * @constructor
 * @param {Scene} [scene] - The scene to render.
 * @param {Camera} [camera] - The camera will be added to the given scene if it has no parent.
 */

export function Pass(scene, camera) {

	/**
	 * The scene to render.
	 *
	 * @property scene
	 * @type Scene
	 * @private
	 * @default Scene()
	 */

	this.scene = (scene !== undefined) ? scene : new THREE.Scene();

	/**
	 * The camera to render with.
	 *
	 * @property camera
	 * @type Camera
	 * @private
	 * @default OrthographicCamera(-1, 1, 1, -1, 0, 1)
	 */

	this.camera = (camera !== undefined) ? camera : new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

	if(this.camera.parent === null) { this.scene.add(this.camera); }

	/**
	 * Enabled flag.
	 *
	 * @property enabled
	 * @type Boolean
	 * @default true
	 */

	this.enabled = true;

	/**
	 * Render target swap flag.
	 *
	 * @property needsSwap
	 * @type Boolean
	 * @default false
	 */

	this.needsSwap = false;

}

/**
 * Renders the scene.
 *
 * This is an abstract method that must be overriden.
 *
 * @method render
 * @throws {Error} An error is thrown if the method is not overridden.
 * @param {WebGLRenderer} renderer - The renderer to use.
 * @param {WebGLRenderTarget} writeBuffer - The write buffer.
 * @param {WebGLRenderTarget} readBuffer - The read buffer.
 * @param {Number} delta - The render delta time.
 */

Pass.prototype.render = function(renderer, writeBuffer, readBuffer, delta) {

	throw new Error("Render method not implemented!");

};

/**
 * Updates this pass with the main render target's size.
 *
 * This is an abstract method that may be overriden in case 
 * you want to be informed about the main render size.
 *
 * The effect composer calls this method when the pass is added 
 * and when the effect composer is reset.
 *
 * @method setSize
 * @param {Number} width - The width.
 * @param {Number} height - The height.
 * @example
 *  this.myRenderTarget.width = width / 2;
 */

Pass.prototype.setSize = function(width, height) {};
