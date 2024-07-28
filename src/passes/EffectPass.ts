import {
	SRGBColorSpace,
	WebGLRenderer,
	Material,
	Texture,
	Uniform
} from "three";

import { Pass } from "../core/Pass.js";
import { Effect } from "../effects/Effect.js";
import { EffectShaderSection as Section } from "../enums/EffectShaderSection.js";
import { GBuffer } from "../enums/GBuffer.js";
import { EffectMaterial } from "../materials/EffectMaterial.js";
import { EffectShaderData } from "../utils/EffectShaderData.js";
import { GBufferConfig } from "../utils/GBufferConfig.js";
import { Resolution } from "../utils/Resolution.js";

/**
 * An effect pass.
 *
 * Use this pass to combine {@link Effect} instances.
 *
 * @category Passes
 */

export class EffectPass extends Pass<EffectMaterial> {

	/**
	 * Keeps track of previous input defines.
	 */

	private readonly previousDefines: Map<string, string | number | boolean>;

	/**
	 * Keeps track of previous input uniforms.
	 */

	private readonly previousUniforms: Map<string, Uniform>;

	/**
	 * Keeps track of the previous G-Buffer configuration.
	 */

	private previousGBufferConfig: GBufferConfig | null;

	/**
	 * An event listener that triggers {@link rebuild}.
	 */

	private listener: () => void;

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

