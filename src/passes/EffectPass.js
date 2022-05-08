import { BasicDepthPacking, UnsignedByteType } from "three";
import { BlendFunction } from "../effects/blending";
import { EffectAttribute } from "../effects/Effect";
import { EffectMaterial } from "../materials";
import { Pass } from "./Pass";

/**
 * Prefixes substrings within the given strings.
 *
 * @private
 * @param {String} prefix - A prefix.
 * @param {String[]} substrings - The substrings.
 * @param {Map<String, String>} strings - A collection of named strings.
 */

function prefixSubstrings(prefix, substrings, strings) {

	for(const substring of substrings) {

		const prefixed = "$1" + prefix + substring.charAt(0).toUpperCase() + substring.slice(1);
		const regExp = new RegExp("([^\\.])(\\b" + substring + "\\b)", "g");

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

	const shaders = new Map([
		["fragment", effect.getFragmentShader()],
		["vertex", effect.getVertexShader()]
	]);

	const mainImageExists = (shaders.get("fragment") !== undefined && /mainImage/.test(shaders.get("fragment")));
	const mainUvExists = (shaders.get("fragment") !== undefined && /mainUv/.test(shaders.get("fragment")));

	let varyings = [], names = [];
	let transformedUv = false, readDepth = false;

	if(shaders.get("fragment") === undefined) {

		console.error("Missing fragment shader", effect);

	} else if(mainUvExists && (attributes & EffectAttribute.CONVOLUTION) !== 0) {

		console.error("Effects that transform UV coordinates are incompatible with convolution effects", effect);

	} else if(!mainImageExists && !mainUvExists) {

		console.error("The fragment shader contains neither a mainImage nor a mainUv function", effect);

	} else {

		const functionRegExp = /(?:\w+\s+(\w+)\([\w\s,]*\)\s*{[^}]+})/g;
		const Section = EffectMaterial.Section;

		if(mainUvExists) {

			const code = `\t${prefix}MainUv(UV);\n`;
			shaderParts.set(Section.FRAGMENT_MAIN_UV, shaderParts.get(Section.FRAGMENT_MAIN_UV) + code);
			transformedUv = true;

		}

		if(shaders.get("vertex") !== null && /mainSupport/.test(shaders.get("vertex"))) {

			// Build the mainSupport call (with optional uv parameter).
			let string = `\t${prefix}MainSupport(`;
			string += /mainSupport *\([\w\s]*?uv\s*?\)/.test(shaders.get("vertex")) ? "vUv);\n" : ");\n";
			shaderParts.set(Section.VERTEX_MAIN_SUPPORT, shaderParts.get(Section.VERTEX_MAIN_SUPPORT) + string);

			// Collect names of varyings and functions.
			varyings = varyings.concat([...shaders.get("vertex").matchAll(/(?:varying\s+\w+\s+(\w*))/g)].map(m => m[1]));
			names = names.concat(varyings).concat([...shaders.get("vertex").matchAll(functionRegExp)].map(m => m[1]));

		}

		// Assemble all names while ignoring parameters of function-like macros.
		names = names.concat([...shaders.get("fragment").matchAll(functionRegExp)].map(m => m[1]));
		names = names.concat([...effect.defines.keys()].map((s) => s.replace(/\([\w\s,]*\)/g, "")));
		names = names.concat([...effect.uniforms.keys()]);

		// Store prefixed uniforms and macros.
		effect.uniforms.forEach((val, key) => uniforms.set(prefix + key.charAt(0).toUpperCase() + key.slice(1), val));
		effect.defines.forEach((val, key) => defines.set(prefix + key.charAt(0).toUpperCase() + key.slice(1), val));

		// Prefix varyings, functions, uniforms and macro values.
		prefixSubstrings(prefix, names, defines);
		prefixSubstrings(prefix, names, shaders);

		// Collect unique blend modes.
		const blendMode = effect.blendMode;
		blendModes.set(blendMode.blendFunction, blendMode);

		if(mainImageExists) {

			const depthParamRegExp = /MainImage *\([\w\s,]*?depth[\w\s,]*?\)/;
			let string = `${prefix}MainImage(color0, UV, `;

			// The effect may sample depth in a different shader.
			if((attributes & EffectAttribute.DEPTH) !== 0 && depthParamRegExp.test(shaders.get("fragment"))) {

				string += "depth, ";
				readDepth = true;

			}

			string += "color1);\n\t";

			// Include the blend opacity uniform of this effect.
			const blendOpacity = prefix + "BlendOpacity";
			uniforms.set(blendOpacity, blendMode.opacity);

			// Blend the result of this effect with the input color.
			string += `color0 = blend${blendMode.blendFunction}(color0, color1, ${blendOpacity});\n\n\t`;
			shaderParts.set(Section.FRAGMENT_MAIN_IMAGE, shaderParts.get(Section.FRAGMENT_MAIN_IMAGE) + string);
			string = `uniform float ${blendOpacity};\n\n`;
			shaderParts.set(Section.FRAGMENT_HEAD, shaderParts.get(Section.FRAGMENT_HEAD) + string);

		}

		// Include the modified code in the final shader.
		shaderParts.set(Section.FRAGMENT_HEAD, shaderParts.get(Section.FRAGMENT_HEAD) + shaders.get("fragment") + "\n");

		if(shaders.get("vertex") !== null) {

			shaderParts.set(Section.VERTEX_HEAD, shaderParts.get(Section.VERTEX_HEAD) + shaders.get("vertex") + "\n");

		}

	}

	return { varyings, transformedUv, readDepth };

}

