import { Matrix4, NoBlending, PerspectiveCamera, ShaderMaterial, Uniform, Vector2 } from "three";

import fragmentShader from "./glsl/ssao/shader.frag";
import vertexShader from "./glsl/ssao/shader.vert";

/**
 * A Screen Space Ambient Occlusion (SSAO) shader material.
 *
 * @implements {Resizable}
 */

export class SSAOMaterial extends ShaderMaterial {

	/**
	 * Constructs a new SSAO material.
	 *
	 * @param {Camera} camera - A camera.
	 */

	constructor(camera) {

		super({
			name: "SSAOMaterial",
			defines: {
				SAMPLES_INT: "0",
				SAMPLES_FLOAT: "0.0",
				SPIRAL_TURNS: "0.0",
				RADIUS: "1.0",
				RADIUS_SQ: "1.0",
				DISTANCE_SCALING: "1",
				DEPTH_PACKING: "0"
			},
			uniforms: {
				depthBuffer: new Uniform(null),
				normalBuffer: new Uniform(null),
				normalDepthBuffer: new Uniform(null),
				noiseTexture: new Uniform(null),
				inverseProjectionMatrix: new Uniform(new Matrix4()),
				projectionMatrix: new Uniform(new Matrix4()),
				texelSize: new Uniform(new Vector2()),
				cameraNear: new Uniform(0.0),
				cameraFar: new Uniform(0.0),
				distanceCutoff: new Uniform(new Vector2()),
				proximityCutoff: new Uniform(new Vector2()),
				noiseScale: new Uniform(new Vector2()),
				minRadiusScale: new Uniform(0.33),
				intensity: new Uniform(1.0),
				fade: new Uniform(0.01),
				bias: new Uniform(0.0)
			},
			blending: NoBlending,
			depthWrite: false,
			depthTest: false,
			fragmentShader,
			vertexShader
		});

		/** @ignore */
		this.toneMapped = false;

		this.adoptCameraSettings(camera);

		/**
		 * The resolution.
		 *
		 * @type {Vector2}
		 * @private
		 */

		this.resolution = new Vector2();

		/**
		 * The relative sampling radius.
		 *
		 * @type {Number}
		 * @private
		 */

		this.radius = 1.0;

	}

	/**
	 * Sets the normal buffer.
	 *
	 * @param {Number} value - The buffer.
	 */

	setNormalBuffer(value) {

		this.uniforms.normalBuffer.value = value;

	}

	/**
	 * Sets the depth buffer.
	 *
	 * @param {Number} value - The buffer.
	 */

	setDepthBuffer(value) {

		this.uniforms.depthBuffer.value = value;

	}

	/**
	 * The current depth packing.
	 *
	 * @type {DepthPackingStrategies}
	 * @deprecated Use getDepthPacking() instead.
	 */

	get depthPacking() {

		return this.getDepthPacking();

	}

	/**
	 * Sets the depth packing.
	 *
	 * @type {DepthPackingStrategies}
	 * @deprecated Use setDepthPacking() instead.
	 */

	set depthPacking(value) {

		this.setDepthPacking(value);

	}

	/**
	 * Returns the current depth packing strategy.
	 *
	 * @return {DepthPackingStrategies} The depth packing strategy.
	 */

	getDepthPacking() {

		return Number(this.defines.DEPTH_PACKING);

	}

	/**
	 * Sets the depth packing strategy.
	 *
	 * @param {DepthPackingStrategies} value - The depth packing strategy.
	 */

	setDepthPacking(value) {

		this.defines.DEPTH_PACKING = value.toFixed(0);
		this.needsUpdate = true;

	}

	/**
	 * Sets the normal-depth buffer.
	 *
	 * @param {Number} value - The buffer.
	 */

	setNormalDepthBuffer(value) {

		this.uniforms.normalDepthBuffer.value = value;

		if(value !== null) {

			this.defines.NORMAL_DEPTH = "1";

		} else {

			delete this.defines.NORMAL_DEPTH;

		}

		this.needsUpdate = true;

	}

	/**
	 * Sets the noise texture.
	 *
	 * @param {Number} value - The texture.
	 */

	setNoiseTexture(value) {

		this.uniforms.noiseTexture.value = value;

	}

	/**
	 * Returns the amount of occlusion samples per pixel.
	 *
	 * @return {Number} The sample count.
	 */

	getSamples() {

		return Number(this.defines.SAMPLES_INT);

	}

	/**
	 * Sets the amount of occlusion samples per pixel.
	 *
	 * @param {Number} value - The sample count.
	 */

	setSamples(value) {

		this.defines.SAMPLES_INT = value.toFixed(0);
		this.defines.SAMPLES_FLOAT = value.toFixed(1);
		this.needsUpdate = true;

	}

	/**
	 * Returns the amount of spiral turns in the occlusion sampling pattern.
	 *
	 * @return {Number} The radius.
	 */

	getRings() {

		return Number(this.defines.SPIRAL_TURNS);

	}

