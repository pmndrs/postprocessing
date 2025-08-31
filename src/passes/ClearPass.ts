import { Color, Scene } from "three";
import { Pass } from "../core/Pass.js";
import { extractIndices } from "../utils/gbuffer/GBufferUtils.js";
import { Background } from "../utils/Background.js";
import { ClearFlags } from "../utils/ClearFlags.js";
import { ClearValues } from "../utils/ClearValues.js";

const color = /* @__PURE__ */ new Color();
const fv = /* @__PURE__ */ new Float32Array(4);

/**
 * A clear pass.
 *
 * @category Passes
 */

export class ClearPass extends Pass {

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
	 * G-Buffer texture indices.
	 */

	private gBufferIndices: Map<string, number> | null;

	/**
	 * A background object.
	 */

	private readonly background: Background;

	/**
	 * A background scene.
	 */

	private readonly backgroundScene: Scene;

	/**
	 * Constructs a new clear pass.
	 *
	 * @param color - The color clear flag.
	 * @param depth - The depth clear flag.
	 * @param stencil - The stencil clear flag.
	 */

	constructor(color = true, depth = true, stencil = true) {

		super("ClearPass");

		this.clearFlags = new ClearFlags(color, depth, stencil);
		this.clearValues = new ClearValues();
		this.gBufferIndices = null;

		this.background = new Background();
		this.background.setClearValues(this.clearValues);
		this.clearValues.addEventListener("change", () => this.background.setClearValues(this.clearValues));

		this.backgroundScene = new Scene();
		this.backgroundScene.add(this.background);

		this.disposables.add(this.background);

	}

	/**
	 * Clears all buffer attachments with the respective clear values.
	 *
	 * @remarks `gl.clearBufferfv` expects 4 floats regardless of the target buffer format.
	 * @see https://www.khronos.org/opengl/wiki/Framebuffer#Buffer_clearing
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext/clearBuffer
	 * @param gl - A rendering context.
	 * @param textureIndices - The indices of the texture attachments that should be cleared.
	 */

	private clearBuffers(gl: WebGL2RenderingContext, textureIndices: Map<string, number>): void {

		const flags = this.clearFlags;
		const clearValues = this.clearValues.gBuffer;

		for(const entry of textureIndices) {

			const clearValue = clearValues.get(entry[0]);

			if(!flags.gBuffer.has(entry[0]) || clearValue === undefined) {

				continue;

			}

			if(typeof clearValue === "number") {

				fv[0] = clearValue;
				fv[1] = 0.0;
				fv[2] = 0.0;
				fv[3] = 1.0;

			} else {

				fv[0] = (clearValue.length > 0) ? clearValue[0] : 0.0;
				fv[1] = (clearValue.length > 1) ? clearValue[1] : 0.0;
				fv[2] = (clearValue.length > 2) ? clearValue[2] : 0.0;
				fv[3] = (clearValue.length > 3) ? clearValue[3] : 1.0;

			}

			gl.clearBufferfv(gl.COLOR, entry[1], fv);

		}

	}

	/**
	 * Clears the default output buffer using the current clear values.
	 *
	 * @param clearColor - An override clear color.
	 */

	private clear(clearColor = this.clearValues.color): void {

		const renderer = this.renderer!;
		const gl = renderer.getContext() as WebGL2RenderingContext;
		const clearAlpha = this.clearValues.alpha ?? renderer.getClearAlpha();
		clearColor ??= renderer.getClearColor(color);

		fv[0] = clearColor.r;
		fv[1] = clearColor.g;
		fv[2] = clearColor.b;
		fv[3] = clearAlpha;

		gl.clearBufferfv(gl.COLOR, 0, fv);

		if(this.gBufferIndices !== null && this.gBufferIndices.size > 1) {

			this.clearBuffers(gl, this.gBufferIndices);

		}

	}

	/**
	 * Clears the default output buffer using the scene background.
	 */

	private clearWithBackground(): void {

		const scene = this.scene!;
		const camera = this.camera!;
		const renderer = this.renderer!;

		if(scene.background instanceof Color) {

			this.clear(scene.background);

		} else {

			this.background.update(scene);
			renderer.render(this.backgroundScene, camera);

		}

	}

	protected override onOutputChange(): void {

		const buffer = this.output.defaultBuffer?.value ?? null;
		this.gBufferIndices = (buffer !== null) ? extractIndices(buffer) : null;

	}

	override async compile(): Promise<void> {

		if(this.renderer === null || this.camera === null) {

			return;

		}

		await Promise.all([
			super.compile(),
			this.renderer.compileAsync(this.backgroundScene, this.camera)
		]);

	}

	override render(): void {

		if(this.renderer === null) {

			return;

		}

		const background = this.scene?.background ?? null;
		const hasOverrideClearColor = this.clearValues.color !== null;
		const flags = this.clearFlags;

		this.setRenderTarget(this.output.defaultBuffer?.value);

		if(flags.depth || flags.stencil) {

			this.renderer.clear(false, flags.depth, flags.stencil);

		}

		if(!hasOverrideClearColor && this.camera !== null && background !== null) {

			this.clearWithBackground();

		} else {

			this.clear();

		}

	}

}
