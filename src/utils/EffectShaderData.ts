import { ColorSpace, LinearSRGBColorSpace, NoColorSpace, SRGBColorSpace, Uniform } from "three";
import { ShaderData } from "../core/ShaderData.js";
import { Effect } from "../effects/Effect.js";
import { BlendMode } from "../effects/blending/BlendMode.js";
import { EffectShaderSection } from "../enums/EffectShaderSection.js";
import { EffectShaderSection as Section } from "../enums/EffectShaderSection.js";
import { GData } from "../enums/GData.js";
import { prefixSubstrings } from "../utils/functions/string.js";

/**
 * A collection of shader data.
 *
 * @internal
 * @group Utils
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
	 * A set of varyings.
	 */

	readonly varyings: Set<string>;

	/**
	 * A collection of required GBuffer data.
	 */

	readonly gData: Set<GData>;

	/**
	 * A list of effects that use convolution operations.
	 */

	readonly convolutionEffects: Set<Effect>;

	/**
	 * Indicates whether the shader transforms UV coordinates in the fragment shader.
	 */

	uvTransformation: boolean;

	/**
	 * Keeps track of the current color space.
	 */

	colorSpace: ColorSpace;

	/**
	 * Constructs new shader data.
	 */

	constructor() {

		this.shaderParts = new Map<EffectShaderSection, string>([
			[EffectShaderSection.FRAGMENT_HEAD_GBUFFER, ""],
			[EffectShaderSection.FRAGMENT_HEAD_EFFECTS, ""],
			[EffectShaderSection.FRAGMENT_MAIN_UV, ""],
			[EffectShaderSection.FRAGMENT_MAIN_GDATA, ""],
			[EffectShaderSection.FRAGMENT_MAIN_IMAGE, ""],
			[EffectShaderSection.VERTEX_HEAD, ""],
			[EffectShaderSection.VERTEX_MAIN_SUPPORT, ""]
		]);

		this.defines = new Map<string, string | number | boolean>();
		this.uniforms = new Map<string, Uniform>();
		this.blendModes = new Map<number, BlendMode>();
		this.varyings = new Set<string>();
		this.gData = new Set<GData>([GData.COLOR]);
		this.convolutionEffects = new Set<Effect>();
		this.uvTransformation = false;
		this.colorSpace = LinearSRGBColorSpace;

	}

	/**
	 * Validates the given effect.
	 *
	 * @param effect - The effect.
	 * @throws {@link Error} if the effect is invalid or cannot be merged.
	 */

	private validateEffect(effect: Effect): void {

		const fragmentShader = effect.fragmentShader;

		if(fragmentShader === null) {

			throw new Error(`Missing fragment shader (${effect.name})`);

		}

		if(effect.isConvolutionPass(false)) {

			this.convolutionEffects.add(effect);

		}

		if(this.convolutionEffects.size > 1) {

			const effectNames = Array.from(this.convolutionEffects).map(x => x.name).join(", ");
			throw new Error(`Convolution effects cannot be merged (${effectNames})`);

		} else if(effect.hasMainUvFunction && this.convolutionEffects.size > 0) {

			throw new Error(`Effects that transform UVs are incompatible with convolution effects (${effect.name})`);

		} else if(!effect.hasMainImageFunction && !effect.hasMainUvFunction) {

			throw new Error(`Could not find a valid mainImage or mainUv function (${effect.name})`);

		}

	}

	/**
	* Integrates the given effect by collecting relevant shader data.
	*
	* @param prefix - A prefix.
	* @param effect - The effect.
	* @throws {@link Error} if the effect is invalid or cannot be merged.
	*/

	integrateEffect(prefix: string, effect: Effect): void {

		this.validateEffect(effect);

		let fragmentShader = effect.fragmentShader!;
		let vertexShader = effect.vertexShader;

		const shaderParts = this.shaderParts;
		let fragmentHead = shaderParts.get(Section.FRAGMENT_HEAD_EFFECTS) as string;
		let fragmentMainUv = shaderParts.get(Section.FRAGMENT_MAIN_UV) as string;
		let fragmentMainImage = shaderParts.get(Section.FRAGMENT_MAIN_IMAGE) as string;
		let vertexHead = shaderParts.get(Section.VERTEX_HEAD) as string;
		let vertexMainSupport = shaderParts.get(Section.VERTEX_MAIN_SUPPORT) as string;

		const varyings = new Set<string>();
		const names = new Set<string>();

		if(effect.hasMainUvFunction) {

			fragmentMainUv += `\t${prefix}MainUv(UV);\n`;
			this.uvTransformation = true;

		}

		const functionRegExp = /\w+\s+(\w+)\([\w\s,]*\)\s*{/g;

		if(vertexShader !== null && effect.hasMainSupportFunction) {

			// Build the mainSupport call (with optional uv parameter).
			const needsUv = /mainSupport\s*\([\w\s]*?uv\s*?\)/.test(vertexShader);
			vertexMainSupport += `\t${prefix}MainSupport(`;
			vertexMainSupport += needsUv ? "vUv);\n" : ");\n";

			// Collect names of varyings and functions.
			for(const m of vertexShader.matchAll(/(?:out\s+\w+\s+([\S\s]*?);)/g)) {

				// Handle unusual formatting and commas.
				for(const n of m[1].split(/\s*,\s*/)) {

					this.varyings.add(n); // Varyings of all effects combined.
					varyings.add(n); // Varyings of this effect.
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
		fragmentShader = shaders.get("fragment") as string;
		vertexShader = shaders.get("vertex") as string;

		// Collect unique blend modes.
		const blendMode = effect.blendMode;
		this.blendModes.set(blendMode.blendFunction.id, blendMode);

		if(effect.hasMainImageFunction) {

			// Already checked param existence during effect validation.
			const gDataParamName = fragmentShader.match(/GData\s+(\w+)/)![0];

			// Detect GData usage.
			for(const value of Object.values(GData)) {

				const regExpGData = new RegExp(`${gDataParamName}.${value}`);

				if(regExpGData.test(fragmentShader)) {

					this.gData.add(value);

				}

			}

			if(effect.inputColorSpace !== NoColorSpace && effect.inputColorSpace !== this.colorSpace) {

				fragmentMainImage += (effect.inputColorSpace === SRGBColorSpace) ?
					"color0 = LinearTosRGB(color0);\n\t" :
					"color0 = sRGBToLinear(color0);\n\t";

			}

			// Remember the color space at this stage.
			if(effect.outputColorSpace !== null) {

				this.colorSpace = effect.outputColorSpace;

			} else if(effect.inputColorSpace !== null) {

				this.colorSpace = effect.inputColorSpace;

			}

			fragmentMainImage += `color1 = ${prefix}MainImage(color0, UV, gData);\n\t`;

			// Include the blend opacity uniform of this effect.
			const blendOpacity = prefix + "BlendOpacity";
			this.uniforms.set(blendOpacity, blendMode.opacityUniform);

			// Blend the result of this effect with the input color (color0 = dst, color1 = src).
			fragmentMainImage += `color0 = blend${blendMode.blendFunction.id}(color0, color1, ${blendOpacity});\n\n\t`;
			fragmentHead += `uniform float ${blendOpacity};\n\n`;

		}

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

	}

	/**
	* Creates a struct that defines the required GBuffer components.
	*
	* @return The shader code.
	*/

	createGBufferStruct(): string {

		const gData = this.gData;
		let s = "struct GBuffer {\n";

		if(gData.has(GData.COLOR)) {

			// Precision depends on the configured frame buffer type.
			s += "\tFRAME_BUFFER_PRECISION sampler2D color;\n";

		}

		if(gData.has(GData.DEPTH)) {

			// Precision depends on the hardware.
			s += "\tDEPTH_BUFFER_PRECISION sampler2D depth;\n";

		}

		if(gData.has(GData.NORMAL)) {

			s += "\tmediump sampler2D normal;\n";

		}

		if(gData.has(GData.ROUGHNESS) || gData.has(GData.METALNESS)) {

			s += "\tlowp sampler2D roughnessMetalness;\n";

		}

		s += "};\n";

		return s;

	}

	/**
	* Creates a struct that defines the required GBuffer data.
	*
	* @return The shader code.
	*/

	createGDataStruct(): string {

		const gData = this.gData;
		let s = "struct GData {\n";

		if(gData.has(GData.COLOR)) {

			s += "\tvec4 color;\n";

		}

		if(gData.has(GData.DEPTH)) {

			s += "\tfloat depth;\n";

		}

		if(gData.has(GData.NORMAL)) {

			s += "\tvec3 normal;\n";

		}

		if(gData.has(GData.ROUGHNESS)) {

			s += "\tfloat roughness;\n";

		}

		if(gData.has(GData.METALNESS)) {

			s += "\tfloat metalness;\n";

		}

		if(gData.has(GData.LUMINANCE)) {

			s += "\tfloat luminance;\n";

		}

		s += "};\n";

		return s;

	}

	/**
	* Creates the GData setup code.
	*
	* @return The shader code.
	*/

	createGDataSetup(): string {

		const gData = this.gData;
		let s = "GData gData;\n";

		if(gData.has(GData.COLOR)) {

			s += "\tgData.color = texture(gBuffer.color, UV);\n";

		}

		if(gData.has(GData.DEPTH)) {

			s += "\tgData.depth = texture(gBuffer.depth, UV).r;\n";

		}

		if(gData.has(GData.NORMAL)) {

			s += "\tgData.normal = texture(gBuffer.normal, UV).xyz;\n";

		}

		if(gData.has(GData.ROUGHNESS) || gData.has(GData.METALNESS)) {

			s += "\tvec2 roughnessMetalness = texture(gBuffer.roughnessMetalness, UV).rg;\n";

		}

		if(gData.has(GData.ROUGHNESS)) {

			s += "\tgData.roughness = roughnessMetalness.r;\n";

		}

		if(gData.has(GData.METALNESS)) {

			s += "\tgData.metalness = roughnessMetalness.g;\n";

		}

		if(gData.has(GData.LUMINANCE)) {

			s += "\tgData.luminance = luminance(gData.color.rgb);\n";

		}

		return s;

	}

	/**
	* Creates the relevant blend function declarations.
	*
	* @return The shader code.
	*/

	createBlendFunctions(): string {

		const blendRegExp = /\bblend\b/g;
		let s = "";

		for(const blendMode of this.blendModes.values()) {

			const blendFunctionShader = blendMode.blendFunction.shader!;
			const blendFunctionName = `blend${blendMode.blendFunction.id}`;
			s += blendFunctionShader.replace(blendRegExp, blendFunctionName) + "\n";

		}

		return s;

	}

}