	/**
	 * Sets the amount of spiral turns in the occlusion sampling pattern.
	 *
	 * @param {Number} value - The radius.
	 */

	setRings(value) {

		this.defines.SPIRAL_TURNS = value.toFixed(1);
		this.needsUpdate = true;

	}

	/**
	 * Returns the intensity.
	 *
	 * @return {Number} The intensity.
	 */

	getIntensity() {

		return this.uniforms.intensity.value;

	}

	/**
	 * Sets the intensity.
	 *
	 * @param {Number} value - The intensity.
	 */

	setIntensity(value) {

		this.uniforms.intensity.value = value;

	}

	/**
	 * Returns the depth fade factor.
	 *
	 * @return {Number} The fade factor.
	 */

	getFade() {

		return this.uniforms.fade.value;

	}

	/**
	 * Sets the depth fade factor.
	 *
	 * @param {Number} value - The fade factor.
	 */

	setFade(value) {

		this.uniforms.bias.value = value;

	}

	/**
	 * Returns the depth bias.
	 *
	 * @return {Number} The bias.
	 */

	getBias() {

		return this.uniforms.bias.value;

	}

	/**
	 * Sets the depth bias.
	 *
	 * @param {Number} value - The bias.
	 */

	setBias(value) {

		this.uniforms.bias.value = value;

	}

	/**
	 * Returns the minimum radius scale for distance scaling.
	 *
	 * @return {Number} The minimum radius scale.
	 */

	getMinRadiusScale() {

		return this.uniforms.minRadiusScale.value;

	}

	/**
	 * Sets the minimum radius scale for distance scaling.
	 *
	 * @param {Number} value - The minimum radius scale.
	 */

	setMinRadiusScale(value) {

		this.uniforms.minRadiusScale.value = value;

	}

	/**
	 * Returns the occlusion sampling radius.
	 *
	 * @return {Number} The radius.
	 */

	getRadius() {

		return Number(this.defines.RADIUS);

	}

	/**
	 * Sets the occlusion sampling radius.
	 *
	 * @param {Number} value - The radius. Range [1e-6, 1.0].
	 */

	setRadius(value) {

		this.radius = Math.min(Math.max(value, 1e-6), 1.0);
		const radius = this.radius * this.resolution.height;
		this.defines.RADIUS = radius.toFixed(11);
		this.defines.RADIUS_SQ = (radius * radius).toFixed(11);
		this.needsUpdate = true;

	}

	/**
	 * Indicates whether distance-based radius scaling is enabled.
	 *
	 * @return {Boolean} Whether distance scaling is enabled.
	 */

	isDistanceScalingEnabled() {

		return (this.defines.DISTANCE_SCALING !== undefined);

	}

	/**
	 * Enables or disables distance-based radius scaling.
	 *
	 * @param {Boolean} value - Whether distance scaling should be enabled.
	 */

	setDistanceScalingEnabled(value) {

		if(this.isDistanceScalingEnabled() !== value) {

			if(value) {

				this.defines.DISTANCE_SCALING = "1";

			} else {

				delete this.defines.DISTANCE_SCALING;

			}

			this.needsUpdate = true;

		}

	}

	/**
	 * Sets the occlusion distance cutoff.
	 *
	 * @param {Number} threshold - The distance threshold. Range [0.0, 1.0].
	 * @param {Number} falloff - The falloff. Range [0.0, 1.0].
	 */

	setDistanceCutoff(threshold, falloff) {

		this.uniforms.distanceCutoff.value.set(
			Math.min(Math.max(threshold, 0.0), 1.0),
			Math.min(Math.max(threshold + falloff, 0.0), 1.0)
		);

	}

	/**
	 * Sets the occlusion proximity cutoff.
	 *
	 * @param {Number} threshold - The range threshold. Range [0.0, 1.0].
	 * @param {Number} falloff - The falloff. Range [0.0, 1.0].
	 */

	setProximityCutoff(threshold, falloff) {

		this.uniforms.proximityCutoff.value.set(
			Math.min(Math.max(threshold, 0.0), 1.0),
			Math.min(Math.max(threshold + falloff, 0.0), 1.0)
		);

	}

	/**
	 * Sets the texel size.
	 *
	 * @param {Number} x - The texel width.
	 * @param {Number} y - The texel height.
	 */

	setTexelSize(x, y) {

		this.uniforms.texelSize.value.set(x, y);

	}

	/**
	 * Adopts the settings of the given camera.
	 *
	 * @param {Camera} camera - A camera.
	 */

	adoptCameraSettings(camera) {

		if(camera) {

			this.uniforms.cameraNear.value = camera.near;
			this.uniforms.cameraFar.value = camera.far;

			if(camera instanceof PerspectiveCamera) {

				this.defines.PERSPECTIVE_CAMERA = "1";

			} else {

				delete this.defines.PERSPECTIVE_CAMERA;

			}

			this.needsUpdate = true;

		}

	}

}
