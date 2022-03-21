import {
	BasicDepthPacking,
	Color,
	LinearFilter,
	RepeatWrapping,
	RGBAFormat,
	Uniform,
	WebGLRenderTarget
} from "three";

import { BlendFunction } from "./blending/BlendFunction";
import { Resolution } from "../core/Resolution";
import { NoiseTexture } from "../images/textures/NoiseTexture";
import { SSAOMaterial } from "../materials";
import { ShaderPass } from "../passes";
import { Effect, EffectAttribute } from "./Effect";

import fragmentShader from "./glsl/ssao/shader.frag";

const NOISE_TEXTURE_SIZE = 64;

/**
 * A Screen Space Ambient Occlusion (SSAO) effect.
 *
 * For high quality visuals use two SSAO effect instances in a row with different radii, one for rough AO and one for
 * fine details.
 *
 * This effect supports depth-aware upsampling and should be rendered at a lower resolution. The resolution should match
 * that of the downsampled normals and depth. If you intend to render SSAO at full resolution, do not provide a
 * downsampled `normalDepthBuffer`.
 *
 * It's recommended to specify a relative render resolution using the `resolutionScale` constructor parameter to avoid
 * undesired sampling patterns.
 *
 * Based on "Scalable Ambient Obscurance" by Morgan McGuire et al. and "Depth-aware upsampling experiments" by Eleni
 * Maria Stea:
 * https://research.nvidia.com/publication/scalable-ambient-obscurance
 * https://eleni.mutantstargoat.com/hikiko/on-depth-aware-upsampling
 *
 * The view position calculation is based on a shader by Norbert Nopper:
 * https://github.com/McNopper/OpenGL/blob/master/Example28/shader/ssao.frag.glsl
 */

export class SSAOEffect extends Effect {

	/**
	 * Constructs a new SSAO effect.
	 *
	 * @todo Move normalBuffer to options.
	 * @param {Camera} camera - The main camera.
	 * @param {Texture} normalBuffer - A texture that contains the scene normals. May be null if a normalDepthBuffer is provided. See {@link NormalPass}.
	 * @param {Object} [options] - The options.
	 * @param {BlendFunction} [options.blendFunction=BlendFunction.MULTIPLY] - The blend function of this effect.
	 * @param {Boolean} [options.distanceScaling=true] - Enables or disables distance-based radius scaling.
	 * @param {Boolean} [options.depthAwareUpsampling=true] - Enables or disables depth-aware upsampling. Has no effect if WebGL 2 is not supported.
	 * @param {Texture} [options.normalDepthBuffer=null] - A texture that contains downsampled scene normals and depth. See {@link DepthDownsamplingPass}.
	 * @param {Number} [options.samples=9] - The amount of samples per pixel. Should not be a multiple of the ring count.
	 * @param {Number} [options.rings=7] - The amount of spiral turns in the occlusion sampling pattern. Should be a prime number.
	 * @param {Number} [options.worldDistanceThreshold] - The world distance threshold at which the occlusion effect starts to fade out.
	 * @param {Number} [options.worldDistanceFalloff] - The world distance falloff. Influences the smoothness of the occlusion cutoff.
	 * @param {Number} [options.worldProximityThreshold] - The world proximity threshold at which the occlusion starts to fade out.
	 * @param {Number} [options.worldProximityFalloff] - The world proximity falloff. Influences the smoothness of the proximity cutoff.
	 * @param {Number} [options.distanceThreshold=0.97] - The distance threshold at which the occlusion effect starts to fade out. Range [0.0, 1.0].
	 * @param {Number} [options.distanceFalloff=0.03] - The distance falloff. Influences the smoothness of the overall occlusion cutoff. Range [0.0, 1.0].
	 * @param {Number} [options.rangeThreshold=0.0005] - The proximity threshold at which the occlusion starts to fade out. Range [0.0, 1.0].
	 * @param {Number} [options.rangeFalloff=0.001] - The proximity falloff. Influences the smoothness of the proximity cutoff. Range [0.0, 1.0].
	 * @param {Number} [options.luminanceInfluence=0.7] - Determines how much the luminance of the scene influences the ambient occlusion.
	 * @param {Number} [options.radius=0.1825] - The occlusion sampling radius, expressed as a scale relative to the resolution. Range [1e-6, 1.0].
	 * @param {Number} [options.intensity=1.0] - The intensity of the ambient occlusion.
	 * @param {Number} [options.bias=0.025] - An occlusion bias. Eliminates artifacts caused by depth discontinuities.
	 * @param {Number} [options.fade=0.01] - Influences the smoothness of the shadows. A lower value results in higher contrast.
	 * @param {Color} [options.color=null] - The color of the ambient occlusion.
	 * @param {Number} [options.resolutionScale=1.0] - The resolution scale.
	 * @param {Number} [options.width=Resolution.AUTO_SIZE] - The render width.
	 * @param {Number} [options.height=Resolution.AUTO_SIZE] - The render height.
	 */

