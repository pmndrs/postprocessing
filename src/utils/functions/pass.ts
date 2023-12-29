import { Material } from "three";
import { Pass } from "../../core/Pass.js";
import { FullscreenMaterial } from "../../materials/FullscreenMaterial.js";

/**
 * Checks if a given pass uses convolution shaders.
 *
 * Only works on passes that use `FullscreenMaterial`.
 *
 * @ignore
 * @param pass - The pass.
 * @param recursive - Controls whether subpasses should be checked recursively.
 * @return True if the pass uses convolution shaders.
 * @group Utils
 */

export function isConvolutionPass(pass: Pass<Material | null>, recursive: boolean): boolean {

	const material = pass.fullscreenMaterial;

	if(material instanceof FullscreenMaterial && /texture\s*\(\s*inputBuffer/.test(material.fragmentShader)) {

		return true;

	}

	if(recursive) {

		for(const subpass of pass.subpasses) {

			if(isConvolutionPass(subpass, recursive)) {

				return true;

			}

		}

	}

	return false;

}
