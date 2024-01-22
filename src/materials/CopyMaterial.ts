import { Texture, Uniform } from "three";
import { FullscreenMaterial } from "./FullscreenMaterial.js";

import fragmentShader from "./shaders/copy.frag";
import vertexShader from "./shaders/common.vert";

/**
 * A copy shader material.
 *
 * @category Materials
 */

export class CopyMaterial extends FullscreenMaterial {

	/**
	 * Constructs a new copy material.
	 */

	constructor() {

		super({
			name: "CopyMaterial",
			fragmentShader,
			vertexShader,
			defines: {
				COLOR_SPACE_CONVERSION: true
			},
			uniforms: {
				depthBuffer: new Uniform(null)
			}
		});

	}

	/**
	 * Indicates whether depth should be copied.
	 *
	 * When enabled, the values from the {@link depthBuffer} will be written to the default output buffer.
	 */

	get depthCopy(): boolean {

		return this.depthWrite;

	}

	set depthCopy(value: boolean) {

		if(this.depthCopy !== value) {

			if(value) {

				this.defines.COPY_DEPTH = true;

			} else {

				delete this.defines.COPY_DEPTH;

			}

			this.depthTest = value;
			this.depthWrite = value;
			this.needsUpdate = true;

		}

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