	constructor(camera, normalBuffer, {
		blendFunction = BlendFunction.MULTIPLY,
		distanceScaling = true,
		depthAwareUpsampling = true,
		normalDepthBuffer = null,
		samples = 9,
		rings = 7,
		worldDistanceThreshold,
		worldDistanceFalloff,
		worldProximityThreshold,
		worldProximityFalloff,
		distanceThreshold = 0.97,
		distanceFalloff = 0.03,
		rangeThreshold = 0.0005,
		rangeFalloff = 0.001,
		minRadiusScale = 0.33,
		luminanceInfluence = 0.7,
		radius = 0.1825,
		intensity = 1.0,
		bias = 0.025,
		fade = 0.01,
		color = null,
		resolutionScale = 1.0,
		width = Resolution.AUTO_SIZE,
		height = Resolution.AUTO_SIZE
	} = {}) {

		super("SSAOEffect", fragmentShader, {
			blendFunction,
			attributes: EffectAttribute.DEPTH,
			defines: new Map([
				["THRESHOLD", "0.997"]
			]),
			uniforms: new Map([
				["aoBuffer", new Uniform(null)],
				["normalDepthBuffer", new Uniform(null)],
				["luminanceInfluence", new Uniform(luminanceInfluence)],
				["color", new Uniform(null)],
				["scale", new Uniform(0.0)] // Unused.
			])
		});

		/**
		 * A render target for the ambient occlusion shadows.
		 *
		 * @type {WebGLRenderTarget}
		 * @private
		 */

		this.renderTargetAO = new WebGLRenderTarget(1, 1, {
			minFilter: LinearFilter,
			magFilter: LinearFilter,
			stencilBuffer: false,
			depthBuffer: false
		});

		this.renderTargetAO.texture.name = "AO.Target";
		this.renderTargetAO.texture.generateMipmaps = false;
		this.uniforms.get("aoBuffer").value = this.renderTargetAO.texture;

		/**
		 * The resolution.
		 *
		 * @type {Resolution}
		 */

		const resolution = this.resolution = new Resolution(this, width, height, resolutionScale);
		resolution.addEventListener("change", (e) => this.setSize(resolution.baseWidth, resolution.baseHeight));

		/**
		 * The main camera.
		 *
		 * @type {Camera}
		 * @private
		 */

		this.camera = camera;

		/**
		 * An SSAO pass.
		 *
		 * @type {ShaderPass}
		 * @private
		 */

		this.ssaoPass = new ShaderPass(new SSAOMaterial(camera));

		const noiseTexture = new NoiseTexture(NOISE_TEXTURE_SIZE, NOISE_TEXTURE_SIZE, RGBAFormat);
		noiseTexture.wrapS = noiseTexture.wrapT = RepeatWrapping;

		const material = this.ssaoMaterial;
		material.noiseTexture = noiseTexture;
		material.minRadiusScale = minRadiusScale;
		material.intensity = intensity;
		material.fade = fade;
		material.bias = bias;

		if(normalDepthBuffer !== null) {

			material.normalDepthBuffer = normalDepthBuffer;

			if(depthAwareUpsampling) {

				this.depthAwareUpsampling = depthAwareUpsampling;
				this.uniforms.get("normalDepthBuffer").value = normalDepthBuffer;

			}

		} else {

			material.normalBuffer = normalBuffer;

		}

		material.distanceThreshold = distanceThreshold;
		material.distanceFalloff = distanceFalloff;
		material.proximityThreshold = rangeThreshold;
		material.proximityFalloff = rangeFalloff;

		if(worldDistanceThreshold !== undefined) {

			material.worldDistanceThreshold = worldDistanceThreshold;

		}

		if(worldDistanceFalloff !== undefined) {

			material.worldDistanceFalloff = worldDistanceFalloff;

		}

		if(worldProximityThreshold !== undefined) {

			material.worldProximityThreshold = worldProximityThreshold;

		}

		if(worldProximityFalloff !== undefined) {

			material.worldProximityFalloff = worldProximityFalloff;

		}

		material.distanceScaling = distanceScaling;
		material.samples = samples;
		material.radius = radius;
		material.rings = rings;
		this.color = color;

	}

