import {
	Event,
	EventListener,
	OrthographicCamera,
	PerspectiveCamera,
	BaseEvent,
	SRGBColorSpace,
	WebGLRenderer,
	Material,
	Texture
} from "three";

import { Pass } from "../core/Pass.js";
import { Effect } from "../effects/Effect.js";
import { EffectShaderSection as Section } from "../enums/EffectShaderSection.js";
import { GData } from "../enums/GData.js";
import { EffectMaterial } from "../materials/EffectMaterial.js";
import { isConvolutionPass } from "../utils/functions/pass.js";
import { EffectShaderData } from "../utils/EffectShaderData.js";
import { Log } from "../utils/Log.js";
import { Resolution } from "../utils/Resolution.js";

/**
 * Prefixes substrings within the given strings.
 *
 * @param prefix - A prefix.
 * @param substrings - The substrings.
 * @param shadersOrMacros - A collection of shaders or macros.
 */

function prefixSubstrings(prefix: string, substrings: Iterable<string>,
	shadersOrMacros: Map<string, string | number | boolean | null>): void {

	for(const substring of substrings) {

		// Prefix the substring and build a RegExp that searches for the unprefixed version.
		const prefixed = "$1" + prefix + substring.charAt(0).toUpperCase() + substring.slice(1);
		const regExp = new RegExp("([^\\.])(\\b" + substring + "\\b)", "g");

		for(const entry of shadersOrMacros.entries()) {

			if(typeof entry[1] === "string") {

				// Replace all occurances of the substring with the prefixed version.
				shadersOrMacros.set(entry[0], entry[1].replace(regExp, prefixed));

			}

		}

	}

}

/**
 * A collection of fragment shader information.
 */

interface FragmentShaderInfo {

	mainImageExists: boolean;
	mainUvExists: boolean;

}

/**
 * Validates the given effect.
 *
 * @param effect - The effect.
 * @param data - Effect shader data.
 * @throws {@link Error} if the effect is invalid or cannot be merged.
 * @return Fragment shader information.
 */

function validateEffect(effect: Effect, data: EffectShaderData): FragmentShaderInfo {

	const fragmentShader = effect.fragmentShader;

	if(fragmentShader === null) {

		throw new Error(`Missing fragment shader (${effect.name})`);

	}

	const mainImageExists = (fragmentShader !== undefined && /mainImage/.test(fragmentShader));
	const mainUvExists = (fragmentShader !== undefined && /mainUv/.test(fragmentShader));

	if(isConvolutionPass(effect, true)) {

		data.convolutionEffects.add(effect);

	}

	if(data.convolutionEffects.size > 1) {

		const effectNames = Array.from(data.convolutionEffects).map(x => x.name).join(", ");
		throw new Error(`Convolution effects cannot be merged (${effectNames})`);

	} else if(mainUvExists && data.convolutionEffects.size > 0) {

		throw new Error(`Effects that transform UVs are incompatible with convolution effects (${effect.name})`);

	} else if(!mainImageExists && !mainUvExists) {

		throw new Error(`Could not find a valid mainImage or mainUv function (${effect.name})`);

	} else if(mainImageExists && !/GData\s+\w+/.test(fragmentShader)) {

		throw new Error(`Invalid mainImage signature (${effect.name})`);

	}

	return { mainImageExists, mainUvExists };

}

/**
 * Integrates the given effect by collecting relevant shader data.
 *
 * @param prefix - A prefix.
 * @param effect - The effect.
 * @param data - Cumulative effect shader data.
 * @throws {@link Error} if the effect is invalid or cannot be merged.
 */

