import { Color, Vector3, WebGLMultipleRenderTargets } from "three";
import { Pass } from "../core/Pass.js";
import { GBuffer } from "../enums/GBuffer.js";
import { ClearFlags } from "../utils/ClearFlags.js";

const color = /* @__PURE__ */ new Color();
const fv = /* @__PURE__ */ new Float32Array(4);

/**
 * A clear pass.
 */

export class ClearPass extends Pass {

	/**
	 * The clear flags.
	 */

	readonly flags: ClearFlags;

	// #region Clear Values

	/**
	 * A clear color that overrides the clear color of the renderer. Default is `null`, meaning disabled.
	 */

	clearColor: Color | null;

	/**
	 * A clear alpha value that overrides the clear alpha of the renderer. Default is `-1`, meaning disabled.
	 */

	clearAlpha: number;

	/**
	 * The clear value for the normal buffer.
	 */

	clearNormal: Vector3;

	/**
	 * The clear value for roughness.
	 */

	clearRoughness: number;

	/**
	 * The clear value for metalness.
	 */

	clearMetalness: number;

	// #endregion

	/**
	 * Constructs a new clear pass.
	 *
	 * @param color - The color clear flag.
	 * @param depth - The depth clear flag.
	 * @param stencil - The stencil clear flag.
	 */

	constructor(color = true, depth = true, stencil = true) {

		super("ClearPass");

		this.flags = new ClearFlags(color, depth, stencil);
		this.clearColor = null;
		this.clearAlpha = -1;
		this.clearNormal = new Vector3(0.5, 0.5, 1);
		this.clearRoughness = 0;
		this.clearMetalness = 0;

	}

	/**
	 * The current GBuffer component indices.
	 */

	private get gBufferIndices(): Map<GBuffer, number> {

		return this.output.defines as Map<GBuffer, number>;

	}

	/**
	 * Clears GBuffer components.
	 *
	 * @see https://www.khronos.org/opengl/wiki/Framebuffer#Buffer_clearing
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext/clearBuffer
	 */

	private clearGBuffer(): void {

		const renderer = this.renderer!;
		const gl = renderer.getContext() as WebGL2RenderingContext;
		const flags = this.flags;

		if(flags.gBufferComponents.has(GBuffer.NORMAL) && this.gBufferIndices.has(GBuffer.NORMAL)) {

			const clearNormal = this.clearNormal;
			const index = this.gBufferIndices.get(GBuffer.NORMAL) as number;

			fv[0] = clearNormal.x;
			fv[1] = clearNormal.y;
			fv[2] = clearNormal.z;
			fv[3] = 1.0;

			gl.clearBufferfv(gl.COLOR, index, fv);

		}

		if((flags.gBufferComponents.has(GBuffer.ROUGHNESS) || flags.gBufferComponents.has(GBuffer.METALNESS)) &&
			(this.gBufferIndices.has(GBuffer.ROUGHNESS) || this.gBufferIndices.has(GBuffer.METALNESS))) {

			const clearRoughness = this.clearRoughness;
			const clearMetalness = this.clearMetalness;
			const index = this.gBufferIndices.get(GBuffer.ROUGHNESS) as number;

			fv[0] = clearRoughness;
			fv[1] = clearMetalness;
			fv[2] = 0.0;
			fv[3] = 1.0;

			gl.clearBufferfv(gl.COLOR, index, fv);

		}

	}

	render(): void {

		const renderer = this.renderer;

		if(renderer === null) {

			return;

		}

		const overrideClearColor = this.clearColor;
		const overrideClearAlpha = this.clearAlpha;
		const hasOverrideClearColor = overrideClearColor !== null;
		const hasOverrideClearAlpha = overrideClearAlpha >= 0;
		const clearAlpha = renderer.getClearAlpha();
		const flags = this.flags;

		if(hasOverrideClearColor) {

			renderer.getClearColor(color);
			renderer.setClearColor(overrideClearColor);

		}

		if(hasOverrideClearAlpha) {

			renderer.setClearAlpha(overrideClearAlpha);

		}

		renderer.setRenderTarget(this.output.defaultBuffer);
		renderer.clear(flags.color, flags.depth, flags.stencil);

		if(this.output.defaultBuffer instanceof WebGLMultipleRenderTargets) {

			this.clearGBuffer();

		}

		if(hasOverrideClearColor) {

			renderer.setClearColor(color, clearAlpha);

		} else if(hasOverrideClearAlpha) {

			renderer.setClearAlpha(clearAlpha);

		}

	}

}
