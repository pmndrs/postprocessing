import { CombineMaterial } from "../materials";
import { Pass } from "./Pass.js";

/**
 * A pass that renders a given texture.
 */

export class TexturePass extends Pass {

	/**
	 * Constructs a new texture pass.
	 *
	 * @param {Texture} texture - The texture.
	 * @param {Number} [opacity=1.0] - The texture opacity.
	 * @param {Boolean} [screenMode=true] - Whether the screen blend mode should be used for combining the texture with the scene colors.
	 */

	constructor(texture, opacity = 1.0, screenMode = true) {

		super("TexturePass");

		this.material = new CombineMaterial(screenMode);

		this.texture = texture;
		this.opacity = opacity;

	}

	/**
	 * The texture.
	 *
	 * @type {Texture}
	 */

	get texture() {

		return this.material.uniforms.texture2.value;

	}

	/**
	 * @type {Texture}
	 */

	set texture(value) {

		this.material.uniforms.texture2.value = value;

	}

	/**
	 * The opacity.
	 *
	 * @type {Number}
	 */

	get opacity() {

		return this.material.uniforms.opacity2.value;

	}

	/**
	 * @type {Number}
	 */

	set opacity(value = 1.0) {

		this.material.uniforms.opacity2.value = value;

	}

	/**
	 * Renders the effect.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
	 * @param {WebGLRenderTarget} outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
	 * @param {Number} [delta] - The time between the last frame and the current one in seconds.
	 * @param {Boolean} [stencilTest] - Indicates whether a stencil mask is active.
	 */

	render(renderer, inputBuffer, outputBuffer, delta, stencilTest) {

		this.material.uniforms.texture1.value = inputBuffer.texture;
		renderer.render(this.scene, this.camera, this.renderToScreen ? null : outputBuffer);

	}

}
