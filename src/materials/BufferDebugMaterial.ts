import { Texture, Uniform } from "three";
import { GBuffer } from "../enums/GBuffer.js";
import { GBufferDebug } from "../enums/GBufferDebug.js";
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

	}

	/**
	 * Sets the buffer focus.
	 */

	set bufferFocus(value: string | null) {

		const defines = this.defines;
		delete defines.DEPTH;
		delete defines.NORMAL;
		delete defines.POSITION;

		switch(value) {

			case GBuffer.DEPTH:
				defines.DEPTH = true;
				break;

			case GBuffer.NORMAL:
				defines.NORMAL = true;
				break;

			case GBufferDebug.POSITION:
				defines.POSITION = true;
				break;

		}

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
