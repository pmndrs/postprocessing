import { Color, Vector3, WebGLMultipleRenderTargets } from "three";
import { Pass } from "../core/Pass.js";
import { GBuffer } from "../enums/GBuffer.js";
import { ClearFlags } from "../utils/ClearFlags.js";

const color = /* @__PURE__ */ new Color();
const iv = /* @__PURE__ */ new Int32Array(4);
const uiv = /* @__PURE__ */ new Uint32Array(4);
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
	 */

	constructor() {

		super("ClearPass");

		this.flags = new ClearFlags();
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

	protected override onOutputChange(): void {

	}

	/**
	 * Clears the MRT output buffer.
	 *
	 * @see https://www.khronos.org/opengl/wiki/Framebuffer#Buffer_clearing
	 */

	private clearMRT(): void {

		const renderer = this.renderer!;
		const gl = renderer.getContext() as WebGL2RenderingContext;
		const flags = this.flags;

		const clearColor = this.clearColor ?? renderer.getClearColor(color);
		const clearAlpha = this.clearAlpha ?? renderer.getClearAlpha();

		//for(const component of flags.gBufferComponents) { // flags not needed

		if(flags.depth || flags.stencil) {

			renderer.clear(false, flags.depth, flags.stencil);

		}

		if(flags.color && this.gBufferIndices.has(GBuffer.COLOR)) {

			const index = this.gBufferIndices.get(GBuffer.COLOR) as number;

			fv[0] = clearColor.r;
			fv[1] = clearColor.g;
			fv[2] = clearColor.b;
			fv[3] = clearAlpha;

			gl.clearBufferfv(gl.COLOR, index, fv);

		}

		if(this.gBufferIndices.has(GBuffer.NORMAL)) {

			const index = this.gBufferIndices.get(GBuffer.NORMAL) as number;
			gl.clearBufferfv(gl.COLOR, index, clearNormal.toArray(fv));

		}

	}

	/**
	 * Clears the output buffer using default clear methods.
	 */

	private clear(): void {

		const renderer = this.renderer!;
		const flags = this.flags;

		const overrideClearColor = this.clearColor;
		const overrideClearAlpha = this.clearAlpha;
		const hasOverrideClearColor = (overrideClearColor !== null);
		const hasOverrideClearAlpha = (overrideClearAlpha >= 0);
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

	}

	render(): void {

		if(this.renderer === null) {

			return;

		}

		this.renderer.setRenderTarget(this.output.defaultBuffer);

		if(this.output.defaultBuffer instanceof WebGLMultipleRenderTargets) {

			this.clearMRT();

		} else {

			this.clear();

		}

	}

}
