import { BasicDepthPacking, NoBlending, PerspectiveCamera, ShaderMaterial, Uniform } from "three";

import fragmentShader from "./glsl/circle-of-confusion/shader.frag";
import vertexShader from "./glsl/common/shader.vert";

/**
 * A CoC shader material.
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
				focalLength: new Uniform(0.0),
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

		this.adoptCameraSettings(camera);

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
	 * The focus distance.
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
	 * @type {Number}
	 */

	get focalLength() {

		return this.uniforms.focalLength.value;

	}

	set focalLength(value) {

		this.uniforms.focalLength.value = value;

	}

	/**
	 * Returns the focal length.
	 *
	 * @deprecated Use focalLength instead.
	 * @return {Number} The focal length.
	 */

	getFocalLength(value) {

		this.uniforms.focalLength.value = value;

	}

	/**
	 * Sets the focal length.
	 *
	 * @deprecated Use focalLength instead.
	 * @param {Number} value - The focal length.
	 */

	setFocalLength(value) {

		this.uniforms.focalLength.value = value;

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
