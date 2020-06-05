import { OverrideMaterialManager } from "../core/OverrideMaterialManager.js";
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
	 * @param {Material} [overrideMaterial=null] - An override material.
	 */

	constructor(scene, camera, overrideMaterial = null) {

		super("RenderPass", scene, camera);

		this.needsSwap = false;

		/**
		 * A clear pass.
		 *
		 * @type {ClearPass}
		 * @private
		 */

		this.clearPass = new ClearPass();

		/**
		 * A depth texture.
		 *
		 * @type {DepthTexture}
		 * @private
		 */

		this.depthTexture = null;

		/**
		 * An override material manager.
		 *
		 * @type {OverrideMaterialManager}
		 * @private
		 */

		this.overrideMaterialManager = (overrideMaterial === null) ? null :
			new OverrideMaterialManager(overrideMaterial);

	}

	/**
	 * Indicates whether this pass should render to screen.
	 *
	 * @type {Boolean}
	 */

	get renderToScreen() {

		return super.renderToScreen;

	}

	/**
	 * Sets the render to screen flag.
	 *
	 * @type {Boolean}
	 */

	set renderToScreen(value) {

		super.renderToScreen = value;
		this.clearPass.renderToScreen = value;

	}

	/**
	 * The current override material.
	 *
	 * @type {Material}
	 */

	get overrideMaterial() {

		const manager = this.overrideMaterialManager;

		return (manager !== null) ? manager.material : null;

	}

	/**
	 * Sets the override material.
	 *
	 * @type {Material}
	 */

	set overrideMaterial(value) {

		const manager = this.overrideMaterialManager;

		if(value !== null && manager !== null) {

			manager.setMaterial(value);

		} else if(value === null) {

			manager.dispose();
			this.overrideMaterialManager = null;

		} else {

			this.overrideMaterialManager = new OverrideMaterialManager(value);

		}

	}

	/**
	 * Indicates whether the target buffer should be cleared before rendering.
	 *
	 * @type {Boolean}
	 */

	get clear() {

		return this.clearPass.enabled;

	}

	/**
	 * Enables or disables auto clear.
	 *
	 * @type {Boolean}
	 */

	set clear(value) {

		this.clearPass.enabled = value;

	}

	/**
	 * Returns the clear pass.
	 *
	 * @return {ClearPass} The clear pass.
	 */

	getClearPass() {

		return this.clearPass;

	}

	/**
	 * Returns the current depth texture.
	 *
	 * @return {Texture} The current depth texture, or null if there is none.
	 */

	getDepthTexture() {

		return this.depthTexture;

	}

	/**
	 * Sets the depth texture.
	 *
	 * The provided texture will be attached to the input buffer unless this pass
	 * renders to screen.
	 *
	 * @param {DepthTexture} depthTexture - A depth texture.
	 * @param {Number} [depthPacking=0] - The depth packing.
	 */

	setDepthTexture(depthTexture, depthPacking = 0) {

		this.depthTexture = depthTexture;

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
		const camera = this.camera;
		const renderTarget = this.renderToScreen ? null : inputBuffer;

		if(this.depthTexture !== null && !this.renderToScreen) {

			inputBuffer.depthTexture = this.depthTexture;
			outputBuffer.depthTexture = null;

		}

		if(this.clear) {

			this.clearPass.render(renderer, inputBuffer);

		}

		renderer.setRenderTarget(renderTarget);

		if(this.overrideMaterialManager !== null) {

			this.overrideMaterialManager.render(renderer, scene, camera);

		} else {

			renderer.render(scene, camera);

		}

	}

}
