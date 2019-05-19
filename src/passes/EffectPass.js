import { BlendFunction } from "../effects/blending";
import { EffectAttribute } from "../effects/Effect.js";
import { EffectMaterial, Section } from "../materials";
import { Pass } from "./Pass.js";

/**
 * Finds and collects substrings that match the given regular expression.
 *
 * @private
 * @param {RegExp} regExp - A regular expression.
 * @param {String} string - A string.
 * @return {String[]} The matching substrings.
 */

function findSubstrings(regExp, string) {

	const substrings = [];
	let result;

	while((result = regExp.exec(string)) !== null) {

		substrings.push(result[1]);

	}

	return substrings;

}

/**
 * Prefixes substrings within the given strings.
 *
 * @private
 * @param {String} prefix - A prefix.
 * @param {String[]} substrings - The substrings.
 * @param {Map<String, String>} strings - A collection of named strings.
 */

function prefixSubstrings(prefix, substrings, strings) {

	let prefixed, regExp;

	for(const substring of substrings) {

		prefixed = "$1" + prefix + substring.charAt(0).toUpperCase() + substring.slice(1);
		regExp = new RegExp("([^\\.])(\\b" + substring + "\\b)", "g");

		for(const entry of strings.entries()) {

			if(entry[1] !== null) {

				strings.set(entry[0], entry[1].replace(regExp, prefixed));

			}

		}

	}

}

/**
 * Integrates the given effect.
 *
 * @private
 * @param {String} prefix - A prefix.
 * @param {Effect} effect - An effect.
 * @param {Map<String, String>} shaderParts - The shader parts.
 * @param {Map<BlendFunction, BlendMode>} blendModes - The blend modes.
 * @param {Map<String, String>} defines - The macro definitions.
 * @param {Map<String, Uniform>} uniforms - The uniforms.
 * @param {EffectAttribute} attributes - The global, collective attributes.
 * @return {Object} The results.
 * @property {String[]} varyings - The varyings used by the given effect.
 * @property {Boolean} transformedUv - Indicates whether the effect transforms UV coordinates in the fragment shader.
 * @property {Boolean} readDepth - Indicates whether the effect actually uses depth in the fragment shader.
 */

