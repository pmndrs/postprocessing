import { AlwaysDepth, Texture, Uniform, Vector4 } from "three";
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
				COLOR_SPACE_CONVERSION: true,
				COLOR_WRITE: true
			},
			uniforms: {
				depthBuffer: new Uniform(null),
				channelWeights: new Uniform(null)
			}
		});

		this.depthFunc = AlwaysDepth;

	}

	override get inputBuffer(): Texture | null {

		return super.inputBuffer;

	}

	override set inputBuffer(value: Texture | null) {

		const colorWrite = value !== null;

		if(this.colorWrite !== colorWrite) {

			if(colorWrite) {

				this.defines.COLOR_WRITE = true;

			} else {

				delete this.defines.COLOR_WRITE;

			}

			this.colorWrite = colorWrite;
			this.needsUpdate = true;

		}

		super.inputBuffer = value;

	}

	/**
	 * A depth buffer that should be copied to the output buffer.
	 */

	get depthBuffer(): Texture | null {

		return this.uniforms.depthBuffer.value as Texture;

	}

	set depthBuffer(value: Texture | null) {

		const depthWrite = value !== null;

		if(this.depthWrite !== depthWrite) {

			if(depthWrite) {

				this.defines.DEPTH_WRITE = true;

			} else {

				delete this.defines.DEPTH_WRITE;

			}

			this.depthTest = depthWrite;
			this.depthWrite = depthWrite;
			this.needsUpdate = true;

		}

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

	/**
	 * Color channel weights that modulate texels from the input buffer.
	 *
	 * Set to `null` to disable.
	 */

	get channelWeights(): Vector4 | null {

		return this.uniforms.channelWeights.value as Vector4;

	}

	set channelWeights(value: Vector4 | null) {

		if(value !== null) {

			this.defines.USE_WEIGHTS = true;
			this.uniforms.channelWeights.value = value;

		} else {

			delete this.defines.USE_WEIGHTS;

		}

		this.needsUpdate = true;

	}

}
