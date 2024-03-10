import { LinearSRGBColorSpace } from "three";
import { EffectAttribute } from "../enums/EffectAttribute.js";
import { EffectShaderSection as Section } from "../enums/EffectShaderSection.js";

/**
 * A collection of shader data.
 *
 * @internal
 */

export class EffectShaderData {

	/**
	 * Constructs new shader data.
	 */

	constructor() {

		/**
		 * The shader parts.
		 *
		 * @type {Map<EffectShaderSection, String>}
		 * @readonly
		 */

		this.shaderParts = new Map([
			[Section.FRAGMENT_HEAD, null],
			[Section.FRAGMENT_MAIN_UV, null],
			[Section.FRAGMENT_MAIN_IMAGE, null],
			[Section.VERTEX_HEAD, null],
			[Section.VERTEX_MAIN_SUPPORT, null]
		]);

		/**
		 * Preprocessor macros.
		 *
		 * @type {Map<String, String>}
		 * @readonly
		 */

		this.defines = new Map();

		/**
		 * The uniforms.
		 *
		 * @type {Map<String, Uniform>}
		 * @readonly
		 */

		this.uniforms = new Map();

		/**
		 * The blend modes of the individual effects.
		 *
		 * @type {Map<BlendFunction, BlendMode>}
		 * @readonly
		 */

		this.blendModes = new Map();

		/**
		 * Required extensions.
		 *
		 * @type {Set<WebGLExtension>}
		 * @readonly
		 */

		this.extensions = new Set();

		/**
		 * Combined effect attributes.
		 *
		 * @type {EffectAttribute}
		 */

		this.attributes = EffectAttribute.NONE;

		/**
		 * A list of varyings.
		 *
		 * @type {Set<String>}
		 * @readonly
		 */

		this.varyings = new Set();

		/**
		 * Indicates whether the shader transforms UV coordinates in the fragment shader.
		 *
		 * @type {Boolean}
		 */

		this.uvTransformation = false;

		/**
		 * Indicates whether the shader reads depth in the fragment shader.
		 *
		 * @type {Boolean}
		 */

		this.readDepth = false;

		/**
		 * Keeps track of the current color space.
		 *
		 * @type {ColorSpace}
		 */

		this.colorSpace = LinearSRGBColorSpace;

	}

}