function integrateEffect(prefix: string, effect: Effect, data: EffectShaderData): void {

	const { mainImageExists, mainUvExists } = validateEffect(effect, data);
	let fragmentShader = effect.fragmentShader!;
	let vertexShader = effect.vertexShader;

	const shaderParts = data.shaderParts;
	let fragmentHead = shaderParts.get(Section.FRAGMENT_HEAD) ?? "";
	let fragmentMainUv = shaderParts.get(Section.FRAGMENT_MAIN_UV) ?? "";
	let fragmentMainImage = shaderParts.get(Section.FRAGMENT_MAIN_IMAGE) ?? "";
	let vertexHead = shaderParts.get(Section.VERTEX_HEAD) ?? "";
	let vertexMainSupport = shaderParts.get(Section.VERTEX_MAIN_SUPPORT) ?? "";

	const varyings = new Set<string>();
	const names = new Set<string>();

	if(mainUvExists) {

		fragmentMainUv += `\t${prefix}MainUv(UV);\n`;
		data.uvTransformation = true;

	}

	const functionRegExp = /\w+\s+(\w+)\([\w\s,]*\)\s*{/g;

	if(vertexShader !== null && /mainSupport/.test(vertexShader)) {

		// Build the mainSupport call (with optional uv parameter).
		const needsUv = /mainSupport\s*\([\w\s]*?uv\s*?\)/.test(vertexShader);
		vertexMainSupport += `\t${prefix}MainSupport(`;
		vertexMainSupport += needsUv ? "vUv);\n" : ");\n";

		// Collect names of varyings and functions.
		for(const m of vertexShader.matchAll(/(?:out\s+\w+\s+([\S\s]*?);)/g)) {

			// Handle unusual formatting and commas.
			for(const n of m[1].split(/\s*,\s*/)) {

				data.varyings.add(n);
				varyings.add(n);
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
	effect.input.uniforms.forEach((v, k) => data.uniforms.set(prefix + k.charAt(0).toUpperCase() + k.slice(1), v));
	effect.input.defines.forEach((v, k) => data.defines.set(prefix + k.charAt(0).toUpperCase() + k.slice(1), v));

	// Prefix varyings, functions and uniforms in shaders and macros.
	const shaders = new Map([["fragment", fragmentShader], ["vertex", vertexShader]]);
	prefixSubstrings(prefix, names, data.defines);
	prefixSubstrings(prefix, names, shaders);
	fragmentShader = shaders.get("fragment") as string;
	vertexShader = shaders.get("vertex") as string;

	// Collect unique blend modes.
	const blendMode = effect.blendMode;
	data.blendModes.set(blendMode.blendFunction.id, blendMode);

	if(mainImageExists) {

		// Already checked param existence during effect validation.
		const gDataParamName = fragmentShader.match(/GData\s+(\w+)/)![0];

		// Detect GData usage.
		for(const value of Object.values(GData)) {

			const regExpGData = new RegExp(`${gDataParamName}.${value}`);

			if(regExpGData.test(fragmentShader)) {

				data.gData.add(value);

			}

		}

		if(effect.inputColorSpace !== null && effect.inputColorSpace !== data.colorSpace) {

			fragmentMainImage += (effect.inputColorSpace === SRGBColorSpace) ?
				"color0 = LinearTosRGB(color0);\n\t" :
				"color0 = sRGBToLinear(color0);\n\t";

		}

		// Remember the color space at this stage.
		if(effect.outputColorSpace !== null) {

			data.colorSpace = effect.outputColorSpace;

		} else if(effect.inputColorSpace !== null) {

			data.colorSpace = effect.inputColorSpace;

		}

		fragmentMainImage += `color1 = ${prefix}MainImage(color0, UV, gData);\n\t`;

		// Include the blend opacity uniform of this effect.
		const blendOpacity = prefix + "BlendOpacity";
		data.uniforms.set(blendOpacity, blendMode.opacityUniform);

		// Blend the result of this effect with the input color (color0 = dst, color1 = src).
		fragmentMainImage += `color0 = ${blendMode.blendFunction.name}(color0, color1, ${blendOpacity});\n\n\t`;
		fragmentHead += `uniform float ${blendOpacity};\n\n`;

	}

	// Include the modified code in the final shader.
	fragmentHead += fragmentShader + "\n";

	if(vertexShader !== null) {

		vertexHead += vertexShader + "\n";

	}

	shaderParts.set(Section.FRAGMENT_HEAD, fragmentHead);
	shaderParts.set(Section.FRAGMENT_MAIN_UV, fragmentMainUv);
	shaderParts.set(Section.FRAGMENT_MAIN_IMAGE, fragmentMainImage);
	shaderParts.set(Section.VERTEX_HEAD, vertexHead);
	shaderParts.set(Section.VERTEX_MAIN_SUPPORT, vertexMainSupport);

}

/**
 * An effect pass.
 *
 * Use this pass to combine {@link Effect} instances.
 *
 * @group Passes
 */

export class EffectPass extends Pass<EffectMaterial> implements EventListenerObject {

	/**
	 * An event listener that forwards events to {@link handleEvent}.
	 */

	private listener: EventListener<BaseEvent, string, Pass<Material | null>>;

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

		this.fullscreenMaterial = new EffectMaterial();
		this.listener = (e: Event) => this.handleEvent(e);
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
		material.dithering = value;
		material.needsUpdate = true;

	}

	/**
	 * Updates the composite shader material.
	 *
	 * @throws {@link Error} if the current effects cannot be merged.
	 */

	private updateMaterial(): void {

		if(this.effects.length === 0) {

			throw new Error("There are no effects to merge");

		}

		const data = new EffectShaderData();
		let id = 0;

		for(const effect of this.effects) {

			if(effect.blendMode.blendFunction.shader === null) {

				continue;

			}

			integrateEffect(`e${id++}`, effect, data);

		}

		data.shaderParts.set(Section.FRAGMENT_HEAD_GBUFFER, data.createGBufferStruct());
		data.shaderParts.set(Section.FRAGMENT_HEAD_GDATA, data.createGDataStruct());
		data.shaderParts.set(Section.FRAGMENT_MAIN_GDATA, data.createGDataSetup());

		const fragmentHead = data.shaderParts.get(Section.FRAGMENT_HEAD) as string;
		data.shaderParts.set(Section.FRAGMENT_HEAD, fragmentHead + data.createBlendFunctions());

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
		data.shaderParts.forEach((v, k, map) => map.set(k, v !== null ? v.trim().replace(/^#/, "\n#") : null));

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

		}

	}

	protected override onResolutionChange(resolution: Resolution): void {

		this.fullscreenMaterial.setSize(resolution.width, resolution.height);

		for(const effect of this.effects) {

			effect.resolution.copy(resolution);

		}

	}

	protected override onInputChange(): void {

		const entries: [string, Texture | null][] = [];

		for(const component of this.input.gBuffer) {

			entries.push([component, this.input.buffers.get(component) || null]);

		}

		this.fullscreenMaterial.gBuffer = Object.fromEntries(entries);
		console.log(this.fullscreenMaterial.gBuffer);

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
