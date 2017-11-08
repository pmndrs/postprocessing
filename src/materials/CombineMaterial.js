import { ShaderMaterial, Uniform } from "three";

import fragment from "./glsl/combine/shader.frag";
import vertex from "./glsl/combine/shader.vert";

/**
 * A material for combining two textures.
 *
 * This material supports the two blend modes Add and Screen.
 *
 * In Screen mode, the two textures are effectively projected on a white screen
 * simultaneously. In Add mode, the textures are simply added together which
 * often produces undesired, washed out results.
 */

export class CombineMaterial extends ShaderMaterial {

	/**
	 * Constructs a new combine material.
	 *
	 * @param {Boolean} [screenMode=false] - Whether the screen blend mode should be used.
	 */

	constructor(screenMode = false) {

		super({

			type: "CombineMaterial",

			uniforms: {

				texture1: new Uniform(null),
				texture2: new Uniform(null),

				opacity1: new Uniform(1.0),
				opacity2: new Uniform(1.0)

			},

			fragmentShader: fragment,
			vertexShader: vertex,

			depthWrite: false,
			depthTest: false

		});

		this.setScreenModeEnabled(screenMode);

	}

	/**
	 * Enables or disables the Screen blend mode.
	 *
	 * @param {Boolean} enabled - Whether the Screen blend mode should be enabled.
	 */

	setScreenModeEnabled(enabled) {

		if(enabled) {

			this.defines.SCREEN_MODE = "1";

		} else {

			delete this.defines.SCREEN_MODE;

		}

		this.needsUpdate = true;

	}

}
