import {
	Color,
	LinearFilter,
	MeshBasicMaterial,
	RGBFormat,
	Scene,
	Vector3,
	WebGLRenderTarget
} from "three";

import { CombineMaterial, GodRaysMaterial, KernelSize } from "../materials";
import { RenderPass } from "./RenderPass.js";
import { BlurPass } from "./BlurPass.js";
import { Pass } from "./Pass.js";

/**
 * Clamps a given value.
 *
 * @private
 * @param {Number} value - The value to clamp.
 * @param {Number} min - The lowest possible value.
 * @param {Number} max - The highest possible value.
 * @return {Number} The clamped value.
 */

function clamp(value, min, max) {

	return Math.max(min, Math.min(max, value));

}

/**
 * A crepuscular rays pass.
 */

export class GodRaysPass extends Pass {

	/**
	 * Constructs a new god rays pass.
	 *
	 * @param {Scene} scene - The main scene.
	 * @param {Camera} camera - The main camera.
	 * @param {Object3D} lightSource - The main light source.
	 * @param {Object} [options] - The options.
	 * @param {Number} [options.density=0.96] - The density of the light rays.
	 * @param {Number} [options.decay=0.93] - An illumination decay factor.
	 * @param {Number} [options.weight=0.4] - A light ray weight factor.
	 * @param {Number} [options.exposure=0.6] - A constant attenuation coefficient.
	 * @param {Number} [options.clampMax=1.0] - An upper bound for the saturation of the overall effect.
	 * @param {Number} [options.intensity=1.0] - A constant factor for additive blending.
	 * @param {Number} [options.resolutionScale=0.5] - The render texture resolution scale, relative to the screen render size.
	 * @param {Number} [options.kernelSize=KernelSize.LARGE] - The blur kernel size.
	 * @param {Number} [options.samples=60] - The number of samples per pixel.
	 * @param {Number} [options.screenMode=true] - Whether the screen blend mode should be used for combining the god rays texture with the scene colors.
	 */

