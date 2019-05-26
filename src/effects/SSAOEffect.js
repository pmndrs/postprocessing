import { Matrix4, Uniform, Vector2 } from "three";
import { BlendFunction } from "./blending/BlendFunction.js";
import { Effect, EffectAttribute } from "./Effect.js";

import fragmentShader from "./glsl/ssao/shader.frag";

/**
 * A Screen Space Ambient Occlusion (SSAO) effect.
 *
 * For high quality visuals use two SSAO effect instances in a row with
 * different radii, one for rough AO and one for fine details.
 *
 * This implementation uses a spiral sampling pattern:
 *  https://jsfiddle.net/a16ff1p7
 */

export class SSAOEffect extends Effect {

	/**
	 * Constructs a new SSAO effect.
	 *
	 * @param {Camera} camera - The main camera.
	 * @param {Texture} normalBuffer - A texture that contains the scene normals. See {@link NormalPass}.
	 * @param {Object} [options] - The options.
	 * @param {BlendFunction} [options.blendFunction=BlendFunction.MULTIPLY] - The blend function of this effect.
	 * @param {Number} [options.samples=11] - The amount of samples per pixel. Should not be a multiple of the ring count.
	 * @param {Number} [options.rings=4] - The amount of rings in the occlusion sampling pattern.
	 * @param {Number} [options.distanceThreshold=0.65] - A global distance threshold at which the occlusion effect starts to fade out. Range [0.0, 1.0].
	 * @param {Number} [options.distanceFalloff=0.1] - The distance falloff. Influences the smoothness of the overall occlusion cutoff. Range [0.0, 1.0].
	 * @param {Number} [options.rangeThreshold=0.0015] - A local occlusion range threshold at which the occlusion starts to fade out. Range [0.0, 1.0].
	 * @param {Number} [options.rangeFalloff=0.01] - The occlusion range falloff. Influences the smoothness of the proximity cutoff. Range [0.0, 1.0].
	 * @param {Number} [options.luminanceInfluence=0.7] - Determines how much the luminance of the scene influences the ambient occlusion.
	 * @param {Number} [options.radius=18.25] - The occlusion sampling radius.
	 * @param {Number} [options.scale=1.0] - The scale of the ambient occlusion.
	 * @param {Number} [options.bias=0.5] - An occlusion bias.
	 */

	constructor(camera, normalBuffer, {
		blendFunction = BlendFunction.MULTIPLY,
		samples = 11,
		rings = 4,
		distanceThreshold = 0.65,
		distanceFalloff = 0.1,
		rangeThreshold = 0.0015,
		rangeFalloff = 0.01,
		luminanceInfluence = 0.7,
		radius = 18.25,
		scale = 1.0,
		bias = 0.5
	} = {}) {

		super("SSAOEffect", fragmentShader, {

			blendFunction,
			attributes: EffectAttribute.DEPTH,

			defines: new Map([
				["RINGS_INT", "0"],
				["SAMPLES_INT", "0"],
				["SAMPLES_FLOAT", "0.0"]
			]),

			uniforms: new Map([
				["normalBuffer", new Uniform(normalBuffer)],
				["cameraInverseProjectionMatrix", new Uniform(new Matrix4())],
				["cameraProjectionMatrix", new Uniform(new Matrix4())],
				["radiusStep", new Uniform(new Vector2())],
				["distanceCutoff", new Uniform(new Vector2())],
				["proximityCutoff", new Uniform(new Vector2())],
				["seed", new Uniform(Math.random())],
				["luminanceInfluence", new Uniform(luminanceInfluence)],
				["scale", new Uniform(scale)],
				["bias", new Uniform(bias)]
			])

		});

		/**
		 * The current sampling radius.
		 *
		 * @type {Number}
		 * @private
		 */

		this.r = 0.0;

		/**
		 * The current resolution.
		 *
		 * @type {Vector2}
		 * @private
		 */

		this.resolution = new Vector2(1, 1);

		/**
		 * The main camera.
		 *
		 * @type {Camera}
		 * @private
		 */

		this.camera = camera;

		this.samples = samples;
		this.rings = rings;
		this.radius = radius;

		this.setDistanceCutoff(distanceThreshold, distanceFalloff);
		this.setProximityCutoff(rangeThreshold, rangeFalloff);

	}

