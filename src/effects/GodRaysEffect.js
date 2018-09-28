import {
	Color,
	LinearFilter,
	MeshBasicMaterial,
	RGBFormat,
	Scene,
	Uniform,
	Vector2,
	Vector3,
	WebGLRenderTarget
} from "three";

import { KernelSize, GodRaysMaterial } from "../materials";
import { BlurPass, RenderPass, ShaderPass } from "../passes";
import { BlendFunction } from "./blending/BlendFunction.js";
import { Effect } from "./Effect.js";

import fragment from "./glsl/texture/shader.frag";

/**
 * A vector.
 *
 * @type {Vector3}
 * @private
 */

const v = new Vector3();

/**
 * A god rays pass.
 */

export class GodRaysEffect extends Effect {

	/**
	 * Constructs a new god rays pass.
	 *
	 * @param {Scene} scene - The main scene.
	 * @param {Camera} camera - The main camera.
	 * @param {Object3D} lightSource - The main light source.
	 * @param {Object} [options] - The options. See {@link GodRaysMaterial} for additional options.
	 * @param {BlendFunction} [options.blendFunction=BlendFunction.SCREEN] - The blend function of this effect.
	 * @param {Number} [options.resolutionScale=0.5] - The render texture resolution scale, relative to the screen render size.
	 * @param {Number} [options.samples=60.0] - The number of samples per pixel.
	 * @param {Number} [options.blur=true] - Whether the god rays should be blurred to reduce artifacts.
	 * @param {Number} [options.kernelSize=KernelSize.SMALL] - The blur kernel size. Has no effect if blur is disabled.
	 */

	constructor(scene, camera, lightSource, options = {}) {

		const settings = Object.assign({
			blendFunction: BlendFunction.SCREEN,
			resolutionScale: 0.5,
			samples: 60.0,
			blur: true,
			kernelSize: KernelSize.SMALL
		}, options);

		super("GodRaysEffect", fragment, {

			blendFunction: settings.blendFunction,

			uniforms: new Map([
				["texture", new Uniform(null)]
			])

		});

		/**
		 * The main scene.
		 *
		 * @type {Scene}
		 * @private
		 */

		this.scene = scene;

		/**
		 * The main camera.
		 *
		 * @type {Camera}
		 * @private
		 */

		this.camera = camera;

		/**
		 * The light source.
		 *
		 * @type {Object3D}
		 */

		this.lightSource = lightSource;

		/**
		 * A scene that only contains the light source.
		 *
		 * @type {Scene}
		 * @private
		 */

		this.lightScene = new Scene();

		/**
		 * The light position in screen space.
		 *
		 * @type {Vector3}
		 * @private
		 */

		this.screenPosition = new Vector2();

		/**
		 * The original resolution.
		 *
		 * @type {Vector2}
		 * @private
		 */

		this.resolution = new Vector2();

		/**
		 * A render target.
		 *
		 * @type {WebGLRenderTarget}
		 * @private
		 */

		this.renderTargetX = new WebGLRenderTarget(1, 1, {
			minFilter: LinearFilter,
			magFilter: LinearFilter,
			stencilBuffer: false,
			depthBuffer: false
		});

		this.renderTargetX.texture.name = "GodRays.TargetX";
		this.renderTargetX.texture.generateMipmaps = false;

		this.uniforms.get("texture").value = this.renderTargetX.texture;

		/**
		 * A second render target.
		 *
		 * @type {WebGLRenderTarget}
		 * @private
		 */

		this.renderTargetY = this.renderTargetX.clone();

		this.renderTargetY.texture.name = "GodRays.TargetY";

		/**
		 * A render target for the masked light scene.
		 *
		 * @type {WebGLRenderTarget}
		 * @private
		 */

		this.renderTargetMask = new WebGLRenderTarget(1, 1, {
			minFilter: LinearFilter,
			magFilter: LinearFilter,
			stencilBuffer: false
		});

		this.renderTargetMask.texture.name = "GodRays.Mask";
		this.renderTargetMask.texture.generateMipmaps = false;

		/**
		 * A pass that only renders the light source.
		 *
		 * @type {RenderPass}
		 * @private
		 */

		this.renderPassLight = new RenderPass(this.lightScene, camera, {
			clearColor: new Color(0x000000)
		});

		/**
		 * A pass that renders the masked scene over the light source.
		 *
		 * @type {RenderPass}
		 * @private
		 */

		this.renderPassMask = new RenderPass(scene, camera, {
			overrideMaterial: new MeshBasicMaterial({ color: 0x000000 })
		});

		this.renderPassMask.clear = false;

		/**
		 * A blur pass.
		 *
		 * @type {BlurPass}
		 * @private
		 */

		this.blurPass = new BlurPass(settings);

		/**
		 * A god rays pass.
		 *
		 * @type {ShaderPass}
		 * @private
		 */

		this.godRaysPass = new ShaderPass(new GodRaysMaterial(this.screenPosition, settings));

		this.blur = settings.blur;
		this.kernelSize = settings.kernelSize;
		this.samples = settings.samples;

	}

