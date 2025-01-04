import { ShaderMaterial } from "three";
import { Pass } from "../core/Pass.js";

/**
 * A pass that renders a given shader material as a fullscreen effect.
 *
 * To render multiple chained fullscreen effects, consider using {@link EffectPass} instead.
 *
 * @param TMaterial - The type of the fullscreen material.
 * @category Passes
 */

export class ShaderPass<TMaterial extends ShaderMaterial = ShaderMaterial> extends Pass<TMaterial> {

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

	constructor(material: TMaterial, uniformName = "inputBuffer") {

		super("ShaderPass");

		this.output.defaultBuffer = this.createFramebuffer();
		this.fullscreenMaterial = material;
		this.uniformName = uniformName;

	}

	protected override onInputChange(): void {

		const uniforms = this.fullscreenMaterial.uniforms;

		if(this.input.hasDefaultBuffer && uniforms[this.uniformName] !== undefined) {

			uniforms[this.uniformName].value = this.input.defaultBuffer!.value;

		}

	}

	override render(): void {

		this.setRenderTarget(this.output.defaultBuffer?.value);
		this.renderFullscreen();

	}

}
