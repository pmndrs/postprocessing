import { ColorSpace, Uniform } from "three";
import { BlendFunction } from "../enums/BlendFunction.js";
import { EffectAttribute } from "../enums/EffectAttribute.js";
import { EffectShaderSection } from "../enums/EffectShaderSection.js";
import { WebGLExtension } from "../enums/WebGLExtension.js";
import { BlendMode } from "../effects/blending/BlendMode.js";

/**
 * A collection of shader data.
 *
 * @internal
 * @group Utils
 */

export class EffectShaderData {

	/**
	 * The shader parts.
	 */

	readonly shaderParts: Map<EffectShaderSection, string | null>;

	/**
	 * Preprocessor macros.
	 */

	readonly defines: Map<string, string>;

	/**
	 * The uniforms.
	 */

	readonly uniforms: Map<string, Uniform>;

	/**
	 * The blend modes of the individual effects.
	 */

	readonly blendModes: Map<BlendFunction, BlendMode>;

	/**
	 * Required extensions.
	 */

	readonly extensions: Set<WebGLExtension>;

	/**
	 * A set of varyings.
	 */

	readonly varyings: Set<string>;

	/**
	 * Collective effect attributes.
	 */

	attributes: EffectAttribute;

	/**
	 * Indicates whether the shader transforms UV coordinates in the fragment shader.
	 */

	uvTransformation: boolean;

	/**
	 * Indicates whether the shader reads depth in the fragment shader.
	 */

	readDepth: boolean;

	/**
	 * Keeps track of the current color space.
	 */

	colorSpace: ColorSpace;

	/**
	 * Constructs new shader data.
	 */

	constructor() {

		this.shaderParts = new Map<EffectShaderSection, string | null>([
			[EffectShaderSection.FRAGMENT_HEAD, null],
			[EffectShaderSection.FRAGMENT_MAIN_UV, null],
			[EffectShaderSection.FRAGMENT_MAIN_IMAGE, null],
			[EffectShaderSection.VERTEX_HEAD, null],
			[EffectShaderSection.VERTEX_MAIN_SUPPORT, null]
		]);

		this.defines = new Map<string, string>();
		this.uniforms = new Map<string, Uniform>();
		this.blendModes = new Map<BlendFunction, BlendMode>();
		this.extensions = new Set<WebGLExtension>();
		this.varyings = new Set<string>();
		this.attributes = EffectAttribute.NONE;
		this.uvTransformation = false;
		this.readDepth = false;
		this.colorSpace = "srgb-linear";

	}

}
