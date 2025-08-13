import { Texture, Uniform } from "three";
import { FullscreenMaterial } from "./FullscreenMaterial.js";

import fragmentShader from "./shaders/buffer-debug.frag";
import vertexShader from "./shaders/common.vert";

/**
 * A buffer debug shader material.
 *
 * @category Materials
 */

export class BufferDebugMaterial extends FullscreenMaterial {

	/**
	 * @see {@link bufferFocus}
	 */

	private _bufferFocus: string | null;

	/**
	 * Constructs a new buffer debug material.
	 */

	constructor() {

		super({
			name: "BufferDebugMaterial",
			fragmentShader,
			vertexShader,
			uniforms: {
				depthBuffer: new Uniform(null)
			}
		});

		this._bufferFocus = null;

	}

	/**
	 * Sets the buffer focus.
	 */

	get bufferFocus(): string | null {

		return this._bufferFocus;

	}

	set bufferFocus(value: string | null) {

		if(this._bufferFocus === value) {

			return;

		}

		if(this._bufferFocus !== null) {

			delete this.defines[this._bufferFocus];

		}

		if(value !== null) {

			value = value.toUpperCase();
			this.defines[value] = true;

		}

		this._bufferFocus = value;
		this.needsUpdate = true;

	}

	/**
	 * A depth buffer.
	 */

	get depthBuffer(): Texture | null {

		return this.uniforms.depthBuffer.value as Texture;

	}

	set depthBuffer(value: Texture | null) {

		this.uniforms.depthBuffer.value = value;

	}

	/**
	 * Indicates whether output color space conversion is enabled.
	 */

	get colorSpaceConversion(): boolean {

		return (this.defines.COLOR_SPACE_CONVERSION !== undefined);

	}

	set colorSpaceConversion(value: boolean) {

		if(this.colorSpaceConversion !== value) {

			if(value) {

				this.defines.COLOR_SPACE_CONVERSION = true;

			} else {

				delete this.defines.COLOR_SPACE_CONVERSION;

			}

			this.needsUpdate = true;

		}

	}

}
