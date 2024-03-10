import {
	BasicDepthPacking,
	Color,
	DepthTexture,
	Matrix4,
	Scene,
	SRGBColorSpace,
	Uniform,
	Vector2,
	Vector3,
	WebGLRenderTarget
} from "three";

import { Resolution } from "../core/Resolution.js";
import { BlendFunction } from "../enums/BlendFunction.js";
import { EffectAttribute } from "../enums/EffectAttribute.js";
import { KernelSize } from "../enums/KernelSize.js";
import { DepthMaskMaterial } from "../materials/DepthMaskMaterial.js";
import { GodRaysMaterial } from "../materials/GodRaysMaterial.js";
import { KawaseBlurPass } from "../passes/KawaseBlurPass.js";
import { ClearPass } from "../passes/ClearPass.js";
import { RenderPass } from "../passes/RenderPass.js";
import { ShaderPass } from "../passes/ShaderPass.js";
import { Effect } from "./Effect.js";

import fragmentShader from "./glsl/god-rays.frag";

const v = /* @__PURE__ */ new Vector3();
const m = /* @__PURE__ */ new Matrix4();

/**
 * A god rays effect.
 */

export class GodRaysEffect extends Effect {

	/**
	 * Constructs a new god rays effect.
	 *
	 * @param {Camera} [camera] - The main camera.
	 * @param {Mesh|Points} [lightSource] - The light source. Must not write depth and has to be flagged as transparent.
	 * @param {Object} [options] - The options.
	 * @param {BlendFunction} [options.blendFunction=BlendFunction.SCREEN] - The blend function of this effect.
	 * @param {Number} [options.samples=60.0] - The number of samples per pixel.
	 * @param {Number} [options.density=0.96] - The density of the light rays.
	 * @param {Number} [options.decay=0.9] - An illumination decay factor.
	 * @param {Number} [options.weight=0.4] - A light ray weight factor.
	 * @param {Number} [options.exposure=0.6] - A constant attenuation coefficient.
	 * @param {Number} [options.clampMax=1.0] - An upper bound for the saturation of the overall effect.
	 * @param {Number} [options.resolutionScale=0.5] - The resolution scale.
	 * @param {Number} [options.resolutionX=Resolution.AUTO_SIZE] - The horizontal resolution.
	 * @param {Number} [options.resolutionY=Resolution.AUTO_SIZE] - The vertical resolution.
	 * @param {Number} [options.width=Resolution.AUTO_SIZE] - Deprecated. Use resolutionX instead.
	 * @param {Number} [options.height=Resolution.AUTO_SIZE] - Deprecated. Use resolutionY instead.
	 * @param {KernelSize} [options.kernelSize=KernelSize.SMALL] - The blur kernel size. Has no effect if blur is disabled.
	 * @param {Boolean} [options.blur=true] - Whether the god rays should be blurred to reduce artifacts.
	 */