function integrateEffect(prefix, effect, shaderParts, blendModes, defines, uniforms, attributes) {

	const functionRegExp = /(?:\w+\s+(\w+)\([\w\s,]*\)\s*{[^}]+})/g;
	const varyingRegExp = /(?:varying\s+\w+\s+(\w*))/g;

	const blendMode = effect.blendMode;
	const shaders = new Map([
		["fragment", effect.fragmentShader],
		["vertex", effect.vertexShader]
	]);

	const mainImageExists = (shaders.get("fragment") !== undefined && shaders.get("fragment").indexOf("mainImage") >= 0);
	const mainUvExists = (shaders.get("fragment") !== undefined && shaders.get("fragment").indexOf("mainUv") >= 0);

	let varyings = [], names = [];
	let transformedUv = false;
	let readDepth = false;

	if(shaders.get("fragment") === undefined) {

		console.error("Missing fragment shader", effect);

	} else if(mainUvExists && (attributes & EffectAttribute.CONVOLUTION) !== 0) {

		console.error("Effects that transform UV coordinates are incompatible with convolution effects", effect);

	} else if(!mainImageExists && !mainUvExists) {

		console.error("The fragment shader contains neither a mainImage nor a mainUv function", effect);

	} else {

		if(mainUvExists) {

			shaderParts.set(Section.FRAGMENT_MAIN_UV, shaderParts.get(Section.FRAGMENT_MAIN_UV) +
				"\t" + prefix + "MainUv(UV);\n");

			transformedUv = true;

		}

		if(shaders.get("vertex") !== null && shaders.get("vertex").indexOf("mainSupport") >= 0) {

			let string = "\t" + prefix + "MainSupport(";

			// Check if the vertex shader expects uv coordinates.
			if(shaders.get("vertex").indexOf("uv") >= 0) {

				string += "vUv";

			}

			string += ");\n";

			shaderParts.set(Section.VERTEX_MAIN_SUPPORT,
				shaderParts.get(Section.VERTEX_MAIN_SUPPORT) + string);

			varyings = varyings.concat(findSubstrings(varyingRegExp, shaders.get("vertex")));
			names = names.concat(varyings).concat(findSubstrings(functionRegExp, shaders.get("vertex")));

		}

		names = names.concat(findSubstrings(functionRegExp, shaders.get("fragment")))
			.concat(Array.from(effect.uniforms.keys()))
			.concat(Array.from(effect.defines.keys()));

		// Store prefixed uniforms and macros.
		effect.uniforms.forEach((value, key) => uniforms.set(prefix + key.charAt(0).toUpperCase() + key.slice(1), value));
		effect.defines.forEach((value, key) => defines.set(prefix + key.charAt(0).toUpperCase() + key.slice(1), value));

		// Prefix varyings, functions, uniforms and macros.
		prefixSubstrings(prefix, names, defines);
		prefixSubstrings(prefix, names, shaders);

		// Collect unique blend modes.
		blendModes.set(blendMode.blendFunction, blendMode);

		if(mainImageExists) {

			let string = prefix + "MainImage(color0, UV, ";

			// The effect may sample depth in a different shader.
			if((attributes & EffectAttribute.DEPTH) !== 0 && shaders.get("fragment").indexOf("depth") >= 0) {

				string += "depth, ";
				readDepth = true;

			}

			string += "color1);\n\t";

			// Include the blend opacity uniform of this effect.
			const blendOpacity = prefix + "BlendOpacity";
			uniforms.set(blendOpacity, blendMode.opacity);

			// Blend the result of this effect with the input color.
			string += "color0 = blend" + blendMode.blendFunction +
				"(color0, color1, " + blendOpacity + ");\n\n\t";

			shaderParts.set(Section.FRAGMENT_MAIN_IMAGE,
				shaderParts.get(Section.FRAGMENT_MAIN_IMAGE) + string);

			shaderParts.set(Section.FRAGMENT_HEAD, shaderParts.get(Section.FRAGMENT_HEAD) +
				"uniform float " + blendOpacity + ";\n\n");

		}

		// Include the modified code in the final shader.
		shaderParts.set(Section.FRAGMENT_HEAD, shaderParts.get(Section.FRAGMENT_HEAD) +
			shaders.get("fragment") + "\n");

		if(shaders.get("vertex") !== null) {

			shaderParts.set(Section.VERTEX_HEAD, shaderParts.get(Section.VERTEX_HEAD) +
				shaders.get("vertex") + "\n");

		}

	}

	return { varyings, transformedUv, readDepth };

}

/**
 * An effect pass.
 *
 * Use this pass to combine {@link Effect} instances.
 */

export class EffectPass extends Pass {

	/**
	 * Constructs a new effect pass.
	 *
	 * The provided effects will be organized and merged for optimal performance.
	 *
	 * @param {Camera} camera - The main camera. The camera's type and settings will be available to all effects.
	 * @param {...Effect} effects - The effects that will be rendered by this pass.
	 */

	constructor(camera, ...effects) {

		super("EffectPass");

		/**
		 * The main camera.
		 *
		 * @type {Camera}
		 * @private
		 */

		this.mainCamera = camera;

		/**
		 * The effects, sorted by attribute priority, DESC.
		 *
		 * @type {Effect[]}
		 * @private
		 */

		this.effects = effects.sort((a, b) => (b.attributes - a.attributes));

		/**
		 * Indicates whether this pass should skip rendering.
		 *
		 * Effects will still be updated, even if this flag is true.
		 *
		 * @type {Boolean}
		 * @private
		 */

		this.skipRendering = false;

		/**
		 * Indicates whether dithering is enabled.
		 *
		 * @type {Boolean}
		 * @private
		 */

		this.quantize = false;

		/**
		 * The amount of shader uniforms that this pass uses.
		 *
		 * @type {Number}
		 * @private
		 */

		this.uniforms = 0;

		/**
		 * The amount of shader varyings that this pass uses.
		 *
		 * @type {Number}
		 * @private
		 */

		this.varyings = 0;

		/**
		 * A time offset.
		 *
		 * Elapsed time will start at this value.
		 *
		 * @type {Number}
		 */

		this.minTime = 1.0;

		/**
		 * The maximum time.
		 *
		 * If the elapsed time exceeds this value, it will be reset.
		 *
		 * @type {Number}
		 */

		this.maxTime = 1e3;

		this.setFullscreenMaterial(this.createMaterial());

	}

