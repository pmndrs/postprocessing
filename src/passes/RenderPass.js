import { ClearPass } from "./ClearPass.js";
import { Pass } from "./Pass.js";

/**
 * A pass that renders a given scene into the input buffer or to screen.
 *
 * This pass uses a {@link ClearPass} to clear the target buffer.
 */

export class RenderPass extends Pass {

	/**
	 * Constructs a new render pass.
	 *
	 * @param {Scene} scene - The scene to render.
	 * @param {Camera} camera - The camera to use to render the scene.
	 * @param {Object} [overrideMaterial=null] - An override material for the scene.
	 */

	constructor(scene, camera, overrideMaterial = null) {

		super("RenderPass", scene, camera);

		this.needsSwap = false;

		/**
		 * An override material.
		 *
		 * @type {Material}
		 */

		this.overrideMaterial = overrideMaterial;

		/**
		 * A clear pass.
		 *
		 * @type {ClearPass}
		 * @private
		 */

		this.clearPass = new ClearPass();


		this.clear = (options.clear !== undefined) ? options.clear : true;

	}

	/**
	 * Renders the scene.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
	 * @param {WebGLRenderTarget} outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
	 * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
	 * @param {Boolean} [stencilTest] - Indicates whether a stencil mask is active.
	 */

	render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest) {

		const scene = this.scene;
		const renderTarget = this.renderToScreen ? null : inputBuffer;
		const overrideMaterial = scene.overrideMaterial;

		if(this.clear) {

			this.clearPass.renderToScreen = this.renderToScreen;
			this.clearPass.render(renderer, inputBuffer);

		}

		scene.overrideMaterial = this.overrideMaterial;
		renderer.setRenderTarget(renderTarget);
		renderer.render(scene, this.camera);
		scene.overrideMaterial = overrideMaterial;

	}

}
