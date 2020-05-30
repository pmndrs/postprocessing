import { Matrix4, PerspectiveCamera, ShaderMaterial, Uniform, Vector2 } from "three";

import fragmentShader from "./glsl/ssao/shader.frag";
import vertexShader from "./glsl/ssao/shader.vert";

/**
 * A Screen Space Ambient Occlusion (SSAO) shader material.
 */

export class SSAOMaterial extends ShaderMaterial {

	/**
	 * Constructs a new SSAO material.
	 *
	 * @param {Camera} camera - A camera.
	 */

	constructor(camera) {

		super({

			type: "SSAOMaterial",

			defines: {
				SAMPLES_INT: "0",
				SAMPLES_FLOAT: "0.0",
				SPIRAL_TURNS: "0.0",
				RADIUS: "1.0",
				RADIUS_SQ: "1.0"
			},

			uniforms: {

				normalDepthBuffer: new Uniform(null),
				noiseTexture: new Uniform(null),

				inverseProjectionMatrix: new Uniform(new Matrix4()),
				projectionMatrix: new Uniform(new Matrix4()),
				texelSize: new Uniform(new Vector2()),
				projectionScale: new Uniform(1.0),
				cameraNear: new Uniform(0.0),
				cameraFar: new Uniform(0.0),

				distanceCutoff: new Uniform(new Vector2()),
				proximityCutoff: new Uniform(new Vector2()),
				noiseScale: new Uniform(new Vector2()),
				intensity: new Uniform(1.0),
				bias: new Uniform(0.0)

			},

			fragmentShader,
			vertexShader,

			depthWrite: false,
			depthTest: false

		});

		/** @ignore */
		this.toneMapped = false;

		this.adoptCameraSettings(camera);

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
	 * @param {Camera} [camera=null] - A camera.
	 */

	adoptCameraSettings(camera = null) {

		if(camera !== null) {

			const uniforms = this.uniforms;

			uniforms.cameraNear.value = camera.near;
			uniforms.cameraFar.value = camera.far;
			uniforms.projectionScale.value = 1.0 / (2.0 * Math.tan(camera.fov * 0.5));

			if(camera instanceof PerspectiveCamera) {

				this.defines.PERSPECTIVE_CAMERA = "1";

			} else {

				delete this.defines.PERSPECTIVE_CAMERA;

			}

			this.needsUpdate = true;

		}

	}

}
