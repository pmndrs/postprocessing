import { BlendFunction } from "../effects";
import { EffectMaterial } from "../materials";
import { Pass } from "./Pass.js";

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
		 * The effects, sorted by priority, DESC.
		 *
		 * @type {Effect[]}
		 * @private
		 */

		this.effects = effects.sort((a, b) => (a.priority - b.priority));

		/**
		 * Indicates whether dithering is enabled.
		 *
		 * @type {Boolean}
		 * @private
		 */

		this.quantize = false;

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
	 * @type {Boolean}
	 */

	set dithering(value) {

		if(this.quantize !== value) {

			const material = this.getFullscreenMaterial();
			material.dithering = value;
			material.needsUpdate = true;
			this.quantize = value;

		}

	}

	/**
	 * Prefixes variables and updates affected code.
	 *
	 * @private
	 * @param {String} prefix - A prefix.
	 * @param {Iterable} input - An input map of variables.
	 * @param {Map} output - An output map.
	 * @param {String[]} src - Source code that uses the given variables.
	 */

	prefixVariables(prefix, input, output, src) {

		const l = src.length;

		let key, regExp, i;

		if(input !== null) {

			for(const entry of input.entries()) {

				key = prefix + entry[0].charAt(0).toUpperCase() + entry[0].slice(1);
				regExp = new RegExp(entry[0], "g");

				output.set(key, entry[1]);

				for(i = 0; i < l; ++i) {

					src[i] = src[i].replace(regExp, key);

				}

			}

		}

	}

	/**
	 * Prefixes function names.
	 *
	 * @private
	 * @param {String} prefix - A prefix.
	 * @param {String[]} src - The source code to modify.
	 */

	prefixFunctions(prefix, src) {

		const regExp = /(?:\w+\s+(\w+)\([\w\s,]*\)\s*{[^}]+})/g;
		const l = src.length;

		let i, result, name;

		for(i = 0; i < l; ++i) {

			while((result = regExp.exec(src[i])) !== null) {

				name = result[1];

				src[i] = src[i].replace(
					new RegExp(name, "g"),
					prefix + name.charAt(0).toUpperCase() + name.slice(1)
				);

			}

		}

	}

	/**
	 * Creates a compound shader material.
	 *
	 * @private
	 * @return {Material} The new material.
	 */

	createMaterial() {

		const blendModes = new Map();
		const defines = new Map();
		const uniforms = new Map();

		let fragmentHead = "";
		let fragmentMainUv = "";
		let fragmentMainImage = "";
		let vertexHead = "";
		let vertexMainSupport = "";

		let transformedUv;
		let varyingCount = 0;

		let id = 0, prefix, src, result;
		let blendOpacity, blendMode;

		for(const effect of this.effects) {

			blendMode = effect.blendMode;

			if(blendMode.blendFunction !== BlendFunction.SKIP) {

				if(effect.fragmentShader === undefined) {

					console.error("Missing fragment shader", effect);

				} else if(effect.fragmentShader.indexOf("mainImage") < 0) {

					console.error("Missing mainImage function", effect);

				} else {

					prefix = "e" + id++;

					// Integrate the mainImage function call.
					fragmentMainImage += "\t" + prefix + "MainImage(inputColor, UV, outputColor);\n";

					if(effect.fragmentShader.indexOf("mainUv") >= 0) {

						// Integrate the mainUv function call.
						fragmentMainUv += "\t" + prefix + "MainUv(UV);\n";
						transformedUv = true;

					}

					src = [effect.fragmentShader];

					if(effect.vertexShader !== null) {

						src.push(effect.vertexShader);

						// Count varyings.
						result = effect.vertexShader.match(/varying/g);

						if(result !== null) {

							varyingCount += result.length;

						}

						if(effect.vertexShader.indexOf("mainSupport") >= 0) {

							// Integrate the mainSupport function call.
							vertexMainSupport += "\t" + prefix + "MainSupport();\n";

						}

					}

					// Prefix macros, uniforms and functions to prevent name collisions.
					this.prefixVariables(prefix, effect.defines, defines, src);
					this.prefixVariables(prefix, effect.uniforms, uniforms, src);
					this.prefixFunctions(prefix, src);

					// Collect unique blend modes.
					blendModes.set(blendMode.blendFunction, blendMode);

					// Create a blend opacity uniform for this effect.
					blendOpacity = prefix + "BlendOpacity";
					uniforms.set(blendOpacity, blendMode.opacity);

					// Blend the result of this effect with the input color.
					fragmentMainImage += "\tinputColor.rgb = blend" + blendMode.blendFunction +
						"(inputColor.rgb, outputColor.rgb, " + blendOpacity + ");\n\n";

					// Include the modified code in the final shader.
					fragmentHead += "uniform float " + blendOpacity + ";\n" + src[0] + "\n";

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
		defines.set("VERTEX_HEAD", vertexHead);
		defines.set("VERTEX_MAIN_SUPPORT", vertexMainSupport);
		defines.set("FRAGMENT_HEAD", fragmentHead);
		defines.set("FRAGMENT_MAIN_IMAGE", fragmentMainImage);

		if(transformedUv) {

			defines.set("FRAGMENT_MAIN_UV", "vec2 transformedUv = vUv;\n" + fragmentMainUv);
			defines.set("UV", "transformedUv");

		} else {

			defines.set("UV", "vUv");

		}

		return new EffectMaterial(this.mainCamera, defines, uniforms, this.dithering);

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

		this.material.setResolution(width, height);

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

		// const capabilities = renderer.capabilities;

		this.setFullscreenMaterial(this.createMaterial());

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
