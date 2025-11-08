import { BasicDepthPacking, NoBlending, PerspectiveCamera, ShaderMaterial, Uniform } from "three";

import fragmentShader from "./glsl/circle-of-confusion.frag";
import vertexShader from "./glsl/common.vert";

/**
 * A Circle of Confusion shader material.
 */

export class CircleOfConfusionMaterial extends ShaderMaterial {

	/**
	 * Constructs a new CoC material.
	 *
	 * @param {Camera} camera - A camera.
	 */

	constructor(camera = null) {

		super({
			name: "CircleOfConfusionMaterial",
			defines: {
				DEPTH_PACKING: "0"
			},
			uniforms: {
				depthBuffer: new Uniform(null),
				projectionMatrix: new Uniform(null),
				projectionMatrixInverse: new Uniform(null),
				cameraNear: new Uniform(0.3),
				cameraFar: new Uniform(1000),
				focusDistance: new Uniform(0.0),
				focusRange: new Uniform(0.0)
			},
			blending: NoBlending,
			toneMapped: false,
			depthWrite: false,
			depthTest: false,
			fragmentShader,
			vertexShader
		});

		// TODO Added for backward-compatibility.
		this.uniforms.focalLength = this.uniforms.focusRange;

		if(camera !== null) {

			this.copyCameraSettings(camera);

		}

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
	 * The focus distance in world units.
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
	 * @deprecated Use focusDistance instead.
	 * @type {Number}
	 */

	get worldFocusDistance() {

		return this.focusDistance;

	}

	set worldFocusDistance(value) {

		this.focusDistance = value;

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
	 * @deprecated Use focusRange instead.
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
	 * @deprecated Use focusRange instead.
	 * @type {Number}
	 */

	get worldFocusRange() {

		return this.focusRange;

	}

	set worldFocusRange(value) {

		this.focusRange = value;

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
	 * Copies the settings of the given camera.
	 *
	 * @deprecated Use copyCameraSettings instead.
	 * @param {Camera} camera - A camera.
	 */

	adoptCameraSettings(camera) {

		this.copyCameraSettings(camera);

	}

	/**
	 * Copies the settings of the given camera.
	 *
	 * @param {Camera} camera - A camera.
	 */

	copyCameraSettings(camera) {

		this.uniforms.projectionMatrix.value = camera.projectionMatrix;
		this.uniforms.projectionMatrixInverse.value = camera.projectionMatrixInverse;

		this.uniforms.cameraNear.value = camera.near;
		this.uniforms.cameraFar.value = camera.far;

		const perspectiveCameraDefined = (this.defines.PERSPECTIVE_CAMERA !== undefined);

		if(camera instanceof PerspectiveCamera) {

			if(!perspectiveCameraDefined) {

				this.defines.PERSPECTIVE_CAMERA = true;
				this.needsUpdate = true;

			}

		} else if(perspectiveCameraDefined) {

			delete this.defines.PERSPECTIVE_CAMERA;
			this.needsUpdate = true;

		}

	}

}