	constructor(camera, lightSource, {
		blendFunction = BlendFunction.SCREEN,
		samples = 60.0,
		density = 0.96,
		decay = 0.9,
		weight = 0.4,
		exposure = 0.6,
		clampMax = 1.0,
		blur = true,
		kernelSize = KernelSize.SMALL,
		resolutionScale = 0.5,
		width = Resolution.AUTO_SIZE,
		height = Resolution.AUTO_SIZE,
		resolutionX = width,
		resolutionY = height
	} = {}) {

		super("GodRaysEffect", fragmentShader, {
			blendFunction,
			attributes: EffectAttribute.DEPTH,
			uniforms: new Map([
				["map", new Uniform(null)]
			])
		});

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
		 * @type {Mesh|Points}
		 * @private
		 */

		this._lightSource = lightSource;
		this.lightSource = lightSource;

		/**
		 * A scene for the light source.
		 *
		 * @type {Scene}
		 * @private
		 */

		this.lightScene = new Scene();

		/**
		 * The light position in screen space.
		 *
		 * @type {Vector2}
		 * @private
		 */

		this.screenPosition = new Vector2();

		/**
		 * A render target.
		 *
		 * @type {WebGLRenderTarget}
		 * @private
		 */

		this.renderTargetA = new WebGLRenderTarget(1, 1, { depthBuffer: false });
		this.renderTargetA.texture.name = "GodRays.Target.A";

		/**
		 * A render target.
		 *
		 * @type {WebGLRenderTarget}
		 * @private
		 */

		this.renderTargetB = this.renderTargetA.clone();
		this.renderTargetB.texture.name = "GodRays.Target.B";
		this.uniforms.get("map").value = this.renderTargetB.texture;

		/**
		 * A render target for the light scene.
		 *
		 * @type {WebGLRenderTarget}
		 * @private
		 */

		this.renderTargetLight = new WebGLRenderTarget(1, 1);
		this.renderTargetLight.texture.name = "GodRays.Light";
		this.renderTargetLight.depthTexture = new DepthTexture();

		/**
		 * A pass that renders the light source.
		 *
		 * @type {RenderPass}
		 * @private
		 */

		this.renderPassLight = new RenderPass(this.lightScene, camera);
		this.renderPassLight.clearPass.overrideClearColor = new Color(0x000000);

		/**
		 * A clear pass.
		 *
		 * @type {ClearPass}
		 * @private
		 */

		this.clearPass = new ClearPass(true, false, false);
		this.clearPass.overrideClearColor = new Color(0x000000);

		/**
		 * A blur pass that reduces aliasing artifacts to make the light softer.
		 *
		 * This pass can be disabled to improve performance.
		 *
		 * @type {KawaseBlurPass}
		 * @readonly
		 */

		this.blurPass = new KawaseBlurPass({ kernelSize });
		this.blurPass.enabled = blur;

		/**
		 * A depth mask pass.
		 *
		 * @type {ShaderPass}
		 * @private
		 */

		this.depthMaskPass = new ShaderPass(new DepthMaskMaterial());
		const depthMaskMaterial = this.depthMaskMaterial;
		depthMaskMaterial.depthBuffer1 = this.renderTargetLight.depthTexture;
		depthMaskMaterial.copyCameraSettings(camera);

		/**
		 * A god rays blur pass.
		 *
		 * @type {ShaderPass}
		 * @private
		 */

		this.godRaysPass = new ShaderPass(new GodRaysMaterial(this.screenPosition));
		const godRaysMaterial = this.godRaysMaterial;
		godRaysMaterial.density = density;
		godRaysMaterial.decay = decay;
		godRaysMaterial.weight = weight;
		godRaysMaterial.exposure = exposure;
		godRaysMaterial.maxIntensity = clampMax;
		godRaysMaterial.samples = samples;

		/**
		 * The render resolution.
		 *
		 * @type {Resolution}
		 * @readonly
		 */

		const resolution = this.resolution = new Resolution(this, resolutionX, resolutionY, resolutionScale);
		resolution.addEventListener("change", (e) => this.setSize(resolution.baseWidth, resolution.baseHeight));

	}

	set mainCamera(value) {

		this.camera = value;
		this.renderPassLight.mainCamera = value;
		this.depthMaskMaterial.copyCameraSettings(value);

	}

	/**
	 * Sets the light source.
	 *
	 * @type {Mesh|Points}
	 */

	get lightSource() {

		return this._lightSource;

	}

	set lightSource(value) {

		this._lightSource = value;

		if(value !== null) {

			value.material.depthWrite = false;
			value.material.transparent = true;

		}

	}

	/**
	 * Returns the blur pass that reduces aliasing artifacts and makes the light softer.
	 *
	 * @deprecated Use blurPass instead.
	 * @return {KawaseBlurPass} The blur pass.
	 */

	getBlurPass() {

		return this.blurPass;

	}

	/**
	 * A texture that contains the intermediate result of this effect.
	 *
	 * @type {Texture}
	 */

