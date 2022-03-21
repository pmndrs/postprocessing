import { BasicDepthPacking, NoBlending, PerspectiveCamera, ShaderMaterial, Uniform } from "three";
import { orthographicDepthToViewZ, viewZToOrthographicDepth } from "../utils";

import fragmentShader from "./glsl/circle-of-confusion/shader.frag";
import vertexShader from "./glsl/common/shader.vert";

/**
 * A Circle of Confusion shader material.
 */

export class CircleOfConfusionMaterial extends ShaderMaterial {

	/**
	 * Constructs a new CoC material.
	 *
	 * @param {Camera} camera - A camera.
	 */

	constructor(camera) {

		super({
			name: "CircleOfConfusionMaterial",
			defines: {
				DEPTH_PACKING: "0"
			},
			uniforms: {
				depthBuffer: new Uniform(null),
				focusDistance: new Uniform(0.0),
				focusRange: new Uniform(0.0),
				cameraNear: new Uniform(0.3),
				cameraFar: new Uniform(1000)
			},
			blending: NoBlending,
			depthWrite: false,
			depthTest: false,
			fragmentShader,
			vertexShader
		});

		/** @ignore */
		this.toneMapped = false;

		// TODO Added for backward-compatibility.
		this.uniforms.focalLength = this.uniforms.focusRange;

		this.adoptCameraSettings(camera);

	}

	/**
	 * The current near plane setting.
	 *
	 * @type {Number}
	 * @private
	 */

	get near() {

		return this.uniforms.cameraNear.value;

	}

	/**
	 * The current far plane setting.
	 *
	 * @type {Number}
	 * @private
	 */

	get far() {

		return this.uniforms.cameraFar.value;

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
	 * The focus distance. Range: [0.0, 1.0].
	 *
	 * @type {Number}
	 */

	get focusDistance() {

		return this.uniforms.focusDistance.value;

	}

	set focusDistance(value) {

		this.uniforms.focusDistance.value = value;

	}

	/**
	 * The focus distance in world units.
	 *
	 * @type {Number}
	 */

	get worldFocusDistance() {

		return -orthographicDepthToViewZ(this.focusDistance, this.near, this.far);

	}

	set worldFocusDistance(value) {

		this.focusDistance = viewZToOrthographicDepth(-value, this.near, this.far);

	}

	/**
	 * Returns the focus distance.
	 *
	 * @deprecated Use focusDistance instead.
	 * @return {Number} The focus distance.
	 */

	getFocusDistance(value) {

		this.uniforms.focusDistance.value = value;

	}

	/**
	 * Sets the focus distance.
	 *
	 * @deprecated Use focusDistance instead.
	 * @param {Number} value - The focus distance.
	 */

	setFocusDistance(value) {

		this.uniforms.focusDistance.value = value;

	}

	/**
	 * The focal length.
	 *
	 * @deprecated Renamed to focusRange.
	 * @type {Number}
	 */

	get focalLength() {

		return this.focusRange;

	}

	set focalLength(value) {

		this.focusRange = value;

	}

	/**
	 * The focus range. Range: [0.0, 1.0].
	 *
	 * @type {Number}
	 */

	get focusRange() {

		return this.uniforms.focusRange.value;

	}

	set focusRange(value) {

		this.uniforms.focusRange.value = value;

	}

	/**
	 * The focus range in world units.
	 *
	 * @type {Number}
	 */

	get worldFocusRange() {

		return -orthographicDepthToViewZ(this.focusRange, this.near, this.far);

	}

	set worldFocusRange(value) {

		this.focusRange = viewZToOrthographicDepth(-value, this.near, this.far);

	}

	/**
	 * Returns the focal length.
	 *
	 * @deprecated Use focusRange instead.
	 * @return {Number} The focal length.
	 */

	getFocalLength(value) {

		return this.focusRange;

	}

	/**
	 * Sets the focal length.
	 *
	 * @deprecated Use focusRange instead.
	 * @param {Number} value - The focal length.
	 */

	setFocalLength(value) {

		this.focusRange = value;

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
