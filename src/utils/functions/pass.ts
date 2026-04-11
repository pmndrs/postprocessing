import { Material } from "three";
import { Pass } from "../../core/Pass.js";
import { FullscreenMaterial } from "../../materials/FullscreenMaterial.js";

/**
 * Checks if this pass uses convolution shaders.
 *
 * Only works on passes that use a `FullscreenMaterial`.
 *
 * @param recursive - Controls whether subpasses should be checked recursively.
 * @return True if the pass uses convolution shaders.
 * @category Utils
 * @internal
 */

export function isConvolutionPass(pass: Pass<Material | null>, recursive: boolean): boolean {

	const material = pass.fullscreenMaterial;

	if(material instanceof FullscreenMaterial && /texture\s*\(\s*gBuffer.color/.test(material.fragmentShader)) {

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
