import { AdditiveBlending } from "three";
import { CopyMaterial } from "../materials";
import { Pass } from "./pass.js";

/**
 * A pass that renders a given texture.
 */

export class TexturePass extends Pass {

	/**
	 * Constructs a new texture pass.
	 *
	 * @param {Texture} texture - The texture.
	 * @param {Number} [opacity=1.0] - The texture opacity.
	 */

	constructor(texture, opacity = 1.0) {

		super();

		/**
		 * The name of this pass.
		 */

		this.name = "TexturePass";

		/**
		 * A copy shader material used for rendering to texture.
		 *
		 * @type {CopyMaterial}
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
	 * @type {Texture}
	 */

	get texture() { return this.copyMaterial.uniforms.tDiffuse.value; }

	/**
	 * @type {Texture}
	 */

	set texture(x) {

		this.copyMaterial.uniforms.tDiffuse.value = x;

	}

	/**
	 * The opacity.
	 *
	 * @type {Number}
	 * @default 1.0
	 */

	get opacity() { return this.copyMaterial.uniforms.opacity.value; }

	/**
	 * @type {Number}
	 */

	set opacity(x) {

		this.copyMaterial.uniforms.opacity.value = x;

	}

	/**
	 * Renders the effect.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {WebGLRenderTarget} readBuffer - The read buffer.
	 */

	render(renderer, readBuffer) {

		renderer.render(this.scene, this.camera, this.renderToScreen ? null : readBuffer);

	}

}
