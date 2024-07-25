import { BasicDepthPacking, NoColorSpace, SRGBColorSpace, UnsignedByteType } from "three";
import { EffectShaderData } from "../core/EffectShaderData.js";
import { BlendFunction } from "../enums/BlendFunction.js";
import { EffectAttribute } from "../enums/EffectAttribute.js";
import { EffectShaderSection as Section } from "../enums/EffectShaderSection.js";

import { EffectMaterial } from "../materials/EffectMaterial.js";
import { Pass } from "./Pass.js";

/**
 * Prefixes substrings within the given strings.
 *
 * @private
 * @param {String} prefix - A prefix.
 * @param {Iterable<String>} substrings - The substrings.
 * @param {Map<String, String>} strings - A collection of named strings.
 */

function prefixSubstrings(prefix, substrings, strings) {

	for(const substring of substrings) {

		// Prefix the substring and build a RegExp that searches for the unprefixed version.
		const prefixed = "$1" + prefix + substring.charAt(0).toUpperCase() + substring.slice(1);
		const regExp = new RegExp("([^\\.])(\\b" + substring + "\\b)", "g");

		for(const entry of strings.entries()) {

			if(entry[1] !== null) {

				// Replace all occurances of the substring with the prefixed version.
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
 * @param {Effect} effect - The effect.
 * @param {EffectShaderData} data - Cumulative shader data.
 */

function integrateEffect(prefix, effect, data) {

	let fragmentShader = effect.getFragmentShader();
	let vertexShader = effect.getVertexShader();

	const mainImageExists = (fragmentShader !== undefined && /mainImage/.test(fragmentShader));
	const mainUvExists = (fragmentShader !== undefined && /mainUv/.test(fragmentShader));

	data.attributes |= effect.getAttributes();

	if(fragmentShader === undefined) {

		throw new Error(`Missing fragment shader (${effect.name})`);

	} else if(mainUvExists && (data.attributes & EffectAttribute.CONVOLUTION) !== 0) {

		throw new Error(`Effects that transform UVs are incompatible with convolution effects (${effect.name})`);

	} else if(!mainImageExists && !mainUvExists) {

		throw new Error(`Could not find mainImage or mainUv function (${effect.name})`);

	} else {

		const functionRegExp = /\w+\s+(\w+)\([\w\s,]*\)\s*{/g;

		const shaderParts = data.shaderParts;
		let fragmentHead = shaderParts.get(Section.FRAGMENT_HEAD) || "";
		let fragmentMainUv = shaderParts.get(Section.FRAGMENT_MAIN_UV) || "";
		let fragmentMainImage = shaderParts.get(Section.FRAGMENT_MAIN_IMAGE) || "";
		let vertexHead = shaderParts.get(Section.VERTEX_HEAD) || "";
		let vertexMainSupport = shaderParts.get(Section.VERTEX_MAIN_SUPPORT) || "";

		const varyings = new Set();
		const names = new Set();

		if(mainUvExists) {

			fragmentMainUv += `\t${prefix}MainUv(UV);\n`;
			data.uvTransformation = true;

		}

		if(vertexShader !== null && /mainSupport/.test(vertexShader)) {

			// Build the mainSupport call (with optional uv parameter).
			const needsUv = /mainSupport *\([\w\s]*?uv\s*?\)/.test(vertexShader);
			vertexMainSupport += `\t${prefix}MainSupport(`;
			vertexMainSupport += needsUv ? "vUv);\n" : ");\n";

			// Collect names of varyings and functions.
			for(const m of vertexShader.matchAll(/(?:varying\s+\w+\s+([\S\s]*?);)/g)) {

				// Handle unusual formatting and commas.
				for(const n of m[1].split(/\s*,\s*/)) {

					data.varyings.add(n);
					varyings.add(n);
					names.add(n);

				}

			}

			for(const m of vertexShader.matchAll(functionRegExp)) {

				names.add(m[1]);

			}

		}

		for(const m of fragmentShader.matchAll(functionRegExp)) {

			names.add(m[1]);

		}

		for(const d of effect.defines.keys()) {

			// Ignore parameters of function-like macros.
			names.add(d.replace(/\([\w\s,]*\)/g, ""));

		}

		for(const u of effect.uniforms.keys()) {

			names.add(u);

		}

		// Remove potential false positives.
		names.delete("while");
		names.delete("for");
		names.delete("if");

		// Store prefixed uniforms and macros.
		effect.uniforms.forEach((val, key) => data.uniforms.set(prefix + key.charAt(0).toUpperCase() + key.slice(1), val));
		effect.defines.forEach((val, key) => data.defines.set(prefix + key.charAt(0).toUpperCase() + key.slice(1), val));

		// Prefix varyings, functions, uniforms and macro values.
		const shaders = new Map([["fragment", fragmentShader], ["vertex", vertexShader]]);
		prefixSubstrings(prefix, names, data.defines);
		prefixSubstrings(prefix, names, shaders);
		fragmentShader = shaders.get("fragment");
		vertexShader = shaders.get("vertex");

		// Collect unique blend modes.
		const blendMode = effect.blendMode;
		data.blendModes.set(blendMode.blendFunction, blendMode);

		if(mainImageExists) {

			if(effect.inputColorSpace !== null && effect.inputColorSpace !== data.colorSpace) {

				fragmentMainImage += (effect.inputColorSpace === SRGBColorSpace) ?
					"color0 = sRGBTransferOETF(color0);\n\t" :
					"color0 = sRGBToLinear(color0);\n\t";

			}

			if(effect.outputColorSpace !== NoColorSpace) {

				data.colorSpace = effect.outputColorSpace;

			} else if(effect.inputColorSpace !== null) {

				data.colorSpace = effect.inputColorSpace;

			}

			const depthParamRegExp = /MainImage *\([\w\s,]*?depth[\w\s,]*?\)/;
			fragmentMainImage += `${prefix}MainImage(color0, UV, `;

			// Check if the effect reads depth in the fragment shader.
			if((data.attributes & EffectAttribute.DEPTH) !== 0 && depthParamRegExp.test(fragmentShader)) {

				fragmentMainImage += "depth, ";
				data.readDepth = true;

			}

			fragmentMainImage += "color1);\n\t";

			// Include the blend opacity uniform of this effect.
			const blendOpacity = prefix + "BlendOpacity";
			data.uniforms.set(blendOpacity, blendMode.opacity);

			// Blend the result of this effect with the input color (color0 = dst, color1 = src).
			fragmentMainImage += `color0 = blend${blendMode.blendFunction}(color0, color1, ${blendOpacity});\n\n\t`;
			fragmentHead += `uniform float ${blendOpacity};\n\n`;

		}

		// Include the modified code in the final shader.
		fragmentHead += fragmentShader + "\n";

		if(vertexShader !== null) {

			vertexHead += vertexShader + "\n";

		}

		shaderParts.set(Section.FRAGMENT_HEAD, fragmentHead);
		shaderParts.set(Section.FRAGMENT_MAIN_UV, fragmentMainUv);
		shaderParts.set(Section.FRAGMENT_MAIN_IMAGE, fragmentMainImage);
		shaderParts.set(Section.VERTEX_HEAD, vertexHead);
		shaderParts.set(Section.VERTEX_MAIN_SUPPORT, vertexMainSupport);

		if(effect.extensions !== null) {

			// Collect required WebGL extensions.
			for(const extension of effect.extensions) {

				data.extensions.add(extension);

			}

		}

	}

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

		/**
		 * The animation time scale.
		 *
		 * @type {Number}
		 */

		this.timeScale = 1.0;

	}

	set mainScene(value) {

		for(const effect of this.effects) {

			effect.mainScene = value;

		}

	}

	set mainCamera(value) {

		this.fullscreenMaterial.copyCameraSettings(value);

		for(const effect of this.effects) {

			effect.mainCamera = value;

		}

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
	 * Updates the compound shader material.
	 *
	 * @protected
	 */

	updateMaterial() {

		const data = new EffectShaderData();
		let id = 0;

		for(const effect of this.effects) {

			if(effect.blendMode.blendFunction === BlendFunction.DST) {

				// Check if this effect relies on depth and continue.
				data.attributes |= (effect.getAttributes() & EffectAttribute.DEPTH);

			} else if((data.attributes & effect.getAttributes() & EffectAttribute.CONVOLUTION) !== 0) {

				throw new Error(`Convolution effects cannot be merged (${effect.name})`);

			} else {

				integrateEffect("e" + id++, effect, data);

			}

		}

		let fragmentHead = data.shaderParts.get(Section.FRAGMENT_HEAD);
		let fragmentMainImage = data.shaderParts.get(Section.FRAGMENT_MAIN_IMAGE);
		let fragmentMainUv = data.shaderParts.get(Section.FRAGMENT_MAIN_UV);

		// Integrate the relevant blend functions.
		const blendRegExp = /\bblend\b/g;

		for(const blendMode of data.blendModes.values()) {

			fragmentHead += blendMode.getShaderCode().replace(blendRegExp, `blend${blendMode.blendFunction}`) + "\n";

		}

		// Check if any effect relies on depth.
		if((data.attributes & EffectAttribute.DEPTH) !== 0) {

			// Check if depth should be read.
			if(data.readDepth) {

				fragmentMainImage = "float depth = readDepth(UV);\n\n\t" + fragmentMainImage;

			}

			// Only request a depth texture if none has been provided yet.
			this.needsDepthTexture = (this.getDepthTexture() === null);

		} else {

			this.needsDepthTexture = false;

		}

		if(data.colorSpace === SRGBColorSpace) {

			// Convert back to linear.
			fragmentMainImage += "color0 = sRGBToLinear(color0);\n\t";

		}

		// Check if any effect transforms UVs in the fragment shader.
		if(data.uvTransformation) {

			fragmentMainUv = "vec2 transformedUv = vUv;\n" + fragmentMainUv;
			data.defines.set("UV", "transformedUv");

		} else {

			data.defines.set("UV", "vUv");

		}

		data.shaderParts.set(Section.FRAGMENT_HEAD, fragmentHead);
		data.shaderParts.set(Section.FRAGMENT_MAIN_IMAGE, fragmentMainImage);
		data.shaderParts.set(Section.FRAGMENT_MAIN_UV, fragmentMainUv);

		// Ensure that leading preprocessor directives start on a new line.
		for(const [key, value] of data.shaderParts) {

			if(value !== null) {

				data.shaderParts.set(key, value.trim().replace(/^#/, "\n#"));

			}

		}

		this.skipRendering = (id === 0);
		this.needsSwap = !this.skipRendering;
		this.fullscreenMaterial.setShaderData(data);

	}

	/**
	 * Rebuilds the shader material.
	 */

	recompile() {

		this.updateMaterial();

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
			material.time += deltaTime * this.timeScale;

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
