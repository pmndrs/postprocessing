import { Texture, Uniform } from "three";
import { EffectShaderSection } from "../enums/EffectShaderSection.js";
import { EffectShaderSection as Section } from "../enums/EffectShaderSection.js";
import { FullscreenMaterial } from "./FullscreenMaterial.js";

import fragmentTemplate from "./shaders/effect.frag";
import vertexTemplate from "./shaders/effect.vert";

/**
 * An effect material.
 *
 * @category Materials
 */

export class EffectMaterial extends FullscreenMaterial {

	/**
	 * Keeps track of custom uniforms.
	 */

	private readonly customUniforms: Map<string, Uniform>;

	/**
	 * Keeps track of custom defines.
	 */

	private readonly customDefines: Map<string, string | number | boolean>;

	/**
	 * Constructs a new effect material.
	 */

	constructor() {

		super({
			name: "EffectMaterial",
			defines: {
				COLOR_SPACE_CONVERSION: true
			},
			uniforms: {
				gBuffer: new Uniform(null),
				time: new Uniform(0.0)
			}
		});

		this.customUniforms = new Map<string, Uniform>();
		this.customDefines = new Map<string, string | number | boolean>();

		// Ensure that gl_FragColor is defined in the default shader.
		this.fragmentShader = "#include <pp_default_output_pars_fragment>\n\n" + this.fragmentShader;

	}

	/**
	 * The current gBuffer struct.
	 */

	get gBuffer(): Record<string, Texture | null> | null {

		return this.uniforms.gBuffer.value as Record<string, Texture | null> | null;

	}

	set gBuffer(value: Record<string, Texture | null>) {

		this.uniforms.gBuffer.value = value;

	}

	/**
	 * Indicates whether output color space conversion is enabled.
	 */

	get colorSpaceConversion(): boolean {

		return (this.defines.COLOR_SPACE_CONVERSION !== undefined);

	}

	set colorSpaceConversion(value: boolean) {

		if(this.colorSpaceConversion !== value) {

			if(value) {

				this.defines.COLOR_SPACE_CONVERSION = true;

			} else {

				delete this.defines.COLOR_SPACE_CONVERSION;

			}

			this.needsUpdate = true;

		}

	}

	/**
	 * The current animation time in seconds.
	 */

	get time(): number {

		return this.uniforms.time.value as number;

	}

	set time(value: number) {

		this.uniforms.time.value = value;

	}

	/**
	 * Sets the shader parts.
	 *
	 * @param shaderParts - A collection of shader code snippets. See {@link EffectShaderSection}.
	 * @return This material.
	 */

	setShaderParts(shaderParts: Map<EffectShaderSection, string | null>): this {

		this.fragmentShader = fragmentTemplate
			.replace(Section.FRAGMENT_MAIN_IMAGE, shaderParts.get(Section.FRAGMENT_MAIN_IMAGE)!)
			.replace(Section.FRAGMENT_MAIN_GDATA, shaderParts.get(Section.FRAGMENT_MAIN_GDATA)!)
			.replace(Section.FRAGMENT_MAIN_UV, shaderParts.get(Section.FRAGMENT_MAIN_UV)!)
			.replace(Section.FRAGMENT_HEAD_EFFECTS, shaderParts.get(Section.FRAGMENT_HEAD_EFFECTS)!)
			.replace(Section.FRAGMENT_HEAD_GBUFFER, shaderParts.get(Section.FRAGMENT_HEAD_GBUFFER)!)
			.replace(Section.FRAGMENT_HEAD_GDATA, shaderParts.get(Section.FRAGMENT_HEAD_GDATA)!);

		this.vertexShader = vertexTemplate
			.replace(Section.VERTEX_MAIN_SUPPORT, shaderParts.get(Section.VERTEX_MAIN_SUPPORT)!)
			.replace(Section.VERTEX_HEAD, shaderParts.get(Section.VERTEX_HEAD)!);

		this.needsUpdate = true;
		return this;

	}

	/**
	 * Sets the shader macros.
	 *
	 * Macros that have previously been set will be removed before the new ones are added.
	 *
	 * @param defines - A collection of preprocessor macro definitions.
	 * @return This material.
	 */

	setDefines(defines: Map<string, string | number | boolean>): this {

		// Reset defines.
		for(const key of this.customDefines.keys()) {

			delete this.defines[key];

		}

		this.customDefines.clear();

		for(const entry of defines.entries()) {

			this.defines[entry[0]] = entry[1];
			this.customDefines.set(entry[0], entry[1]);

		}

		this.needsUpdate = true;
		return this;

	}

	/**
	 * Sets the shader uniforms.
	 *
	 * Uniforms that have previously been set will be removed before the new ones are added.
	 *
	 * @param uniforms - A collection of uniforms.
	 * @return This material.
	 */

	setUniforms(uniforms: Map<string, Uniform>): this {

		// Reset uniforms.
		for(const key of this.customUniforms.keys()) {

			delete this.uniforms[key];

		}

		this.customUniforms.clear();

		for(const entry of uniforms.entries()) {

			this.uniforms[entry[0]] = entry[1];
			this.customUniforms.set(entry[0], entry[1]);

		}

		this.uniformsNeedUpdate = true;
		return this;

	}

}
