import { PerspectiveCamera, ShaderMaterial, Uniform, Vector2 } from "three";

import fragmentTemplate from "./glsl/effect/shader.frag";
import vertexTemplate from "./glsl/effect/shader.vert";

/**
 * An effect material for compound shaders.
 *
 * This material supports dithering.
 *
 * @implements {Resizable}
 */

export class EffectMaterial extends ShaderMaterial {

	/**
	 * Constructs a new effect material.
	 *
	 * @param {Map<String, String>} [shaderParts=null] - A collection of shader snippets. See {@link Section}.
	 * @param {Map<String, String>} [defines=null] - A collection of preprocessor macro definitions.
	 * @param {Map<String, Uniform>} [uniforms=null] - A collection of uniforms.
	 * @param {Camera} [camera=null] - A camera.
	 * @param {Boolean} [dithering=false] - Whether dithering should be enabled.
	 */

	constructor(shaderParts = null, defines = null, uniforms = null, camera = null, dithering = false) {

		super({

			type: "EffectMaterial",

			defines: {
				DEPTH_PACKING: "0",
				ENCODE_OUTPUT: "1"
			},

			uniforms: {
				inputBuffer: new Uniform(null),
				depthBuffer: new Uniform(null),
				resolution: new Uniform(new Vector2()),
				texelSize: new Uniform(new Vector2()),
				cameraNear: new Uniform(0.3),
				cameraFar: new Uniform(1000.0),
				aspect: new Uniform(1.0),
				time: new Uniform(0.0)
			},

			depthWrite: false,
			depthTest: false,
			dithering

		});

		/** @ignore */
		this.toneMapped = false;

		if(shaderParts !== null) {

			this.setShaderParts(shaderParts);

		}

		if(defines !== null) {

			this.setDefines(defines);

		}

		if(uniforms !== null) {

			this.setUniforms(uniforms);

		}

		this.adoptCameraSettings(camera);

	}

	/**
	 * The current depth packing.
	 *
	 * @type {Number}
	 */

	get depthPacking() {

		return Number(this.defines.DEPTH_PACKING);

	}

	/**
	 * Sets the depth packing.
	 *
	 * Use `BasicDepthPacking` or `RGBADepthPacking` if your depth texture
	 * contains packed depth.
	 *
	 * @type {Number}
	 */

	set depthPacking(value) {

		this.defines.DEPTH_PACKING = value.toFixed(0);
		this.needsUpdate = true;

	}

	/**
	 * Sets the shader parts.
	 *
	 * @param {Map<String, String>} shaderParts - A collection of shader snippets. See {@link Section}.
	 * @return {EffectMaterial} This material.
	 */

	setShaderParts(shaderParts) {

		this.fragmentShader = fragmentTemplate
			.replace(Section.FRAGMENT_HEAD, shaderParts.get(Section.FRAGMENT_HEAD))
			.replace(Section.FRAGMENT_MAIN_UV, shaderParts.get(Section.FRAGMENT_MAIN_UV))
			.replace(Section.FRAGMENT_MAIN_IMAGE, shaderParts.get(Section.FRAGMENT_MAIN_IMAGE));

		this.vertexShader = vertexTemplate
			.replace(Section.VERTEX_HEAD, shaderParts.get(Section.VERTEX_HEAD))
			.replace(Section.VERTEX_MAIN_SUPPORT, shaderParts.get(Section.VERTEX_MAIN_SUPPORT));

		this.needsUpdate = true;

		return this;

	}

	/**
	 * Sets the shader macros.
	 *
	 * @param {Map<String, String>} defines - A collection of preprocessor macro definitions.
	 * @return {EffectMaterial} This material.
	 */

	setDefines(defines) {

		for(const entry of defines.entries()) {

			this.defines[entry[0]] = entry[1];

		}

		this.needsUpdate = true;

		return this;

	}

	/**
	 * Sets the shader uniforms.
	 *
	 * @param {Map<String, Uniform>} uniforms - A collection of uniforms.
	 * @return {EffectMaterial} This material.
	 */

	setUniforms(uniforms) {

		for(const entry of uniforms.entries()) {

			this.uniforms[entry[0]] = entry[1];

		}

		return this;

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

			this.needsUpdate = true;

		}

	}

	/**
	 * Sets the resolution.
	 *
	 * @param {Number} width - The width.
	 * @param {Number} height - The height.
	 */

	setSize(width, height) {

		const w = Math.max(width, 1);
		const h = Math.max(height, 1);

		this.uniforms.resolution.value.set(w, h);
		this.uniforms.texelSize.value.set(1.0 / w, 1.0 / h);
		this.uniforms.aspect.value = w / h;

	}

}

/**
 * An enumeration of shader code placeholders used by the {@link EffectPass}.
 *
 * @type {Object}
 * @property {String} FRAGMENT_HEAD - A placeholder for function and variable declarations inside the fragment shader.
 * @property {String} FRAGMENT_MAIN_UV - A placeholder for UV transformations inside the fragment shader.
 * @property {String} FRAGMENT_MAIN_IMAGE - A placeholder for color calculations inside the fragment shader.
 * @property {String} VERTEX_HEAD - A placeholder for function and variable declarations inside the vertex shader.
 * @property {String} VERTEX_MAIN_SUPPORT - A placeholder for supporting calculations inside the vertex shader.
 */

export const Section = {

	FRAGMENT_HEAD: "FRAGMENT_HEAD",
	FRAGMENT_MAIN_UV: "FRAGMENT_MAIN_UV",
	FRAGMENT_MAIN_IMAGE: "FRAGMENT_MAIN_IMAGE",
	VERTEX_HEAD: "VERTEX_HEAD",
	VERTEX_MAIN_SUPPORT: "VERTEX_MAIN_SUPPORT"

};
