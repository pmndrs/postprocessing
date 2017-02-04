import { Color } from "three";
import { Pass } from "./pass.js";

/**
 * Used for saving the original clear color during rendering.
 *
 * @property CLEAR_COLOR
 * @type Color
 * @private
 * @static
 */

const CLEAR_COLOR = new Color();

/**
 * A pass that renders a given scene directly on screen or into the read buffer
 * for further processing.
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

	constructor(scene, camera, options = {}) {

		super(scene, camera, null);

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
		 * @default 1.0
		 */

		this.clearAlpha = (options.clearAlpha !== undefined) ? options.clearAlpha : 1.0;

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

		const state = renderer.state;
		const scene = this.scene;
		const clearColor = this.clearColor;

		let clearAlpha;

		state.setDepthWrite(true);

		scene.overrideMaterial = this.overrideMaterial;

		if(clearColor !== null) {

			CLEAR_COLOR.copy(renderer.getClearColor());
			clearAlpha = renderer.getClearAlpha();
			renderer.setClearColor(clearColor, this.clearAlpha);

		}

		if(this.renderToScreen) {

			renderer.render(scene, this.camera, null, this.clear);

		} else {

			renderer.render(scene, this.camera, readBuffer, this.clear);

		}

		if(clearColor !== null) {

			renderer.setClearColor(CLEAR_COLOR, clearAlpha);

		}

		scene.overrideMaterial = null;

		state.setDepthWrite(false);

	}

}
