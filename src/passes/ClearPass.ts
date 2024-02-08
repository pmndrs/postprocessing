import { Color, WebGLMultipleRenderTargets } from "three";
import { Pass } from "../core/Pass.js";
import { ClearFlags } from "../utils/ClearFlags.js";
import { ClearValues } from "../utils/ClearValues.js";
import { extractIndices } from "../utils/GBufferUtils.js";

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
	 */

	readonly clearValues: ClearValues;

	/**
	 * G-Buffer texture indices.
	 */

	private gBufferIndices: Map<string, number> | null;

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

			const value = entry[1];
			fv[0] = value.x;
			fv[1] = value.y;
			fv[2] = value.z;
			fv[3] = value.w;

			gl.clearBufferfv(gl.COLOR, index, fv);

		}

	}

	protected override onOutputChange(): void {

		const buffer = this.output.defaultBuffer?.value;
		this.gBufferIndices = buffer instanceof WebGLMultipleRenderTargets ? extractIndices(buffer) : null;

	}

	render(): void {

		const renderer = this.renderer;

		if(renderer === null) {

			return;

		}

		const values = this.clearValues;
		const overrideClearColor = values.color;
		const overrideClearAlpha = values.alpha;
		const hasOverrideClearColor = overrideClearColor !== null;
		const hasOverrideClearAlpha = overrideClearAlpha !== null;
		const clearAlpha = renderer.getClearAlpha();
		const flags = this.clearFlags;

		if(hasOverrideClearColor) {

			renderer.getClearColor(color);
			renderer.setClearColor(overrideClearColor);

		}

		if(hasOverrideClearAlpha) {

			renderer.setClearAlpha(overrideClearAlpha);

		}

		renderer.setRenderTarget(this.output.defaultBuffer?.value ?? null);
		renderer.clear(flags.color, flags.depth, flags.stencil);

		if(this.output.defaultBuffer?.value instanceof WebGLMultipleRenderTargets) {

			this.clearGBuffer();

		}

		if(hasOverrideClearColor) {

			renderer.setClearColor(color, clearAlpha);

		} else if(hasOverrideClearAlpha) {

			renderer.setClearAlpha(clearAlpha);

		}

	}

}