/**
 * An effect pass.
 *
 * Use this pass to combine {@link Effect} instances.
 *
 * @implements {EventListener}
 */

export class EffectPass extends Pass {

	/**
	 * Constructs a new effect pass.
	 *
	 * @param {Camera} camera - The main camera.
	 * @param {...Effect} effects - The effects that will be rendered by this pass.
	 */

	constructor(camera, ...effects) {

		super("EffectPass");

		this.fullscreenMaterial = new EffectMaterial(null, null, null, camera);

		/**
		 * An event listener that forwards events to {@link handleEvent}.
		 *
		 * @type {EventListener}
		 * @private
		 */

		this.listener = (event) => this.handleEvent(event);

		/**
		 * The effects.
		 *
		 * Use `updateMaterial` or `recompile` after changing the effects and consider calling `dispose` to free resources
		 * of unused effects.
		 *
		 * @type {Effect[]}
		 * @private
		 */

		this.effects = [];
		this.setEffects(effects);

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
		 * The amount of shader uniforms that this pass uses.
		 *
		 * @type {Number}
		 * @private
		 */

		this.uniformCount = 0;

		/**
		 * The amount of shader varyings that this pass uses.
		 *
		 * @type {Number}
		 * @private
		 */

		this.varyingCount = 0;

		/**
		 * A time offset.
		 *
		 * Elapsed time will start at this value.
		 *
		 * @type {Number}
		 * @deprecated
		 */

		this.minTime = 1.0;

		/**
		 * The maximum time.
		 *
		 * If the elapsed time exceeds this value, it will be reset.
		 *
		 * @type {Number}
		 * @deprecated
		 */

		this.maxTime = Number.POSITIVE_INFINITY;

	}

	/**
	 * Indicates whether this pass encodes its output when rendering to screen.
	 *
	 * @type {Boolean}
	 * @deprecated Use fullscreenMaterial.encodeOutput instead.
	 */

	get encodeOutput() {

		return this.fullscreenMaterial.encodeOutput;

	}

	set encodeOutput(value) {

		this.fullscreenMaterial.encodeOutput = value;

	}

	/**
	 * Indicates whether dithering is enabled.
	 *
	 * @type {Boolean}
	 */

	get dithering() {

		return this.fullscreenMaterial.dithering;

	}

	set dithering(value) {

		const material = this.fullscreenMaterial;
		material.dithering = value;
		material.needsUpdate = true;

	}

	/**
	 * Sets the effects.
	 *
	 * @param {Effect[]} effects - The effects.
	 * @protected
	 */

	setEffects(effects) {

		for(const effect of this.effects) {

			effect.removeEventListener("change", this.listener);

		}

		this.effects = effects.sort((a, b) => (b.attributes - a.attributes));

		for(const effect of this.effects) {

			effect.addEventListener("change", this.listener);

		}

	}

	/**
	 * Checks if the required resources are within limits.
	 *
	 * @private
	 */

	verifyResources() {

		if(this.renderer !== null) {

			const capabilities = this.renderer.capabilities;
			let max = Math.min(capabilities.maxFragmentUniforms, capabilities.maxVertexUniforms);

			if(this.uniformCount > max) {

				console.warn("The current rendering context doesn't support more than " +
					max + " uniforms, but " + this.uniformCount + " were defined");

			}

			max = capabilities.maxVaryings;

			if(this.varyingCount > max) {

				console.warn("The current rendering context doesn't support more than " +
					max + " varyings, but " + this.varyingCount + " were defined");

			}

		}

	}

	/**
	 * Updates the compound shader material.
	 *
	 * @protected
	 */

