import {
	GLSL3,
	LinearSRGBColorSpace,
	NoBlending,
	OrthographicCamera,
	PerspectiveCamera,
	RawShaderMaterial,
	SRGBColorSpace,
	ShaderMaterialParameters,
	Texture,
	Uniform,
	UnsignedByteType,
	Vector3,
	Vector4,
	WebGLProgramParametersWithUniforms,
	WebGLRenderer
} from "three";

import { Resizable } from "../core/Resizable.js";
import { Precision } from "../enums/Precision.js";

/**
 * A fullscreen shader material.
 *
 * This material defines the following commonly used uniforms:
 * - `mat4` projectionMatrix
 * - `mat4` projectionMatrixInverse
 * - `vec3` cameraParams
 * - `vec4` resolution
 * - `sampler2D` inputBuffer
 *
 * Uses GLSL3 by default.
 *
 * @see {@link inputBuffer} for setting an input buffer.
 * @see {@link copyCameraSettings} for copying camera settings.
 * @see {@link setSize} for setting the resolution.
 * @category Materials
 */

export abstract class FullscreenMaterial extends RawShaderMaterial implements Resizable {

	/**
	 * Constructs a new fullscreen shader material.
	 */

	constructor(parameters?: ShaderMaterialParameters) {

		super(Object.assign({
			name: "FullscreenMaterial",
			glslVersion: GLSL3,
			blending: NoBlending,
			depthWrite: false,
			depthTest: false
		}, parameters));

		// Define commonly used uniforms in case they are needed.
		// Note: Uniforms will only be uploaded to the GPU if they are used by the shader.
		Object.assign(this.uniforms, {
			projectionMatrix: new Uniform(null),
			projectionMatrixInverse: new Uniform(null),
			cameraParams: new Uniform(new Vector3()),
			resolution: new Uniform(new Vector4()),
			inputBuffer: new Uniform(null)
		});

		// Set the default precision.
		this.outputPrecision = "lowp";

		// Updates the shader depending on the current render target.
		this.onBeforeCompile = (shader: WebGLProgramParametersWithUniforms, renderer: WebGLRenderer) => {

			if(shader.defines === undefined) {

				shader.defines = {};

			}

			if(renderer.getRenderTarget() === null) {

				// Rendering to screen.

				switch(renderer.outputColorSpace) {

					case SRGBColorSpace:
						shader.defines.OUTPUT_COLOR_SPACE = 1;
						break;

					case LinearSRGBColorSpace:
						shader.defines.OUTPUT_COLOR_SPACE = 0;
						break;

					default:
						throw new Error(`Unsupported color space: ${renderer.outputColorSpace}`);

				}

				if(this.outputPrecision !== "lowp") {

					// The canvas uses 8 bits per channel (HDR is currently not supported in WebGL).
					this.outputPrecision = "lowp";
					// Prevent infinite loop.
					this.needsUpdate = false;

				}

			} else {

				// Rendering to texture; disable conversion.
				shader.defines.OUTPUT_COLOR_SPACE = 0;

			}

		};

	}

	/**
	 * The precision of the output color.
	 *
	 * This setting will be set automatically by the I/O manager.
	 */

	get outputPrecision(): Precision {

		return this.defines.OUTPUT_COLOR_PRECISION as Precision;

	}

	set outputPrecision(value: Precision) {

		this.defines.OUTPUT_COLOR_PRECISION = value;
		this.needsUpdate = true;

	}

	/**
	 * Indicates whether the input buffer uses high precision.
	 */

	private get frameBufferPrecisionHigh(): boolean {

		return (this.defines.FRAME_BUFFER_PRECISION_HIGH !== undefined);

	}

	private set frameBufferPrecisionHigh(value: boolean) {

		if(this.frameBufferPrecisionHigh !== value) {

			if(value) {

				this.defines.FRAME_BUFFER_PRECISION_HIGH = true;

			} else {

				delete this.defines.FRAME_BUFFER_PRECISION_HIGH;

			}

			this.needsUpdate = true;

		}

	}

	/**
	 * The input buffer.
	 *
	 * If this buffer uses high precision, the macro `FRAME_BUFFER_PRECISION_HIGH` will be defined.
	 */

	get inputBuffer(): Texture | null {

		return this.uniforms.inputBuffer.value as Texture;

	}

	set inputBuffer(value: Texture | null) {

		this.frameBufferPrecisionHigh = value !== null && value.type !== UnsignedByteType;
		this.uniforms.inputBuffer.value = value;

	}

	/**
	 * The current camera near plane value.
	 */

	protected get near(): number {

		const cameraParams = this.uniforms.cameraParams.value as Vector3;
		return cameraParams.x;

	}

	/**
	 * The current camera far plane value.
	 */

	protected get far(): number {

		const cameraParams = this.uniforms.cameraParams.value as Vector3;
		return cameraParams.y;

	}

	/**
	 * Copies the settings of the given camera.
	 *
	 * Updates the `cameraParams` uniform and updates the `PERSPECTIVE_CAMERA` macro.
	 *
	 * @param camera - A camera.
	 */

	copyCameraSettings(camera: OrthographicCamera | PerspectiveCamera): void {

		this.uniforms.projectionMatrix.value = camera.projectionMatrix;
		this.uniforms.projectionMatrixInverse.value = camera.projectionMatrixInverse;
		const cameraParams = this.uniforms.cameraParams.value as Vector3;
		cameraParams.set(camera.near, camera.far, cameraParams.z);

		if(camera instanceof PerspectiveCamera) {

			this.defines.PERSPECTIVE_CAMERA = true;

		} else {

			delete this.defines.PERSPECTIVE_CAMERA;

		}

		this.needsUpdate = true;

	}

	/**
	 * Updates the `resolution` uniform (XY = resolution, ZW = texelSize).
	 *
	 * @param width - The width.
	 * @param height - The height.
	 */

	setSize(width: number, height: number): void {

		const resolution = this.uniforms.resolution.value as Vector4;
		resolution.set(width, height, 1.0 / width, 1.0 / height);

		const cameraParams = this.uniforms.cameraParams.value as Vector3;
		cameraParams.z = width / height;

	}

}
