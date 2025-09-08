import {
	Material,
	ShaderMaterial,
	WebGLProgramParametersWithUniforms,
	WebGLRenderer,
	WebGLRenderTarget
} from "three";

import { addGBufferDefaultOutput, extractOutputDefinitions } from "./GBufferUtils.js";

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

	private readonly registeredMaterials = new WeakSet<Material>();

	/**
	 * @see {@link enabled}
	 */

	private _enabled: boolean;

	/**
	 * @see {@link gBuffer}
	 */

	private _gBuffer: WebGLRenderTarget | null;

	/**
	 * Constructs a new G-Buffer shader plugin.
	 */

	constructor() {

		this._enabled = true;
		this._gBuffer = null;

	}

	/**
	 * Indicates whether this plugin is enabled.
	 */

	get enabled(): boolean {

		return this._enabled;

	}

	set enabled(value: boolean) {

		this._enabled = value;

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

		if(this.registeredMaterials.has(material)) {

			return;

		}

		this.registeredMaterials.add(material);

		/* eslint-disable @typescript-eslint/unbound-method */
		const onBeforeCompile = material.onBeforeCompile;
		const customProgramCacheKey = material.customProgramCacheKey;

		material.onBeforeCompile = (shader: WebGLProgramParametersWithUniforms, renderer: WebGLRenderer) => {

			// Workaround for troika-three-text, see #660.
			if(material.onBeforeCompile !== onBeforeCompile) {

				onBeforeCompile.call(material, shader, renderer);

			}

			if(!this.enabled || this.gBuffer === null) {

				return;

			}

			// Update unknown materials that haven't already been modified via ShaderLib.
			if(material instanceof ShaderMaterial) {

				shader.fragmentShader = addGBufferDefaultOutput(shader.fragmentShader);

			}

			if(!shader.fragmentShader.includes("out_FragData")) {

				const outputDefinitions = extractOutputDefinitions(this.gBuffer);
				shader.fragmentShader = outputDefinitions + "\n" + shader.fragmentShader;

			}

		};

		material.customProgramCacheKey = () => {

			let key = "";

			// Workaround for troika-three-text, see @pmndrs/postprocessing#660.
			if(material.customProgramCacheKey !== customProgramCacheKey) {

				key += customProgramCacheKey.call(material);

			}

			const gBufferId = this.gBuffer?.texture.uuid ?? "";
			return key + this.enabled + gBufferId;

		};

	}

}
