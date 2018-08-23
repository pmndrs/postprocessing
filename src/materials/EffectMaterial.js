import { PerspectiveCamera, ShaderMaterial, Uniform, Vector2 } from "three";

import fragmentTemplate from "./glsl/effect/shader.frag";
import vertexTemplate from "./glsl/effect/shader.vert";

/**
 * An effect material for compound shaders.
 *
 * This material supports dithering.
 */

export class EffectMaterial extends ShaderMaterial {

	/**
	 * Constructs a new effect material.
	 *
	 * @param {Map<String, String>} shaderParts - A collection of shader snippets.
	 * @param {Map<String, String>} defines - A collection of preprocessor macro definitions.
	 * @param {Map<String, Uniform>} uniforms - A collection of uniforms.
	 * @param {Camera} [camera=null] - A camera.
	 * @param {Boolean} [dithering=false] - Whether dithering should be enabled.
	 */

	constructor(shaderParts, defines, uniforms, camera = null, dithering = false) {

		super({

			type: "EffectMaterial",

			uniforms: {

				inputBuffer: new Uniform(null),
				depthBuffer: new Uniform(null),

				resolution: new Uniform(new Vector2()),
				texelSize: new Uniform(new Vector2()),

				cameraNear: new Uniform(0.1),
				cameraFar: new Uniform(2000),
				aspect: new Uniform(1.0),
				time: new Uniform(0.0)

			},

			fragmentShader: fragmentTemplate.replace("FRAGMENT_HEAD", shaderParts.get("FRAGMENT_HEAD"))
				.replace("FRAGMENT_MAIN_UV", shaderParts.get("FRAGMENT_MAIN_UV"))
				.replace("FRAGMENT_MAIN_IMAGE", shaderParts.get("FRAGMENT_MAIN_IMAGE")),

			vertexShader: vertexTemplate.replace("VERTEX_HEAD", shaderParts.get("VERTEX_HEAD"))
				.replace("VERTEX_MAIN_SUPPORT", shaderParts.get("VERTEX_MAIN_SUPPORT")),

			dithering: dithering,
			depthWrite: false,
			depthTest: false

		});

		if(defines !== null) {

			for(const entry of defines.entries()) {

				this.defines[entry[0]] = entry[1];

			}

		}

		if(uniforms !== null) {

			for(const entry of uniforms.entries()) {

				this.uniforms[entry[0]] = entry[1];

			}

		}

		this.adoptCameraSettings(camera);

	}

	/**
	 * Sets the resolution.
	 *
	 * @param {Number} x - The width.
	 * @param {Number} y - The height.
	 */

	setResolution(x, y) {

		x = Math.max(x, 1.0);
		y = Math.max(y, 1.0);

		this.uniforms.resolution.value.set(x, y);
		this.uniforms.texelSize.value.set(1.0 / x, 1.0 / y);
		this.uniforms.aspect.value = x / y;

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
