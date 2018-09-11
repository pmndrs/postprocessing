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

			fragmentShader: fragmentTemplate.replace(Section.FRAGMENT_HEAD, shaderParts.get(Section.FRAGMENT_HEAD))
				.replace(Section.FRAGMENT_MAIN_UV, shaderParts.get(Section.FRAGMENT_MAIN_UV))
				.replace(Section.FRAGMENT_MAIN_IMAGE, shaderParts.get(Section.FRAGMENT_MAIN_IMAGE)),

			vertexShader: vertexTemplate.replace(Section.VERTEX_HEAD, shaderParts.get(Section.VERTEX_HEAD))
				.replace(Section.VERTEX_MAIN_SUPPORT, shaderParts.get(Section.VERTEX_MAIN_SUPPORT)),

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

/**
 * An enumeration of shader code placeholders.
 *
 * @type {Object}
 * @property {String} FRAGMENT_HEAD - A placeholder for function and variable declarations inside the fragment shader.
 * @property {String} FRAGMENT_MAIN_UV - A placeholder UV transformations inside the fragment shader.
 * @property {String} FRAGMENT_MAIN_IMAGE - A placeholder for color calculations inside the fragment shader.
 * @property {String} VERTEX_HEAD - A placeholder for function and variable declarations inside the vertex shader.
 * @property {String} VERTEX_MAIN_SUPPORT - A placeholder for varying calculations inside the vertex shader.
 */

export const Section = {

	FRAGMENT_HEAD: "FRAGMENT_HEAD",
	FRAGMENT_MAIN_UV: "FRAGMENT_MAIN_UV",
	FRAGMENT_MAIN_IMAGE: "FRAGMENT_MAIN_IMAGE",
	VERTEX_HEAD: "VERTEX_HEAD",
	VERTEX_MAIN_SUPPORT: "VERTEX_MAIN_SUPPORT"

};