	get texture() {

		return this.renderTargetB.texture;

	}

	/**
	 * Returns the god rays texture.
	 *
	 * @deprecated Use texture instead.
	 * @return {Texture} The texture.
	 */

	getTexture() {

		return this.texture;

	}

	/**
	 * The depth mask material.
	 *
	 * @type {DepthMaskMaterial}
	 * @private
	 */

	get depthMaskMaterial() {

		return this.depthMaskPass.fullscreenMaterial;

	}

	/**
	 * The internal god rays material.
	 *
	 * @type {GodRaysMaterial}
	 */

	get godRaysMaterial() {

		return this.godRaysPass.fullscreenMaterial;

	}

	/**
	 * Returns the god rays material.
	 *
	 * @deprecated Use godRaysMaterial instead.
	 * @return {GodRaysMaterial} The material.
	 */

	getGodRaysMaterial() {

		return this.godRaysMaterial;

	}

	/**
	 * Returns the resolution of this effect.
	 *
	 * @deprecated Use resolution instead.
	 * @return {GodRaysMaterial} The material.
	 */

	getResolution() {

		return this.resolution;

	}

	/**
	 * The current width of the internal render targets.
	 *
	 * @type {Number}
	 * @deprecated Use resolution.width instead.
	 */

	get width() {

		return this.resolution.width;

	}

	set width(value) {

		this.resolution.preferredWidth = value;

	}

	/**
	 * The current height of the internal render targets.
	 *
	 * @type {Number}
	 * @deprecated Use resolution.height instead.
	 */

	get height() {

		return this.resolution.height;

	}

	set height(value) {

		this.resolution.preferredHeight = value;

	}

	/**
	 * Indicates whether dithering is enabled.
	 *
	 * @type {Boolean}
	 * @deprecated
	 */

	get dithering() {

		return this.godRaysMaterial.dithering;

	}

	set dithering(value) {

		const material = this.godRaysMaterial;
		material.dithering = value;
		material.needsUpdate = true;

	}

	/**
	 * Indicates whether the god rays should be blurred to reduce artifacts.
	 *
	 * @type {Boolean}
	 * @deprecated Use blurPass.enabled instead.
	 */

	get blur() {

		return this.blurPass.enabled;

	}

	set blur(value) {

		this.blurPass.enabled = value;

	}

	/**
	 * The blur kernel size.
	 *
	 * @type {KernelSize}
	 * @deprecated Use blurPass.kernelSize instead.
	 */

	get kernelSize() {

		return this.blurPass.kernelSize;

	}

	set kernelSize(value) {

		this.blurPass.kernelSize = value;

	}

	/**
	 * Returns the current resolution scale.
	 *
	 * @return {Number} The resolution scale.
	 * @deprecated Use resolution instead.
	 */

	getResolutionScale() {

		return this.resolution.scale;

	}

	/**
	 * Sets the resolution scale.
	 *
	 * @param {Number} scale - The new resolution scale.
	 * @deprecated Use resolution instead.
	 */

	setResolutionScale(scale) {

		this.resolution.scale = scale;

	}

	/**
	 * The number of samples per pixel.
	 *
	 * @type {Number}
	 * @deprecated Use godRaysMaterial.samples instead.
	 */

	get samples() {

		return this.godRaysMaterial.samples;

	}

	/**
	 * A higher sample count improves quality at the cost of performance.
	 *
	 * @type {Number}
	 * @deprecated Use godRaysMaterial.samples instead.
	 */

	set samples(value) {

		this.godRaysMaterial.samples = value;

	}

	/**
	 * Sets the depth texture.
	 *
	 * @param {Texture} depthTexture - A depth texture.
	 * @param {Number} [depthPacking=BasicDepthPacking] - The depth packing.
	 */

	setDepthTexture(depthTexture, depthPacking = BasicDepthPacking) {

		this.depthMaskPass.fullscreenMaterial.depthBuffer0 = depthTexture;
		this.depthMaskPass.fullscreenMaterial.depthPacking0 = depthPacking;

	}

