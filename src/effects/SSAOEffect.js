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
import { Resizer } from "../core/Resizer";
import { NoiseTexture } from "../images/textures/NoiseTexture";
import { SSAOMaterial } from "../materials";
import { ShaderPass } from "../passes";
import { Effect, EffectAttribute } from "./Effect";

import fragmentShader from "./glsl/ssao/shader.frag";

/**
 * The size of the generated noise texture.
 *
 * @type {Number}
 * @private
 */

const NOISE_TEXTURE_SIZE = 64;

/**
 * A Screen Space Ambient Occlusion (SSAO) effect.
 *
 * For high quality visuals use two SSAO effect instances in a row with different radii, one for
 * rough AO and one for fine details.
 *
 * This effect supports depth-aware upsampling and should be rendered at a lower resolution. The
 * resolution should match that of the downsampled normals and depth. If you intend to render SSAO
 * at full resolution, do not provide a downsampled `normalDepthBuffer` and make sure to disable
 * `depthAwareUpsampling`.
 *
 * It's recommended to specify a relative render resolution using the `resolutionScale` constructor
 * parameter to avoid undesired sampling patterns.
 *
 * Based on "Scalable Ambient Obscurance" by Morgan McGuire et al. and "Depth-aware upsampling
 * experiments" by Eleni Maria Stea:
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
	 * @param {Number} [options.distanceThreshold=0.97] - A global distance threshold at which the occlusion effect starts to fade out. Range [0.0, 1.0].
	 * @param {Number} [options.distanceFalloff=0.03] - The distance falloff. Influences the smoothness of the overall occlusion cutoff. Range [0.0, 1.0].
	 * @param {Number} [options.rangeThreshold=0.0005] - A local occlusion range threshold at which the occlusion starts to fade out. Range [0.0, 1.0].
	 * @param {Number} [options.rangeFalloff=0.001] - The occlusion range falloff. Influences the smoothness of the proximity cutoff. Range [0.0, 1.0].
	 * @param {Number} [options.minRadiusScale=0.33] - The minimum radius scale. Has no effect if distance scaling is disabled.
	 * @param {Number} [options.luminanceInfluence=0.7] - Determines how much the luminance of the scene influences the ambient occlusion.
	 * @param {Number} [options.radius=0.1825] - The occlusion sampling radius, expressed as a resolution independent scale. Range [1e-6, 1.0].
	 * @param {Number} [options.intensity=1.0] - The intensity of the ambient occlusion.
	 * @param {Number} [options.bias=0.025] - An occlusion bias. Eliminates artifacts caused by depth discontinuities.
	 * @param {Number} [options.fade=0.01] - Influences the smoothness of the shadows. A lower value results in higher contrast.
	 * @param {Color} [options.color=null] - The color of the ambient occlusion.
	 * @param {Number} [options.resolutionScale=1.0] - The resolution scale.
	 * @param {Number} [options.width=Resizer.AUTO_SIZE] - The render width.
	 * @param {Number} [options.height=Resizer.AUTO_SIZE] - The render height.
	 */

	constructor(camera, normalBuffer, {
		blendFunction = BlendFunction.MULTIPLY,
		distanceScaling = true,
		depthAwareUpsampling = true,
		normalDepthBuffer = null,
		samples = 9,
		rings = 7,
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
		width = Resizer.AUTO_SIZE,
		height = Resizer.AUTO_SIZE
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
		 * @type {Resizer}
		 * @deprecated Use getResolution() instead.
		 */

		this.resolution = new Resizer(this, width, height, resolutionScale);

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

		const material = this.ssaoPass.getFullscreenMaterial();
		material.setNoiseTexture(noiseTexture);
		material.setIntensity(intensity);
		material.setMinRadiusScale(minRadiusScale);
		material.setFade(fade);
		material.setBias(bias);

		if(normalDepthBuffer !== null) {

			material.setNormalDepthBuffer(normalDepthBuffer);

			if(depthAwareUpsampling) {

				this.setDepthAwareUpsamplingEnabled(depthAwareUpsampling);
				this.uniforms.get("normalDepthBuffer").value = normalDepthBuffer;

			}

		} else {

			material.setNormalBuffer(normalBuffer);

		}

		material.setDistanceCutoff(distanceThreshold, distanceFalloff);
		material.setProximityCutoff(rangeThreshold, rangeFalloff);
		material.setDistanceScalingEnabled(distanceScaling);
		material.setSamples(samples);
		material.setRadius(radius);
		material.setRings(rings);
		this.setColor(color);

	}

	/**
	 * Returns the resolution settings.
	 *
	 * @return {Resolution} The resolution.
	 */

	getResolution() {

		return this.resolution;

	}

	/**
	 * The SSAO material.
	 *
	 * @type {SSAOMaterial}
	 * @deprecated Use getSSAOMaterial() instead.
	 */

	get ssaoMaterial() {

		return this.getSSAOMaterial();

	}

	/**
	 * Returns the SSAO material.
	 *
	 * @return {SSAOMaterial} The material.
	 */

	getSSAOMaterial() {

		return this.ssaoPass.getFullscreenMaterial();

	}

	/**
	 * The amount of occlusion samples per pixel.
	 *
	 * @type {Number}
	 * @deprecated Use getSSAOMaterial().getSamples() instead.
	 */

	get samples() {

		return this.getSSAOMaterial().getSamples();

	}

	/**
	 * Sets the amount of occlusion samples per pixel.
	 *
	 * @type {Number}
	 * @deprecated Use getSSAOMaterial().setSamples() instead.
	 */

	set samples(value) {

		this.getSSAOMaterial().setSamples(value);

	}

	/**
	 * The amount of spiral turns in the occlusion sampling pattern.
	 *
	 * @type {Number}
	 * @deprecated Use getSSAOMaterial().getRings() instead.
	 */

	get rings() {

		return this.getSSAOMaterial().getRings();

	}

	/**
	 * Sets the amount of spiral turns in the occlusion sampling pattern.
	 *
	 * @type {Number}
	 * @deprecated Use getSSAOMaterial().setRings() instead.
	 */

	set rings(value) {

		this.getSSAOMaterial().setRings(value);

	}

	/**
	 * The occlusion sampling radius.
	 *
	 * @type {Number}
	 * @deprecated Use getSSAOMaterial().getRadius() instead.
	 */

	get radius() {

		return this.getSSAOMaterial().getRadius();

	}

	/**
	 * Sets the occlusion sampling radius. Range [1e-6, 1.0].
	 *
	 * @type {Number}
	 * @deprecated Use getSSAOMaterial().setRadius() instead.
	 */

	set radius(value) {

		this.getSSAOMaterial().setRadius(value);

	}

	/**
	 * Indicates whether depth-aware upsampling is enabled.
	 *
	 * @type {Boolean}
	 * @deprecated Use isDepthAwareUpsamplingEnabled() instead.
	 */

	get depthAwareUpsampling() {

		return this.isDepthAwareUpsamplingEnabled();

	}

	/**
	 * Enables or disables depth-aware upsampling.
	 *
	 * @type {Boolean}
	 * @deprecated Use setDepthAwareUpsamplingEnabled() instead.
	 */

	set depthAwareUpsampling(value) {

		this.setDepthAwareUpsamplingEnabled(value);

	}

	/**
	 * Indicates whether depth-aware upsampling is enabled.
	 *
	 * @return {Boolean} Whether depth-aware upsampling is enabled.
	 */

	isDepthAwareUpsamplingEnabled() {

		return this.defines.has("DEPTH_AWARE_UPSAMPLING");

	}

	/**
	 * Enables or disables depth-aware upsampling.
	 *
	 * @param {Boolean} value - Whether depth-aware upsampling should be enabled.
	 */

	setDepthAwareUpsamplingEnabled(value) {

		if(this.isDepthAwareUpsamplingEnabled() !== value) {

			if(value) {

				this.defines.set("DEPTH_AWARE_UPSAMPLING", "1");

			} else {

				this.defines.delete("DEPTH_AWARE_UPSAMPLING");

			}

			this.setChanged();

		}

	}

	/**
	 * Indicates whether distance-based radius scaling is enabled.
	 *
	 * @type {Boolean}
	 * @deprecated Use getSSAOMaterial().isDistanceScalingEnabled() instead.
	 */

	get distanceScaling() {

		return this.getSSAOMaterial().isDistanceScalingEnabled();

	}

	/**
	 * Enables or disables distance-based radius scaling.
	 *
	 * @type {Boolean}
	 * @deprecated Use getSSAOMaterial().setDistanceScalingEnabled() instead.
	 */

	set distanceScaling(value) {

		this.getSSAOMaterial().setDistanceScalingEnabled(value);

	}

	/**
	 * The color of the ambient occlusion.
	 *
	 * @type {Color}
	 * @deprecated Use getColor() instead.
	 */

	get color() {

		return this.getColor();

	}

	/**
	 * Sets the color of the ambient occlusion.
	 *
	 * Set to `null` to disable colorization.
	 *
	 * @type {Color}
	 * @deprecated Use setColor() instead.
	 */

	set color(value) {

		this.setColor(value);

	}

	/**
	 * Returns the color of the ambient occlusion.
	 *
	 * @return {Color} The color.
	 */

	getColor() {

		return this.uniforms.get("color").value;

	}

	/**
	 * Sets the color of the ambient occlusion. Set to `null` to disable colorization.
	 *
	 * @param {Color} value - The color.
	 */

	setColor(value) {

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
	 * Sets the occlusion distance cutoff.
	 *
	 * @deprecated Use getSSAOMaterial().setDistanceCutoff() instead.
	 * @param {Number} threshold - The distance threshold. Range [0.0, 1.0].
	 * @param {Number} falloff - The falloff. Range [0.0, 1.0].
	 */

	setDistanceCutoff(threshold, falloff) {

		this.getSSAOMaterial().setDistanceCutoff(threshold, falloff);

	}

	/**
	 * Sets the occlusion proximity cutoff.
	 *
	 * @deprecated Use getSSAOMaterial().setProximityCutoff() instead.
	 * @param {Number} threshold - The range threshold. Range [0.0, 1.0].
	 * @param {Number} falloff - The falloff. Range [0.0, 1.0].
	 */

	setProximityCutoff(threshold, falloff) {

		this.getSSAOMaterial().setProximityCutoff(threshold, falloff);

	}

	/**
	 * Sets the depth texture.
	 *
	 * @param {Texture} depthTexture - A depth texture.
	 * @param {Number} [depthPacking=BasicDepthPacking] - The depth packing.
	 */

	setDepthTexture(depthTexture, depthPacking = BasicDepthPacking) {

		const material = this.ssaoMaterial;

		if(material.defines.NORMAL_DEPTH === undefined) {

			material.uniforms.normalDepthBuffer.value = depthTexture;
			material.depthPacking = depthPacking;

		}

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
	 * Updates the camera projection matrix uniforms and the size of internal
	 * render targets.
	 *
	 * @param {Number} width - The width.
	 * @param {Number} height - The height.
	 */

	setSize(width, height) {

		const resolution = this.resolution;
		resolution.base.set(width, height);

		const w = resolution.width;
		const h = resolution.height;

		const material = this.getSSAOMaterial();
		material.adoptCameraSettings(this.camera);
		material.setSize(w, h);
		this.renderTargetAO.setSize(w, h);

	}

}
