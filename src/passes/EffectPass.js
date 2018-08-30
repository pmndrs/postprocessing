import { BlendFunction } from "../effects/blending";
import { EffectType } from "../effects/Effect.js";
import { EffectMaterial } from "../materials";
import { Pass } from "./Pass.js";

/**
 * Prefixes substrings that match the given regular expression.
 *
 * @private
 * @param {String} prefix - A prefix.
 * @param {RegExp} regExp - A regular expression.
 * @param {String} string - The string to modify.
 * @return {Object} The modified string and the number of matches.
 * @property {String} string - The modified string.
 * @property {Number} occurrences - The number of matches.
 */

function prefixRegExp(prefix, regExp, string) {

	let occurrences = 0;
	let result, name;

	while((result = regExp.exec(string)) !== null) {

		name = result[1];

		string = string.replace(
			new RegExp(name, "g"),
			prefix + name.charAt(0).toUpperCase() + name.slice(1)
		);

		++occurrences;

	}

	return { string, occurrences };

}

/**
 * Prefixes variables and updates affected code.
 *
 * @private
 * @param {String} prefix - A prefix.
 * @param {Map} input - An input map of variables.
 * @param {Map} output - An output map.
 * @param {String[]} src - Source code that uses the given variables.
 */

function prefixVariables(prefix, input, output, src) {

	const l = src.length;

	let key, regExp, i;

	for(const entry of input.entries()) {

		key = prefix + entry[0].charAt(0).toUpperCase() + entry[0].slice(1);
		regExp = new RegExp("\\b" + entry[0] + "\\b", "g");

		output.set(key, entry[1]);

		for(i = 0; i < l; ++i) {

			src[i] = src[i].replace(regExp, key);

		}

	}

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
		 * The effects, sorted by type priority, DESC.
		 *
		 * @type {Effect[]}
		 * @private
		 */

		this.effects = effects.sort((a, b) => (a.type - b.type));

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
		 */

		this.uniforms = 0;

		/**
		 * The amount of shader varyings that this pass uses.
		 *
		 * @type {Number}
		 */

		this.varyings = 0;

		// Create the compound shader material.
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
	 * Note that convolution effects like bloom have their own dithering setting.
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

		const functionRegExp = /(?:\w+\s+(\w+)\([\w\s,]*\)\s*{[^}]+})/g;
		const varyingRegExp = /(?:varying\s+\w+\s+(\w*))/g;

		const blendModes = new Map();
		const shaderParts = new Map();
		const defines = new Map();
		const uniforms = new Map();

		let fragmentHead = "";
		let fragmentMainUv = "";
		let fragmentMainImage = "";
		let vertexHead = "";
		let vertexMainSupport = "";

		let id = 0, prefix, src, result;
		let blendMode, blendOpacity;
		let fragmentShader, vertexShader;
		let mainImageExists, mainUvExists;

		let antialiasing = false;
		let transformedUv = false;

		this.uniforms = 0;
		this.varyings = 0;

		for(const effect of this.effects) {

			antialiasing = antialiasing || (effect.type === EffectType.ANTIALIASING);
			blendMode = effect.blendMode;

			if(blendMode.blendFunction !== BlendFunction.SKIP) {

				fragmentShader = effect.fragmentShader;
				vertexShader = effect.vertexShader;

				if(fragmentShader !== undefined) {

					mainImageExists = (fragmentShader.indexOf("mainImage") >= 0);
					mainUvExists = (fragmentShader.indexOf("mainUv") >= 0);

				}

				if(fragmentShader === undefined) {

					console.error("Missing fragment shader", effect);

				} else if(!mainImageExists && !mainUvExists) {

					console.error("The fragment shader contains neither a mainImage nor a mainUv function", effect);

				} else {

					prefix = "e" + id++;

					if(mainUvExists) {

						fragmentMainUv += "\t" + prefix + "MainUv(UV);\n";
						transformedUv = true;

						if(antialiasing) {

							console.warn("Effects that transform UV coordinates are incompatible with antialiasing effects", effect);

						}

					}

					// Prefix varyings and functions.
					src = [prefixRegExp(prefix, varyingRegExp, prefixRegExp(
						prefix, functionRegExp, fragmentShader).string).string];

					if(vertexShader !== null) {

						if(vertexShader.indexOf("mainSupport") >= 0) {

							vertexMainSupport += "\t" + prefix + "MainSupport();\n";

							result = prefixRegExp(prefix, varyingRegExp, prefixRegExp(
								prefix, functionRegExp, vertexShader).string);

							// Count varyings.
							this.varyings += result.occurrences;
							src.push(result.string);

						}

					}

					// Prefix macros and uniforms.
					// @todo Consider prefixing varyings and uniforms within macros.
					prefixVariables(prefix, effect.defines, defines, src);
					prefixVariables(prefix, effect.uniforms, uniforms, src);

					// Collect unique blend modes.
					blendModes.set(blendMode.blendFunction, blendMode);

					if(mainImageExists) {

						fragmentMainImage += "\t" + prefix + "MainImage(color0, UV, color1);\n";

						// Include the blend opacity uniform of this effect.
						blendOpacity = prefix + "BlendOpacity";
						uniforms.set(blendOpacity, blendMode.opacity);

						// Blend the result of this effect with the input color.
						fragmentMainImage += "\tcolor0 = vec4(blend" + blendMode.blendFunction +
							"(color0.rgb, color1.rgb, " + blendOpacity + "), color1.a);\n\n";

						fragmentHead += "uniform float " + blendOpacity + ";\n";

					}

					// Include the modified code in the final shader.
					fragmentHead += src[0] + "\n";

					if(src.length === 2) {

						vertexHead += src[1] + "\n";

					}

				}

			}

		}

		// Integrate the relevant blend functions.
		for(blendMode of blendModes.values()) {

			fragmentHead += blendMode.getShaderCode().replace("blend", "blend" + blendMode.blendFunction);

		}

		// Register the final shader code snippets.
		shaderParts.set("VERTEX_HEAD", vertexHead.trim());
		shaderParts.set("VERTEX_MAIN_SUPPORT", vertexMainSupport.trim());
		shaderParts.set("FRAGMENT_HEAD", fragmentHead.trim());
		shaderParts.set("FRAGMENT_MAIN_IMAGE", fragmentMainImage.trim());

		if(transformedUv) {

			shaderParts.set("FRAGMENT_MAIN_UV", "vec2 transformedUv = vUv;\n\t" + fragmentMainUv.trim());
			defines.set("UV", "transformedUv");

		} else {

			shaderParts.set("FRAGMENT_MAIN_UV", fragmentMainUv.trim());
			defines.set("UV", "vUv");

		}

		this.uniforms = uniforms.size;

		return new EffectMaterial(shaderParts, defines, uniforms, this.mainCamera, this.dithering);

	}

	/**
	 * Destroys the current fullscreen shader material and builds a new one.
	 *
	 * Warning: This method performs a relatively expensive shader recompilation.
	 */

	recompile() {

		let material = this.getFullscreenMaterial();
		let width = 0, height = 0;

		if(material !== null) {

			const resolution = material.uniforms.resolution.value;
			width = resolution.x; height = resolution.y;
			material.dispose();

		}

		material = this.createMaterial();
		material.setResolution(width, height);
		this.setFullscreenMaterial(material);

	}

	/**
	 * Renders the effect.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
	 * @param {WebGLRenderTarget} outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
	 * @param {Number} [delta] - The time between the last frame and the current one in seconds.
	 * @param {Boolean} [stencilTest] - Indicates whether a stencil mask is active.
	 */

	render(renderer, inputBuffer, outputBuffer, delta, stencilTest) {

		const material = this.getFullscreenMaterial();

		for(const effect of this.effects) {

			effect.update(renderer, inputBuffer, delta);

		}

		material.uniforms.inputBuffer.value = inputBuffer.texture;
		material.uniforms.depthBuffer.value = inputBuffer.depthTexture;

		material.uniforms.time.value += delta;

		renderer.render(this.scene, this.camera, this.renderToScreen ? null : outputBuffer);

	}

	/**
	 * Updates the size of this pass.
	 *
	 * @param {Number} width - The width.
	 * @param {Number} height - The height.
	 */

	setSize(width, height) {

		this.getFullscreenMaterial().setResolution(width, height);

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

			console.warn("The current rendering context can't use more than " + max + " uniforms, but " + this.uniforms + " were defined");

		}

		max = capabilities.maxVaryings;

		if(this.varyings > max) {

			console.warn("The current rendering context can't use more than " + max + " varyings, but " + this.varyings + " were defined");

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
