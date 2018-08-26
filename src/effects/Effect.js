import { BlendFunction } from "./blending/BlendFunction.js";
import { BlendMode } from "./blending/BlendMode.js";

/**
 * An abstract effect.
 *
 * Effects can be combined using the {@link EffectPass}.
 *
 * Just like passes, effects may perform initialization tasks, react to render
 * size changes and execute supporting render operations if needed but they
 * don't have access to an output buffer and are not supposed to render to
 * screen by themselves.
 *
 * An Effect must specify a fragment shader. The fragment shader may implement
 * the following function: `void mainImage(const in vec4 inputColor, const in
 * vec2 uv, out vec4 outputColor)` to calculate an output color. It may also
 * implement `void mainUv(const inout vec2 uv)` to manipulate the screen UV
 * coordinates.
 *
 * Effects may also provide a vertex shader. If defined, it must implement the
 * following function: `void mainSupport()`.
 *
 * The fragment and vertex shaders have access to the following uniforms:
 *  - vec2 resolution
 *  - vec2 texelSize
 *  - float cameraNear
 *  - float cameraFar
 *  - float aspect
 *  - float time
 *
 * The fragment shader has access to the convenience function `float
 * readDepth(const in vec2 uv)` as well as the following additional uniforms:
 *  - sampler2D inputBuffer
 *  - sampler2D depthBuffer
 *
 * Effects may define custom uniforms, varyings, functions and preprocessor
 * macros as usual.
 *
 * Furthermore, the shader chunks [common](https://github.com/mrdoob/three.js/blob/dev/src/renderers/shaders/ShaderChunk/common.glsl)
 * and [packing](https://github.com/mrdoob/three.js/blob/dev/src/renderers/shaders/ShaderChunk/packing.glsl)
 * are included in the fragment shader.
 *
 * @implements {Resizable}
 * @implements {Disposable}
 */

export class Effect {

	/**
	 * Constructs a new effect.
	 *
	 * @param {String} name - The name of this effect. Doesn't have to be unique.
	 * @param {String} fragmentShader - The fragment shader. This shader is required.
	 * @param {Object} [options] - Additional options.
	 * @param {Priority} [options.priority=Priority.NORMAL] - The execution priority. Most effects should use the default priority.
	 * @param {BlendFunction} [options.blendFunction=BlendFunction.SCREEN] - The blend function of this effect.
	 * @param {Map<String, String>} [options.defines=null] - Custom preprocessor macro definitions. Keys are names and values are code.
	 * @param {Map<String, Uniform>} [options.uniforms=null] - Custom shader uniforms. Keys are names and values are uniforms.
	 * @param {String} [options.vertexShader=null] - The vertex shader. Most effects don't need one.
	 */

	constructor(name, fragmentShader, options = {}) {

		const settings = Object.assign({
			priority: Priority.NORMAL,
			blendFunction: BlendFunction.SCREEN,
			defines: null,
			uniforms: null,
			vertexShader: null
		}, options);

		/**
		 * The name of this effect.
		 *
		 * @type {String}
		 */

		this.name = name;

		/**
		 * The fragment shader.
		 *
		 * @type {String}
		 */

		this.fragmentShader = fragmentShader;

		/**
		 * The vertex shader.
		 *
		 * @type {String}
		 */

		this.vertexShader = settings.vertexShader;

		/**
		 * Preprocessor macro definitions.
		 *
		 * You'll need to call {@link EffectPass#recompile} after changing a macro.
		 *
		 * @type {Map<String, String>}
		 */

		this.defines = settings.defines;

		/**
		 * Shader uniforms.
		 *
		 * You may freely modify the values of these uniforms at runtime. However,
		 * uniforms must not be removed or added after the effect was created.
		 *
		 * @type {Map<String, Uniform>}
		 */

		this.uniforms = settings.uniforms;

		/**
		 * The priority of this effect.
		 *
		 * An effect with a higher priority will be executed before an effect with a
		 * lower priority.
		 *
		 * Effects of the same priority will be executed in the order in which they
		 * were registered.
		 *
		 * Changing the priority at runtime has no effect.
		 *
		 * @type {Priority}
		 */

		this.priority = settings.priority;

		/**
		 * The blend mode of this effect.
		 *
		 * The result of this effect will be blended with the result of the previous
		 * effect using this blend mode.
		 *
		 * Feel free to adjust the opacity of the blend mode at runtime. However,
		 * you'll need to call {@link EffectPass#recompile} if you change the blend
		 * function.
		 *
		 * @type {BlendMode}
		 */

		this.blendMode = new BlendMode(settings.blendFunction);

	}

	/**
	 * Updates the effect by performing supporting operations.
	 *
	 * This method is called by the {@link EffectPass} right before the main
	 * fullscreen render operation, even if the blend function is set to `SKIP`.
	 *
	 * You may override this method if you need to render additional off-screen
	 * textures that will be used in the fragment shader.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
	 * @param {Number} [delta] - The time between the last frame and the current one in seconds.
	 */

	update(renderer, inputBuffer, delta) {}

	/**
	 * Updates the size of this effect.
	 *
	 * You may override this method in case you want to be informed about the main
	 * render size.
	 *
	 * The {@link EffectPass} calls this method before this effect is initialized
	 * and every time its own size is updated.
	 *
	 * @param {Number} width - The width.
	 * @param {Number} height - The height.
	 * @example this.myRenderTarget.setSize(width, height);
	 */

	setSize(width, height) {}

	/**
	 * Performs initialization tasks.
	 *
	 * By overriding this method you gain access to the renderer. You'll also be
	 * able to configure your custom render targets to use the appropriate format
	 * (RGB or RGBA).
	 *
	 * The provided renderer can be used to warm up special off-screen render
	 * targets by performing a preliminary render operation.
	 *
	 * The {@link EffectPass} calls this method during its own initialization
	 * which happens after the size has been set.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {Boolean} alpha - Whether the renderer uses the alpha channel or not.
	 * @example if(!alpha) { this.myRenderTarget.texture.format = RGBFormat; }
	 */

	initialize(renderer, alpha) {}

	/**
	 * Performs a shallow search for properties that define a dispose method and
	 * deletes them. The effect will be inoperative after this method was called!
	 *
	 * Disposable objects:
	 *  - render targets
	 *  - materials
	 *  - textures
	 *
	 * The {@link EffectPass} calls this method when it is being destroyed. Do not
	 * call this method directly.
	 */

	dispose() {

		for(const key of Object.keys(this)) {

			if(this[key] !== null && typeof this[key].dispose === "function") {

				this[key].dispose();
				this[key] = null;

			}

		}

	}

}

/**
 * An enumeration of effect priority levels.
 *
 * @type {Object}
 * @property {Number} HIGHEST - The highest priority. There should only be one effect with this priority per EffectPass.
 * @property {Number} HIGH - A high priority level. Effects will be executed before those that have a lower priority.
 * @property {Number} NORMAL - The normal priority level. Most passes should use this priority.
 */

export const Priority = {

	HIGHEST: 0,
	HIGH: 1,
	NORMAL: 2

};
