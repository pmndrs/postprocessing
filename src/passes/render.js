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
 * @param {Material} [options.overrideMaterial=null] - An override material for the scene.
 * @param {Color} [options.clearColor=null] - An override clear color.
 * @param {Number} [options.clearAlpha=1.0] - An override clear alpha.
 * @param {Boolean} [options.clearDepth=false] - Whether depth should be cleared explicitly.
 * @param {Boolean} [options.clear=true] - Whether all buffers should be cleared.
 */

export class RenderPass extends Pass {

	constructor(scene, camera, options = {}) {

		super(scene, camera, null);

		this.name = "RenderPass";

		/**
		 * Override material.
		 *
		 * @property overrideMaterial
		 * @type Material
		 * @default null
		 */

		this.overrideMaterial = (options.overrideMaterial !== undefined) ? options.overrideMaterial : null;

		/**
		 * Clear color.
		 *
		 * @property clearColor
		 * @type Color
		 * @default null
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
		 * Indicates whether the depth buffer should be cleared explicitly.
		 *
		 * @property clearDepth
		 * @type Boolean
		 * @default false
		 */

		this.clearDepth = (options.clearDepth !== undefined) ? options.clearDepth : false;

		/**
		 * Indicates whether the color, depth and stencil buffers should be cleared.
		 *
		 * Even with clear set to true you can prevent specific buffers from being
		 * cleared by setting either the autoClearColor, autoClearStencil or
		 * autoClearDepth properties of the renderer to false.
		 *
		 * @property clear
		 * @type Boolean
		 * @default true
		 */

		this.clear = (options.clear !== undefined) ? options.clear : true;

	}

	/**
	 * Renders the scene.
	 *
	 * @method render
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {WebGLRenderTarget} readBuffer - The read buffer.
	 */

	render(renderer, readBuffer) {

		const scene = this.scene;
		const clearColor = this.clearColor;

		let clearAlpha;

		scene.overrideMaterial = this.overrideMaterial;

		if(clearColor !== null) {

			CLEAR_COLOR.copy(renderer.getClearColor());
			clearAlpha = renderer.getClearAlpha();
			renderer.setClearColor(clearColor, this.clearAlpha);

		}

		if(this.clearDepth) {

			renderer.clearDepth();

		}

		renderer.render(scene, this.camera, this.renderToScreen ? null : readBuffer, this.clear);

		if(clearColor !== null) {

			renderer.setClearColor(CLEAR_COLOR, clearAlpha);

		}

		scene.overrideMaterial = null;

	}

}
