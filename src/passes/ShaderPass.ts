import { ShaderMaterial } from "three";
import { Pass } from "../core/Pass.js";

/**
 * A pass that renders a given shader material as a fullscreen effect.
 *
 * To render multiple chained fullscreen effects, consider using {@link EffectPass} instead.
 *
 * @group Passes
 */

export class ShaderPass extends Pass<ShaderMaterial> {

	/**
	 * The name of the input buffer uniform.
	 *
	 * Most fullscreen materials modify texels from an input texture. This pass automatically assigns the default input
	 * buffer to the uniform identified by this name.
	 */

	uniformName: string;

	/**
	 * Constructs a new shader pass.
	 *
	 * @param material - A shader material.
	 * @param uniformName - The name of the input buffer uniform. Default is `inputBuffer`.
	 */

	constructor(material: ShaderMaterial, uniformName = "inputBuffer") {

		super("ShaderPass");

		this.fullscreenMaterial = material;
		this.uniformName = uniformName;

	}

	protected override onInputChange(): void {

		const uniforms = this.fullscreenMaterial.uniforms;
		const inputBuffer = this.input.defaultBuffer;

		if(uniforms !== undefined && uniforms[this.uniformName] !== undefined) {

			uniforms[this.uniformName].value = inputBuffer;

		}

	}

	render(): void {

		this.renderer?.setRenderTarget(this.output.defaultBuffer);
		this.renderFullscreen();

	}

}
