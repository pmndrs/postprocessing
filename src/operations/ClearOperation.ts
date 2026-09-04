import { Color, Scene, WebGLRenderer, WebGLRenderTarget } from "three";
import { RenderOperation } from "../core/RenderOperation.js";
import { RenderTaskContext } from "../core/RenderTaskContext.js";
import { Background } from "../utils/Background.js";
import { ClearFlags } from "../utils/ClearFlags.js";
import { ClearValues } from "../utils/ClearValues.js";

const color = /* @__PURE__ */ new Color();
const fv = /* @__PURE__ */ new Float32Array(4);

/**
 * ClearOperation constructor options.
 *
 * @category Core
 */

export interface ClearOperationOptions {

	/**
	 * The color clear flag.
	 */

	color?: boolean;

	/**
	 * The depth clear flag.
	 */

	depth?: boolean;

	/**
	 * The stencil clear flag.
	 */

	stencil?: boolean;

}

/**
 * A clear operation.
 *
 * This operation clears the current render target using its parent task's context.
 *
 * @category Core
 */

export class ClearOperation extends RenderOperation {

	/**
	 * The clear flags.
	 */

	readonly clearFlags: ClearFlags;

	/**
	 * The clear values.
	 *
	 * - If an override clear color is set, the scene background will be ignored.
	 * - The override alpha setting has no effect when a scene background is used.
	 */

	readonly clearValues: ClearValues;

	/**
	 * A background object.
	 */

	private readonly background: Background;

	/**
	 * A background scene.
	 */

	private readonly backgroundScene: Scene;

	/**
	 * Constructs a new clear operation.
	 *
	 * @param context - The context of the parent render task.
	 * @param options - Additional options.
	 */

	constructor(context: Readonly<RenderTaskContext>, {
		color = true,
		depth = true,
		stencil = true
	}: ClearOperationOptions = {}) {

		super("ClearTask", context);

		this.clearFlags = new ClearFlags(color, depth, stencil);
		this.clearValues = new ClearValues();

		this.background = new Background();
		this.background.setClearValues(this.clearValues);
		this.clearValues.addEventListener("change", () => this.background.setClearValues(this.clearValues));

		this.backgroundScene = new Scene();
		this.backgroundScene.add(this.background);

	}

	/**
	 * Clears all buffer attachments with the respective clear values.
	 *
	 * @remarks `gl.clearBufferfv` expects 4 floats regardless of the target buffer format.
	 * @see https://www.khronos.org/opengl/wiki/Framebuffer#Buffer_clearing
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext/clearBuffer
	 * @param gl - A rendering context.
	 * @param renderTarget - The render target to clear.
	 */

	private clearBuffers(gl: WebGL2RenderingContext, renderTarget: WebGLRenderTarget): void {

		const flags = this.clearFlags.gBuffer;
		const clearValues = this.clearValues.gBuffer;
		const textures = renderTarget.textures;

		// Skip attachment 0 (COLOR).
		for(let i = 1, l = textures.length; i < l; ++i) {

			const texture = textures[i];
			const clearValue = clearValues.get(texture.name);

			if(!flags.has(texture.name) || clearValue === undefined) {

				continue;

			}

			gl.clearBufferfv(gl.COLOR, i, clearValue);

		}

	}

	/**
	 * Clears the currently bound output buffer using the current clear values.
	 *
	 * @param renderer - A renderer.
	 * @param clearColor - An override clear color.
	 */

	private clear(renderer: WebGLRenderer, clearColor = this.clearValues.color): void {

		const gl = renderer.getContext() as WebGL2RenderingContext;
		const renderTarget = renderer.getRenderTarget();

		if(this.clearFlags.color) {

			const clearAlpha = this.clearValues.alpha ?? renderer.getClearAlpha();
			clearColor ??= renderer.getClearColor(color);

			fv[0] = clearColor.r;
			fv[1] = clearColor.g;
			fv[2] = clearColor.b;
			fv[3] = clearAlpha;

			gl.clearBufferfv(gl.COLOR, 0, fv);

		}

		if(renderTarget !== null && renderTarget.textures.length > 1) {

			this.clearBuffers(gl, renderTarget);

		}

	}

	/**
	 * Clears the currently bound output buffer using the scene background.
	 *
	 * @param context - The render task context.
	 */

	private clearWithBackground(): void {

		const context = this.context;

		if(context.scene!.background instanceof Color) {

			this.clear(context.renderer!, context.scene!.background);

		} else {

			this.background.update(context.scene);
			context.renderer!.render(this.backgroundScene, context.camera!);

		}

	}

	override async compile(): Promise<void> {

		const context = this.context;

		if(context.renderer === null || context.camera === null) {

			return;

		}

		await context.renderer.compileAsync(this.backgroundScene, context.camera);

	}

	/**
	 * Clears the currently bound render target.
	 *
	 * @param context - The render task context.
	 */

	execute(): void {

		const context = this.context;

		if(!this.enabled || context === undefined || context.renderer === null) {

			return;

		}

		if(this.clearFlags.depth || this.clearFlags.stencil) {

			context.renderer.clear(false, this.clearFlags.depth, this.clearFlags.stencil);

		}

		const background = context.scene?.background ?? null;
		const hasOverrideClearColor = this.clearValues.color !== null;

		if(!hasOverrideClearColor && context.camera !== null && background !== null) {

			this.clearWithBackground();

		} else {

			this.clear(context.renderer);

		}

	}

	override dispose(): void {

		super.dispose();
		this.background.dispose();

	}

}
