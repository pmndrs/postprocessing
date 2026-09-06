import { Group, Material, Mesh, Object3D, Scene, ShaderMaterial } from "three";
import { FullscreenMaterial } from "../materials/FullscreenMaterial.js";
import { fullscreenCamera } from "../utils/objects/fullscreenCamera.js";
import { fullscreenGeometry } from "../utils/objects/fullscreenGeometry.js";
import { ObservableSet } from "../utils/ObservableSet.js";
import { ShaderDataTracker } from "../utils/ShaderDataTracker.js";
import { RenderOperation } from "./RenderOperation.js";
import { RenderTaskContext } from "./RenderTaskContext.js";

/**
 * A fullscreen render operation.
 *
 * @category Core
 * @internal
 */

export class FullscreenRenderOperation<TMaterial extends Material | null> extends RenderOperation {

	/**
	 * A container that keeps track of input shader data.
	 */

	private readonly shaderDataTracker: ShaderDataTracker;

	/**
	 * A fullscreen mesh.
	 */

	private readonly screen: Mesh;

	/**
	 * A scene that contains the fullscreen mesh.
	 */

	private readonly fullscreenScene: Scene;

	/**
	 * A collection of materials that are used by this operation.
	 *
	 * Materials set via {@link fullscreenMaterial} will be added automatically.
	 */

	readonly materials: Set<Material>;

	/**
	 * Constructs a new fullscreen render operation.
	 *
	 * @param context - The context of the parent render task.
	 */

	constructor(context: Readonly<RenderTaskContext>) {

		super("FullscreenRenderOperation", context);

		this.shaderDataTracker = new ShaderDataTracker();
		this.screen = new Mesh(fullscreenGeometry);
		this.screen.frustumCulled = false;
		this.fullscreenScene = new Scene();
		this.fullscreenScene.add(this.screen);

		const materials = new ObservableSet<Material>();
		this.materials = materials;

		// Manage built-in fullscreen material data.
		materials.addEventListener("add", (e) => this.updateFullscreenMaterial(e.value));
		context.input.addEventListener("change", () => this.updateFullscreenMaterialsInput());
		context.output.addEventListener("change", () => this.updateFullscreenMaterialsOutput());
		context.resolution.addEventListener("change", () => this.updateFullscreenMaterialsResolution());

	}

	/**
	 * The current fullscreen material.
	 */

	get fullscreenMaterial(): TMaterial {

		return this.screen?.material as TMaterial;

	}

	set fullscreenMaterial(value: TMaterial) {

		if(value === null) {

			return;

		}

		this.screen.material = value;
		this.materials.add(value);

	}

	// #region Materials

	/**
	 * Updates the size of the given material.
	 */

	private updateFullscreenMaterialResolution(material: Material | null): void {

		if(material instanceof FullscreenMaterial) {

			material.setSize(this.context.resolution.width, this.context.resolution.height);

		}

	}

	/**
	 * Updates the size of all fullscreen materials.
	 */

	private updateFullscreenMaterialsResolution(): void {

		for(const material of this.materials) {

			this.updateFullscreenMaterialResolution(material);

		}

	}

	/**
	 * Updates the shader input data of the given fullscreen material.
	 *
	 * @param material - The material to update.
	 */

	private updateFullscreenMaterialInput(material: Material | null): void {

		if(!(material instanceof ShaderMaterial)) {

			// No defines and uniforms available.
			return;

		}

		if(material instanceof FullscreenMaterial) {

			material.inputBuffer = this.context.input.defaultBuffer?.value ?? null;

		}

		this.shaderDataTracker
			.applyDefines(material, this.context.input.defines)
			.applyUniforms(material, this.context.input.uniforms);

	}

	/**
	 * Updates the shader input data of all fullscreen {@link materials}.
	 */

	private updateFullscreenMaterialsInput(): void {

		for(const material of this.materials) {

			this.updateFullscreenMaterialInput(material);

		}

		this.shaderDataTracker
			.trackDefines(this.context.input.defines)
			.trackUniforms(this.context.input.uniforms);

	}

	/**
	 * Updates the shader output settings of the given fullscreen material.
	 *
	 * @param material - The material to update.
	 */

	private updateFullscreenMaterialOutput(material: Material | null): void {

		if(material instanceof FullscreenMaterial) {

			// High precision buffers use HalfFloatType (mediump).
			material.outputPrecision = this.context.output.frameBufferPrecisionHigh ? "mediump" : "lowp";

		}

	}

	/**
	 * Updates the shader output settings of all fullscreen {@link materials}.
	 */

	private updateFullscreenMaterialsOutput(): void {

		for(const material of this.materials) {

			this.updateFullscreenMaterialOutput(material);

		}

	}

	/**
	 * Updates the given material's resolution and input/output data.
	 *
	 * @param material - The material to update.
	 */

	private updateFullscreenMaterial(material: Material | null): void {

		this.updateFullscreenMaterialResolution(material);
		this.updateFullscreenMaterialInput(material);
		this.updateFullscreenMaterialOutput(material);

	}

	// #endregion

	override async compile(): Promise<void> {

		const context = this.context;

		if(context.renderer === null || this.fullscreenScene === null) {

			return;

		}

		const group = new Group();

		for(const material of this.materials) {

			group.add(new Mesh(fullscreenGeometry, material));

		}

		const promises: Promise<Object3D | void>[] = [
			context.renderer.compileAsync(group, fullscreenCamera, this.fullscreenScene)
		];

		promises.push(context.renderer.compileAsync(this.fullscreenScene, fullscreenCamera));

		await Promise.all(promises);

	}

	execute(): void {

		const context = this.context;

		if(context.renderer !== null && this.fullscreenMaterial !== null) {

			context.renderer.render(this.fullscreenScene, fullscreenCamera);

		}

	}

	override dispose(): void {

		this.shaderDataTracker.dispose();

	}

}
