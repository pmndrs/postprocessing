import {
	Color,
	MeshDepthMaterial,
	NearestFilter,
	RGBADepthPacking,
	WebGLRenderTarget
} from "three";

import { Resizer } from "../core/Resizer.js";
import { Pass } from "./Pass.js";
import { RenderPass } from "./RenderPass.js";

/**
 * A pass that renders the depth of a given scene into a color buffer.
 */

export class DepthPass extends Pass {

	/**
	 * Constructs a new depth pass.
	 *
	 * @param {Scene} scene - The scene to render.
	 * @param {Camera} camera - The camera to use to render the scene.
	 * @param {Object} [options] - The options.
	 * @param {Number} [options.resolutionScale=1.0] - Deprecated. Adjust the height or width instead for consistent results.
	 * @param {Number} [options.width=Resizer.AUTO_SIZE] - The render width.
	 * @param {Number} [options.height=Resizer.AUTO_SIZE] - The render height.
	 * @param {WebGLRenderTarget} [options.renderTarget] - A custom render target.
	 */

	constructor(scene, camera, {
		resolutionScale = 1.0,
		width = Resizer.AUTO_SIZE,
		height = Resizer.AUTO_SIZE,
		renderTarget
	} = {}) {

		super("DepthPass");

		this.needsSwap = false;

		/**
		 * A render pass.
		 *
		 * @type {RenderPass}
		 * @private
		 */

		this.renderPass = new RenderPass(scene, camera, new MeshDepthMaterial({
			depthPacking: RGBADepthPacking,
			morphTargets: true,
			skinning: true
		}));

		const clearPass = this.renderPass.getClearPass();
		clearPass.overrideClearColor = new Color(0xffffff);
		clearPass.overrideClearAlpha = 1.0;

		/**
		 * A render target that contains the scene depth.
		 *
		 * @type {WebGLRenderTarget}
		 */

		this.renderTarget = renderTarget;

		if(this.renderTarget === undefined) {

			this.renderTarget = new WebGLRenderTarget(1, 1, {
				minFilter: NearestFilter,
				magFilter: NearestFilter,
				stencilBuffer: false
			});

			this.renderTarget.texture.name = "DepthPass.Target";

		}

		/**
		 * The desired render resolution.
		 *
		 * Use {@link Resizer.AUTO_SIZE} for the width or height to automatically
		 * calculate it based on its counterpart and the original aspect ratio.
		 *
		 * @type {Resizer}
		 */

		this.resolution = new Resizer(this, width, height, resolutionScale);

	}

	/**
	 * The depth texture.
	 *
	 * @type {Texture}
	 */

	get texture() {

		return this.renderTarget.texture;

	}

	/**
	 * Returns the current resolution scale.
	 *
	 * @return {Number} The resolution scale.
	 * @deprecated Adjust the fixed resolution width or height instead.
	 */

	getResolutionScale() {

		return this.resolutionScale;

	}

	/**
	 * Sets the resolution scale.
	 *
	 * @param {Number} scale - The new resolution scale.
	 * @deprecated Adjust the fixed resolution width or height instead.
	 */

	setResolutionScale(scale) {

		this.resolutionScale = scale;
		this.setSize(this.resolution.base.x, this.resolution.base.y);

	}

	/**
	 * Renders the scene depth.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
	 * @param {WebGLRenderTarget} outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
	 * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
	 * @param {Boolean} [stencilTest] - Indicates whether a stencil mask is active.
	 */

	render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest) {

		const renderTarget = this.renderToScreen ? null : this.renderTarget;
		this.renderPass.render(renderer, renderTarget);

	}

	/**
	 * Updates the size of this pass.
	 *
	 * @param {Number} width - The width.
	 * @param {Number} height - The height.
	 */

	setSize(width, height) {

		const resolution = this.resolution;
		resolution.base.set(width, height);

		this.renderTarget.setSize(resolution.width, resolution.height);

	}

}
