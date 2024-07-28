import { Texture, Uniform } from "three";
import { FullscreenMaterial } from "./FullscreenMaterial.js";

import fragmentShader from "./shaders/gbuffer-debug.frag";
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
	 * A depth buffer.
	 */

	get depthBuffer(): Texture | null {

		return this.uniforms.depthBuffer.value as Texture;

	}

	set depthBuffer(value: Texture | null) {

		this.uniforms.depthBuffer.value = value;

	}

	/**
	 * Enables or disables view space position reconstruction.
	 */

	get reconstructPosition(): boolean {

		return (this.defines.RECONSTRUCT_POSITION !== undefined);

	}

	set reconstructPosition(value: boolean) {

		if(this.reconstructPosition !== value) {

			if(value) {

				this.defines.RECONSTRUCT_POSITION = true;

			} else {

				delete this.defines.RECONSTRUCT_POSITION;

			}

			this.needsUpdate = true;

		}

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
