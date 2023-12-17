import { Texture, Uniform, Vector2 } from "three";
import { DepthCopyMode } from "../enums/DepthCopyMode.js";
import { FullscreenMaterial } from "./FullscreenMaterial.js";

import fragmentShader from "./shaders/depth-copy.frag";
import vertexShader from "./shaders/depth-copy.vert";

/**
 * A depth copy shader material.
 *
 * @group Materials
 */

export class DepthCopyMaterial extends FullscreenMaterial {

	/**
	 * @see {@link mode}
	 */

	private _mode: DepthCopyMode;

	/**
	 * Constructs a new depth copy material.
	 */

	constructor() {

		super({
			name: "DepthCopyMaterial",
			fragmentShader,
			vertexShader,
			defines: {
				DEPTH_COPY_MODE: "0"
			},
			uniforms: {
				depthBuffer: new Uniform(null),
				texelPosition: new Uniform(new Vector2())
			}
		});

		this._mode = DepthCopyMode.FULL;

	}

	/**
	 * The input depth buffer.
	 */

	get depthBuffer(): Texture | null {

		return this.uniforms.depthBuffer.value as Texture;

	}

	set depthBuffer(value: Texture | null) {

		this.uniforms.depthBuffer.value = value;

	}

	/**
	 * The screen space position used for single-texel copy operations.
	 */

	get texelPosition(): Vector2 {

		return this.uniforms.texelPosition.value as Vector2;

	}

	/**
	 * The current depth copy mode.
	 */

	get mode(): DepthCopyMode {

		return this._mode;

	}

	set mode(value: DepthCopyMode) {

		this._mode = value;
		this.defines.DEPTH_COPY_MODE = value.toFixed(0);
		this.needsUpdate = true;

	}

}
