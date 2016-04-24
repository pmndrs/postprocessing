import { Pass } from "./pass";
import THREE from "three";

/**
 * Used for saving the original clear color during rendering.
 *
 * @property clearColor
 * @type Color
 * @private
 * @static
 */

const clearColor = new THREE.Color();

/**
 * A pass that renders a given scene directly on screen
 * or into the read buffer for further processing.
 *
 * In addition to that, this pass can also render a depth 
 * texture which may be used by other passes.
 *
 * @class RenderPass
 * @submodule passes
 * @extends Pass
 * @constructor
 * @param {Scene} scene - The scene to render.
 * @param {Camera} camera - The camera to use to render the scene.
 * @param {Object} [options] - Additional options.
 * @param {Material} [options.overrideMaterial] - An override material for the scene.
 * @param {Color} [options.clearColor] - An override clear color.
 * @param {Number} [options.clearAlpha] - An override clear alpha.
 */

export class RenderPass extends Pass {

	constructor(scene, camera, options) {

		super(scene, camera, null);

		if(options === undefined) { options = {}; }

		/**
		 * Override material.
		 *
		 * @property overrideMaterial
		 * @type Material
		 */

		this.overrideMaterial = (options.overrideMaterial !== undefined) ? options.overrideMaterial : null;

		/**
		 * Clear color.
		 *
		 * @property clearColor
		 * @type Color
		 */

		this.clearColor = (options.clearColor !== undefined) ? options.clearColor : null;

		/**
		 * Clear alpha.
		 *
		 * @property clearAlpha
		 * @type Number
		 */

		this.clearAlpha = (options.clearAlpha === undefined) ? 1.0 : THREE.Math.clamp(options.clearAlpha, 0.0, 1.0);

		/**
		 * Clear flag.
		 *
		 * @property clear
		 * @type Boolean
		 * @default true
		 */

		this.clear = true;

	}

	/**
	 * Renders the scene.
	 *
	 * @method render
	 * @param {WebGLRenderer} renderer - The renderer to use.
	 * @param {WebGLRenderTarget} readBuffer - The read buffer.
	 */

	render(renderer, readBuffer) {

		let clearAlpha;
		let ctx = renderer.context;

		ctx.depthMask(true);

		this.scene.overrideMaterial = this.overrideMaterial;

		if(this.clearColor !== null) {

			clearColor.copy(renderer.getClearColor());
			clearAlpha = renderer.getClearAlpha();
			renderer.setClearColor(this.clearColor, this.clearAlpha);

		}

		if(this.renderToScreen) {

			renderer.render(this.scene, this.camera, null, this.clear);

		} else {

			renderer.render(this.scene, this.camera, readBuffer, this.clear);

		}

		if(this.clearColor !== null) {

			renderer.setClearColor(clearColor, clearAlpha);

		}

		this.scene.overrideMaterial = null;

		ctx.depthMask(false);

	}

}
