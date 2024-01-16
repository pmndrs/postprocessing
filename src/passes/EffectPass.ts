import {
	Event,
	EventListener,
	OrthographicCamera,
	PerspectiveCamera,
	BaseEvent,
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
import { Log } from "../utils/Log.js";
import { Resolution } from "../utils/Resolution.js";

/**
 * An effect pass.
 *
 * Use this pass to combine {@link Effect} instances.
 *
 * @category Passes
 */

export class EffectPass extends Pass<EffectMaterial> implements EventListenerObject {

	/**
	 * A collection that maps GBuffer components to GBuffer struct field names.
	 */

	private static gBufferStructFields = /* @__PURE__ */ new Map([
		[GBuffer.COLOR, "color"],
		[GBuffer.DEPTH, "depth"],
		[GBuffer.NORMAL, "normal"],
		[GBuffer.ROUGHNESS, "roughnessMetalness"],
		[GBuffer.METALNESS, "roughnessMetalness"]
	]);

	/**
	 * An event listener that forwards events to {@link handleEvent}.
	 */

	private listener: EventListener<BaseEvent, string, Pass<Material | null>>;

	/**
	 * Keeps track of previous input defines.
	 */

	private readonly previousDefines: Map<string, string | number | boolean>;

	/**
	 * Keeps track of previous input uniforms.
	 */

	private readonly previousUniforms: Map<string, Uniform>;

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
		this.listener = (e: Event) => this.handleEvent(e);
		this.previousDefines = new Map<string, string | number | boolean>();
		this.previousUniforms = new Map<string, Uniform>();
		this.effects = effects;
		this.timeScale = 1.0;

	}

	override get camera(): OrthographicCamera | PerspectiveCamera | null {

		return super.camera;

	}

	override set camera(value: OrthographicCamera | PerspectiveCamera | null) {

		super.camera = value;

		if(value !== null) {

			this.fullscreenMaterial.copyCameraSettings(value);

		}

	}

	override get subpasses(): ReadonlyArray<Pass<Material | null>> {

		return super.subpasses;

	}

	private override set subpasses(value: Pass<Material | null>[]) {

		for(const effect of super.subpasses) {

			effect.removeEventListener(Pass.EVENT_CHANGE, this.listener);

		}

		super.subpasses = value;
		Object.freeze(super.subpasses);

		for(const effect of super.subpasses) {

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

				Log.info("Dithering only works on low precision colors");

			} else {

				material.dithering = value;
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

		const data = new EffectShaderData();
		let id = 0;

		for(const effect of this.effects) {

			if(effect.blendMode.blendFunction.shader !== null) {

				data.integrateEffect(`e${id++}`, effect);

			}

		}

		data.shaderParts.set(Section.FRAGMENT_HEAD_GBUFFER, data.createGBufferStruct());
		data.shaderParts.set(Section.FRAGMENT_HEAD_GDATA, data.createGDataStruct());
		data.shaderParts.set(Section.FRAGMENT_MAIN_GDATA, data.createGDataSetup());

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

			Log.error(e);
			Log.info("Disabling pass:", this);
			this.enabled = false;

		}

	}

	protected override onResolutionChange(resolution: Resolution): void {

		this.fullscreenMaterial.setSize(resolution.width, resolution.height);

		for(const effect of this.effects) {

			effect.resolution.copy(resolution);

		}

	}

	protected override onInputChange(): void {

		// Construct the gBuffer uniform.

		const gBufferEntries: [string, Texture | null][] = [];
		const fullscreenMaterial = this.fullscreenMaterial;
		const input = this.input;

		for(const component of input.gBuffer) {

			gBufferEntries.push([
				EffectPass.gBufferStructFields.get(component) as string,
				component === GBuffer.COLOR ? input.defaultBuffer : input.buffers.get(component) || null
			]);

		}

		fullscreenMaterial.gBuffer = Object.fromEntries(gBufferEntries);

		// Remove previous input defines and uniforms.

		for(const key of this.previousDefines.keys()) {

			delete fullscreenMaterial.defines[key];

		}

		for(const key of this.previousUniforms.keys()) {

			delete fullscreenMaterial.uniforms[key];

		}

		this.previousDefines.clear();
		this.previousUniforms.clear();

		for(const entry of input.defines) {

			this.previousDefines.set(entry[0], entry[1]);

		}

		for(const entry of input.uniforms) {

			this.previousUniforms.set(entry[0], entry[1]);

		}

		fullscreenMaterial.needsUpdate = true;

		// Make the input buffers available to all effects.

		for(const effect of this.effects) {

			effect.input.buffers.clear();

			for(const entry of input.buffers) {

				effect.input.buffers.set(entry[0], entry[1]);

			}

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

		this.renderer.setRenderTarget(this.output.defaultBuffer);
		this.renderFullscreen();

	}

	handleEvent(event: Event): void {

		switch(event.type) {

			case "change":
				this.rebuild();
				break;

		}

	}

}
