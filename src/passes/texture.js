import { AdditiveBlending } from "three";
import { CopyMaterial } from "../materials";
import { Pass } from "./pass.js";

/**
 * A texture pass.
 *
 * Renders a given texture over the screen.
 *
 * @class TexturePass
 * @submodule passes
 * @extends Pass
 * @constructor
 * @param {Texture} texture - The texture.
 * @param {Number} [opacity=1.0] - The texture opacity.
 */

export class TexturePass extends Pass {

	constructor(texture, opacity = 1.0) {

		super();

		/**
		 * A copy shader material used for rendering to texture.
		 *
		 * @property copyMaterial
		 * @type CopyMaterial
		 * @private
		 */

		this.copyMaterial = new CopyMaterial();
		this.copyMaterial.blending = AdditiveBlending;
		this.copyMaterial.transparent = true;

		this.texture = texture;
		this.opacity = opacity;

		this.quad.material = this.copyMaterial;

	}

	/**
	 * The texture.
	 *
	 * @property texture
	 * @type Texture
	 */

	get texture() { return this.copyMaterial.uniforms.tDiffuse.value; }

	set texture(x) {

		this.copyMaterial.uniforms.tDiffuse.value = x;

	}

	/**
	 * The opacity.
	 *
	 * @property opacity
	 * @type Number
	 * @default 1.0
	 */

	get opacity() { return this.copyMaterial.uniforms.opacity.value; }

	set opacity(x) {

		this.copyMaterial.uniforms.opacity.value = x;

	}

	/**
	 * Renders the effect.
	 *
	 * @method render
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {WebGLRenderTarget} readBuffer - The read buffer.
	 */

	render(renderer, readBuffer) {

		renderer.render(this.scene, this.camera, this.renderToScreen ? null : readBuffer, this.clear);

	}

}
