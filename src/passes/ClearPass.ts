import { Color, WebGLMultipleRenderTargets } from "three";
import { Pass } from "../core/Pass.js";
import { GBuffer } from "../enums/GBuffer.js";
import { ClearFlags } from "../utils/ClearFlags.js";
import { ClearValues } from "../utils/ClearValues.js";
import { GBufferInfo } from "../utils/GBufferInfo.js";

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
		const flags = this.clearFlags;
		const values = this.clearValues;

		// The type of the default buffer has already been checked.
		const gBuffer = this.output.defaultBuffer as WebGLMultipleRenderTargets;
		const gBufferInfo = new GBufferInfo(gBuffer);

		if(flags.gBufferComponents.has(GBuffer.NORMAL) && gBufferInfo.indices.has(GBuffer.NORMAL)) {

			const clearNormal = values.normal;
			const index = gBufferInfo.indices.get(GBuffer.NORMAL) as number;

			fv[0] = clearNormal.x;
			fv[1] = clearNormal.y;
			fv[2] = clearNormal.z;
			fv[3] = 1.0;

			gl.clearBufferfv(gl.COLOR, index, fv);

		}

		if((flags.gBufferComponents.has(GBuffer.ROUGHNESS) || flags.gBufferComponents.has(GBuffer.METALNESS)) &&
			(gBufferInfo.indices.has(GBuffer.ROUGHNESS) || gBufferInfo.indices.has(GBuffer.METALNESS))) {

			const clearRoughness = values.roughness;
			const clearMetalness = values.metalness;
			const index = gBufferInfo.indices.get(GBuffer.ROUGHNESS) as number;

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
