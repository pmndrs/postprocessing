import { WebGLProgramParametersWithUniforms } from "three";

import alphaFogParsFragment from "./shaders/alpha-fog-pars.frag";
import alphaFogFragment from "./shaders/alpha-fog.frag";
import alphaFogParsVertex from "./shaders/alpha-fog-pars.vert";
import alphaFogVertex from "./shaders/alpha-fog.vert";

/**
 * Modifies the given shader to use range-based alpha fog.
 *
 * @param shader - A shader.
 */

export function alphaFog(shader: WebGLProgramParametersWithUniforms): void {

	shader.fragmentShader = shader.fragmentShader.replace("#include <fog_pars_fragment>", alphaFogParsFragment);
	shader.fragmentShader = shader.fragmentShader.replace("#include <fog_fragment>", alphaFogFragment);
	shader.vertexShader = shader.vertexShader.replace("#include <fog_pars_vertex>", alphaFogParsVertex);
	shader.vertexShader = shader.vertexShader.replace("#include <fog_vertex>", alphaFogVertex);

}
