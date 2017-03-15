import { ClearPass } from "./clear.js";
import { Pass } from "./pass.js";

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
		 * A clear pass.
		 *
		 * @property clearPass
		 * @type ClearPass
		 */

		this.clearPass = new ClearPass(options);

		/**
		 * An override material.
		 *
		 * @property overrideMaterial
		 * @type Material
		 * @default null
		 */

		this.overrideMaterial = (options.overrideMaterial !== undefined) ? options.overrideMaterial : null;

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
		const target = this.renderToScreen ? null : readBuffer;

		if(this.clear) {

			this.clearPass.render(renderer, target);

		} else if(this.clearDepth) {

			renderer.setRenderTarget(target);
			renderer.clearDepth();

		}

		scene.overrideMaterial = this.overrideMaterial;
		renderer.render(scene, this.camera, target);
		scene.overrideMaterial = null;

	}

}