		this.output.defaultBuffer = this.createFramebuffer();
		this.fullscreenMaterial = new EffectMaterial();
		this.previousDefines = new Map<string, string | number | boolean>();
		this.previousUniforms = new Map<string, Uniform>();
		this.previousGBufferConfig = null;
		this.listener = () => this.rebuild();
		this.effects = effects;
		this.timeScale = 1.0;

	}

	override get subpasses(): ReadonlyArray<Pass<Material | null>> {

		return super.subpasses;

	}

	private override set subpasses(value: Pass<Material | null>[]) {

		for(const effect of super.subpasses) {

			effect.removeEventListener(Pass.EVENT_CHANGE, this.listener);

		}

		super.subpasses = value;
		this.input.gBuffer.clear();

		for(const effect of super.subpasses) {

			for(const gBufferComponent of effect.input.gBuffer) {

				this.input.gBuffer.add(gBufferComponent);

			}

			effect.addEventListener(Pass.EVENT_CHANGE, this.listener);

		}

		this.rebuild();

	}

	/**
	 * The effects.
	 */

	get effects(): ReadonlyArray<Effect> {

		return this.subpasses as ReadonlyArray<Effect>;

	}

	protected set effects(value: Effect[]) {

		this.subpasses = value;

	}

	/**
	 * Indicates whether dithering is enabled.
	 */

	get dithering(): boolean {

		return this.fullscreenMaterial.dithering;

	}

	set dithering(value: boolean) {

		const material = this.fullscreenMaterial;

		if(material.dithering !== value) {

			if(value && this.fullscreenMaterial.outputPrecision !== "lowp") {

				console.info("Dithering only works on low precision colors");

			} else {

				material.dithering = value;

				// The macro needs to be updated manually because RawShaderMaterial doesn't honor the property.
				if(value) {

					material.defines.DITHERING = true;

				} else {

					delete material.defines.DITHERING;

				}

				material.needsUpdate = true;

			}

		}

	}

	/**
	 * Updates the composite shader material.
	 *
	 * @throws {@link Error} if the current effects cannot be merged.
	 */

	private updateMaterial(): void {

		const data = new EffectShaderData(this.input.gBufferConfig);
		let id = 0;

		for(const effect of this.effects) {

			if(effect.blendMode.blendFunction.shader !== null) {

				data.integrateEffect(`e${id++}`, effect);

			}

		}

		data.shaderParts.set(Section.FRAGMENT_HEAD_GBUFFER, data.createGBufferStruct());
		data.shaderParts.set(Section.FRAGMENT_HEAD_GDATA, data.createGDataStructDeclaration());
		data.shaderParts.set(Section.FRAGMENT_MAIN_GDATA, data.createGDataStructInitialization());

		const fragmentHead = data.shaderParts.get(Section.FRAGMENT_HEAD_EFFECTS) as string;
		data.shaderParts.set(Section.FRAGMENT_HEAD_EFFECTS, fragmentHead + data.createBlendFunctions());

		if(data.colorSpace === SRGBColorSpace) {

			// Convert back to linear.
			const fragmentMainImage = data.shaderParts.get(Section.FRAGMENT_MAIN_IMAGE) as string;
			data.shaderParts.set(Section.FRAGMENT_MAIN_IMAGE, fragmentMainImage + "color0 = sRGBToLinear(color0);\n\t");

		}

		// Check if any effect transforms UVs in the fragment shader.
		if(data.uvTransformation) {

			const fragmentMainUv = data.shaderParts.get(Section.FRAGMENT_MAIN_UV) as string;
			data.shaderParts.set(Section.FRAGMENT_MAIN_UV, "vec2 transformedUv = vUv;\n" + fragmentMainUv);
			data.defines.set("UV", "transformedUv");

		} else {

			data.defines.set("UV", "vUv");

		}

		// Ensure that leading preprocessor directives start on a new line.
		data.shaderParts.forEach((v, k, map) => map.set(k, v.trim().replace(/^#/, "\n#")));

		// Add input defines and uniforms.
		for(const entry of this.input.defines) {

			data.defines.set(entry[0], entry[1]);

		}

		for(const entry of this.input.uniforms) {

			data.uniforms.set(entry[0], entry[1]);

		}

		this.fullscreenMaterial
			.setShaderParts(data.shaderParts)
			.setDefines(data.defines)
			.setUniforms(data.uniforms);

	}

	/**
	 * Rebuilds the composite shader material.
	 */

	protected rebuild(): void {

		try {

			this.updateMaterial();

		} catch(e) {

			console.error(e);
			console.info("Disabling pass:", this);
			this.enabled = false;

		}

	}

	/**
	 * Updates macros and uniforms.
	 */

	private updateDefinesAndUniforms(): void {

		const fullscreenMaterial = this.fullscreenMaterial;
		const input = this.input;

		// Remove previous input defines and uniforms.

		for(const key of this.previousDefines.keys()) {

			delete fullscreenMaterial.defines[key];

		}

		for(const key of this.previousUniforms.keys()) {

			delete fullscreenMaterial.uniforms[key];

		}

		this.previousDefines.clear();
		this.previousUniforms.clear();

		// Add the new input defines and uniforms.

		for(const entry of input.defines) {

			this.previousDefines.set(entry[0], entry[1]);
			fullscreenMaterial.defines[entry[0]] = entry[1];

		}

		for(const entry of input.uniforms) {

			this.previousUniforms.set(entry[0], entry[1]);
			fullscreenMaterial.uniforms[entry[0]] = entry[1];

		}

		fullscreenMaterial.needsUpdate = true;

	}

	/**
	 * Updates the G-Buffer struct uniform.
	 */

	private updateGBufferStruct(): void {

		const input = this.input;
		const gBufferConfig = input.gBufferConfig;

		if(gBufferConfig === null) {

			return;

		}

		const gBufferEntries: [string, Texture | null][] = [];

		for(const component of input.gBuffer) {

			const useDefaultBuffer = (component === GBuffer.COLOR as string);

			gBufferEntries.push([
				gBufferConfig.gBufferStructFields.get(component) as string,
				(useDefaultBuffer ? input.defaultBuffer?.value : input.buffers.get(component)?.value) ?? null
			]);

		}

		this.fullscreenMaterial.gBuffer = Object.fromEntries(gBufferEntries);

	}

	protected override onInputChange(): void {

		this.updateGBufferStruct();
		this.updateDefinesAndUniforms();

		// Make the input buffers available to all effects.

		for(const effect of this.effects) {

			effect.input.buffers.clear();

			for(const entry of this.input.buffers) {

				effect.input.buffers.set(entry[0], entry[1]);

			}

		}

		// Clean up and configure listeners for the G-Buffer configuration.

		if(this.previousGBufferConfig !== null) {

			this.previousGBufferConfig.removeEventListener(GBufferConfig.EVENT_CHANGE, this.listener);

		}

		if(this.input.gBufferConfig !== null) {

			this.input.gBufferConfig.addEventListener(GBufferConfig.EVENT_CHANGE, this.listener);

		}

		this.previousGBufferConfig = this.input.gBufferConfig;

	}

	protected override onResolutionChange(resolution: Resolution): void {

		this.fullscreenMaterial.setSize(resolution.width, resolution.height);

		for(const effect of this.effects) {

			effect.resolution.copy(resolution);

		}

	}

	override checkRequirements(renderer: WebGLRenderer): void {

		for(const effect of this.effects) {

			effect.checkRequirements(renderer);

		}

	}

	override dispose(): void {

		for(const effect of this.effects) {

			effect.removeEventListener("change", this.listener);

		}

		super.dispose();

	}

	render(): void {

		if(this.renderer === null || this.timer === null) {

			return;

		}

		for(const effect of this.effects) {

			effect.render();

		}

		const material = this.fullscreenMaterial;
		material.time += this.timer.getDelta() * this.timeScale;

		this.renderer.setRenderTarget(this.output.defaultBuffer?.value ?? null);
		this.renderFullscreen();

	}

}
