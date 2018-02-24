import { PerspectiveCamera, ShaderMaterial, Uniform } from "three";

import fragment from "./glsl/depth-comparison/shader.frag";
import vertex from "./glsl/depth-comparison/shader.vert";

/**
 * A depth comparison shader material.
 */

export class DepthComparisonMaterial extends ShaderMaterial {

	/**
	 * Constructs a new depth comparison material.
	 *
	 * @param {Texture} [depthTexture=null] - A depth texture.
	 * @param {PerspectiveCamera} [camera] - A camera.
	 */

	constructor(depthTexture = null, camera) {

		super({

			type: "DepthComparisonMaterial",

			uniforms: {

				tDepth: new Uniform(depthTexture),
				cameraNear: new Uniform(0.1),
				cameraFar: new Uniform(2000)

			},

			fragmentShader: fragment,
			vertexShader: vertex,

			depthWrite: false,
			depthTest: false,

			morphTargets: true,
			skinning: true

		});

		this.adoptCameraSettings(camera);

	}

	/**
	 * Adopts the settings of the given camera.
	 *
	 * @param {Camera} [camera=null] - A camera.
	 */

	adoptCameraSettings(camera = null) {

		if(camera !== null) {

			this.uniforms.cameraNear.value = camera.near;
			this.uniforms.cameraFar.value = camera.far;

			if(camera instanceof PerspectiveCamera) {

				this.defines.PERSPECTIVE_CAMERA = "1";

			} else {

				delete this.defines.PERSPECTIVE_CAMERA;

			}

		}

	}

}
