import { ShaderMaterial } from "three";

import fragment from "./glsl/shader.frag";
import vertex from "./glsl/shader.vert";

/**
 * A depth shader material.
 *
 * @class DepthMaterial
 * @submodule materials
 * @extends ShaderMaterial
 * @constructor
 * @param {PerspectiveCamera} [camera] - A camera.
 */

export class DepthMaterial extends ShaderMaterial {

	constructor(camera = null) {

		super({

			type: "DepthMaterial",

			uniforms: {

				cameraNear: { value: 0.1 },
				cameraFar: { value: 2000 },

				tDepth: { value: null }

			},

			fragmentShader: fragment,
			vertexShader: vertex,

			depthWrite: false,
			depthTest: false

		});

		if(camera !== null) { this.adoptCameraSettings(camera); }

	}

	/**
	 * Adopts the settings of the given camera.
	 *
	 * @method adoptCameraSettings
	 * @param {PerspectiveCamera} camera - A camera.
	 */

	adoptCameraSettings(camera) {

		this.uniforms.cameraNear.value = camera.near;
		this.uniforms.cameraFar.value = camera.far;

	}

}
