import { Camera, DepthTexture, Material, Object3D, Scene, TextureDataType } from "three";
import { GBufferResource, GBufferResourceOptions } from "../core/io/GBufferResource.js";
import { Pass } from "../core/Pass.js";
import { Selective } from "../core/Selective.js";
import { GBuffer } from "../enums/GBuffer.js";
import { MSAASamples } from "../enums/MSAASamples.js";
import { GBufferSchema } from "../utils/gbuffer/GBufferSchema.js";
import { GBufferShaderPlugin } from "../utils/gbuffer/GBufferShaderPlugin.js";
import { Selection } from "../utils/Selection.js";

/**
 * GeometryPass constructor options.
 *
 * @category Passes
 */

export interface GeometryPassOptions extends GBufferResourceOptions {

	/**
	 * The scene to render.
	 *
	 * Defaults to the main scene of the associated frame graph if not defined.
	 *
	 * @defaultValue null
	 */

	scene?: Scene | null;

	/**
	 * The camera to use for rendering the main scene.
	 *
	 * Defaults to the main camera of the associated frame graph if not defined.
	 *
	 * @defaultValue null
	 */

	camera?: Camera | null;

}

/**
 * A geometry pass.
 *
 * @category Passes
 */

export class GeometryPass extends Pass implements GeometryPassOptions, Selective {

	/**
	 * Identifies the G-Buffer resource.
	 */

	private static readonly GBUFFER = "GBUFFER";

	readonly selection: Selection;

	/**
	 * A shader plugin that enables rendering to G-Buffer render targets.
	 */

	private readonly gBufferShaderPlugin: GBufferShaderPlugin;

	/**
	 * A G-Buffer resource.
	 */

	readonly gBuffer: GBufferResource;

	/**
	 * Constructs a new geometry pass.
	 *
	 * @param options - Additional options.
	 */

	constructor({
		scene = null,
		camera = null,
		gBufferSchema: gBufferConfig,
		alpha,
		stencilBuffer,
		depthBuffer,
		type,
		samples
	}: GeometryPassOptions = {}) {

		super("GeometryPass");

		this.selection = new Selection();
		this.selection.enabled = false;

		this.gBuffer = new GBufferResource({
			gBufferSchema: gBufferConfig,
			alpha,
			stencilBuffer,
			depthBuffer,
			type,
			samples
		});

		this.gBufferShaderPlugin = new GBufferShaderPlugin();
		this.gBufferShaderPlugin.gBuffer = this.gBuffer.value;
		this.gBuffer.addEventListener("change", () => {

			this.gBufferShaderPlugin.gBuffer = this.gBuffer.value;

		});

		this.output.setBuffer(GeometryPass.GBUFFER, this.gBuffer);
		this.output.defaultBuffer = this.gBuffer;

		this.scene = scene;
		this.camera = camera;

	}

	// #region Accessors

	override get enabled(): boolean {

		return super.enabled;

	}

	override set enabled(value: boolean) {

		if(super.enabled === value) {

			return;

		}

		super.enabled = value;
		this.gBufferShaderPlugin.enabled = value;
		this.invalidateMaterials();

	}

	// #region Settings

	get samples(): MSAASamples { return this.gBuffer.samples; }
	set samples(value: MSAASamples) { this.gBuffer.samples = value; }
	get gBufferSchema(): GBufferSchema { return this.gBuffer.gBufferSchema; }
	get alpha(): boolean { return this.gBuffer.alpha; }
	get stencilBuffer(): boolean { return this.gBuffer.stencilBuffer; }
	get depthBuffer(): boolean { return this.gBuffer.depthBuffer; }
	get type(): TextureDataType { return this.gBuffer.type; }

	// #endregion

	// #endregion

	// #region Material Manipulation

	/**
	 * Refreshes the material of the given object.
	 *
	 * @param object - The object to update.
	 */

	private invalidateMaterial(object: Object3D): void {

		if(!("material" in object)) {

			return;

		}

		const materials = (Array.isArray(object.material) ? object.material : [object.material]) as Material[];

		for(const material of materials) {

			material.needsUpdate = true;

		}

	}

	/**
	 * Refreshes the materials of the scene objects.
	 */

	private invalidateMaterials(): void {

		this.scene?.traverse((node) => this.invalidateMaterial(node));

	}

	/**
	 * Enables rendering to {@link GBuffer} components for the materials of a given object.
	 *
	 * Should also be called when a material is added, removed or replaced at runtime.
	 *
	 * @param object - The object to update.
	 */

	private updateMaterial(object: Object3D): void {

		if(!("material" in object)) {

			return;

		}

		const materials = (Array.isArray(object.material) ? object.material : [object.material]) as Material[];

		for(const material of materials) {

			this.gBufferShaderPlugin.applyTo(material);

		}

	}

	// #endregion

	// #region G-Buffer Configuration

	/**
	 * Configures the G-Buffer depth texture.
	 *
	 * Uses the current {@link GBuffer.DEPTH} texture if available, or creates a new one.
	 */

	private configureDepthTexture(): void {

		if(this.gBuffer === null || !this.gBuffer.components.has(GBuffer.DEPTH)) {

			return;

		}

		const inputDepthTexture = this.input.buffers.get(GBuffer.DEPTH)?.value ?? null;

		if(inputDepthTexture !== null && this.gBuffer.descriptor.depthTexture !== inputDepthTexture) {

			this.gBuffer.descriptor.depthTexture = inputDepthTexture as DepthTexture;

		}

	}

	/**
	 * Restores the default buffer to the initial {@link gBuffer} resource.
	 */

	restoreDefaultBuffer(): void {

		this.output.defaultBuffer = this.gBuffer;

	}

	// #endregion

	protected override onInputChange(): void {

		this.configureDepthTexture();

	}

	protected override onOutputChange(): void {

		this.configureDepthTexture();

	}

	protected override onSceneChildAdded(object: Object3D): void {

		object.traverse((node) => this.updateMaterial(node));

	}

	override async compile(): Promise<void> {

		if(this.renderer === null || this.scene === null || this.camera === null) {

			return;

		}

		const promises: Promise<Object3D | void>[] = [];
		promises.push(super.compile());
		promises.push(this.renderer.compileAsync(this.scene, this.camera));
		await Promise.all(promises);

	}

	override render(): void {

		const scene = this.scene;
		const camera = this.camera;

		if(this.renderer === null || scene === null || camera === null) {

			return;

		}

		// The background is rendered by the ClearPass.
		const background = scene.background;
		scene.background = null;

		const mask = camera.layers.mask;

		if(this.selection.enabled) {

			camera.layers.set(this.selection.layer);

		}

		this.setRenderTarget(this.output.defaultBuffer?.value);
		this.renderer.render(scene, camera);

		// Restore the original values.
		camera.layers.mask = mask;
		scene.background = background;

	}

}
