import {
	Material,
	ShaderMaterial,
	WebGLProgramParametersWithUniforms,
	WebGLRenderer,
	WebGLRenderTarget
} from "three";

import { extractOutputDefinitions } from "./GBufferUtils.js";

/**
 * A shader plugin that enables rendering to G-Buffer render targets.
 *
 * @category Utils
 * @internal
 */

export class GBufferShaderPlugin {

	/**
	 * A collection of materials that have been modified with `onBeforeCompile`.
	 */

	private static readonly registeredMaterials = new WeakSet<Material>();

	/**
	 * A collection of materials that have been modified with `onBeforeCompile`.
	 */

	private _gBuffer: WebGLRenderTarget | null;

	/**
	 * Constructs a new G-Buffer shader plugin.
	 */

	constructor() {

		this._gBuffer = null;

	}

	/**
	 * Returns the G-Buffer render target, or null if there is none.
	 */

	get gBuffer(): WebGLRenderTarget | null {

		return this._gBuffer;

	}

	set gBuffer(value: WebGLRenderTarget | null) {

		this._gBuffer = value;

	}

	/**
	 * Applies this plugin to the given material.
	 *
	 * @param material - The material.
	 */

	applyTo(material: Material) {

		if(GBufferShaderPlugin.registeredMaterials.has(material)) {

			return;

		}

		GBufferShaderPlugin.registeredMaterials.add(material);

		/* eslint-disable @typescript-eslint/unbound-method */
		const onBeforeCompile = material.onBeforeCompile;
		const customProgramCacheKey = material.customProgramCacheKey;

		material.onBeforeCompile = (shader: WebGLProgramParametersWithUniforms, renderer: WebGLRenderer) => {

			// Workaround for troika-three-text, see #660.
			if(material.onBeforeCompile !== onBeforeCompile) {

				onBeforeCompile.call(material, shader, renderer);

			}

			if(this.gBuffer === null) {

				return;

			}

			// Built-in materials have already been modified via ShaderLib.
			if(material instanceof ShaderMaterial) {

				shader.fragmentShader = shader.fragmentShader.replace(
					/(^ *void\s+main\(\)\s+{.*)/m,
					"#include <pp_normal_codec_pars_fragment>\n\n$1\n\n#include <pp_default_output_fragment>"
				);

			}

			const outputDefinitions = extractOutputDefinitions(this.gBuffer);
			shader.fragmentShader = outputDefinitions + "\n\n" + shader.fragmentShader;

		};

		material.customProgramCacheKey = () => {

			let key = this.gBuffer?.texture?.uuid ?? "";

			// Workaround for troika-three-text, see #660.
			if(material.customProgramCacheKey !== customProgramCacheKey) {

				key += customProgramCacheKey.call(material);

			}

			return key;

		};

	}

}
