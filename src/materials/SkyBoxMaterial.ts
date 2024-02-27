import { BackSide, UniformsUtils, ShaderLib, ShaderMaterial, Texture } from "three";

/**
 * A sky box material that's compatible with MRT.
 *
 * @category Materials
 * @internal
 */

export class SkyBoxMaterial extends ShaderMaterial {

	/**
	 * Constructs a new sky box material.
	 */

	constructor() {

		super({
			name: "SkyBoxMaterial",
			fragmentShader: ShaderLib.backgroundCube.fragmentShader,
			vertexShader: ShaderLib.backgroundCube.vertexShader,
			uniforms: UniformsUtils.clone(ShaderLib.backgroundCube.uniforms),
			side: BackSide,
			depthWrite: false,
			depthTest: false,
			fog: false
		});

	}

	/**
	 * The current background texture.
	 */

	get envMap(): Texture {

		return this.uniforms.envMap.value as Texture;

	}

	set envMap(value: Texture) {

		this.uniforms.envMap.value = value;

	}

}