	/**
	 * Returns the resolution settings.
	 *
	 * @deprecated Use resolution instead.
	 * @return {Resolution} The resolution.
	 */

	getResolution() {

		return this.resolution;

	}

	/**
	 * The SSAO material.
	 *
	 * @type {SSAOMaterial}
	 */

	get ssaoMaterial() {

		return this.ssaoPass.fullscreenMaterial;

	}

	/**
	 * Returns the SSAO material.
	 *
	 * @deprecated Use ssaoMaterial instead.
	 * @return {SSAOMaterial} The material.
	 */

	getSSAOMaterial() {

		return this.ssaoMaterial;

	}

	/**
	 * The amount of occlusion samples per pixel.
	 *
	 * @type {Number}
	 * @deprecated Use ssaoMaterial.samples instead.
	 */

	get samples() {

		return this.ssaoMaterial.samples;

	}

	set samples(value) {

		this.ssaoMaterial.samples = value;

	}

	/**
	 * The amount of spiral turns in the occlusion sampling pattern.
	 *
	 * @type {Number}
	 * @deprecated Use ssaoMaterial.rings instead.
	 */

	get rings() {

		return this.ssaoMaterial.rings;

	}

	set rings(value) {

		this.ssaoMaterial.rings = value;

	}

	/**
	 * The occlusion sampling radius.
	 *
	 * @type {Number}
	 * @deprecated Use ssaoMaterial.radius instead.
	 */

	get radius() {

		return this.ssaoMaterial.radius;

	}

	set radius(value) {

		this.ssaoMaterial.radius = value;

	}

	/**
	 * Indicates whether depth-aware upsampling is enabled.
	 *
	 * @type {Boolean}
	 */

	get depthAwareUpsampling() {

		return this.defines.has("DEPTH_AWARE_UPSAMPLING");

	}

	set depthAwareUpsampling(value) {

		if(this.depthAwareUpsampling !== value) {

			if(value) {

				this.defines.set("DEPTH_AWARE_UPSAMPLING", "1");

			} else {

				this.defines.delete("DEPTH_AWARE_UPSAMPLING");

			}

			this.setChanged();

		}

	}

	/**
	 * Indicates whether depth-aware upsampling is enabled.
	 *
	 * @deprecated Use depthAwareUpsampling instead.
	 * @return {Boolean} Whether depth-aware upsampling is enabled.
	 */

	isDepthAwareUpsamplingEnabled() {

		return this.depthAwareUpsampling;

	}

	/**
	 * Enables or disables depth-aware upsampling.
	 *
	 * @deprecated Use depthAwareUpsampling instead.
	 * @param {Boolean} value - Whether depth-aware upsampling should be enabled.
	 */

