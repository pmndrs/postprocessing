import {
	DepthFormat,
	DepthStencilFormat,
	DepthTexture,
	HalfFloatType,
	LinearFilter,
	Material,
	Mesh,
	NearestFilter,
	OrthographicCamera,
	PerspectiveCamera,
	RGBAFormat,
	SRGBColorSpace,
	Scene,
	TextureDataType,
	UnsignedByteType,
	WebGLMultipleRenderTargets,
	WebGLProgramParametersWithUniforms,
	WebGLRenderer
} from "three";

import { Resource } from "../core/io/Resource.js";
import { Pass } from "../core/Pass.js";
import { Selective } from "../core/Selective.js";
import { GBuffer } from "../enums/GBuffer.js";
import { GBufferTexture } from "../enums/GBufferTexture.js";
import { MSAASamples } from "../enums/MSAASamples.js";
import { GBufferInfo } from "../utils/GBufferInfo.js";
import { ObservableSet } from "../utils/ObservableSet.js";
import { Selection } from "../utils/Selection.js";
import { CopyPass } from "./CopyPass.js";

/**
 * GeometryPass constructor options.
 *
 * @category Passes
 */

export interface GeometryPassOptions {

	/**
	 * Determines whether a stencil buffer should be created.
	 *
	 * @defaultValue false
	 */

	stencilBuffer?: boolean;

	/**
	 * Determines whether a depth buffer should be created.
	 *
	 * @defaultValue true
	 */

	depthBuffer?: boolean;

	/**
	 * The type of the color buffer.
	 *
	 * @defaultValue {@link UnsignedByteType}
	 */

	frameBufferType?: TextureDataType;

	/**
	 * The amount of samples used for MSAA.
	 *
	 * Will be limited to the maximum value supported by the device.
	 *
	 * @defaultValue 0
	 */

	samples?: MSAASamples;

}

/**
 * A geometry pass.
 *
 * @category Passes
 */

export class GeometryPass extends Pass implements Selective {

	/**
	 * A collection that maps G-Buffer components to G-Buffer texture IDs.
	 */

	private static readonly gBufferTextures = /* @__PURE__ */ new Map<GBuffer, GBufferTexture>([
		[GBuffer.COLOR, GBufferTexture.COLOR],
		[GBuffer.NORMAL, GBufferTexture.NORMAL],
		[GBuffer.OCCLUSION, GBufferTexture.ORM],
		[GBuffer.ROUGHNESS, GBufferTexture.ORM],
		[GBuffer.METALNESS, GBufferTexture.ORM],
		[GBuffer.EMISSION, GBufferTexture.EMISSION]
	]);

	readonly selection: Selection;

	/**
	 * A collection of materials that have been modified with `onBeforeCompile`.
	 */

	private readonly registeredMaterials: WeakSet<Material>;

	/**
	 * A copy pass that is used to blit the default input buffer to the output color buffer.
	 */

	private readonly copyPass: CopyPass;

	/**
	 * Controls which G-Buffer components should be rendered by this pass.
	 *
	 * This will be automatically configured based on the requirements of other passes in the same pipeline.
	 *
	 * @internal
	 */

	readonly gBufferComponents: Set<GBuffer>;

	/**
	 * A collection of G-Buffer textures that correspond to the current G-Buffer components.
	 */

	private readonly gBufferTextures: Set<GBufferTexture>;

	// #region Settings

	/**
	 * Indicates whether the scene background should be ignored.
	 */

	ignoreBackground: boolean;

	/**
	 * Indicates whether the shadow map auto update should be skipped.
	 */

	skipShadowMapUpdate: boolean;

	/**
	 * Indicates whether a stencil buffer should be created.
	 */

	readonly stencilBuffer: boolean;

	/**
	 * Indicates whether a depth buffer should be created.
	 */

	readonly depthBuffer: boolean;

	/**
	 * The texture data type of the primary color buffer.
	 */

	readonly frameBufferType: TextureDataType;

	/**
	 * The current G-Buffer resource.
	 */

	private gBufferResource: Resource | null;

	/**
	 * @see {@link samples}
	 */

	private _samples: MSAASamples;

	// #endregion

	/**
	 * Constructs a new geometry pass.
	 *
	 * @param scene - A scene.
	 * @param camera - A camera.
	 * @param options - Additional options.
	 */

