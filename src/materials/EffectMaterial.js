import { BasicDepthPacking, NoBlending, PerspectiveCamera, REVISION, ShaderMaterial, Uniform, Vector2 } from "three";
import { EffectShaderSection as Section } from "../enums";

import fragmentTemplate from "./glsl/effect.frag";
import vertexTemplate from "./glsl/effect.vert";

/**
 * An effect material for compound shaders. Supports dithering.
 *
 * @implements {Resizable}
 */

export class EffectMaterial extends ShaderMaterial {

	/**
	 * Constructs a new effect material.
	 *
	 * @param {Map<String, String>} [shaderParts] - Deprecated. Use setShaderData instead.
	 * @param {Map<String, String>} [defines] - Deprecated. Use setShaderData instead.
	 * @param {Map<String, Uniform>} [uniforms] - Deprecated. Use setShaderData instead.
	 * @param {Camera} [camera] - A camera.
	 * @param {Boolean} [dithering=false] - Deprecated.
	 */

	constructor(shaderParts, defines, uniforms, camera, dithering = false) {

		super({
			name: "EffectMaterial",
			defines: {
				THREE_REVISION: REVISION.replace(/\D+/g, ""),
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
			blending: NoBlending,
			depthWrite: false,
			depthTest: false,
			dithering
		});

		/** @ignore */
		this.toneMapped = false;

		if(shaderParts) {

			this.setShaderParts(shaderParts);

		}

		if(defines) {

			this.setDefines(defines);

		}

		if(uniforms) {

			this.setUniforms(uniforms);

		}

		this.adoptCameraSettings(camera);

	}

	/**
	 * The input buffer.
	 *
	 * @type {Texture}
	 */

	set inputBuffer(value) {

		this.uniforms.inputBuffer.value = value;

	}

	/**
	 * Sets the input buffer.
	 *
	 * @deprecated Use inputBuffer instead.
	 * @param {Texture} value - The input buffer.
	 */

	setInputBuffer(value) {

		this.uniforms.inputBuffer.value = value;

	}

	/**
	 * The depth buffer.
	 *
	 * @type {Texture}
	 */

	get depthBuffer() {

		return this.uniforms.depthBuffer.value;

	}

	set depthBuffer(value) {

		this.uniforms.depthBuffer.value = value;

	}

	/**
	 * The depth packing strategy.
	 *
	 * @type {DepthPackingStrategies}
	 */

	get depthPacking() {

		return Number(this.defines.DEPTH_PACKING);

	}

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
	 * Sets the shader data.
	 *
	 * @param {EffectShaderData} data - The shader data.
	 * @return {EffectMaterial} This material.
	 */

	setShaderData(data) {

		this.setShaderParts(data.shaderParts);
		this.setDefines(data.defines);
		this.setUniforms(data.uniforms);
		this.setExtensions(data.extensions);

	}

	/**
	 * Sets the shader parts.
	 *
	 * @deprecated Use setShaderData instead.
	 * @param {Map<String, String>} shaderParts - A collection of shader snippets. See {@link EffectShaderSection}.
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
	 * @deprecated Use setShaderData instead.
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
	 * @deprecated Use setShaderData instead.
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
	 * Sets the required shader extensions.
	 *
	 * @deprecated Use setShaderData instead.
	 * @param {Set<WebGLExtension>} extensions - A collection of extensions.
	 * @return {EffectMaterial} This material.
	 */

	setExtensions(extensions) {

		this.extensions = {};

		for(const extension of extensions) {

			this.extensions[extension] = true;

		}

		return this;

	}

	/**
	 * Indicates whether output encoding is enabled.
	 *
	 * @type {Boolean}
	 */

	get encodeOutput() {

		return (this.defines.ENCODE_OUTPUT !== undefined);

	}

	set encodeOutput(value) {

		if(this.encodeOutput !== value) {

			if(value) {

				this.defines.ENCODE_OUTPUT = "1";

			} else {

				delete this.defines.ENCODE_OUTPUT;

			}

			this.needsUpdate = true;

		}

	}

	/**
	 * Indicates whether output encoding is enabled.
	 *
	 * @deprecated Use encodeOutput instead.
	 * @return {Boolean} Whether output encoding is enabled.
	 */

	isOutputEncodingEnabled(value) {

		return this.encodeOutput;

	}

	/**
	 * Enables or disables output encoding.
	 *
	 * @deprecated Use encodeOutput instead.
	 * @param {Boolean} value - Whether output encoding should be enabled.
	 */

	setOutputEncodingEnabled(value) {

		this.encodeOutput = value;

	}

	/**
	 * The time in seconds.
	 *
	 * @type {Number}
	 */

	get time() {

		return this.uniforms.time.value;

	}

	set time(value) {

		this.uniforms.time.value = value;

	}

	/**
	 * Sets the delta time.
	 *
	 * @deprecated Use time instead.
	 * @param {Number} value - The delta time in seconds.
	 */

	setDeltaTime(value) {

		this.uniforms.time.value += value;

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

	/**
	 * Sets the resolution.
	 *
	 * @param {Number} width - The width.
	 * @param {Number} height - The height.
	 */

	setSize(width, height) {

		const uniforms = this.uniforms;
		uniforms.resolution.value.set(width, height);
		uniforms.texelSize.value.set(1.0 / width, 1.0 / height);
		uniforms.aspect.value = width / height;

	}

	/**
	 * An enumeration of shader code placeholders.
	 *
	 * @deprecated Use EffectShaderSection instead.
	 * @type {Object}
	 */

	static get Section() {

		return Section;

	}

}
