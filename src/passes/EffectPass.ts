import {
	Event,
	EventListener,
	Scene,
	OrthographicCamera,
	PerspectiveCamera
} from "three";

import { Pass } from "../core/Pass.js";
import { Effect } from "../effects/Effect.js";
import { BlendFunction } from "../enums/BlendFunction.js";
import { EffectAttribute } from "../enums/EffectAttribute.js";
import { EffectShaderSection as Section } from "../enums/EffectShaderSection.js";
import { EffectMaterial } from "../materials/EffectMaterial.js";
import { EffectShaderData } from "../utils/EffectShaderData.js";
import { Log } from "../utils/Log.js";
import { Resolution } from "../utils/Resolution.js";

/**
 * Prefixes substrings within the given strings.
 *
 * @param prefix - A prefix.
 * @param substrings - The substrings.
 * @param strings - A collection of named strings.
 */

function prefixSubstrings(prefix: string, substrings: Iterable<string>, strings: Map<string, string | null>): void {

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
 * Integrates the given effect by collecting relevant shader data.
 *
 * @param prefix - A prefix.
 * @param effect - The effect.
 * @param data - Cumulative shader data.
 * @throws {@link Error} if the effect is invalid or cannot be merged.
 */

function integrateEffect(prefix: string, effect: Effect, data: EffectShaderData): void {

	if(effect.fragmentShader === null) {

		throw new Error(`Missing fragment shader (${effect.name})`);

	}

	let fragmentShader = effect.fragmentShader;
	let vertexShader = effect.vertexShader;

	const mainImageExists = (fragmentShader !== undefined && /mainImage/.test(fragmentShader));
	const mainUvExists = (fragmentShader !== undefined && /mainUv/.test(fragmentShader));

	data.attributes |= effect.attributes;

	if(mainUvExists && (data.attributes & EffectAttribute.CONVOLUTION) !== 0) {

		throw new Error(`Effects that transform UVs are incompatible with convolution effects (${effect.name})`);

	} else if(!mainImageExists && !mainUvExists) {

		throw new Error(`Could not find mainImage or mainUv function (${effect.name})`);

	} else {

		const functionRegExp = /\w+\s+(\w+)\([\w\s,]*\)\s*{/g;

		const shaderParts = data.shaderParts;
		let fragmentHead = shaderParts.get(Section.FRAGMENT_HEAD) ?? "";
		let fragmentMainUv = shaderParts.get(Section.FRAGMENT_MAIN_UV) ?? "";
		let fragmentMainImage = shaderParts.get(Section.FRAGMENT_MAIN_IMAGE) ?? "";
		let vertexHead = shaderParts.get(Section.VERTEX_HEAD) ?? "";
		let vertexMainSupport = shaderParts.get(Section.VERTEX_MAIN_SUPPORT) ?? "";

		const varyings = new Set<string>();
		const names = new Set<string>();

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
		effect.uniforms.forEach((v, k) => data.uniforms.set(prefix + k.charAt(0).toUpperCase() + k.slice(1), v));
		effect.defines.forEach((v, k) => data.defines.set(prefix + k.charAt(0).toUpperCase() + k.slice(1), v));

		// Prefix varyings, functions, uniforms and macro values.
		const shaders = new Map([["fragment", fragmentShader], ["vertex", vertexShader]]);
		prefixSubstrings(prefix, names, data.defines);
		prefixSubstrings(prefix, names, shaders);
		fragmentShader = shaders.get("fragment") as string;
		vertexShader = shaders.get("vertex") as string;

		// Collect unique blend modes.
		const blendMode = effect.blendMode;
		data.blendModes.set(blendMode.blendFunction, blendMode);

		if(mainImageExists) {

			if(effect.inputColorSpace !== null && effect.inputColorSpace !== data.colorSpace) {

				fragmentMainImage += (effect.inputColorSpace === "srgb") ?
					"color0 = LinearTosRGB(color0);\n\t" :
					"color0 = sRGBToLinear(color0);\n\t";

			}

			if(effect.outputColorSpace !== null) {

				data.colorSpace = effect.outputColorSpace;

			} else if(effect.inputColorSpace !== null) {

				data.colorSpace = effect.inputColorSpace;

			}

			// const depthParamRegExp = /MainImage *\([\w\s,]*?depth[\w\s,]*?\)/;
			fragmentMainImage += `${prefix}MainImage(color0, UV, `;

			// Check if the effect reads depth in the fragment shader.
			/*
			if((data.attributes & EffectAttribute.DEPTH) !== 0 && depthParamRegExp.test(fragmentShader)) {

				fragmentMainImage += "depth, ";
				data.readDepth = true;

			}
			*/

			fragmentMainImage += "color1);\n\t";

			// Include the blend opacity uniform of this effect.
			const blendOpacity = prefix + "BlendOpacity";
			data.uniforms.set(blendOpacity, blendMode.opacityUniform);

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
 * @group Passes
 */

export class EffectPass extends Pass<EffectMaterial> implements EventListenerObject {

	/**
	 * An event listener that forwards events to {@link handleEvent}.
	 */

	private listener: EventListener<Event, unknown, unknown>;

	/**
	 * The effects.
	 */

	private _effects: Effect[];

	/**
	 * An animation time scale.
	 */

	timeScale: number;

	/**
	 * Constructs a new effect pass.
	 *
	 * @param effects - The effects that will be rendered by this pass.
	 */

	constructor(...effects: Effect[]) {

		super("EffectPass");

		this.fullscreenMaterial = new EffectMaterial();
		this.listener = (e: Event) => this.handleEvent(e);
		this._effects = effects;
		this.timeScale = 1.0;

	}

	override set scene(value: Scene) {

		for(const effect of this.effects) {

			effect.scene = value;

		}

	}

	override set camera(value: OrthographicCamera | PerspectiveCamera) {

		this.fullscreenMaterial.copyCameraSettings(value);

		for(const effect of this.effects) {

			effect.camera = value;

		}

	}

	/**
	 * Indicates whether dithering is enabled.
	 */

	get dithering(): boolean {

		return this.fullscreenMaterial.dithering;

	}

	set dithering(value: boolean) {

		const material = this.fullscreenMaterial;
		material.dithering = value;
		material.needsUpdate = true;

	}

	/**
	 * The effects.
	 */

	get effects(): Effect[] {

		return this._effects;

	}

	protected set effects(value: Effect[]) {

		for(const effect of this._effects) {

			effect.removeEventListener("change", this.listener);

		}

		this._effects = value.sort((a, b) => (b.attributes - a.attributes));
		Object.freeze(this._effects);

		for(const effect of this._effects) {

			effect.addEventListener("change", this.listener);

		}

		this.rebuild();

	}

	/**
	 * Updates the compound shader material.
	 *
	 * @throws {@link Error} if the current effects cannot be merged.
	 */

	private updateMaterial(): void {

		const data = new EffectShaderData();
		let id = 0;

		if(this.effects.length === 0) {

			throw new Error("There are no effects to merge");

		}

		for(const effect of this.effects) {

			if(effect.blendMode.blendFunction === BlendFunction.DST) {

				continue;

			}

			if((data.attributes & effect.attributes & EffectAttribute.CONVOLUTION) !== 0) {

				throw new Error(`Convolution effects cannot be merged (${effect.name})`);

			} else {

				integrateEffect(`e${id++}`, effect, data);

			}

		}

		if(id === 0) {

			throw new Error("Invalid effect combination");

		}

		let fragmentHead = data.shaderParts.get(Section.FRAGMENT_HEAD) as string;
		let fragmentMainImage = data.shaderParts.get(Section.FRAGMENT_MAIN_IMAGE) as string;
		let fragmentMainUv = data.shaderParts.get(Section.FRAGMENT_MAIN_UV) as string;

		// Integrate the relevant blend functions.
		const blendRegExp = /\bblend\b/g;

		for(const blendMode of data.blendModes.values()) {

			fragmentHead += blendMode.shaderCode.replace(blendRegExp, `blend${blendMode.blendFunction}`) + "\n";

		}

		// Check if any effect relies on depth.
		/* if((data.attributes & EffectAttribute.DEPTH) !== 0) {

			// Check if depth should be read.
			if(data.readDepth) {

				fragmentMainImage = "float depth = readDepth(UV);\n\n\t" + fragmentMainImage;

			}

			// Only request a depth texture if none has been provided yet.
			this.needsDepthTexture = (this.getDepthTexture() === null);

		} else {

			this.needsDepthTexture = false;

		} */

		if(data.colorSpace === "srgb") {

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
		data.shaderParts.forEach(
			(value, key, map) => map.set(key, value !== null ? value.trim().replace(/^#/, "\n#") : null)
		);

		this.fullscreenMaterial.setShaderParts(data.shaderParts)
			.setDefines(data.defines)
			.setUniforms(data.uniforms)
			.setExtensions(data.extensions);

	}

	/**
	 * Rebuilds the compound shader material.
	 */

	protected rebuild(): void {

		try {

			this.updateMaterial();

		} catch(e) {

			Log.error(e);

		}

	}

	protected override onResolutionChange(resolution: Resolution): void {

		this.fullscreenMaterial.setSize(resolution.width, resolution.height);

		for(const effect of this.effects) {

			effect.resolution.copy(resolution);

		}

	}

	protected override onInputChange(): void {

		this.fullscreenMaterial.inputBuffer = this.input.defaultBuffer;

		if(this.input.frameBufferPrecisionHigh) {

			this.fullscreenMaterial.defines.FRAMEBUFFER_PRECISION_HIGH = "1";

		}

	}

	override dispose(): void {

		super.dispose();

		for(const effect of this.effects) {

			effect.removeEventListener("change", this.listener);
			effect.dispose();

		}

	}

	render(): void {

		if(this.renderer === null || this.timer === null) {

			return;

		}

		for(const effect of this.effects) {

			effect.render();

		}

		const material = this.fullscreenMaterial;
		material.inputBuffer = this.input.defaultBuffer;
		material.time += this.timer.delta * this.timeScale;

		this.renderer.setRenderTarget(this.output.defaultBuffer);
		this.renderFullscreen();

	}

	handleEvent(event: Event): void {

		switch(event.type) {

			case "change":
				this.rebuild();
				break;

		}

	}

}