	constructor(scene: Scene, camera: OrthographicCamera | PerspectiveCamera, {
		stencilBuffer = false,
		depthBuffer = true,
		frameBufferType = UnsignedByteType,
		samples = 0
	}: GeometryPassOptions = {}) {

		super("GeometryPass");

		this.scene = scene;
		this.camera = camera;

		this.ignoreBackground = false;
		this.skipShadowMapUpdate = false;
		this.stencilBuffer = stencilBuffer;
		this.depthBuffer = depthBuffer;
		this.frameBufferType = frameBufferType;
		this._samples = samples;

		this.selection = new Selection();
		this.selection.enabled = false;
		this.registeredMaterials = new WeakSet<Material>();
		this.copyPass = new CopyPass();
		this.copyPass.enabled = false;

		const gBufferComponents = new ObservableSet<GBuffer>();
		gBufferComponents.addEventListener(ObservableSet.EVENT_CHANGE, () => this.updateGBufferTextures());
		gBufferComponents.addEventListener(ObservableSet.EVENT_CHANGE, () => this.updateGBuffer());
		this.gBufferComponents = gBufferComponents;
		this.gBufferTextures = new Set<GBufferTexture>();
		this.gBufferResource = null;

		this.updateGBuffer();
		this.updateMaterials();

		this.subpasses = [this.copyPass];

	}

	/**
	 * Sets the amount of MSAA samples.
	 */

	get samples(): MSAASamples {

		return this._samples;

	}

	set samples(value: MSAASamples) {

		this._samples = value;

		const buffer = this.output.defaultBuffer?.value ?? null;

		if(buffer !== null && buffer.samples !== value) {

			buffer.samples = value;
			buffer.dispose();

		}

	}

	/**
	 * Returns the G-Buffer render target, or null if the buffer is not of type `WebGLMultipleRenderTargets`.
	 */

	get gBuffer(): WebGLMultipleRenderTargets | null {

		const buffer = this.output.defaultBuffer?.value ?? null;
		return buffer instanceof WebGLMultipleRenderTargets ? buffer : null;

	}

	override get renderer(): WebGLRenderer | null {

		return super.renderer;

	}

	override set renderer(value: WebGLRenderer | null) {

		super.renderer = value;
		this.updateOutputBufferColorSpace();

	}

	/**
	 * Updates the collection of G-Buffer textures based on the current G-Buffer components.
	 */

	private updateGBufferTextures(): void {

		const gBufferTextures = this.gBufferTextures;
		gBufferTextures.clear();

		for(const component of this.gBufferComponents) {

			const texture = GeometryPass.gBufferTextures.get(component);

			if(texture !== undefined) {

				gBufferTextures.add(texture);

			}

		}

	}

	/**
	 * Enables rendering to G-Buffer components for a given material.
	 *
	 * @todo Remove when three supports output layout definitions for MRT.
	 * @param material - The material.
	 */

	private updateMaterial(material: Material): void {

		if(this.registeredMaterials.has(material)) {

			return;

		}

		this.registeredMaterials.add(material);
		const onBeforeCompile = material.onBeforeCompile.bind(this);

		material.onBeforeCompile = (shader: WebGLProgramParametersWithUniforms, renderer: WebGLRenderer) => {

			onBeforeCompile(shader, renderer);

			if(this.gBuffer === null) {

				return;

			}

			if(shader.defines === undefined) {

				shader.defines = {};

			}

			const gBufferInfo = new GBufferInfo(this.gBuffer);

			for(const entry of gBufferInfo.defines) {

				shader.defines[entry[0]] = entry[1];

			}

			shader.fragmentShader = gBufferInfo.outputDefinitions + "\n\n" + shader.fragmentShader;

		};

	}

	/**
	 * Enables rendering to G-Buffer components for all materials in a given scene.
	 *
	 * Should be called when a mesh or material is added, removed or replaced at runtime.
	 *
	 * @todo Remove when three supports output layout definitions for MRT.
	 * @param scene - The scene, or a subset of a scene.
	 */

	updateMaterials(scene = this.scene): void {

		scene?.traverse((node) => {

			const mesh = (node instanceof Mesh) ? node as Mesh : null;

			if(mesh === null) {

				return;

			}

			for(const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) {

				this.updateMaterial(material);

			}

		});

	}

	/**
	 * Updates the color space of the output buffers.
	 */

	private updateOutputBufferColorSpace(): void {

		const gBuffer = this.gBuffer;
		const frameBufferType = this.frameBufferType;
		const outputColorSpace = this.renderer?.outputColorSpace;

		if(frameBufferType === UnsignedByteType && outputColorSpace === SRGBColorSpace && gBuffer !== null) {

			const gBufferInfo = new GBufferInfo(gBuffer);
			const indexColor = gBufferInfo.indices.get(GBuffer.COLOR);
			const indexEmission = gBufferInfo.indices.get(GBuffer.EMISSION);

			if(indexColor !== undefined) {

				gBuffer.texture[indexColor].colorSpace = SRGBColorSpace;

			}

			if(indexEmission !== undefined) {

				gBuffer.texture[indexEmission].colorSpace = SRGBColorSpace;

			}

		}

	}