	constructor(scene, camera, lightSource, options = {}) {

		super();

		/**
		 * The name of this pass.
		 */

		this.name = "GodRaysPass";

		/**
		 * This pass renders to the write buffer.
		 */

		this.needsSwap = true;

		/**
		 * A scene that only contains the light source.
		 *
		 * @type {Scene}
		 * @private
		 */

		this.lightScene = new Scene();

		/**
		 * The main scene.
		 *
		 * @type {Scene}
		 * @private
		 */

		this.mainScene = scene;

		/**
		 * The main camera.
		 *
		 * @type {Camera}
		 * @private
		 */

		this.mainCamera = camera;

		/**
		 * A pass that only renders the light source.
		 *
		 * @type {RenderPass}
		 * @private
		 */

		this.renderPassLight = new RenderPass(this.lightScene, this.mainCamera);

		/**
		 * A pass that renders the masked scene over the light.
		 *
		 * @type {RenderPass}
		 * @private
		 */

		this.renderPassMask = new RenderPass(this.mainScene, this.mainCamera, {
			overrideMaterial: new MeshBasicMaterial({ color: 0x000000 }),
			clearColor: new Color(0x000000)
		});

		this.renderPassMask.clear = false;

		/**
		 * A blur pass.
		 *
		 * @type {BlurPass}
		 * @private
		 */

		this.blurPass = new BlurPass(options);

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
			magFilter: LinearFilter
		});

		this.renderTargetMask.texture.name = "GodRays.Mask";
		this.renderTargetMask.texture.generateMipmaps = false;

		/**
		 * The light source.
		 *
		 * @type {Object3D}
		 */

		this.lightSource = lightSource;

		/**
		 * The light position in screen space.
		 *
		 * @type {Vector3}
		 * @private
		 */

		this.screenPosition = new Vector3();

		/**
		 * A god rays shader material.
		 *
		 * @type {GodRaysMaterial}
		 * @private
		 */

		this.godRaysMaterial = new GodRaysMaterial(options);
		this.godRaysMaterial.uniforms.lightPosition.value = this.screenPosition;

		this.samples = options.samples;

		/**
		 * A combine shader material.
		 *
		 * @type {CombineMaterial}
		 * @private
		 */

		this.combineMaterial = new CombineMaterial((options.screenMode !== undefined) ? options.screenMode : true);

		this.intensity = options.intensity;

	}

	/**
	 * The resolution scale.
	 *
	 * @type {Number}
	 */

	get resolutionScale() {

		return this.blurPass.resolutionScale;

	}

	/**
	 * You need to call {@link EffectComposer#setSize} after changing this value.
	 *
	 * @type {Number}
	 */

	set resolutionScale(value = 0.5) {

		this.blurPass.resolutionScale = value;

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

	set kernelSize(value = KernelSize.LARGE) {

		this.blurPass.kernelSize = value;

	}

	/**
	 * The overall intensity of the effect.
	 *
	 * @type {Number}
	 */

	get intensity() {

		return this.combineMaterial.uniforms.opacity2.value;

	}

	/**
	 * @type {Number}
	 */

	set intensity(value = 1.0) {

		this.combineMaterial.uniforms.opacity2.value = value;

	}

	/**
	 * The number of samples per pixel.
	 *
	 * @type {Number}
	 */

	get samples() {

		return Number.parseInt(this.godRaysMaterial.defines.NUM_SAMPLES_INT);

	}

	/**
	 * This value must be carefully chosen. A higher value directly increases the
	 * GPU load.
	 *
	 * @type {Number}
	 */

	set samples(value = 60) {

		value = Math.floor(value);

		this.godRaysMaterial.defines.NUM_SAMPLES_FLOAT = value.toFixed(1);
		this.godRaysMaterial.defines.NUM_SAMPLES_INT = value.toFixed(0);
		this.godRaysMaterial.needsUpdate = true;

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
	 * If enabled, the result will be dithered to remove banding artifacts.
	 *
	 * @type {Boolean}
	 */

	set dithering(value) {

		if(this.dithering !== value) {

			this.godRaysMaterial.dithering = value;
			this.godRaysMaterial.needsUpdate = true;

		}

	}

	/**
	 * Renders the scene.
	 *
	 * The god rays pass has four phases:
	 *
	 * Mask Phase:
	 *  First, the light source is rendered. Then the scene is rendered into the
	 *  same buffer using a mask override material with depth test enabled.
	 *
	 * Preliminary Blur Phase:
	 *  The masked scene is blurred.
	 *
	 * God Rays Phase:
	 *  The blurred scene is blurred again, but this time along radial lines
	 *  towards the light source.
	 *
	 * Composite Phase:
	 *  The final result is combined with the read buffer.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {WebGLRenderTarget} readBuffer - The read buffer.
	 * @param {WebGLRenderTarget} writeBuffer - The write buffer.
	 */

	render(renderer, readBuffer, writeBuffer) {

		const quad = this.quad;
		const scene = this.scene;
		const camera = this.camera;
		const mainScene = this.mainScene;

		const lightSource = this.lightSource;
		const screenPosition = this.screenPosition;

		const godRaysMaterial = this.godRaysMaterial;
		const combineMaterial = this.combineMaterial;

		const renderTargetMask = this.renderTargetMask;
		const renderTargetX = this.renderTargetX;
		const renderTargetY = this.renderTargetY;

		let background, parent;

		// Compute the screen light position and translate it to [0, 1].
		screenPosition.copy(lightSource.position).project(this.mainCamera);
		screenPosition.x = clamp((screenPosition.x + 1.0) * 0.5, 0.0, 1.0);
		screenPosition.y = clamp((screenPosition.y + 1.0) * 0.5, 0.0, 1.0);

		// Render the masked scene.
		parent = lightSource.parent;
		background = mainScene.background;
		mainScene.background = null;
		this.lightScene.add(lightSource);

		this.renderPassLight.render(renderer, renderTargetMask);
		this.renderPassMask.render(renderer, renderTargetMask);

		if(parent !== null) {

			parent.add(lightSource);

		}

		mainScene.background = background;

		// Convolution phase.
		this.blurPass.render(renderer, renderTargetMask, renderTargetX);

		// God rays pass.
		quad.material = godRaysMaterial;
		godRaysMaterial.uniforms.tDiffuse.value = renderTargetX.texture;
		renderer.render(scene, camera, renderTargetY);

		// Final pass - composite god rays onto colours.
		quad.material = combineMaterial;
		combineMaterial.uniforms.texture1.value = readBuffer.texture;
		combineMaterial.uniforms.texture2.value = renderTargetY.texture;

		renderer.render(scene, camera, this.renderToScreen ? null : writeBuffer);

	}

	/**
	 * Adjusts the format of the render targets.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {Boolean} alpha - Whether the renderer uses the alpha channel or not.
	 */

	initialise(renderer, alpha) {

		this.renderPassLight.initialise(renderer, alpha);
		this.renderPassMask.initialise(renderer, alpha);
		this.blurPass.initialise(renderer, alpha);

		if(!alpha) {

			this.renderTargetMask.texture.format = RGBFormat;
			this.renderTargetX.texture.format = RGBFormat;
			this.renderTargetY.texture.format = RGBFormat;

		}

	}

	/**
	 * Updates this pass with the renderer's size.
	 *
	 * @param {Number} width - The width.
	 * @param {Number} height - The height.
	 */

	setSize(width, height) {

		this.renderPassLight.setSize(width, height);
		this.renderPassMask.setSize(width, height);
		this.blurPass.setSize(width, height);

		width = this.blurPass.width;
		height = this.blurPass.height;

		this.renderTargetMask.setSize(width, height);
		this.renderTargetX.setSize(width, height);
		this.renderTargetY.setSize(width, height);

	}

}
