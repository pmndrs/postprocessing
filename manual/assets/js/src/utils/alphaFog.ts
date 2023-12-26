import { WebGLProgramParametersWithUniforms } from "three";
import alphaFogFragment from "./glsl/alpha-fog.frag";

/**
 * Modifies the given shader to use alpha fog.
 *
 * @param shader - A shader.
 */

export function alphaFog(shader: WebGLProgramParametersWithUniforms): void {

	shader.fragmentShader = shader.fragmentShader.replace("#include <fog_fragment>", alphaFogFragment);

}