	/**
	 * Updates the output macro definitions.
	 */

	private updateDefines(): void {

		const gBuffer = this.gBuffer;
		this.output.defines.clear();

		if(gBuffer === null) {

			return;

		}

		const gBufferInfo = new GBufferInfo(gBuffer);

		for(const entry of gBufferInfo.defines) {

			this.output.defines.set(entry[0], entry[1]);

		}

	}

	/**
	 * Updates the G-Buffer configuration.
	 */

	private updateGBuffer(): void {

		if(this.output.defaultBuffer !== this.gBufferResource) {

			// Don't modify foreign resources.
			return;

		}

		const gBufferComponents = this.gBufferComponents;
		const gBufferTextures = this.gBufferTextures;
		this.output.defaultBuffer?.value?.dispose();

		if(gBufferComponents.size === 0) {

			this.output.defaultBuffer = null;
			this.gBufferResource = this.output.defaultBuffer;
			this.output.defines.clear();

			return;

		}

		const { width, height } = this.resolution;
		const renderTarget = new WebGLMultipleRenderTargets(width, height, gBufferTextures.size, {
			stencilBuffer: this.stencilBuffer,
			depthBuffer: this.depthBuffer,
			samples: this.samples
		});

		const textures = renderTarget.texture;
		let index = 0;

		if(gBufferTextures.has(GBufferTexture.COLOR)) {

			const texture = textures[index++];
			texture.name = GBufferTexture.COLOR;
			texture.minFilter = LinearFilter;
			texture.magFilter = LinearFilter;
			texture.type = this.frameBufferType;
			texture.format = RGBAFormat;

		}

		if(gBufferTextures.has(GBufferTexture.NORMAL)) {

			const texture = textures[index++];
			texture.name = GBufferTexture.NORMAL;
			texture.minFilter = NearestFilter;
			texture.magFilter = NearestFilter;
			texture.type = HalfFloatType;
			texture.format = RGBAFormat;

		}

		if(gBufferTextures.has(GBufferTexture.ORM)) {

			const texture = textures[index++];
			texture.name = GBufferTexture.ORM;
			texture.minFilter = LinearFilter;
			texture.magFilter = LinearFilter;
			texture.type = UnsignedByteType;
			texture.format = RGBAFormat;

		}

		if(gBufferTextures.has(GBufferTexture.EMISSION)) {

			const texture = textures[index++];
			texture.name = GBufferTexture.EMISSION;
			texture.minFilter = LinearFilter;
			texture.magFilter = LinearFilter;
			texture.type = this.frameBufferType;
			texture.format = RGBAFormat;

		}

		// Special case: DepthTexture
		if(gBufferComponents.has(GBuffer.DEPTH)) {

			const depthTexture = new DepthTexture(1, 1);
			depthTexture.format = this.stencilBuffer ? DepthStencilFormat : DepthFormat;
			renderTarget.depthTexture = depthTexture;

		}

		this.output.defaultBuffer = renderTarget;
		this.gBufferResource = this.output.defaultBuffer;
		this.updateOutputBufferColorSpace();
		this.updateDefines();

	}

	protected override onInputChange(): void {

		this.copyPass.input.defaultBuffer = this.input.defaultBuffer;

		if(this.input.buffers.has(GBuffer.DEPTH)) {

			this.copyPass.input.buffers.set(GBuffer.DEPTH, this.input.buffers.get(GBuffer.DEPTH)!);

		} else {

			this.copyPass.input.buffers.delete(GBuffer.DEPTH);

		}

		const inputBuffer = this.input.defaultBuffer?.value ?? null;
		this.copyPass.enabled = inputBuffer !== null && this.gBuffer !== null;

	}

	protected override onOutputChange(): void {

		this.copyPass.output.defaultBuffer = this.output.defaultBuffer;

	}

	render(): void {

		if(this.renderer === null || this.scene === null || this.camera === null) {

			return;

		}

		const selection = this.selection;
		const mask = this.camera.layers.mask;
		const background = this.scene.background;
		const shadowMapAutoUpdate = this.renderer.shadowMap.autoUpdate;

		if(this.selection.enabled) {

			this.camera.layers.set(selection.layer);

		}

		if(this.skipShadowMapUpdate) {

			this.renderer.shadowMap.autoUpdate = false;

		}

		if(this.ignoreBackground) {

			this.scene.background = null;

		}

		if(this.copyPass.enabled) {

			this.copyPass.render();

		}

		this.renderer.setRenderTarget(this.output.defaultBuffer?.value ?? null);
		this.renderer.render(this.scene, this.camera);

		// Restore the original values.
		this.camera.layers.mask = mask;
		this.scene.background = background;
		this.renderer.shadowMap.autoUpdate = shadowMapAutoUpdate;

	}

}