	setDepthAwareUpsamplingEnabled(value) {

		this.depthAwareUpsampling = value;

	}

	/**
	 * Indicates whether distance-based radius scaling is enabled.
	 *
	 * @type {Boolean}
	 * @deprecated Use ssaoMaterial.distanceScaling instead.
	 */

	get distanceScaling() {

		return this.ssaoMaterial.distanceScaling;

	}

	set distanceScaling(value) {

		this.ssaoMaterial.distanceScaling = value;

	}

	/**
	 * The color of the ambient occlusion. Set to `null` to disable.
	 *
	 * @type {Color}
	 */

	get color() {

		return this.uniforms.get("color").value;

	}

	set color(value) {

		const uniforms = this.uniforms;
		const defines = this.defines;

		if(value !== null) {

			if(defines.has("COLORIZE")) {

				uniforms.get("color").value.set(value);

			} else {

				defines.set("COLORIZE", "1");
				uniforms.get("color").value = new Color(value);
				this.setChanged();

			}

		} else if(defines.has("COLORIZE")) {

			defines.delete("COLORIZE");
			uniforms.get("color").value = null;
			this.setChanged();

		}

	}

	/**
	 * The luminance influence factor. Range: [0.0, 1.0].
	 *
	 * @type {Boolean}
	 */

	get luminanceInfluence() {

		return this.uniforms.get("luminanceInfluence").value;

	}

	set luminanceInfluence(value) {

		this.uniforms.get("luminanceInfluence").value = value;

	}

	/**
	 * Returns the color of the ambient occlusion.
	 *
	 * @deprecated Use color instead.
	 * @return {Color} The color.
	 */

	getColor() {

		return this.color;

	}

	/**
	 * Sets the color of the ambient occlusion. Set to `null` to disable colorization.
	 *
	 * @deprecated Use color instead.
	 * @param {Color} value - The color.
	 */

	setColor(value) {

		this.color = value;

	}

	/**
	 * Sets the occlusion distance cutoff.
	 *
	 * @deprecated Use ssaoMaterial instead.
	 * @param {Number} threshold - The distance threshold. Range [0.0, 1.0].
	 * @param {Number} falloff - The falloff. Range [0.0, 1.0].
	 */

	setDistanceCutoff(threshold, falloff) {

		this.ssaoMaterial.distanceThreshold = threshold;
		this.ssaoMaterial.distanceFalloff = falloff;

	}

	/**
	 * Sets the occlusion proximity cutoff.
	 *
	 * @deprecated Use ssaoMaterial instead.
	 * @param {Number} threshold - The proximity threshold. Range [0.0, 1.0].
	 * @param {Number} falloff - The falloff. Range [0.0, 1.0].
	 */

	setProximityCutoff(threshold, falloff) {

		this.ssaoMaterial.proximityThreshold = threshold;
		this.ssaoMaterial.proximityFalloff = falloff;

	}

	/**
	 * Sets the depth texture.
	 *
	 * @param {Texture} depthTexture - A depth texture.
	 * @param {DepthPackingStrategies} [depthPacking=BasicDepthPacking] - The depth packing.
	 */

	setDepthTexture(depthTexture, depthPacking = BasicDepthPacking) {

		this.ssaoMaterial.depthBuffer = depthTexture;
		this.ssaoMaterial.depthPacking = depthPacking;

	}

	/**
	 * Updates this effect.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
	 * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
	 */

	update(renderer, inputBuffer, deltaTime) {

		this.ssaoPass.render(renderer, null, this.renderTargetAO);

	}

	/**
	 * Sets the size.
	 *
	 * @param {Number} width - The width.
	 * @param {Number} height - The height.
	 */

	setSize(width, height) {

		const resolution = this.resolution;
		resolution.setBaseSize(width, height);
		const w = resolution.width, h = resolution.height;

		const material = this.ssaoMaterial;
		material.adoptCameraSettings(this.camera);
		material.setSize(w, h);
		this.renderTargetAO.setSize(w, h);

	}

}
