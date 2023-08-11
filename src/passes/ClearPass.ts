import { Color } from "three";
import { Pass } from "../core/Pass.js";
import { ClearFlags } from "../utils/ClearFlags.js";

const color = new Color();

/**
 * A clear pass.
 */

export class ClearPass extends Pass {

	/**
	 * Controls which buffers should be cleared.
	 */

	readonly clearFlags: ClearFlags;

	/**
	 * Constructs a new clear pass.
	 */

	constructor() {

		super("ClearPass");

		this.clearFlags = new ClearFlags();

	}

	render(): void {

		if(this.renderer === null) {

			return;

		}

		const clearFlags = this.clearFlags;
		const overrideClearColor = null;
		const overrideClearAlpha = -1;
		const clearAlpha = this.renderer.getClearAlpha();

		const hasOverrideClearColor = (overrideClearColor !== null);
		const hasOverrideClearAlpha = (overrideClearAlpha >= 0);

		if(hasOverrideClearColor) {

			this.renderer.getClearColor(color);
			this.renderer.setClearColor(overrideClearColor, hasOverrideClearAlpha ? overrideClearAlpha : clearAlpha);

		} else if(hasOverrideClearAlpha) {

			this.renderer.setClearAlpha(overrideClearAlpha);

		}

		this.renderer.setRenderTarget(this.output.defaultBuffer);
		this.renderer.clear(clearFlags.color, clearFlags.depth, clearFlags.stencil);

		if(hasOverrideClearColor) {

			this.renderer.setClearColor(color, clearAlpha);

		} else if(hasOverrideClearAlpha) {

			this.renderer.setClearAlpha(clearAlpha);

		}

	}

}