	/**
	 * A texture that contains the intermediate result of this effect.
	 *
	 * This texture will be applied to the scene colors unless the blend function
	 * is set to `SKIP`.
	 *
	 * @type {Texture}
	 */

	get texture() {

		return this.renderTargetX.texture;

	}

	/**
	 * The internal god rays material.
	 *
	 * @type {Material}
	 */

	get godRaysMaterial() {

		return this.godRaysPass.getFullscreenMaterial();

	}

	/**
	 * Indicates whether dithering is enabled.
	 *
	 * @type {Boolean}
	 */

	get dithering() {

		return this.godRaysMaterial.dithering;

	}

	/**
	 * Enables or disables dithering.
	 *
	 * @type {Boolean}
	 */

	set dithering(value) {

		const material = this.godRaysMaterial;

		material.dithering = value;
		material.needsUpdate = true;

	}

	/**
	 * Indicates whether the god rays should be blurred to reduce artifacts.
	 *
	 * @type {Boolean}
	 */

	get blur() {

		return this.blurPass.enabled;

	}

	/**
	 * @type {Boolean}
	 */

	set blur(value) {

		this.blurPass.enabled = value;

	}

	/**
	 * The blur kernel size.
	 *
	 * @type {KernelSize}
	 */

	get kernelSize() {

		return this.blurPass.kernelSize;

	}

	/**
	 * @type {KernelSize}
	 */

	set kernelSize(value) {

		this.blurPass.kernelSize = value;

	}

	/**
	 * Returns the current resolution scale.
	 *
	 * @return {Number} The resolution scale.
	 */

	getResolutionScale() {

		return this.blurPass.getResolutionScale();

	}

	/**
	 * Sets the resolution scale.
	 *
	 * @param {Number} scale - The new resolution scale.
	 */

	setResolutionScale(scale) {

		this.blurPass.setResolutionScale(scale);
		this.setSize(this.resolution.x, this.resolution.y);

	}

	/**
	 * The number of samples per pixel.
	 *
	 * @type {Number}
	 */

	get samples() {

		return this.godRaysMaterial.samples;

	}

	/**
	 * This value must be carefully chosen. A higher value improves quality but
	 * also increases the GPU load.
	 *
	 * @type {Number}
	 */

	set samples(value) {

		this.godRaysMaterial.samples = value;

	}

	/**
	 * Updates this effect.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
	 * @param {Number} [delta] - The time between the last frame and the current one in seconds.
	 */

	update(renderer, inputBuffer, delta) {

		const scene = this.scene;
		const lightSource = this.lightSource;
		const renderTargetMask = this.renderTargetMask;
		const renderTargetY = this.renderTargetY;

		let background, parent;

		// Compute the screen light position and translate it to [0.0, 1.0].
		v.copy(lightSource.position).project(this.camera);
		this.screenPosition.set(
			Math.max(0.0, Math.min(1.0, (v.x + 1.0) * 0.5)),
			Math.max(0.0, Math.min(1.0, (v.y + 1.0) * 0.5)),
		);

		parent = lightSource.parent;
		background = scene.background;
		scene.background = null;
		this.lightScene.add(lightSource);

		/* First, render the light source. Then render the scene into the same
		buffer using a mask override material with depth test enabled. */
		this.renderPassLight.render(renderer, renderTargetMask);
		this.renderPassMask.render(renderer, renderTargetMask);

		if(parent !== null) {

			parent.add(lightSource);

		}

		scene.background = background;
		inputBuffer = renderTargetMask;

		if(this.blur) {

			// Blur the masked scene to reduce artifacts.
			this.blurPass.render(renderer, inputBuffer, renderTargetY);
			inputBuffer = renderTargetY;

		}

		// Blur the masked scene along radial lines towards the light source.
		this.godRaysPass.render(renderer, inputBuffer, this.renderTargetX);

	}

	/**
	 * Updates the size of internal render targets.
	 *
	 * @param {Number} width - The width.
	 * @param {Number} height - The height.
	 */

	setSize(width, height) {

		this.resolution.set(width, height);
		this.renderPassLight.setSize(width, height);
		this.renderPassMask.setSize(width, height);
		this.blurPass.setSize(width, height);
		this.godRaysPass.setSize(width, height);

		width = this.blurPass.width;
		height = this.blurPass.height;

		this.renderTargetMask.setSize(width, height);
		this.renderTargetX.setSize(width, height);
		this.renderTargetY.setSize(width, height);

	}

	/**
	 * Performs initialization tasks.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {Boolean} alpha - Whether the renderer uses the alpha channel or not.
	 */

	initialize(renderer, alpha) {

		this.renderPassLight.initialize(renderer, alpha);
		this.renderPassMask.initialize(renderer, alpha);
		this.blurPass.initialize(renderer, alpha);
		this.godRaysPass.initialize(renderer, alpha);

		if(!alpha) {

			this.renderTargetMask.texture.format = RGBFormat;
			this.renderTargetX.texture.format = RGBFormat;
			this.renderTargetY.texture.format = RGBFormat;

		}

	}

}
