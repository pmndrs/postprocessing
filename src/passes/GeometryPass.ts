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
	RGFormat,
	SRGBColorSpace,
	Scene,
	TextureDataType,
	UnsignedByteType,
	UnsignedInt248Type,
	UnsignedIntType,
	WebGLMultipleRenderTargets,
	WebGLRenderer
} from "three";

import { Pass } from "../core/Pass.js";
import { Selective } from "../core/Selective.js";
import { Selection } from "../utils/Selection.js";
import { ObservableSet } from "../utils/ObservableSet.js";
import { GBuffer } from "../enums/GBuffer.js";
import { Resolution } from "../utils/Resolution.js";
import { ShaderWithDefines } from "../core/ShaderWithDefines.js";

/**
 * Supported MSAA sample counts.
 */

export declare type MSAASamples = 0 | 2 | 4 | 8;

/**
 * GeometryPass constructor options.
 */

interface GeometryPassOptions {

	/**
	 * Determines whether a stencil buffer should be created.
	 */

	stencil?: boolean;

	/**
	 * The type of the color buffer.
	 */

	frameBufferType?: TextureDataType;

	/**
	 * The amount of samples used for MSAA. Default is 0.
	 *
	 * Will be limited to the maximum value supported by the device.
	 */

	samples?: MSAASamples;

}

/**
 * A geometry pass.
 */

export class GeometryPass extends Pass implements Selective {

	readonly selection: Selection;

	/**
	 * A collection of materials that have been modified with `onBeforeCompile`.
	 */

	private readonly registeredMaterials: WeakSet<Material>;

	/**
	 * Controls which gBuffer components should be rendered by this pass.
	 *
	 * This will be automatically configured based on the requirements of other passes in the same pipeline.
	 */

	readonly gBufferComponents: Set<GBuffer>;

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

	private readonly stencil: boolean;

	/**
	 * The texture data type of the primary color buffer.
	 */

