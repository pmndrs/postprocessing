import { ColorSpace, LinearSRGBColorSpace, NoColorSpace, SRGBColorSpace, Uniform } from "three";
import { ShaderData } from "../core/ShaderData.js";
import { Effect } from "../effects/Effect.js";
import { BlendMode } from "../effects/blending/BlendMode.js";
import { EffectShaderSection, EffectShaderSection as Section } from "../enums/EffectShaderSection.js";
import { GData } from "../enums/GData.js";
import { prefixSubstrings } from "../utils/functions/string.js";
import { topologicalSort } from "./functions/sorting.js";
import { GBufferConfig } from "./gbuffer/GBufferConfig.js";

const functionRegExp = /\w+\s+(\w+)\([\w\s,]*\)\s*{/g;
const structRegExp = /struct\s+(\w*)/g;
const defineRegExp = /^\s*#define\s+(\w*)/gm;

/**
 * A collection of shader data.
 *
 * @category Utils
 * @internal
 */

export class EffectShaderData implements ShaderData {

	readonly defines: Map<string, string | number | boolean>;
	readonly uniforms: Map<string, Uniform>;

	/**
	 * The shader parts.
	 */

	readonly shaderParts: Map<EffectShaderSection, string>;

	/**
	 * The blend modes of the individual effects.
	 */

	readonly blendModes: Map<number, BlendMode>;

	/**
	 * A collection of required G-Buffer data.
	 */

	readonly gData: Set<GData | string>;

	/**
	 * A list of effects that use convolution operations.
	 */

	readonly convolutionEffects: Set<Effect>;

	/**
	 * A list of effects that transform UV coordinates in the fragment shader.
	 */

	readonly uvTransformationEffects: Set<Effect>;

	/**
	 * @see {@link colorSpace}
	 */

	private _colorSpace: ColorSpace;

	/**
	 * Constructs new shader data.
	 */

	constructor() {

		this.shaderParts = new Map<EffectShaderSection, string>([
			[EffectShaderSection.FRAGMENT_HEAD_EFFECTS, ""],
			[EffectShaderSection.FRAGMENT_HEAD_GBUFFER, ""],
			[EffectShaderSection.FRAGMENT_HEAD_GDATA, ""],
			[EffectShaderSection.FRAGMENT_MAIN_UV, ""],
			[EffectShaderSection.FRAGMENT_MAIN_GDATA, ""],
			[EffectShaderSection.FRAGMENT_MAIN_IMAGE, ""],
			[EffectShaderSection.VERTEX_HEAD, ""],
			[EffectShaderSection.VERTEX_MAIN_SUPPORT, ""]
		]);

		this.defines = new Map<string, string | number | boolean>();
		this.uniforms = new Map<string, Uniform>();
		this.blendModes = new Map<number, BlendMode>();
		this.gData = new Set<GData | string>([GData.COLOR]);
		this.convolutionEffects = new Set<Effect>();
		this.uvTransformationEffects = new Set<Effect>();
		this._colorSpace = LinearSRGBColorSpace;

	}

	/**
	 * Indicates whether any effect transforms UV coordinates in the fragment shader.
	 */

	get uvTransformation(): boolean {

		return this.uvTransformationEffects.size > 0;

	}

	/**
	 * The effective output color space of this effect shader data.
	 */

	get colorSpace(): ColorSpace {

		return this._colorSpace;

	}

	private set colorSpace(value: ColorSpace) {

		this._colorSpace = value;

	}

	/**
	 * Extracts token names from a given vertex shader.
	 *
	 * @param prefix - A prefix.
	 * @param shader - The vertex shader.
	 * @param names - A set to be filled with the tokens.
	 */

	private gatherVertexShaderTokens(shader: string, names: Set<string>): void {

		// Collect names of varyings.
		for(const m of shader.matchAll(/(?:out\s+\w+\s+(\w*?);)/g)) {

			// Handle unusual formatting and commas.
			for(const n of m[1].split(/\s*,\s*/)) {

				names.add(n);

			}

		}

		for(const m of shader.matchAll(functionRegExp)) {

			names.add(m[1]);

		}

		for(const m of shader.matchAll(structRegExp)) {

			names.add(m[1]);

		}

		for(const m of shader.matchAll(defineRegExp)) {

			names.add(m[1]);

		}

	}

	/**
	 * Extracts token names from a given fragment shader.
	 *
	 * @param prefix - A prefix.
	 * @param shader - The fragment shader.
	 * @param names - A set to be filled with the tokens.
	 */

	private gatherFragmentShaderTokens(shader: string, names: Set<string>): void {

		for(const m of shader.matchAll(functionRegExp)) {

			names.add(m[1]);

		}

		for(const m of shader.matchAll(structRegExp)) {

			names.add(m[1]);

		}

		for(const m of shader.matchAll(defineRegExp)) {

			names.add(m[1]);

		}

	}

	/**
	 * Updates the current working color space based on the given effect.
	 *
	 * @param effect - The effect.
	 */

	private updateWorkingColorSpace(effect: Effect): void {

		if(effect.outputColorSpace !== NoColorSpace) {

			// The effect itself converts colors into a specific color space.
			this.colorSpace = effect.outputColorSpace;

		} else if(effect.inputColorSpace !== NoColorSpace) {

			// Colors have been converted into a specific color space by request of this effect.
			this.colorSpace = effect.inputColorSpace;

		}

	}

	/**
	 * Integrates the given effect by collecting relevant shader data.
	 *
	 * @param prefix - A prefix.
	 * @param effect - The effect.
	 * @throws If the effect is invalid.
	 */

	integrateEffect(prefix: string, effect: Effect): void {

		effect.validate();

		if(effect.isConvolutionPass(false)) {

			this.convolutionEffects.add(effect);

		}

		let fragmentShader = effect.fragmentShader!;
		let vertexShader = effect.vertexShader;

		const shaderParts = this.shaderParts;
		let fragmentHead = shaderParts.get(Section.FRAGMENT_HEAD_EFFECTS)!;
		let fragmentMainUv = shaderParts.get(Section.FRAGMENT_MAIN_UV)!;
		let fragmentMainImage = shaderParts.get(Section.FRAGMENT_MAIN_IMAGE)!;
		let vertexHead = shaderParts.get(Section.VERTEX_HEAD)!;
		let vertexMainSupport = shaderParts.get(Section.VERTEX_MAIN_SUPPORT)!;

		const names = new Set<string>();

		if(vertexShader !== null && effect.hasMainSupportFunction) {

			this.gatherVertexShaderTokens(vertexShader, names);

			// Build the mainSupport call (with optional uv parameter).
			const needsUv = /mainSupport\s*\([\w\s]*?uv\s*?\)/.test(vertexShader);
			vertexMainSupport += `\t${prefix}MainSupport(`;
			vertexMainSupport += needsUv ? "vUv);\n" : ");\n";

		}

		if(effect.hasMainUvFunction) {

			fragmentMainUv += `\t${prefix}MainUv(UV);\n`;
			this.uvTransformationEffects.add(effect);

		}

		// Collect GData usage.
		for(const gData of effect.gData) {

			this.gData.add(gData);

		}

		if(effect.hasMainImageFunction) {

			this.gatherFragmentShaderTokens(fragmentShader, names);

			if(effect.inputColorSpace !== NoColorSpace && effect.inputColorSpace !== this.colorSpace) {

				// Convert the input color to the required color space.
				fragmentMainImage += (effect.inputColorSpace === SRGBColorSpace) ?
					"color0 = sRGBTransferOETF(color0);\n\t" :
					"color0 = sRGBToLinear(color0);\n\t";

			}

			// Apply the effect by calling its mainImage function.
			fragmentMainImage += `color1 = ${prefix}MainImage(color0, UV, gData);\n\t`;

			// Collect unique blend modes.
			const blendMode = effect.blendMode;
			this.blendModes.set(blendMode.blendFunction.id, blendMode);

			// Include the blend opacity uniform of this effect.
			const blendOpacity = prefix + "BlendOpacity";
			this.uniforms.set(blendOpacity, blendMode.opacityUniform);

			// Blend the result of this effect with the input color (color0 = dst, color1 = src).
			fragmentMainImage += `color0 = blend${blendMode.blendFunction.id}(color0, color1, ${blendOpacity});\n\n\t`;
			fragmentHead += `uniform float ${blendOpacity};\n\n`;

			this.updateWorkingColorSpace(effect);

		}

		for(const d of effect.input.defines.keys()) {

			// Ignore parameters of function-like macros.
			names.add(d.replace(/\([\w\s,]*\)/g, ""));

		}

		for(const u of effect.input.uniforms.keys()) {

			names.add(u);

		}

		// Remove known false positives.
		names.delete("while");
		names.delete("for");
		names.delete("if");

		// Store prefixed uniforms and macros.
		effect.input.uniforms.forEach((v, k) => this.uniforms.set(prefix + k.charAt(0).toUpperCase() + k.slice(1), v));
		effect.input.defines.forEach((v, k) => this.defines.set(prefix + k.charAt(0).toUpperCase() + k.slice(1), v));

		// Prefix varyings, functions and uniforms in shaders and macros.
		const shaders = new Map([["fragment", fragmentShader], ["vertex", vertexShader]]);
		prefixSubstrings(prefix, names, this.defines);
		prefixSubstrings(prefix, names, shaders);
		fragmentShader = shaders.get("fragment")!;
		vertexShader = shaders.get("vertex")!;

		// Include the modified code in the final shader.
		fragmentHead += fragmentShader + "\n";

		if(vertexShader !== null) {

			vertexHead += vertexShader + "\n";

		}

		shaderParts.set(Section.FRAGMENT_HEAD_EFFECTS, fragmentHead);
		shaderParts.set(Section.FRAGMENT_MAIN_UV, fragmentMainUv);
		shaderParts.set(Section.FRAGMENT_MAIN_IMAGE, fragmentMainImage);
		shaderParts.set(Section.VERTEX_HEAD, vertexHead);
		shaderParts.set(Section.VERTEX_MAIN_SUPPORT, vertexMainSupport);

		this.validate();

	}

	/**
	 * Adds the given effect shader data to this data.
	 *
	 * @param data - The data to add.
	 * @throws If the data cannot be merged.
	 */

	add(data: EffectShaderData): void {

		data.convolutionEffects.forEach((v) => this.convolutionEffects.add(v));
		data.uvTransformationEffects.forEach((v) => this.uvTransformationEffects.add(v));
		data.uniforms.forEach((v, k) => this.uniforms.set(k, v));
		data.defines.forEach((v, k) => this.defines.set(k, v));
		data.blendModes.forEach((v, k) => this.blendModes.set(k, v));
		data.gData.forEach((v) => this.gData.add(v));

		const shaderParts = this.shaderParts;
		let fragmentHead = shaderParts.get(Section.FRAGMENT_HEAD_EFFECTS)!;
		let fragmentMainUv = shaderParts.get(Section.FRAGMENT_MAIN_UV)!;
		let fragmentMainImage = shaderParts.get(Section.FRAGMENT_MAIN_IMAGE)!;
		let vertexHead = shaderParts.get(Section.VERTEX_HEAD)!;
		let vertexMainSupport = shaderParts.get(Section.VERTEX_MAIN_SUPPORT)!;

		fragmentHead += data.shaderParts.get(Section.FRAGMENT_HEAD_EFFECTS)!;
		fragmentMainUv += data.shaderParts.get(Section.FRAGMENT_MAIN_UV)!;
		fragmentMainImage += data.shaderParts.get(Section.FRAGMENT_MAIN_IMAGE)!;
		vertexHead += data.shaderParts.get(Section.VERTEX_HEAD)!;
		vertexMainSupport += data.shaderParts.get(Section.VERTEX_MAIN_SUPPORT)!;

		shaderParts.set(Section.FRAGMENT_HEAD_EFFECTS, fragmentHead);
		shaderParts.set(Section.FRAGMENT_MAIN_UV, fragmentMainUv);
		shaderParts.set(Section.FRAGMENT_MAIN_IMAGE, fragmentMainImage);
		shaderParts.set(Section.VERTEX_HEAD, vertexHead);
		shaderParts.set(Section.VERTEX_MAIN_SUPPORT, vertexMainSupport);

		// Update the working color space.
		if(this.colorSpace !== data.colorSpace && data.colorSpace !== NoColorSpace) {

			this.colorSpace = data.colorSpace;

		}

		this.validate();

	}

	/**
	 * Checks if this data is valid.
	 *
	 * @throws If the data is invalid.
	 */

	private validate(): void {

		if(this.convolutionEffects.size > 1) {

			const effectNames = [...this.convolutionEffects].map(x => x.name).join(", ");
			throw new Error(`Convolution effects cannot be merged (${effectNames})`);

		} else if(this.convolutionEffects.size > 0 && this.uvTransformation) {

			const effectNames = [...this.convolutionEffects, ...this.uvTransformationEffects].map(x => x.name).join(", ");
			throw new Error(`Effects that transform UVs are incompatible with convolution effects (${effectNames})`);

		}

	}

	/**
	 * Creates shader code for a `GData` struct declaration.
	 *
	 * @param gBufferConfig - A G-Buffer config.
	 * @return The shader code.
	 */

	createGDataStructDeclaration(gBufferConfig: GBufferConfig): string {

		return [
			"struct GData {",
			...Array.from(gBufferConfig.gDataStructDeclaration)
				.filter(x => this.gData.has(x[0]))
				.map(x => `\t${x[1]}`),
			"};\n"
		].join("\n");

	}

	/**
	 * Creates shader code for the `GData` struct initialization.
	 *
	 * @param gBufferConfig - A G-Buffer config.
	 * @return The shader code.
	 */

	createGDataStructInitialization(gBufferConfig: GBufferConfig): string {

		const gDataDependencies = gBufferConfig.gDataDependencies;
		const gDataStructInitialization = gBufferConfig.gDataStructInitialization;

		const dependencyGraph = new Map<string, Iterable<string>>(
			Array.from(this.gData)
				.filter(x => gDataStructInitialization.has(x))
				.map(x => [x, gDataDependencies.get(x) ?? []])
		);

		return [
			"\tGData gData;",
			...topologicalSort(dependencyGraph, true)
				.map(x => `\t${gDataStructInitialization.get(x)}`)
		].join("\n");

	}

	/**
	 * Creates the relevant blend function declarations.
	 *
	 * @return The shader code.
	 */

	createBlendFunctions(): string {

		const blendRegExp = /\bblend\b/g;
		const parts: string[] = [];

		for(const blendMode of this.blendModes.values()) {

			const blendFunctionShader = blendMode.blendFunction.shader!;
			const blendFunctionName = `blend${blendMode.blendFunction.id}`;
			parts.push(blendFunctionShader.replace(blendRegExp, blendFunctionName));

		}

		return parts.join("\n");

	}

}
