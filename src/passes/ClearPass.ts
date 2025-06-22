import { Color, Scene } from "three";
import { Pass } from "../core/Pass.js";
import { Background } from "../utils/Background.js";
import { ClearFlags } from "../utils/ClearFlags.js";
import { ClearValues } from "../utils/ClearValues.js";
import { extractIndices } from "../utils/GBufferUtils.js";

const color = /* @__PURE__ */ new Color();

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
	 * Clears G-Buffer components.
	 *
	 * @see https://www.khronos.org/opengl/wiki/Framebuffer#Buffer_clearing
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext/clearBuffer
	 */

	private clearGBuffer(): void {

		if(this.renderer === null || this.gBufferIndices === null) {

			return;

		}

		const flags = this.clearFlags;
		const values = this.clearValues;
		const gBufferTextureIndices = this.gBufferIndices;
		const gl = this.renderer.getContext() as WebGL2RenderingContext;

		for(const entry of values.gBuffer) {

			const index = gBufferTextureIndices.get(entry[0]);

			if(!flags.gBuffer.has(entry[0]) || index === undefined) {

				continue;

			}

			gl.clearBufferfv(gl.COLOR, index, entry[1]);

		}

	}

	/**
	 * Clears the default output buffer using the current clear values.
	 *
	 * @param overrideClearColor - An override clear color.
	 */

	private clear(overrideClearColor = this.clearValues.color): void {

		const renderer = this.renderer!;
		const flags = this.clearFlags;
		const overrideClearAlpha = this.clearValues.alpha;
		const hasOverrideClearColor = overrideClearColor !== null;
		const hasOverrideClearAlpha = overrideClearAlpha !== null;
		const clearAlpha = renderer.getClearAlpha();

		if(hasOverrideClearColor) {

			renderer.getClearColor(color);
			renderer.setClearColor(overrideClearColor);

		}

		if(hasOverrideClearAlpha) {

			renderer.setClearAlpha(overrideClearAlpha);

		}

		renderer.clear(flags.color, flags.depth, flags.stencil);

		if(hasOverrideClearColor) {

			renderer.setClearColor(color, clearAlpha);

		} else if(hasOverrideClearAlpha) {

			renderer.setClearAlpha(clearAlpha);

		}

		this.clearGBuffer();

	}

	/**
	 * Clears the default output buffer using the scene background.
	 */

	private clearWithBackground(): void {

		const scene = this.scene!;
		const camera = this.camera!;
		const renderer = this.renderer!;
		const flags = this.clearFlags;

		if(scene.background instanceof Color) {

			this.clear(scene.background);

		} else {

			if(flags.depth || flags.stencil) {

				renderer.clear(false, flags.depth, flags.stencil);

			}

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

		this.setRenderTarget(this.output.defaultBuffer?.value);

		if(!hasOverrideClearColor && this.camera !== null && background !== null) {

			this.clearWithBackground();

		} else {

			this.clear();

		}

	}

}