	/**
	 * Updates this effect.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
	 * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
	 */

	update(renderer, inputBuffer, deltaTime) {

		const lightSource = this.lightSource;
		const parent = lightSource.parent;
		const matrixAutoUpdate = lightSource.matrixAutoUpdate;

		const renderTargetA = this.renderTargetA;
		const renderTargetLight = this.renderTargetLight;

		// Enable depth write for the light scene render pass.
		lightSource.material.depthWrite = true;

		// Update the world matrix.
		lightSource.matrixAutoUpdate = false;
		lightSource.updateWorldMatrix(true, false);

		if(parent !== null) {

			if(!matrixAutoUpdate) {

				// Remember the local transformation to restore it later.
				m.copy(lightSource.matrix);

			}

			// Apply parent transformations.
			lightSource.matrix.copy(lightSource.matrixWorld);

		}

		// Render the light source and mask it based on depth.
		this.lightScene.add(lightSource);
		this.renderPassLight.render(renderer, renderTargetLight);
		this.clearPass.render(renderer, renderTargetA);
		this.depthMaskPass.render(renderer, renderTargetLight, renderTargetA);

		// Restore the original values.
		lightSource.material.depthWrite = false;
		lightSource.matrixAutoUpdate = matrixAutoUpdate;

		if(parent !== null) {

			if(!matrixAutoUpdate) {

				lightSource.matrix.copy(m);

			}

			parent.add(lightSource);

		}

		// Calculate the screen light position.
		v.setFromMatrixPosition(lightSource.matrixWorld).project(this.camera);

		// Translate to [0.0, 1.0] and clamp to screen with a bias of 1.0.
		this.screenPosition.set(
			Math.min(Math.max((v.x + 1.0) * 0.5, -1.0), 2.0),
			Math.min(Math.max((v.y + 1.0) * 0.5, -1.0), 2.0)
		);

		if(this.blurPass.enabled) {

			// Blur the masked scene to reduce artifacts.
			this.blurPass.render(renderer, renderTargetA, renderTargetA);

		}

		// Blur the masked scene along radial lines towards the light source.
		this.godRaysPass.render(renderer, renderTargetA, this.renderTargetB);

	}

	/**
	 * Updates the size of internal render targets.
	 *
	 * @param {Number} width - The width.
	 * @param {Number} height - The height.
	 */

	setSize(width, height) {

		const resolution = this.resolution;
		resolution.setBaseSize(width, height);
		const w = resolution.width, h = resolution.height;

		this.renderTargetA.setSize(w, h);
		this.renderTargetB.setSize(w, h);
		this.renderTargetLight.setSize(w, h);
		this.blurPass.resolution.copy(resolution);

	}

	/**
	 * Performs initialization tasks.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {Boolean} alpha - Whether the renderer uses the alpha channel or not.
	 * @param {Number} frameBufferType - The type of the main frame buffers.
	 */

	initialize(renderer, alpha, frameBufferType) {

		this.blurPass.initialize(renderer, alpha, frameBufferType);
		this.renderPassLight.initialize(renderer, alpha, frameBufferType);
		this.depthMaskPass.initialize(renderer, alpha, frameBufferType);
		this.godRaysPass.initialize(renderer, alpha, frameBufferType);

		if(frameBufferType !== undefined) {

			this.renderTargetA.texture.type = frameBufferType;
			this.renderTargetB.texture.type = frameBufferType;
			this.renderTargetLight.texture.type = frameBufferType;

			if(renderer !== null && renderer.outputColorSpace === SRGBColorSpace) {

				this.renderTargetA.texture.colorSpace = SRGBColorSpace;
				this.renderTargetB.texture.colorSpace = SRGBColorSpace;
				this.renderTargetLight.texture.colorSpace = SRGBColorSpace;

			}

		}

	}

}
