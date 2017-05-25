import { ShaderMaterial, Uniform } from "three";

import fragment from "./glsl/depth/shader.frag";
import vertex from "./glsl/depth/shader.vert";

/**
 * A depth shader material.
 */

export class DepthMaterial extends ShaderMaterial {

	/**
	 * Constructs a new depth material.
	 *
	 * @param {PerspectiveCamera} [camera] - A camera.
	 */

	constructor(camera = null) {

		super({

			type: "DepthMaterial",

			uniforms: {

				cameraNear: new Uniform(0.1),
				cameraFar: new Uniform(2000),

				tDepth: new Uniform(null)

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
	 * @param {PerspectiveCamera} camera - A camera.
	 */

	adoptCameraSettings(camera) {

		this.uniforms.cameraNear.value = camera.near;
		this.uniforms.cameraFar.value = camera.far;

	}

}
