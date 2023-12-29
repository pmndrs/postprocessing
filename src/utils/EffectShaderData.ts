import { ColorSpace, LinearSRGBColorSpace, Uniform } from "three";
import { ShaderData } from "../core/ShaderData.js";
import { GData } from "../enums/GData.js";
import { Effect } from "../effects/Effect.js";
import { EffectShaderSection } from "../enums/EffectShaderSection.js";
import { BlendMode } from "../effects/blending/BlendMode.js";

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

	readonly shaderParts: Map<EffectShaderSection, string | null>;

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

		this.shaderParts = new Map<EffectShaderSection, string | null>([
			[EffectShaderSection.FRAGMENT_HEAD_GBUFFER, null],
			[EffectShaderSection.FRAGMENT_HEAD, null],
			[EffectShaderSection.FRAGMENT_MAIN_UV, null],
			[EffectShaderSection.FRAGMENT_MAIN_GDATA, null],
			[EffectShaderSection.FRAGMENT_MAIN_IMAGE, null],
			[EffectShaderSection.VERTEX_HEAD, null],
			[EffectShaderSection.VERTEX_MAIN_SUPPORT, null]
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

		s += "}\n";

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

		s += "}\n";

		return s;

	}

	/**
	* Creates the GData setup code.
	*
	* @return The shader code.
	*/

	createGDataSetup(): string {

		const gData = this.gData;
		let s = "GData gData;";

		if(gData.has(GData.COLOR)) {

			s += "gData.color = texture(gBuffer.color, UV);\n";

		}

		if(gData.has(GData.DEPTH)) {

			s += "gData.depth = texture(gBuffer.depth, UV).r;\n";

		}

		if(gData.has(GData.NORMAL)) {

			s += "gData.normal = texture(gBuffer.normal, UV).xyz;\n";

		}

		if(gData.has(GData.ROUGHNESS) || gData.has(GData.METALNESS)) {

			s += "vec2 roughnessMetalness = texture(gBuffer.roughnessMetalness, UV).rg;\n";

		}

		if(gData.has(GData.ROUGHNESS)) {

			s += "gData.roughness = roughnessMetalness.r;\n";

		}

		if(gData.has(GData.METALNESS)) {

			s += "gData.metalness = roughnessMetalness.g;\n";

		}

		if(gData.has(GData.LUMINANCE)) {

			s += "gData.luminance = luminance(gData.color.rgb);\n";

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
			s += blendFunctionShader.replace(blendRegExp, blendMode.blendFunction.name) + "\n";

		}

		return s;

	}

}