	private readonly frameBufferType: TextureDataType;

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
		stencil = false,
		frameBufferType = UnsignedByteType,
		samples = 0
	}: GeometryPassOptions = {}) {

		super("GeometryPass");

		this.scene = scene;
		this.camera = camera;

		this.ignoreBackground = false;
		this.skipShadowMapUpdate = false;
		this.stencil = stencil;
		this.frameBufferType = frameBufferType;
		this._samples = samples;

		this.selection = new Selection();
		this.selection.enabled = false;
		this.registeredMaterials = new WeakSet<Material>();

		const gBufferComponents = new ObservableSet<GBuffer>();
		gBufferComponents.addEventListener(ObservableSet.EVENT_CHANGE, () => this.updateGBuffer());
		this.gBufferComponents = gBufferComponents;

		this.updateGBuffer();
		this.updateMaterials();

	}

	override get renderer(): WebGLRenderer | null {

		return super.renderer;

	}

	override set renderer(value: WebGLRenderer | null) {

		super.renderer = value;
		this.updateOutputColorSpace();

	}

	protected override onResolutionChange(resolution: Resolution): void {

		this.output.defaultBuffer?.setSize(resolution.width, resolution.height);

	}

	/**
	 * Sets the amount of MSAA samples.
	 */

	get samples(): MSAASamples {

		return this._samples;

	}

	set samples(value: MSAASamples) {

		this._samples = value;

		if(this.output.defaultBuffer !== null) {

			this.output.defaultBuffer.samples = value;

		}

	}

	/**
	 * Alias for {@link output.defaultBuffer}.
	 */

	get gBuffer(): WebGLMultipleRenderTargets | null {

		return this.output.defaultBuffer as WebGLMultipleRenderTargets;

	}

	/**
	 * The GBuffer component indices.
	 */

	get gBufferIndices(): Map<GBuffer, number> {

		return this.output.defines as Map<GBuffer, number>;

	}

	/**
	 * Enables rendering to GBuffer components for a given material.
	 *
	 * @param material - The material.
	 */

	private updateMaterial(material: Material): void {

		if(this.registeredMaterials.has(material)) {

			return;

		}

		this.registeredMaterials.add(material);

		// Binding to this doesn't do anything for arrow functions, but it satisfies eslint.
		const onBeforeCompile = material.onBeforeCompile.bind(this);

		material.onBeforeCompile = (shader: ShaderWithDefines, renderer: WebGLRenderer) => {

			onBeforeCompile(shader, renderer);

			if(shader.defines === undefined || shader.defines === null) {

				shader.defines = {};

			}

			for(const entry of this.gBufferIndices) {

				shader.defines[entry[0]] = entry[1];

			}

			shader.fragmentShader = shader.fragmentShader.replace(
				/(void main)/,
				"#include <pp_gbuffer_output_pars_fragment>\n\n$1"
			);

		};

	}

	/**
	 * Enables rendering to GBuffer components for all materials in a given scene.
	 *
	 * Should be called when a mesh or material is added, removed or replaced at runtime.
	 *
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
	 * Updates the color space of the output color texture.
	 */

	private updateOutputColorSpace(): void {

		if(!this.gBufferComponents.has(GBuffer.COLOR)) {

			return;

		}

		const renderTarget = this.output.defaultBuffer as WebGLMultipleRenderTargets;
		const index = this.gBufferIndices.get(GBuffer.COLOR) as number;

		if(this.frameBufferType === UnsignedByteType && this.renderer?.outputColorSpace === SRGBColorSpace) {

			renderTarget.texture[index].colorSpace = SRGBColorSpace;

		}

	}

	/**
	 * Updates the GBuffer configuration.
	 */

	private updateGBuffer(): void {

		const gBufferComponents = this.gBufferComponents;
		const gBufferIndices = this.gBufferIndices;
		this.output.defaultBuffer?.dispose();
		gBufferIndices.clear();

		if(gBufferComponents.size === 0) {

			this.output.defaultBuffer = null;
			return;

		}

		const useDepthTexture = gBufferComponents.has(GBuffer.DEPTH);
		const exclusions = new Set<GBuffer>([GBuffer.DEPTH, GBuffer.METALNESS]);
		const textureCount = Array.from(gBufferComponents).filter((x) => !exclusions.has(x)).length;

		const renderTarget = new WebGLMultipleRenderTargets(1, 1, textureCount, {
			stencilBuffer: this.stencil && !useDepthTexture,
			depthBuffer: !useDepthTexture,
			samples: this.samples
		});

		const textures = renderTarget.texture;
		let index = 0;

		if(gBufferComponents.has(GBuffer.COLOR)) {

			textures[index].name = GBuffer.COLOR;
			textures[index].minFilter = LinearFilter;
			textures[index].magFilter = LinearFilter;
			textures[index].type = this.frameBufferType;
			textures[index].format = RGBAFormat;
			gBufferIndices.set(GBuffer.COLOR, index++);

		}

		if(gBufferComponents.has(GBuffer.NORMAL)) {

			textures[index].name = GBuffer.NORMAL;
			textures[index].minFilter = NearestFilter;
			textures[index].magFilter = NearestFilter;
			textures[index].type = HalfFloatType;
			textures[index].format = RGBAFormat;
			gBufferIndices.set(GBuffer.NORMAL, index++);

		}

		if(gBufferComponents.has(GBuffer.ROUGHNESS)) {

			textures[index].name = GBuffer.ROUGHNESS;
			textures[index].minFilter = LinearFilter;
			textures[index].magFilter = LinearFilter;
			textures[index].type = UnsignedByteType;
			textures[index].format = RGFormat;
			gBufferIndices.set(GBuffer.ROUGHNESS, index++);

		}

		if(gBufferComponents.has(GBuffer.METALNESS)) {

			gBufferIndices.set(GBuffer.METALNESS, gBufferIndices.get(GBuffer.ROUGHNESS) as number);

		}

		if(useDepthTexture) {

			const depthTexture = new DepthTexture(1, 1);
			depthTexture.format = this.stencil ? DepthStencilFormat : DepthFormat;
			depthTexture.type = this.stencil ? UnsignedInt248Type : UnsignedIntType;
			renderTarget.depthTexture = depthTexture;

		}

		this.output.defaultBuffer = renderTarget;
		this.updateOutputColorSpace();

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

		if(this.input.defaultBuffer !== null) {

			//this.copyInputToColorBuffer();

		}

		this.renderer.setRenderTarget(this.output.defaultBuffer);
		this.renderer.render(this.scene, this.camera);

		// Restore original values.
		this.camera.layers.mask = mask;
		this.scene.background = background;
		this.renderer.shadowMap.autoUpdate = shadowMapAutoUpdate;

	}

}
