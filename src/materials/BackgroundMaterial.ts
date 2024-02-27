import { UniformsUtils, ShaderLib, ShaderMaterial, Texture } from "three";

/**
 * A background material that's compatible with MRT.
 *
 * @category Materials
 * @internal
 */

export class BackgroundMaterial extends ShaderMaterial {

	/**
	 * Constructs a new background material.
	 */

	constructor() {

		super({
			name: "BackgroundMaterial",
			fragmentShader: ShaderLib.background.fragmentShader,
			vertexShader: ShaderLib.background.vertexShader,
			uniforms: UniformsUtils.clone(ShaderLib.background.uniforms),
			depthWrite: false,
			depthTest: false,
			fog: false
		});

	}

	/**
	 * The current background texture.
	 */

	get map(): Texture {

		return this.uniforms.t2D.value as Texture;

	}

	set map(value: Texture) {

		this.uniforms.t2D.value = value;

	}

}
