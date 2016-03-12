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
 * @class RenderPass
 * @constructor
 * @extends Pass
 * @param {Scene} scene - The scene to render.
 * @param {Camera} camera - The camera to use to render the scene.
 * @param {Material} [overrideMaterial] - An override material for the scene.
 * @param {Color} [clearColor] - A clear color.
 * @param {Number} [clearAlpha] - A clear alpha value.
 */

export class RenderPass extends Pass {

	constructor(scene, camera, overrideMaterial, clearColor, clearAlpha) {

		super(scene, camera, null);

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

	/**
	 * Renders the scene.
	 *
	 * @method render
	 * @param {WebGLRenderer} renderer - The renderer to use.
	 * @param {WebGLRenderTarget} readBuffer - The read buffer.
	 */

	render(renderer, readBuffer) {

		let clearAlpha;

		this.scene.overrideMaterial = this.overrideMaterial;

		if(this.clearColor !== null) {

			clearColor.copy(renderer.getClearColor());
			clearAlpha = renderer.getClearAlpha();
			renderer.setClearColor(this.clearColor, this.clearAlpha);

		}

		if(this.renderToScreen) {

			renderer.render(this.scene, this.camera);

		} else {

			renderer.render(this.scene, this.camera, readBuffer, this.clear);

		}

		if(this.clearColor !== null) {

			renderer.setClearColor(clearColor, clearAlpha);

		}

		this.scene.overrideMaterial = null;

	}

}