	/**
	 * Indicates whether dithering is enabled.
	 *
	 * Color quantization reduces banding artifacts but degrades performance.
	 *
	 * @type {Boolean}
	 */

	get dithering() {

		return this.quantize;

	}

	/**
	 * Enables or disables dithering.
	 *
	 * Note that some effects have their own dithering setting.
	 *
	 * @type {Boolean}
	 */

	set dithering(value) {

		if(this.quantize !== value) {

			const material = this.getFullscreenMaterial();

			if(material !== null) {

				material.dithering = value;
				material.needsUpdate = true;

			}

			this.quantize = value;

		}

	}

	/**
	 * Creates a compound shader material.
	 *
	 * @private
	 * @return {Material} The new material.
	 */

	createMaterial() {

		const blendRegExp = /\bblend\b/g;

		const shaderParts = new Map([
			[Section.FRAGMENT_HEAD, ""],
			[Section.FRAGMENT_MAIN_UV, ""],
			[Section.FRAGMENT_MAIN_IMAGE, ""],
			[Section.VERTEX_HEAD, ""],
			[Section.VERTEX_MAIN_SUPPORT, ""]
		]);

		const blendModes = new Map();
		const defines = new Map();
		const uniforms = new Map();
		const extensions = new Set();

		let id = 0, varyings = 0, attributes = 0;
		let transformedUv = false;
		let readDepth = false;
		let result;

		for(const effect of this.effects) {

			if(effect.blendMode.blendFunction === BlendFunction.SKIP) {

				// Check if this effect relies on depth and then continue.
				attributes |= (effect.attributes & EffectAttribute.DEPTH);

			} else if((attributes & EffectAttribute.CONVOLUTION) !== 0 && (effect.attributes & EffectAttribute.CONVOLUTION) !== 0) {

				console.error("Convolution effects cannot be merged", effect);

			} else {

				attributes |= effect.attributes;

				result = integrateEffect(("e" + id++), effect, shaderParts, blendModes, defines, uniforms, attributes);

				varyings += result.varyings.length;
				transformedUv = transformedUv || result.transformedUv;
				readDepth = readDepth || result.readDepth;

				if(effect.extensions !== null) {

					// Collect the WebGL extensions that are required by this effect.
					for(const extension of effect.extensions) {

						extensions.add(extension);

					}

				}

			}

		}

		// Integrate the relevant blend functions.
		for(const blendMode of blendModes.values()) {

			shaderParts.set(Section.FRAGMENT_HEAD, shaderParts.get(Section.FRAGMENT_HEAD) +
				blendMode.getShaderCode().replace(blendRegExp, "blend" + blendMode.blendFunction) + "\n");

		}

		// Check if any effect relies on depth.
		if((attributes & EffectAttribute.DEPTH) !== 0) {

			// Only read depth if any effect actually uses this information.
			if(readDepth) {

				shaderParts.set(Section.FRAGMENT_MAIN_IMAGE, "float depth = readDepth(UV);\n\n\t" +
					shaderParts.get(Section.FRAGMENT_MAIN_IMAGE));

			}

			this.needsDepthTexture = true;

		}

		// Check if any effect transforms UVs in the fragment shader.
		if(transformedUv) {

			shaderParts.set(Section.FRAGMENT_MAIN_UV, "vec2 transformedUv = vUv;\n" +
				shaderParts.get(Section.FRAGMENT_MAIN_UV));

			defines.set("UV", "transformedUv");

		} else {

			defines.set("UV", "vUv");

		}

		shaderParts.forEach((value, key, map) => map.set(key, value.trim()));

		this.uniforms = uniforms.size;
		this.varyings = varyings;

		this.skipRendering = (id === 0);
		this.needsSwap = !this.skipRendering;

		const material = new EffectMaterial(shaderParts, defines, uniforms, this.mainCamera, this.dithering);

		if(extensions.size > 0) {

			// Enable required WebGL extensions.
			for(const extension of extensions) {

				material.extensions[extension] = true;

			}

		}

		return material;

	}

