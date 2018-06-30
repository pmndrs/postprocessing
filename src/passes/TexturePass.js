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

		this.setFullscreenMaterial(new CombineMaterial(screenMode));

		this.texture = texture;
		this.opacitySource = opacity;

	}

	/**
	 * The texture.
	 *
	 * @type {Texture}
	 */

	get texture() {

		return this.getFullscreenMaterial().uniforms.texture2.value;

	}

	/**
	 * @type {Texture}
	 */

	set texture(value) {

		this.getFullscreenMaterial().uniforms.texture2.value = value;

	}

	/**
	 * The opacity of the input buffer.
	 *
	 * The destination color is the color from the image in the input buffer.
	 *
	 * @type {Number}
	 */

	get opacityDestination() {

		return this.getFullscreenMaterial().uniforms.opacity1.value;

	}

	/**
	 * @type {Number}
	 */

	set opacityDestination(value = 1.0) {

		this.getFullscreenMaterial().uniforms.opacity1.value = value;

	}

	/**
	 * The opacity of the texture.
	 *
	 * The source color is the color from the texture.
	 *
	 * @type {Number}
	 */

	get opacitySource() {

		return this.getFullscreenMaterial().uniforms.opacity2.value;

	}

	/**
	 * @type {Number}
	 */

	set opacitySource(value = 1.0) {

		this.getFullscreenMaterial().uniforms.opacity2.value = value;

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

		this.getFullscreenMaterial().uniforms.texture1.value = inputBuffer.texture;

		renderer.render(this.scene, this.camera, this.renderToScreen ? null : outputBuffer);

	}

}