	/**
	 * Updates the angle step constant.
	 *
	 * @private
	 */

	updateAngleStep() {

		this.defines.set("ANGLE_STEP", (Math.PI * 2.0 * this.rings / this.samples).toFixed(11));

	}

	/**
	 * Updates the radius step uniform.
	 *
	 * Note: The radius step is a uniform because it changes with the screen size.
	 *
	 * @private
	 */

	updateRadiusStep() {

		const r = this.r / this.samples;
		this.uniforms.get("radiusStep").value.set(r, r).divide(this.resolution);

	}

	/**
	 * The amount of occlusion samples per pixel.
	 *
	 * @type {Number}
	 */

	get samples() {

		return Number.parseInt(this.defines.get("SAMPLES_INT"));

	}

	/**
	 * Sets the amount of occlusion samples per pixel.
	 *
	 * You'll need to call {@link EffectPass#recompile} after changing this value.
	 *
	 * @type {Number}
	 */

	set samples(value) {

		value = Math.floor(value);

		this.defines.set("SAMPLES_INT", value.toFixed(0));
		this.defines.set("SAMPLES_FLOAT", value.toFixed(1));
		this.updateAngleStep();
		this.updateRadiusStep();

	}

	/**
	 * The amount of rings in the occlusion sampling spiral pattern.
	 *
	 * @type {Number}
	 */

	get rings() {

		return Number.parseInt(this.defines.get("RINGS_INT"));

	}

	/**
	 * Sets the amount of rings in the occlusion sampling spiral pattern.
	 *
	 * You'll need to call {@link EffectPass#recompile} after changing this value.
	 *
	 * @type {Number}
	 */

	set rings(value) {

		value = Math.floor(value);

		this.defines.set("RINGS_INT", value.toFixed(0));
		this.updateAngleStep();

	}

	/**
	 * The occlusion sampling radius.
	 *
	 * @type {Number}
	 */

	get radius() {

		return this.r;

	}

	/**
	 * Sets the occlusion sampling radius.
	 *
	 * @type {Number}
	 */

	set radius(value) {

		this.r = value;
		this.updateRadiusStep();

	}

	/**
	 * Sets the occlusion distance cutoff.
	 *
	 * @param {Number} threshold - The distance threshold. Range [0.0, 1.0].
	 * @param {Number} falloff - The falloff. Range [0.0, 1.0].
	 */

	setDistanceCutoff(threshold, falloff) {

		this.uniforms.get("distanceCutoff").value.set(threshold, Math.min(threshold + falloff, 1.0 - 1e-6));

	}

	/**
	 * Sets the occlusion proximity cutoff.
	 *
	 * @param {Number} threshold - The range threshold. Range [0.0, 1.0].
	 * @param {Number} falloff - The falloff. Range [0.0, 1.0].
	 */

	setProximityCutoff(threshold, falloff) {

		this.uniforms.get("proximityCutoff").value.set(threshold, Math.min(threshold + falloff, 1.0 - 1e-6));

	}

	/**
	 * Updates the camera projection matrix uniforms.
	 *
	 * @param {Number} width - The width.
	 * @param {Number} height - The height.
	 */

	setSize(width, height) {

		this.resolution.set(width, height);
		this.updateRadiusStep();

		this.uniforms.get("cameraInverseProjectionMatrix").value.getInverse(this.camera.projectionMatrix);
		this.uniforms.get("cameraProjectionMatrix").value.copy(this.camera.projectionMatrix);

	}

}