	/**
	 * Destroys the current fullscreen shader material and builds a new one.
	 *
	 * Warning: This method performs a relatively expensive shader recompilation.
	 */

	recompile() {

		let material = this.getFullscreenMaterial();
		let width = 0, height = 0;
		let depthTexture = null;
		let depthPacking = 0;

		if(material !== null) {

			const resolution = material.uniforms.resolution.value;
			width = resolution.x; height = resolution.y;
			depthTexture = material.uniforms.depthBuffer.value;
			depthPacking = material.depthPacking;
			material.dispose();

			this.uniforms = 0;
			this.varyings = 0;

		}

		material = this.createMaterial();
		material.setSize(width, height);
		this.setFullscreenMaterial(material);
		this.setDepthTexture(depthTexture, depthPacking);

	}

	/**
	 * Returns the current depth texture.
	 *
	 * @return {Texture} The current depth texture, or null if there is none.
	 */

	getDepthTexture() {

		const material = this.getFullscreenMaterial();

		return (material !== null) ? material.uniforms.depthBuffer.value : null;

	}

	/**
	 * Sets the depth texture.
	 *
	 * @param {Texture} depthTexture - A depth texture.
	 * @param {Number} [depthPacking=0] - The depth packing.
	 */

	setDepthTexture(depthTexture, depthPacking = 0) {

		const material = this.getFullscreenMaterial();

		material.uniforms.depthBuffer.value = depthTexture;
		material.depthPacking = depthPacking;
		material.needsUpdate = true;

		for(const effect of this.effects) {

			effect.setDepthTexture(depthTexture, depthPacking);

		}

	}

	/**
	 * Renders the effect.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
	 * @param {WebGLRenderTarget} outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
	 * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
	 * @param {Boolean} [stencilTest] - Indicates whether a stencil mask is active.
	 */

	render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest) {

		const material = this.getFullscreenMaterial();
		const time = material.uniforms.time.value + deltaTime;

		for(const effect of this.effects) {

			effect.update(renderer, inputBuffer, deltaTime);

		}

		if(!this.skipRendering || this.renderToScreen) {

			material.uniforms.inputBuffer.value = inputBuffer.texture;
			material.uniforms.time.value = (time <= this.maxTime) ? time : this.minTime;
			renderer.setRenderTarget(this.renderToScreen ? null : outputBuffer);
			renderer.render(this.scene, this.camera);

		}

	}

	/**
	 * Updates the size of this pass.
	 *
	 * @param {Number} width - The width.
	 * @param {Number} height - The height.
	 */

	setSize(width, height) {

		this.getFullscreenMaterial().setSize(width, height);

		for(const effect of this.effects) {

			effect.setSize(width, height);

		}

	}

	/**
	 * Performs initialization tasks.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {Boolean} alpha - Whether the renderer uses the alpha channel or not.
	 */

	initialize(renderer, alpha) {

		const capabilities = renderer.capabilities;

		let max = Math.min(capabilities.maxFragmentUniforms, capabilities.maxVertexUniforms);

		if(this.uniforms > max) {

			console.warn("The current rendering context doesn't support more than " + max + " uniforms, but " + this.uniforms + " were defined");

		}

		max = capabilities.maxVaryings;

		if(this.varyings > max) {

			console.warn("The current rendering context doesn't support more than " + max + " varyings, but " + this.varyings + " were defined");

		}

		for(const effect of this.effects) {

			effect.initialize(renderer, alpha);

		}

	}

	/**
	 * Deletes disposable objects.
	 *
	 * This pass will be inoperative after this method was called!
	 */

	dispose() {

		super.dispose();

		for(const effect of this.effects) {

			effect.dispose();

		}

	}

}
