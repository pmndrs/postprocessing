import { BasicDepthPacking, Matrix4, NoBlending, PerspectiveCamera, ShaderMaterial, Uniform, Vector2 } from "three";

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

		this.r = 1.0;

	}

	/**
	 * The combined normal-depth buffer.
	 *
	 * @type {Texture}
	 */

	set normalDepthBuffer(value) {

		this.uniforms.normalDepthBuffer.value = value;

		if(value !== null) {

			this.defines.NORMAL_DEPTH = "1";

		} else {

			delete this.defines.NORMAL_DEPTH;

		}

		this.needsUpdate = true;

	}

	/**
	 * Sets the combined normal-depth buffer.
	 *
	 * @deprecated Use normalDepthBuffer instead.
	 * @param {Number} value - The buffer.
	 */

	setNormalDepthBuffer(value) {

		this.normalDepthBuffer = value;

	}

	/**
	 * The normal buffer.
	 *
	 * @type {Texture}
	 */

	set normalBuffer(value) {

		this.uniforms.normalBuffer.value = value;

	}

	/**
	 * Sets the normal buffer.
	 *
	 * @deprecated Use normalBuffer instead.
	 * @param {Number} value - The buffer.
	 */

	setNormalBuffer(value) {

		this.uniforms.normalBuffer.value = value;

	}

	/**
	 * The depth buffer.
	 *
	 * @type {Texture}
	 */

	set depthBuffer(value) {

		this.uniforms.depthBuffer.value = value;

	}

	/**
	 * The depth packing strategy.
	 *
	 * @type {DepthPackingStrategies}
	 */

	set depthPacking(value) {

		this.defines.DEPTH_PACKING = value.toFixed(0);
		this.needsUpdate = true;

	}

	/**
	 * Sets the depth buffer.
	 *
	 * @deprecated Use depthBuffer and depthPacking instead.
	 * @param {Texture} buffer - The depth texture.
	 * @param {DepthPackingStrategies} [depthPacking=BasicDepthPacking] - The depth packing strategy.
	 */

	setDepthBuffer(buffer, depthPacking = BasicDepthPacking) {

		this.depthBuffer = buffer;
		this.depthPacking = depthPacking;

	}

	/**
	 * The noise texture.
	 *
	 * @type {Texture}
	 */

	set noiseTexture(value) {

		this.uniforms.noiseTexture.value = value;

	}

	/**
	 * Sets the noise texture.
	 *
	 * @deprecated Use noiseTexture instead.
	 * @param {Number} value - The texture.
	 */

	setNoiseTexture(value) {

		this.uniforms.noiseTexture.value = value;

	}

	/**
	 * The sample count.
	 *
	 * @type {Number}
	 */

	get samples() {

		return Number(this.defines.SAMPLES_INT);

	}

	set samples(value) {

		this.defines.SAMPLES_INT = value.toFixed(0);
		this.defines.SAMPLES_FLOAT = value.toFixed(1);
		this.needsUpdate = true;

	}

	/**
	 * Returns the amount of occlusion samples per pixel.
	 *
	 * @deprecated Use samples instead.
	 * @return {Number} The sample count.
	 */

	getSamples() {

		return this.samples;

	}

	/**
	 * Sets the amount of occlusion samples per pixel.
	 *
	 * @deprecated Use samples instead.
	 * @param {Number} value - The sample count.
	 */

	setSamples(value) {

		this.samples = value;

	}

	/**
	 * The sampling spiral ring count.
	 *
	 * @type {Number}
	 */

	get rings() {

		return Number(this.defines.SPIRAL_TURNS);

	}

	set rings(value) {

		this.defines.SPIRAL_TURNS = value.toFixed(1);
		this.needsUpdate = true;

	}

	/**
	 * Returns the amount of spiral turns in the occlusion sampling pattern.
	 *
	 * @deprecated Use rings instead.
	 * @return {Number} The radius.
	 */

	getRings() {

		return this.rings;

	}

	/**
	 * Sets the amount of spiral turns in the occlusion sampling pattern.
	 *
	 * @deprecated Use rings instead.
	 * @param {Number} value - The radius.
	 */

	setRings(value) {

		this.rings = value;

	}

	/**
	 * The intensity.
	 *
	 * @type {Number}
	 */

	get intensity() {

		return this.uniforms.intensity.value;

	}

	set intensity(value) {

		this.uniforms.intensity.value = value;

	}

	/**
	 * Returns the intensity.
	 *
	 * @deprecated Use intensity instead.
	 * @return {Number} The intensity.
	 */

	getIntensity() {

		return this.uniforms.intensity.value;

	}

	/**
	 * Sets the intensity.
	 *
	 * @deprecated Use intensity instead.
	 * @param {Number} value - The intensity.
	 */

	setIntensity(value) {

		this.uniforms.intensity.value = value;

	}

	/**
	 * The depth fade factor.
	 *
	 * @type {Number}
	 */

	get fade() {

		return this.uniforms.fade.value;

	}

	set fade(value) {

		this.uniforms.fade.value = value;

	}

	/**
	 * Returns the depth fade factor.
	 *
	 * @deprecated Use fade instead.
	 * @return {Number} The fade factor.
	 */

	getFade() {

		return this.uniforms.fade.value;

	}

	/**
	 * Sets the depth fade factor.
	 *
	 * @deprecated Use fade instead.
	 * @param {Number} value - The fade factor.
	 */

	setFade(value) {

		this.uniforms.fade.value = value;

	}

	/**
	 * The depth bias.
	 *
	 * @type {Number}
	 */

	get bias() {

		return this.uniforms.bias.value;

	}

	set bias(value) {

		this.uniforms.bias.value = value;

	}

	/**
	 * Returns the depth bias.
	 *
	 * @deprecated Use bias instead.
	 * @return {Number} The bias.
	 */

	getBias() {

		return this.uniforms.bias.value;

	}

	/**
	 * Sets the depth bias.
	 *
	 * @deprecated Use bias instead.
	 * @param {Number} value - The bias.
	 */

	setBias(value) {

		this.uniforms.bias.value = value;

	}

	/**
	 * The minimum radius scale for distance scaling.
	 *
	 * @type {Number}
	 */

	get minRadiusScale() {

		return this.uniforms.minRadiusScale.value;

	}

	set minRadiusScale(value) {

		this.uniforms.minRadiusScale.value = value;

	}

	/**
	 * Returns the minimum radius scale for distance scaling.
	 *
	 * @deprecated Use minRadiusScale instead.
	 * @return {Number} The minimum radius scale.
	 */

	getMinRadiusScale() {

		return this.uniforms.minRadiusScale.value;

	}

	/**
	 * Sets the minimum radius scale for distance scaling.
	 *
	 * @deprecated Use minRadiusScale instead.
	 * @param {Number} value - The minimum radius scale.
	 */

	setMinRadiusScale(value) {

		this.uniforms.minRadiusScale.value = value;

	}

	/**
	 * Updates the absolute radius.
	 *
	 * @private
	 */

	updateRadius() {

		const radius = this.r * this.resolution.height;
		this.defines.RADIUS = radius.toFixed(11);
		this.defines.RADIUS_SQ = (radius * radius).toFixed(11);
		this.needsUpdate = true;

	}

	/**
	 * The occlusion sampling radius.
	 *
	 * @type {Number}
	 */

	get radius() {

		return this.r;

	}

	set radius(value) {

		this.r = Math.min(Math.max(value, 1e-6), 1.0);
		this.updateRadius();

	}

	/**
	 * Returns the occlusion sampling radius.
	 *
	 * @deprecated Use radius instead.
	 * @return {Number} The radius.
	 */

	getRadius() {

		return this.radius;

	}

	/**
	 * Sets the occlusion sampling radius.
	 *
	 * @deprecated Use radius instead.
	 * @param {Number} value - The radius. Range [1e-6, 1.0].
	 */

	setRadius(value) {

		this.radius = value;

	}

	/**
	 * Indicates whether distance-based radius scaling is enabled.
	 *
	 * @type {Boolean}
	 */

	get distanceScaling() {

		return (this.defines.DISTANCE_SCALING !== undefined);

	}

	set distanceScaling(value) {

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
	 * Indicates whether distance-based radius scaling is enabled.
	 *
	 * @deprecated Use distanceScaling instead.
	 * @return {Boolean} Whether distance scaling is enabled.
	 */

	isDistanceScalingEnabled() {

		return this.distanceScaling;

	}

	/**
	 * Enables or disables distance-based radius scaling.
	 *
	 * @deprecated Use distanceScaling instead.
	 * @param {Boolean} value - Whether distance scaling should be enabled.
	 */

	setDistanceScalingEnabled(value) {

		this.distanceScaling = value;

	}

	/**
	 * The occlusion distance threshold.
	 *
	 * @type {Number}
	 */

	get distanceThreshold() {

		return this.uniforms.distanceCutoff.value.x;

	}

	set distanceThreshold(value) {

		this.uniforms.distanceCutoff.value.set(
			Math.min(Math.max(value, 0.0), 1.0),
			Math.min(Math.max(value + this.distanceFalloff, 0.0), 1.0)
		);

	}

	/**
	 * The occlusion distance falloff.
	 *
	 * @type {Number}
	 */

	get distanceFalloff() {

		return this.uniforms.distanceCutoff.value.y - this.distanceThreshold;

	}

	set distanceFalloff(value) {

		this.uniforms.distanceCutoff.value.y = Math.min(Math.max(this.distanceThreshold + value, 0.0), 1.0);

	}

	/**
	 * Sets the occlusion distance cutoff.
	 *
	 * @deprecated Use distanceThreshold and distanceFalloff instead.
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
	 * The occlusion proximity threshold.
	 *
	 * @type {Number}
	 */

	get proximityThreshold() {

		return this.uniforms.proximityCutoff.value.x;

	}

	set proximityThreshold(value) {

		this.uniforms.proximityCutoff.value.set(
			Math.min(Math.max(value, 0.0), 1.0),
			Math.min(Math.max(value + this.proximityFalloff, 0.0), 1.0)
		);

	}

	/**
	 * The occlusion proximity falloff.
	 *
	 * @type {Number}
	 */

	get proximityFalloff() {

		return this.uniforms.proximityCutoff.value.y - this.proximityThreshold;

	}

	set proximityFalloff(value) {

		this.uniforms.proximityCutoff.value.y = Math.min(Math.max(this.proximityThreshold + value, 0.0), 1.0);

	}

	/**
	 * Sets the occlusion proximity cutoff.
	 *
	 * @deprecated Use proximityThreshold and proximityFalloff instead.
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
	 * @deprecated Use setSize() instead.
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
			this.uniforms.projectionMatrix.value.copy(camera.projectionMatrix);
			this.uniforms.inverseProjectionMatrix.value.copy(camera.projectionMatrix).invert();

			if(camera instanceof PerspectiveCamera) {

				this.defines.PERSPECTIVE_CAMERA = "1";

			} else {

				delete this.defines.PERSPECTIVE_CAMERA;

			}

			this.needsUpdate = true;

		}

	}

	/**
	 * Sets the size of this object.
	 *
	 * @param {Number} width - The width.
	 * @param {Number} height - The height.
	 */

	setSize(width, height) {

		const uniforms = this.uniforms;
		const noiseTexture = uniforms.noiseTexture.value;

		if(noiseTexture !== null) {

			uniforms.noiseScale.value.set(
				width / noiseTexture.image.width,
				height / noiseTexture.image.height
			);

		}

		uniforms.texelSize.value.set(1.0 / width, 1.0 / height);
		this.resolution.set(width, height);
		this.updateRadius();

	}

}
