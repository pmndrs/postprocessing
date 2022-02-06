import { BasicDepthPacking, EventDispatcher, Scene } from "three";
import { BlendFunction, BlendMode } from "./blending";

/**
 * An enumeration of effect attributes.
 *
 * Attributes can be concatenated using the bitwise OR operator.
 *
 * @type {Object}
 * @property {Number} NONE - No attributes. Most effects don't need to specify any attributes.
 * @property {Number} DEPTH - Describes effects that require a depth texture.
 * @property {Number} CONVOLUTION - Describes effects that fetch additional samples from the input buffer. There cannot be more than one effect with this attribute per {@link EffectPass}.
 * @example const attributes = EffectAttribute.CONVOLUTION | EffectAttribute.DEPTH;
 */

export const EffectAttribute = {
	NONE: 0,
	DEPTH: 1,
	CONVOLUTION: 2
};

/**
 * An enumeration of WebGL extensions.
 *
 * @type {Object}
 * @property {String} DERIVATIVES - Enables derivatives by adding the functions dFdx, dFdy and fwidth.
 * @property {String} FRAG_DEPTH - Enables gl_FragDepthEXT to set a depth value of a fragment from within the fragment shader.
 * @property {String} DRAW_BUFFERS - Enables multiple render targets (MRT) support.
 * @property {String} SHADER_TEXTURE_LOD - Enables explicit control of texture LOD.
 */

export const WebGLExtension = {
	DERIVATIVES: "derivatives",
	FRAG_DEPTH: "fragDepth",
	DRAW_BUFFERS: "drawBuffers",
	SHADER_TEXTURE_LOD: "shaderTextureLOD"
};

/**
 * An abstract effect.
 *
 * Effects can be combined using the {@link EffectPass}.
 *
 * @implements {Initializable}
 * @implements {Resizable}
 * @implements {Disposable}
 */

export class Effect extends EventDispatcher {

	/**
	 * Constructs a new effect.
	 *
	 * @param {String} name - The name of this effect. Doesn't have to be unique.
	 * @param {String} fragmentShader - The fragment shader. This shader is required.
	 * @param {Object} [options] - Additional options.
	 * @param {EffectAttribute} [options.attributes=EffectAttribute.NONE] - The effect attributes that determine the execution priority and resource requirements.
	 * @param {BlendFunction} [options.blendFunction=BlendFunction.SCREEN] - The blend function of this effect.
	 * @param {Map<String, String>} [options.defines] - Custom preprocessor macro definitions. Keys are names and values are code.
	 * @param {Map<String, Uniform>} [options.uniforms] - Custom shader uniforms. Keys are names and values are uniforms.
	 * @param {Set<WebGLExtension>} [options.extensions] - WebGL extensions.
	 * @param {String} [options.vertexShader=null] - The vertex shader. Most effects don't need one.
	 */

	constructor(name, fragmentShader, {
		attributes = EffectAttribute.NONE,
		blendFunction = BlendFunction.SCREEN,
		defines = new Map(),
		uniforms = new Map(),
		extensions = null,
		vertexShader = null
	} = {}) {

		super();

		/**
		 * The name of this effect.
		 *
		 * @type {String}
		 * @private
		 */

		this.name = name;

		/**
		 * The renderer.
		 *
		 * @type {WebGLRenderer}
		 * @protected
		 */

		this.renderer = null;

		/**
		 * The effect attributes.
		 *
		 * @type {EffectAttribute}
		 * @private
		 */

		this.attributes = attributes;

		/**
		 * The fragment shader.
		 *
		 * @type {String}
		 * @private
		 */

		this.fragmentShader = fragmentShader;

		/**
		 * The vertex shader.
		 *
		 * @type {String}
		 * @private
		 */

		this.vertexShader = vertexShader;

		/**
		 * Preprocessor macro definitions.
		 *
		 * Call {@link Effect.setChanged} after changing macro definitions.
		 *
		 * @type {Map<String, String>}
		 * @protected
		 */

		this.defines = defines;

		/**
		 * Shader uniforms.
		 *
		 * Call {@link Effect.setChanged} after adding or removing uniforms.
		 *
		 * @type {Map<String, Uniform>}
		 * @protected
		 */

		this.uniforms = uniforms;

		/**
		 * WebGL extensions that are required by this effect.
		 *
		 * Call {@link Effect.setChanged} after adding or removing extensions.
		 *
		 * @type {Set<WebGLExtension>}
		 * @protected
		 */

		this.extensions = extensions;

		/**
		 * The blend mode of this effect.
		 *
		 * @type {BlendMode}
		 * @protected
		 */

		this.blendMode = new BlendMode(blendFunction);
		this.blendMode.addEventListener("change", (event) => this.setChanged());

	}

