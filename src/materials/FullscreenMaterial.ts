import {
	GLSL3,
	LinearSRGBColorSpace,
	NoBlending,
	RawShaderMaterial,
	SRGBColorSpace,
	ShaderMaterialParameters,
	WebGLRenderer
} from "three";

import { ShaderWithDefines } from "../core/ShaderWithDefines.js";

/**
 * Supported precision constants.
 */

export type OutputPrecision = "highp" | "mediump" | "lowp";

/**
 * A fullscreen shader material.
 *
 * @group Materials
 */

export abstract class FullscreenMaterial extends RawShaderMaterial {

	/**
	 * Constructs a new copy material.
	 */

	constructor(parameters?: ShaderMaterialParameters) {

		super(Object.assign({
			name: "FullscreenMaterial",
			glslVersion: GLSL3,
			blending: NoBlending,
			depthWrite: false,
			depthTest: false,
			defines: {
				OUTPUT_COLOR_PRECISION: "lowp"
			}
		}, parameters));

		this.onBeforeCompile = (shader: ShaderWithDefines, renderer: WebGLRenderer) => {

			if(shader.defines === undefined || shader.defines === null) {

				shader.defines = {};

			}

			if(renderer.getRenderTarget() === null) {

				shader.defines.RENDER_TO_SCREEN = true;

				switch(renderer.outputColorSpace) {

					case SRGBColorSpace:
						shader.defines.OUTPUT_COLORSPACE = "1";
						break;

					case LinearSRGBColorSpace:
						shader.defines.OUTPUT_COLORSPACE = "0";
						break;

					default:
						throw new Error(`Unsupported color space: ${renderer.outputColorSpace}`);

				}

			} else {

				shader.defines.OUTPUT_COLORSPACE = "0";

			}

		};

	}

	/**
	 * The precision of the output color.
	 */

	get outputPrecision(): OutputPrecision {

		return this.defines.OUTPUT_COLOR_PRECISION as OutputPrecision;

	}

	set outputPrecision(value: OutputPrecision) {

		this.defines.OUTPUT_COLOR_PRECISION = value;

	}

}