	updateMaterial() {

		const Section = EffectMaterial.Section;
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
		let transformedUv = false, readDepth = false;

		for(const effect of this.effects) {

			if(effect.blendMode.blendFunction === BlendFunction.SKIP) {

				// Check if this effect relies on depth and continue.
				attributes |= (effect.getAttributes() & EffectAttribute.DEPTH);

			} else if((attributes & effect.getAttributes() & EffectAttribute.CONVOLUTION) !== 0) {

				console.error("Convolution effects cannot be merged", effect);

			} else {

				attributes |= effect.getAttributes();

				const prefix = ("e" + id++);
				const result = integrateEffect(prefix, effect, shaderParts, blendModes, defines, uniforms, attributes);
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
		const blendRegExp = /\bblend\b/g;

		for(const blendMode of blendModes.values()) {

			const code = blendMode.getShaderCode().replace(blendRegExp, `blend${blendMode.blendFunction}`);
			shaderParts.set(Section.FRAGMENT_HEAD, shaderParts.get(Section.FRAGMENT_HEAD) + code + "\n");

		}

		// Check if any effect relies on depth.
		if((attributes & EffectAttribute.DEPTH) !== 0) {

			// Only read depth if any effect actually uses this information.
			if(readDepth) {

				const code = "float depth = readDepth(UV);\n\n\t";
				shaderParts.set(Section.FRAGMENT_MAIN_IMAGE, code + shaderParts.get(Section.FRAGMENT_MAIN_IMAGE));

			}

			// Only request a depth texture if none has been provided yet.
			this.needsDepthTexture = (this.getDepthTexture() === null);

		} else {

			this.needsDepthTexture = false;

		}

		// Check if any effect transforms UVs in the fragment shader.
		if(transformedUv) {

			const code = "vec2 transformedUv = vUv;\n";
			shaderParts.set(Section.FRAGMENT_MAIN_UV, code + shaderParts.get(Section.FRAGMENT_MAIN_UV));
			defines.set("UV", "transformedUv");

		} else {

			defines.set("UV", "vUv");

		}

		// Ensure that leading preprocessor directives start at a new line.
		shaderParts.forEach((value, key, map) => map.set(key, value.trim().replace(/^#/, "\n#")));

		this.uniformCount = uniforms.size;
		this.varyingCount = varyings;

		this.skipRendering = (id === 0);
		this.needsSwap = !this.skipRendering;

		this.fullscreenMaterial
			.setShaderParts(shaderParts)
			.setExtensions(extensions)
			.setUniforms(uniforms)
			.setDefines(defines);

	}

	/**
	 * Rebuilds the shader material.
	 */

	recompile() {

		this.updateMaterial();
		this.verifyResources();

	}

	/**
	 * Returns the current depth texture.
	 *
	 * @return {Texture} The current depth texture, or null if there is none.
	 */

	getDepthTexture() {

		return this.fullscreenMaterial.depthBuffer;

	}

	/**
	 * Sets the depth texture.
	 *
	 * @param {Texture} depthTexture - A depth texture.
	 * @param {DepthPackingStrategies} [depthPacking=BasicDepthPacking] - The depth packing.
	 */

	setDepthTexture(depthTexture, depthPacking = BasicDepthPacking) {

		this.fullscreenMaterial.depthBuffer = depthTexture;
		this.fullscreenMaterial.depthPacking = depthPacking;

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

		for(const effect of this.effects) {

			effect.update(renderer, inputBuffer, deltaTime);

		}

		if(!this.skipRendering || this.renderToScreen) {

			const material = this.fullscreenMaterial;
			material.inputBuffer = inputBuffer.texture;
			material.time += deltaTime;

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

		this.fullscreenMaterial.setSize(width, height);

		for(const effect of this.effects) {

			effect.setSize(width, height);

		}

	}

	/**
	 * Performs initialization tasks.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {Boolean} alpha - Whether the renderer uses the alpha channel or not.
	 * @param {Number} frameBufferType - The type of the main frame buffers.
	 */

	initialize(renderer, alpha, frameBufferType) {

		this.renderer = renderer;

		// Initialize effects before building the shader.
		for(const effect of this.effects) {

			effect.initialize(renderer, alpha, frameBufferType);

		}

		// Initialize the fullscreen material.
		this.updateMaterial();
		this.verifyResources();

		if(frameBufferType !== undefined && frameBufferType !== UnsignedByteType) {

			this.fullscreenMaterial.defines.FRAMEBUFFER_PRECISION_HIGH = "1";

		}

	}

	/**
	 * Deletes disposable objects.
	 */

	dispose() {

		super.dispose();

		for(const effect of this.effects) {

			effect.removeEventListener("change", this.listener);
			effect.dispose();

		}

	}

	/**
	 * Handles events.
	 *
	 * @param {Event} event - An event.
	 */

	handleEvent(event) {

		switch(event.type) {

			case "change":
				this.recompile();
				break;

		}

	}

}