	/**
	 * Returns the name of this effect.
	 *
	 * @return {String} The name.
	 */

	getName() {

		return this.name;

	}

	/**
	 * Sets the renderer
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 */

	setRenderer(renderer) {

		this.renderer = renderer;

	}

	/**
	 * Returns the preprocessor macro definitions.
	 *
	 * @return {Map<String, String>} The extensions.
	 */

	getDefines() {

		return this.defines;

	}

	/**
	 * Returns the uniforms of this effect.
	 *
	 * @return {Map<String, Uniform>} The extensions.
	 */

	getUniforms() {

		return this.uniforms;

	}

	/**
	 * Returns the WebGL extensions that are required by this effect.
	 *
	 * @return {Set<WebGLExtension>} The extensions.
	 */

	getExtensions() {

		return this.extensions;

	}

	/**
	 * Returns the blend mode.
	 *
	 * The result of this effect will be blended with the result of the previous effect using this blend mode.
	 *
	 * @return {BlendMode} The blend mode.
	 */

	getBlendMode() {

		return this.blendMode;

	}

	/**
	 * Returns the effect attributes.
	 *
	 * @return {EffectAttribute} The attributes.
	 */

	getAttributes() {

		return this.attributes;

	}

	/**
	 * Sets the effect attributes.
	 *
	 * Effects that have the same attributes will be executed in the order in which they were registered. Some attributes
	 * imply a higher priority.
	 *
	 * @protected
	 * @param {EffectAttribute} attributes - The attributes.
	 */

	setAttributes(attributes) {

		this.attributes = attributes;
		this.setChanged();

	}

	/**
	 * Returns the fragment shader.
	 *
	 * @return {String} The fragment shader.
	 */

	getFragmentShader() {

		return this.fragmentShader;

	}

	/**
	 * Sets the fragment shader.
	 *
	 * @protected
	 * @param {String} fragmentShader - The fragment shader.
	 */

	setFragmentShader(fragmentShader) {

		this.fragmentShader = fragmentShader;
		this.setChanged();

	}

	/**
	 * Returns the vertex shader.
	 *
	 * @return {String} The vertex shader.
	 */

	getVertexShader() {

		return this.vertexShader;

	}

	/**
	 * Sets the vertex shader.
	 *
	 * @protected
	 * @param {String} vertexShader - The vertex shader.
	 */

	setVertexShader(vertexShader) {

		this.vertexShader = vertexShader;
		this.setChanged();

	}

	/**
	 * Informs the associated {@link EffectPass} that this effect requires a shader recompilation.
	 *
	 * Should be called after changing macros or extensions and after adding/removing uniforms.
	 *
	 * @protected
	 */

	setChanged() {

		this.dispatchEvent({ type: "change" });

	}

	/**
	 * Sets the depth texture.
	 *
	 * You may override this method if your effect requires direct access to the depth texture that is bound to the
	 * associated {@link EffectPass}.
	 *
	 * @param {Texture} depthTexture - A depth texture.
	 * @param {DepthPackingStrategies} [depthPacking=BasicDepthPacking] - The depth packing.
	 */

	setDepthTexture(depthTexture, depthPacking = BasicDepthPacking) {}

	/**
	 * Updates this effect by performing supporting operations.
	 *
	 * This method is called by the {@link EffectPass} right before the main fullscreen render operation, even if the
	 * blend function is set to `SKIP`.
	 *
	 * You may override this method if you need to update custom uniforms or render additional off-screen textures.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
	 * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
	 */

	update(renderer, inputBuffer, deltaTime) {}

	/**
	 * Updates the size of this effect.
	 *
	 * You may override this method if you want to be informed about the size of the backbuffer/canvas.
	 * This method is called before {@link initialize} and every time the size of the {@link EffectComposer} changes.
	 *
	 * @param {Number} width - The width.
	 * @param {Number} height - The height.
	 */

	setSize(width, height) {}

	/**
	 * Performs initialization tasks.
	 *
	 * This method is called when the associated {@link EffectPass} is added to an {@link EffectComposer}.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {Boolean} alpha - Whether the renderer uses the alpha channel or not.
	 * @param {Number} frameBufferType - The type of the main frame buffers.
	 * @example if(!alpha && frameBufferType === UnsignedByteType) { this.myRenderTarget.texture.format = RGBFormat; }
	 */

	initialize(renderer, alpha, frameBufferType) {}

	/**
	 * Performs a shallow search for properties that define a dispose method and deletes them.
	 *
	 * The {@link EffectComposer} calls this method when it is being destroyed.
	 */

	dispose() {

		for(const key of Object.keys(this)) {

			const property = this[key];

			if(property !== null && typeof property.dispose === "function") {

				if(property instanceof Scene) {

					continue;

				}

				/** @ignore */
				this[key].dispose();

			}

		}

	}

}
