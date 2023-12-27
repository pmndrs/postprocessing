declare module "postprocessing" {
	import {
		Vector2,
		WebGLRenderer,
		Camera,
		PerspectiveCamera,
		Texture,
		Material,
		WebGLRenderTarget,
		Scene,
		Uniform,
		Object3D,
		Vector3,
		ShaderMaterial,
		DataTexture,
		Mesh,
		Points,
		Loader,
		DepthPackingStrategies,
		DepthModes,
		EventDispatcher,
		Color,
		ColorSpace,
		TextureEncoding,
		Data3DTexture
	} from "three";

	/**
	 * A color channel enumeration.
	 *
	 * @type {Object}
	 * @property {Number} RED - Red.
	 * @property {Number} GREEN - Green.
	 * @property {Number} BLUE - Blue.
	 * @property {Number} ALPHA - Alpha.
	 */
	export enum ColorChannel {
		RED,
		GREEN,
		BLUE,
		ALPHA,
	}

	/**
	 * The Disposable contract.
	 *
	 * Implemented by objects that can free internal resources.
	 *
	 * @interface
	 */
	export interface Disposable {

		/**
		 * Frees internal resources.
		 */
		dispose(): void;

	}

	/**
	 * The initializable contract.
	 *
	 * Implemented by objects that can be initialized.
	 *
	 * @interface
	 */
	export interface Initializable {

		/**
		 * Performs initialization tasks.
		 *
		 * @param {WebGLRenderer} renderer - A renderer.
		 * @param {Boolean} alpha - Whether the renderer uses the alpha channel.
		 * @param {Number} frameBufferType - The type of the main frame buffers.
		 */
		initialize(
			renderer: WebGLRenderer,
			alpha: boolean,
			frameBufferType: number
		): void;

	}

	/**
	 * A Gauss kernel.
	 *
	 * Based on https://github.com/Jam3/glsl-fast-gaussian-blur.
	 */
	export class GaussKernel {

		/**
		 * Constructs a new Gauss kernel.
		 *
		 * @param kernelSize - The kernel size. Should be an odd number in the range [3, 1020].
		 * @param [edgeBias=2] - Determines how many edge coefficients should be cut off for increased accuracy.
		 */
		constructor(kernelSize: number, edgeBias: number);

	}
	/**
	 * An adaptive luminance shader material.
	 */
	export class AdaptiveLuminanceMaterial extends ShaderMaterial {

		/**
		 * Constructs a new adaptive luminance material.
		 */
		constructor();
		/**
		 * The primary luminance buffer that contains the downsampled average luminance.
		 *
		 * @type {Texture}
		 */
		set luminanceBuffer0(arg: Texture);
		/**
		 * Sets the primary luminance buffer that contains the downsampled average luminance.
		 *
		 * @deprecated Use luminanceBuffer0 instead.
		 * @param {Texture} value - The buffer.
		 */
		setLuminanceBuffer0(value: Texture): void;
		/**
		 * The secondary luminance buffer.
		 *
		 * @type {Texture}
		 */
		set luminanceBuffer1(arg: Texture);
		/**
		 * Sets the secondary luminance buffer.
		 *
		 * @deprecated Use luminanceBuffer1 instead.
		 * @param {Texture} value - The buffer.
		 */
		setLuminanceBuffer1(value: Texture): void;
		/**
		 * The 1x1 mipmap level.
		 *
		 * This level is used to identify the smallest mipmap of the primary luminance buffer.
		 *
		 * @type {Number}
		 */
		set mipLevel1x1(arg: number);
		/**
		 * Sets the 1x1 mipmap level.
		 *
		 * @deprecated Use mipLevel1x1 instead.
		 * @param {Number} value - The level.
		 */
		setMipLevel1x1(value: number): void;
		/**
		 * The delta time.
		 *
		 * @type {Number}
		 */
		set deltaTime(arg: number);
		/**
		 * Sets the delta time.
		 *
		 * @deprecated Use deltaTime instead.
		 * @param {Number} value - The delta time.
		 */
		setDeltaTime(value: number): void;
		set minLuminance(arg: number);
		/**
		 * The lowest possible luminance value.
		 *
		 * @type {Number}
		 */
		get minLuminance(): number;
		/**
		 * Returns the lowest possible luminance value.
		 *
		 * @deprecated Use minLuminance instead.
		 * @return {Number} The minimum luminance.
		 */
		getMinLuminance(): number;
		/**
		 * Sets the minimum luminance.
		 *
		 * @deprecated Use minLuminance instead.
		 * @param {Number} value - The minimum luminance.
		 */
		setMinLuminance(value: number): void;
		set adaptationRate(arg: number);
		/**
		 * The luminance adaptation rate.
		 *
		 * @type {Number}
		 */
		get adaptationRate(): number;
		/**
		 * Returns the luminance adaptation rate.
		 *
		 * @deprecated Use adaptationRate instead.
		 * @return {Number} The adaptation rate.
		 */
		getAdaptationRate(): number;
		/**
		 * Sets the luminance adaptation rate.
		 *
		 * @deprecated Use adaptationRate instead.
		 * @param {Number} value - The adaptation rate.
		 */
		setAdaptationRate(value: number): void;

	}

	/**
	 * A bokeh disc blur material.
	 *
	 * This material should be applied twice in a row, with `fill` mode enabled for the second pass. Enabling the
	 * `foreground` option causes the shader to combine the near and far CoC values around foreground objects.
	 *
	 * @implements {Resizable}
	 */
	export class BokehMaterial extends ShaderMaterial implements Resizable {

		/**
		 * Constructs a new bokeh material.
		 *
		 * @param {Boolean} [fill=false] - Enables or disables the bokeh highlight fill mode.
		 * @param {Boolean} [foreground=false] - Determines whether this material will be applied to foreground colors.
		 */
		constructor(fill?: boolean, foreground?: boolean);
		/**
		 * The input buffer.
		 *
		 * @type {Texture}
		 */
		set inputBuffer(arg: Texture);
		/**
		 * Sets the input buffer.
		 *
		 * @deprecated Use inputBuffer instead.
		 * @param {Texture} value - The buffer.
		 */
		setInputBuffer(value: Texture): void;
		/**
		 * The circle of confusion buffer.
		 *
		 * @type {Texture}
		 */
		set cocBuffer(arg: Texture);
		/**
		 * Sets the circle of confusion buffer.
		 *
		 * @deprecated Use cocBuffer instead.
		 * @param {Texture} value - The buffer.
		 */
		setCoCBuffer(value: Texture): void;
		set scale(arg: number);
		/**
		 * The blur scale.
		 *
		 * @type {Number}
		 */
		get scale(): number;
		/**
		 * Returns the blur scale.
		 *
		 * @deprecated Use scale instead.
		 * @return {Number} The scale.
		 */
		getScale(value: number): number;
		/**
		 * Sets the blur scale.
		 *
		 * @deprecated Use scale instead.
		 * @param {Number} value - The scale.
		 */
		setScale(value: number): void;
		/**
		 * Sets the texel size.
		 *
		 * @deprecated Use setSize() instead.
		 * @param {Number} x - The texel width.
		 * @param {Number} y - The texel height.
		 */
		setTexelSize(x: number, y: number): void;
		/**
		 * Sets the size of this object.
		 *
		 * @param {Number} width - The width.
		 * @param {Number} height - The height.
		 */
		setSize(width: number, height: number): void;

	}

	/**
	 * A Circle of Confusion shader material.
	 */
	export class CircleOfConfusionMaterial extends ShaderMaterial {

		/**
		 * Constructs a new CoC material.
		 *
		 * @param {Camera} camera - A camera.
		 */
		constructor(camera: Camera);
		/**
		 * The depth buffer.
		 *
		 * @type {Texture}
		 */
		set depthBuffer(arg: Texture);
		/**
		 * The depth packing strategy.
		 *
		 * @type {DepthPackingStrategies}
		 */
		set depthPacking(arg: DepthPackingStrategies);
		/**
		 * Sets the depth buffer.
		 *
		 * @deprecated Use depthBuffer and depthPacking instead.
		 * @param {Texture} buffer - The depth texture.
		 * @param {DepthPackingStrategies} [depthPacking=BasicDepthPacking] - The depth packing strategy.
		 */
		setDepthBuffer(
			buffer: Texture,
			depthPacking?: DepthPackingStrategies
		): void;

		set focusDistance(arg: number);
		/**
		 * The focus distance. Range: [0.0, 1.0].
		 *
		 * @type {Number}
		 */
		get focusDistance(): number;
		/**
		 * Returns the focus distance.
		 *
		 * @deprecated Use focusDistance instead.
		 * @return {Number} The focus distance.
		 */
		getFocusDistance(value: number): number;
		/**
		 * Sets the focus distance.
		 *
		 * @deprecated Use focusDistance instead.
		 * @param {Number} value - The focus distance.
		 */
		setFocusDistance(value: number): void;
		set focalLength(arg: number);
		/**
		 * The focal length.
		 *
		 * @deprecated Renamed to focusRange.
		 * @type {Number}
		 */
		get focalLength(): number;
		/**
		 * Returns the focal length.
		 *
		 * @deprecated Use focusRange instead.
		 * @return {Number} The focal length.
		 */
		getFocalLength(value: number): number;
		/**
		 * Sets the focal length.
		 *
		 * @deprecated Use focusRange instead.
		 * @param {Number} value - The focal length.
		 */
		setFocalLength(value: number): void;
		/**
		 * Adopts the settings of the given camera.
		 *
		 * @param {Camera} camera - A camera.
		 */
		adoptCameraSettings(camera: Camera): void;

		/**
		 * The focus distance in world units.
		 *
		 * @type {Number}
		 */
		get worldFocusDistance(): number;
		set worldFocusDistance(value: number);

		/**
		 * The focus range. Range: [0.0, 1.0].
		 *
		 * @type {Number}
		 */
		get focusRange(): number;
		set focusRange(value: number);

		/**
		 * The focus range in world units.
		 *
		 * @type {Number}
		 */
		get worldFocusRange(): number;
		set worldFocusRange(value: number);

	}

	/**
	 * A blur kernel size enumeration.
	 *
	 * @type {Object}
	 * @property {Number} VERY_SMALL - A very small kernel that matches a 7x7 Gaussian blur kernel.
	 * @property {Number} SMALL - A small kernel that matches a 15x15 Gaussian blur kernel.
	 * @property {Number} MEDIUM - A medium sized kernel that matches a 23x23 Gaussian blur kernel.
	 * @property {Number} LARGE - A large kernel that matches a 35x35 Gaussian blur kernel.
	 * @property {Number} VERY_LARGE - A very large kernel that matches a 63x63 Gaussian blur kernel.
	 * @property {Number} HUGE - A huge kernel that matches a 127x127 Gaussian blur kernel.
	 */
	export enum KernelSize {
		VERY_SMALL,
		SMALL,
		MEDIUM,
		LARGE,
		VERY_LARGE,
		HUGE,
	}

	/**
	 * A simple copy shader material.
	 */
	export class CopyMaterial extends ShaderMaterial {

		/**
		 * Constructs a new copy material.
		 */
		constructor();
		/**
		 * The input buffer.
		 *
		 * @type {Texture}
		 */
		set inputBuffer(arg: Texture);
		/**
		 * Sets the input buffer.
		 *
		 * @deprecated Use inputBuffer instead.
		 * @param {Number} value - The buffer.
		 */
		setInputBuffer(value: number): void;
		/**
		 * Returns the opacity.
		 *
		 * @deprecated Use opacity instead.
		 * @return {Number} The opacity.
		 */
		getOpacity(): number;
		/**
		 * Sets the opacity.
		 *
		 * @deprecated Use opacity instead.
		 * @param {Number} value - The opacity.
		 */
		setOpacity(value: number): void;

	}

	/**
	 * A depth comparison shader material.
	 */
	export class DepthComparisonMaterial extends ShaderMaterial {

		/**
		 * Constructs a new depth comparison material.
		 *
		 * @param {Texture} [depthTexture=null] - A depth texture.
		 * @param {PerspectiveCamera} [camera] - A camera.
		 */
		constructor(depthTexture?: Texture, camera?: PerspectiveCamera);
		/**
		 * The depth buffer.
		 *
		 * @type {Texture}
		 */
		set depthBuffer(arg: Texture);
		/**
		 * The depth packing strategy.
		 *
		 * @type {DepthPackingStrategies}
		 */
		set depthPacking(arg: DepthPackingStrategies);
		/**
		 * Sets the depth buffer.
		 *
		 * @deprecated Use depthBuffer and depthPacking instead.
		 * @param {Texture} buffer - The depth texture.
		 * @param {DepthPackingStrategies} [depthPacking=RGBADepthPacking] - The depth packing strategy.
		 */
		setDepthBuffer(
			buffer: Texture,
			depthPacking?: DepthPackingStrategies
		): void;

		/**
		 * Adopts the settings of the given camera.
		 *
		 * @param {Camera} camera - A camera.
		 */
		adoptCameraSettings(camera: Camera): void;

	}

	/**
	 * An enumeration of depth copy modes.
	 *
	 * @type {Object}
	 * @property {Number} FULL - Copies the full depth texture every frame.
	 * @property {Number} SINGLE - Copies a single texel from the depth texture on demand.
	 */
	export enum DepthCopyMode {
		FULL,
		SINGLE,
	}

	/**
	 * A depth copy shader material.
	 */
	export class DepthCopyMaterial extends ShaderMaterial {

		/**
		 * Constructs a new depth copy material.
		 */
		constructor();
		/**
		 * The input depth buffer.
		 *
		 * @type {Texture}
		 */
		set depthBuffer(arg: Texture);
		/**
		 * The input depth packing strategy.
		 *
		 * @type {DepthPackingStrategies}
		 */
		set inputDepthPacking(arg: DepthPackingStrategies);
		set outputDepthPacking(arg: DepthPackingStrategies);
		/**
		 * The output depth packing strategy.
		 *
		 * @type {DepthPackingStrategies}
		 */
		get outputDepthPacking(): DepthPackingStrategies;
		/**
		 * Sets the input depth buffer.
		 *
		 * @deprecated Use depthBuffer and inputDepthPacking instead.
		 * @param {Texture} buffer - The depth texture.
		 * @param {DepthPackingStrategies} [depthPacking=BasicDepthPacking] - The depth packing strategy.
		 */
		setDepthBuffer(
			buffer: Texture,
			depthPacking?: DepthPackingStrategies
		): void;

		/**
		 * Returns the current input depth packing strategy.
		 *
		 * @deprecated
		 * @return {DepthPackingStrategies} The input depth packing strategy.
		 */
		getInputDepthPacking(): DepthPackingStrategies;
		/**
		 * Sets the input depth packing strategy.
		 *
		 * @deprecated Use inputDepthPacking instead.
		 * @param {DepthPackingStrategies} value - The new input depth packing strategy.
		 */
		setInputDepthPacking(value: DepthPackingStrategies): void;
		/**
		 * Returns the current output depth packing strategy.
		 *
		 * @deprecated Use outputDepthPacking instead.
		 * @return {DepthPackingStrategies} The output depth packing strategy.
		 */
		getOutputDepthPacking(): DepthPackingStrategies;
		/**
		 * Sets the output depth packing strategy.
		 *
		 * @deprecated Use outputDepthPacking instead.
		 * @param {DepthPackingStrategies} value - The new output depth packing strategy.
		 */
		setOutputDepthPacking(value: DepthPackingStrategies): void;
		/**
		 * The screen space position used for single-texel copy operations.
		 *
		 * @type {Vector2}
		 */
		get texelPosition(): Vector2;
		/**
		 * Returns the screen space position used for single-texel copy operations.
		 *
		 * @deprecated Use texelPosition instead.
		 * @return {Vector2} The position.
		 */
		getTexelPosition(): Vector2;
		/**
		 * Sets the screen space position used for single-texel copy operations.
		 *
		 * @deprecated
		 * @param {Vector2} value - The position.
		 */
		setTexelPosition(value: Vector2): void;
		set mode(arg: DepthCopyMode);
		/**
		 * The depth copy mode.
		 *
		 * @type {DepthCopyMode}
		 */
		get mode(): DepthCopyMode;
		/**
		 * Returns the depth copy mode.
		 *
		 * @deprecated Use mode instead.
		 * @return {DepthCopyMode} The depth copy mode.
		 */
		getMode(): DepthCopyMode;
		/**
		 * Sets the depth copy mode.
		 *
		 * @deprecated Use mode instead.
		 * @param {DepthCopyMode} value - The new mode.
		 */
		setMode(value: DepthCopyMode): void;

	}

	/**
	 * A depth downsampling shader material.
	 *
	 * Based on an article by Eleni Maria Stea:
	 * https://eleni.mutantstargoat.com/hikiko/depth-aware-upsampling-6
	 *
	 * @implements {Resizable}
	 */
	export class DepthDownsamplingMaterial
		extends ShaderMaterial
		implements Resizable {

		/**
		 * Constructs a new depth downsampling material.
		 */
		constructor();
		/**
		 * The depth buffer.
		 *
		 * @type {Texture}
		 */
		set depthBuffer(arg: Texture);
		/**
		 * The depth packing strategy.
		 *
		 * @type {DepthPackingStrategies}
		 */
		set depthPacking(arg: DepthPackingStrategies);
		/**
		 * Sets the depth buffer.
		 *
		 * @deprecated Use depthBuffer and depthPacking instead.
		 * @param {Texture} buffer - The depth texture.
		 * @param {DepthPackingStrategies} [depthPacking=BasicDepthPacking] - The depth packing strategy.
		 */
		setDepthBuffer(
			buffer: Texture,
			depthPacking?: DepthPackingStrategies
		): void;

		/**
		 * The normal buffer.
		 *
		 * @type {Texture}
		 */
		set normalBuffer(arg: Texture);
		/**
		 * Sets the normal buffer.
		 *
		 * @deprecated Use normalBuffer instead.
		 * @param {Texture} value - The normal buffer.
		 */
		setNormalBuffer(value: Texture): void;
		/**
		 * Sets the texel size.
		 *
		 * @deprecated Use setSize() instead.
		 * @param {Number} x - The texel width.
		 * @param {Number} y - The texel height.
		 */
		setTexelSize(x: number, y: number): void;
		/**
		 * Sets the size of this object.
		 *
		 * @param {Number} width - The width.
		 * @param {Number} height - The height.
		 */
		setSize(width: number, height: number): void;

	}

	/**
	 * An enumeration of depth test strategies.
	 *
	 * @type {Object}
	 * @property {Number} DEFAULT - Perform depth test only.
	 * @property {Number} KEEP_MAX_DEPTH - Always keep max depth.
	 * @property {Number} DISCARD_MAX_DEPTH - Always discard max depth.
	 */
	export enum DepthTestStrategy {
		DEFAULT,
		KEEP_MAX_DEPTH,
		DISCARD_MAX_DEPTH,
	}

	/**
	 * A depth mask shader material.
	 *
	 * This material masks a color buffer by comparing two depth textures.
	 */
	export class DepthMaskMaterial extends ShaderMaterial {

		/**
		 * Constructs a new depth mask material.
		 */
		constructor();
		set depthMode(arg: DepthModes);
		/**
		 * The depth mode.
		 *
		 * @see https://threejs.org/docs/#api/en/constants/Materials
		 * @type {DepthModes}
		 */
		get depthMode(): DepthModes;
		/**
		 * The primary depth buffer.
		 *
		 * @type {Texture}
		 */
		set depthBuffer0(arg: Texture);
		/**
		 * The primary depth packing strategy.
		 *
		 * @type {DepthPackingStrategies}
		 */
		set depthPacking0(arg: DepthPackingStrategies);
		/**
		 * Sets the base depth buffer.
		 *
		 * @deprecated Use depthBuffer0 and depthPacking0 instead.
		 * @param {Texture} buffer - The depth texture.
		 * @param {DepthPackingStrategies} [depthPacking=BasicDepthPacking] - The depth packing strategy.
		 */
		setDepthBuffer0(
			buffer: Texture,
			depthPacking?: DepthPackingStrategies
		): void;

		/**
		 * The secondary depth buffer.
		 *
		 * @type {Texture}
		 */
		set depthBuffer1(arg: Texture);
		/**
		 * The secondary depth packing strategy.
		 *
		 * @type {DepthPackingStrategies}
		 */
		set depthPacking1(arg: DepthPackingStrategies);
		/**
		 * Sets the depth buffer that will be compared with the base depth buffer.
		 *
		 * @deprecated Use depthBuffer1 and depthPacking1 instead.
		 * @param {Texture} buffer - The depth texture.
		 * @param {DepthPackingStrategies} [depthPacking=BasicDepthPacking] - The depth packing strategy.
		 */
		setDepthBuffer1(
			buffer: Texture,
			depthPacking?: DepthPackingStrategies
		): void;

		set maxDepthStrategy(arg: DepthTestStrategy);
		/**
		 * The strategy for handling maximum depth.
		 *
		 * @type {DepthTestStrategy}
		 */
		get maxDepthStrategy(): DepthTestStrategy;
		set keepFar(arg: boolean);
		/**
		 * Indicates whether maximum depth values should be preserved.
		 *
		 * @type {Boolean}
		 * @deprecated Use maxDepthStrategy instead.
		 */
		get keepFar(): boolean;
		/**
		 * Returns the strategy for dealing with maximum depth values.
		 *
		 * @deprecated Use maxDepthStrategy instead.
		 * @return {DepthTestStrategy} The strategy.
		 */
		getMaxDepthStrategy(): DepthTestStrategy;
		/**
		 * Sets the strategy for dealing with maximum depth values.
		 *
		 * @deprecated Use maxDepthStrategy instead.
		 * @param {DepthTestStrategy} value - The strategy.
		 */
		setMaxDepthStrategy(value: DepthTestStrategy): void;
		set epsilon(arg: number);
		/**
		 * A small error threshold that is used for `EqualDepth` and `NotEqualDepth` tests. Default is `1e-5`.
		 *
		 * @type {Number}
		 */
		get epsilon(): number;
		/**
		 * Returns the current error threshold for depth comparisons. Default is `1e-5`.
		 *
		 * @deprecated Use epsilon instead.
		 * @return {Number} The error threshold.
		 */
		getEpsilon(): number;
		/**
		 * Sets the depth comparison error threshold.
		 *
		 * @deprecated Use epsilon instead.
		 * @param {Number} value - The new error threshold.
		 */
		setEpsilon(value: number): void;
		/**
		 * Returns the current depth mode.
		 *
		 * @deprecated Use depthMode instead.
		 * @return {DepthModes} The depth mode. Default is `LessDepth`.
		 */
		getDepthMode(): DepthModes;
		/**
		 * Sets the depth mode.
		 *
		 * @deprecated Use depthMode instead.
		 * @param {DepthModes} mode - The depth mode.
		 */
		setDepthMode(mode: DepthModes): void;

	}

	/**
	 * An enumeration of edge detection modes.
	 *
	 * @type {Object}
	 * @property {Number} DEPTH - Depth-based edge detection.
	 * @property {Number} LUMA - Luminance-based edge detection.
	 * @property {Number} COLOR - Chroma-based edge detection.
	 */
	export enum EdgeDetectionMode {
		DEPTH,
		LUMA,
		COLOR,
	}

	/**
	 * An enumeration of predication modes.
	 *
	 * @type {Object}
	 * @property {Number} DISABLED - No predicated thresholding.
	 * @property {Number} DEPTH - Depth-based predicated thresholding.
	 * @property {Number} CUSTOM - Predicated thresholding using a custom buffer.
	 */
	export enum PredicationMode {
		DISABLED,
		DEPTH,
		CUSTOM,
	}
	/**
	 * An edge detection material.
	 *
	 * Mainly used for Subpixel Morphological Anti-Aliasing.
	 *
	 * @implements {Resizable}
	 */
	export class EdgeDetectionMaterial
		extends ShaderMaterial
		implements Resizable {

		/**
		 * Constructs a new edge detection material.
		 *
		 * TODO Remove parameters.
		 * @param {Vector2} [texelSize] - The screen texel size.
		 * @param {EdgeDetectionMode} [mode=EdgeDetectionMode.COLOR] - The edge detection mode.
		 */
		constructor(texelSize?: Vector2, mode?: EdgeDetectionMode);
		set edgeDetectionMode(arg: EdgeDetectionMode);
		/**
		 * The edge detection mode.
		 *
		 * @type {EdgeDetectionMode}
		 */
		get edgeDetectionMode(): EdgeDetectionMode;
		/**
		 * The depth buffer.
		 *
		 * @type {Texture}
		 */
		set depthBuffer(arg: Texture);
		/**
		 * The depth packing strategy.
		 *
		 * @type {DepthPackingStrategies}
		 */
		set depthPacking(arg: DepthPackingStrategies);
		/**
		 * Sets the depth buffer.
		 *
		 * @deprecated Use depthBuffer and depthPacking instead.
		 * @param {Texture} buffer - The depth texture.
		 * @param {DepthPackingStrategies} [depthPacking=BasicDepthPacking] - The depth packing strategy.
		 */
		setDepthBuffer(
			buffer: Texture,
			depthPacking?: DepthPackingStrategies
		): void;

		/**
		 * Returns the edge detection mode.
		 *
		 * @deprecated Use edgeDetectionMode instead.
		 * @return {EdgeDetectionMode} The mode.
		 */
		getEdgeDetectionMode(): EdgeDetectionMode;
		/**
		 * Sets the edge detection mode.
		 *
		 * @deprecated Use edgeDetectionMode instead.
		 * @param {EdgeDetectionMode} value - The edge detection mode.
		 */
		setEdgeDetectionMode(value: EdgeDetectionMode): void;
		set localContrastAdaptationFactor(arg: number);
		/**
		 * The local contrast adaptation factor. Has no effect if the edge detection mode is set to DEPTH. Default is 2.0.
		 *
		 * If a neighbor edge has _factor_ times bigger contrast than the current edge, the edge will be discarded.
		 *
		 * This allows to eliminate spurious crossing edges and is based on the fact that if there is too much contrast in a
		 * direction, the perceptual contrast in the other neighbors will be hidden.
		 *
		 * @type {Number}
		 */
		get localContrastAdaptationFactor(): number;
		/**
		 * Returns the local contrast adaptation factor.
		 *
		 * @deprecated Use localContrastAdaptationFactor instead.
		 * @return {Number} The factor.
		 */
		getLocalContrastAdaptationFactor(): number;
		/**
		 * Sets the local contrast adaptation factor. Has no effect if the edge detection mode is set to DEPTH.
		 *
		 * @deprecated Use localContrastAdaptationFactor instead.
		 * @param {Number} value - The local contrast adaptation factor. Default is 2.0.
		 */
		setLocalContrastAdaptationFactor(value: number): void;
		set edgeDetectionThreshold(arg: number);
		/**
		 * The edge detection threshold. Range: [0.0, 0.5].
		 *
		 * A lower value results in more edges being detected at the expense of performance.
		 *
		 * For luma- and chroma-based edge detection, 0.1 is a reasonable value and allows to catch most visible edges. 0.05
		 * is a rather overkill value that allows to catch 'em all. Darker scenes may require an even lower threshold.
		 *
		 * If depth-based edge detection is used, the threshold will depend on the scene depth.
		 *
		 * @type {Number}
		 */
		get edgeDetectionThreshold(): number;
		/**
		 * Returns the edge detection threshold.
		 *
		 * @deprecated Use edgeDetectionThreshold instead.
		 * @return {Number} The threshold.
		 */
		getEdgeDetectionThreshold(): number;
		/**
		 * Sets the edge detection threshold.
		 *
		 * @deprecated Use edgeDetectionThreshold instead.
		 * @param {Number} value - The edge detection threshold. Range: [0.0, 0.5].
		 */
		setEdgeDetectionThreshold(value: number): void;
		set predicationMode(arg: PredicationMode);
		/**
		 * The predication mode.
		 *
		 * Predicated thresholding allows to better preserve texture details and to improve edge detection using an additional
		 * buffer such as a light accumulation or depth buffer.
		 *
		 * @type {PredicationMode}
		 */
		get predicationMode(): PredicationMode;
		/**
		 * Returns the predication mode.
		 *
		 * @deprecated Use predicationMode instead.
		 * @return {PredicationMode} The mode.
		 */
		getPredicationMode(): PredicationMode;
		/**
		 * Sets the predication mode.
		 *
		 * @deprecated Use predicationMode instead.
		 * @param {PredicationMode} value - The predication mode.
		 */
		setPredicationMode(value: PredicationMode): void;
		/**
		 * The predication buffer.
		 *
		 * @type {Texture}
		 */
		set predicationBuffer(arg: Texture);
		/**
		 * Sets a custom predication buffer.
		 *
		 * @deprecated Use predicationBuffer instead.
		 * @param {Texture} value - The predication buffer.
		 */
		setPredicationBuffer(value: Texture): void;
		set predicationThreshold(arg: number);
		/**
		 * The predication threshold.
		 *
		 * @type {Number}
		 */
		get predicationThreshold(): number;
		/**
		 * Returns the predication threshold.
		 *
		 * @deprecated Use predicationThreshold instead.
		 * @return {Number} The threshold.
		 */
		getPredicationThreshold(): number;
		/**
		 * Sets the predication threshold.
		 *
		 * @deprecated Use predicationThreshold instead.
		 * @param {Number} value - The threshold.
		 */
		setPredicationThreshold(value: number): void;
		set predicationScale(arg: number);
		/**
		 * The predication scale. Range: [1.0, 5.0].
		 *
		 * Determines how much the edge detection threshold should be scaled when using predication.
		 *
		 * @type {Number}
		 */
		get predicationScale(): number;
		/**
		 * Returns the predication scale.
		 *
		 * @deprecated Use predicationScale instead.
		 * @return {Number} The scale.
		 */
		getPredicationScale(): number;
		/**
		 * Sets the predication scale.
		 *
		 * @deprecated Use predicationScale instead.
		 * @param {Number} value - The scale. Range: [1.0, 5.0].
		 */
		setPredicationScale(value: number): void;
		set predicationStrength(arg: number);
		/**
		 * The predication strength. Range: [0.0, 1.0].
		 *
		 * Determines how much the edge detection threshold should be decreased locally when using predication.
		 *
		 * @type {Number}
		 */
		get predicationStrength(): number;
		/**
		 * Returns the predication strength.
		 *
		 * @deprecated Use predicationStrength instead.
		 * @return {Number} The strength.
		 */
		getPredicationStrength(): number;
		/**
		 * Sets the predication strength.
		 *
		 * @deprecated Use predicationStrength instead.
		 * @param {Number} value - The strength. Range: [0.0, 1.0].
		 */
		setPredicationStrength(value: number): void;
		/**
		 * Sets the size of this object.
		 *
		 * @param {Number} width - The width.
		 * @param {Number} height - The height.
		 */
		setSize(width: number, height: number): void;

	}

	export type ColorEdgesMaterial = EdgeDetectionMaterial;

	/**
	 * An effect material for compound shaders. Supports dithering.
	 *
	 * @implements {Resizable}
	 */
	export class EffectMaterial extends ShaderMaterial implements Resizable {

		/**
		 * An enumeration of shader code section placeholders used by the {@link EffectPass}.
		 *
		 * @type {Object}
		 * @property {String} FRAGMENT_HEAD - A placeholder for function and variable declarations inside the fragment shader.
		 * @property {String} FRAGMENT_MAIN_UV - A placeholder for UV transformations inside the fragment shader.
		 * @property {String} FRAGMENT_MAIN_IMAGE - A placeholder for color calculations inside the fragment shader.
		 * @property {String} VERTEX_HEAD - A placeholder for function and variable declarations inside the vertex shader.
		 * @property {String} VERTEX_MAIN_SUPPORT - A placeholder for supporting calculations inside the vertex shader.
		 */
		static get Section(): {
			FRAGMENT_HEAD: string;
			FRAGMENT_MAIN_UV: string;
			FRAGMENT_MAIN_IMAGE: string;
			VERTEX_HEAD: string;
			VERTEX_MAIN_SUPPORT: string;
		};

		/**
		 * Constructs a new effect material.
		 *
		 * @param {Map<String, String>} [shaderParts] - A collection of shader snippets. See {@link Section}.
		 * @param {Map<String, String>} [defines] - A collection of preprocessor macro definitions.
		 * @param {Map<String, Uniform>} [uniforms] - A collection of uniforms.
		 * @param {Camera} [camera] - A camera.
		 * @param {Boolean} [dithering=false] - Whether dithering should be enabled.
		 */
		constructor(
			shaderParts?: Map<string, string>,
			defines?: Map<string, string>,
			uniforms?: Map<string, Uniform>,
			camera?: Camera,
			dithering?: boolean
		);

		/**
		 * The input buffer.
		 *
		 * @type {Texture}
		 */
		set inputBuffer(arg: Texture);
		/**
		 * Sets the input buffer.
		 *
		 * @deprecated Use inputBuffer instead.
		 * @param {Texture} value - The input buffer.
		 */
		setInputBuffer(value: Texture): void;
		set depthBuffer(arg: Texture);
		/**
		 * The depth buffer.
		 *
		 * @type {Texture}
		 */
		get depthBuffer(): Texture;
		set depthPacking(arg: DepthPackingStrategies);
		/**
		 * The depth packing strategy.
		 *
		 * @type {DepthPackingStrategies}
		 */
		get depthPacking(): DepthPackingStrategies;
		/**
		 * Sets the depth buffer.
		 *
		 * @deprecated Use depthBuffer and depthPacking instead.
		 * @param {Texture} buffer - The depth texture.
		 * @param {DepthPackingStrategies} [depthPacking=BasicDepthPacking] - The depth packing strategy.
		 */
		setDepthBuffer(
			buffer: Texture,
			depthPacking?: DepthPackingStrategies
		): void;

		/**
		 * Sets the shader parts.
		 *
		 * @param {Map<String, String>} shaderParts - A collection of shader snippets. See {@link Section}.
		 * @return {EffectMaterial} This material.
		 */
		setShaderParts(shaderParts: Map<string, string>): EffectMaterial;
		/**
		 * Sets the shader macros.
		 *
		 * @param {Map<String, String>} defines - A collection of preprocessor macro definitions.
		 * @return {EffectMaterial} This material.
		 */
		setDefines(defines: Map<string, string>): EffectMaterial;
		/**
		 * Sets the shader uniforms.
		 *
		 * @param {Map<String, Uniform>} uniforms - A collection of uniforms.
		 * @return {EffectMaterial} This material.
		 */
		setUniforms(uniforms: Map<string, Uniform>): EffectMaterial;
		/**
		 * Sets the required shader extensions.
		 *
		 * @param {Set<WebGLExtension>} extensions - A collection of extensions.
		 * @return {EffectMaterial} This material.
		 */
		setExtensions(extensions: Set<WebGLExtension>): EffectMaterial;
		set encodeOutput(arg: boolean);
		/**
		 * Indicates whether output encoding is enabled.
		 *
		 * @type {Boolean}
		 */
		get encodeOutput(): boolean;
		/**
		 * Indicates whether output encoding is enabled.
		 *
		 * @deprecated Use encodeOutput instead.
		 * @return {Boolean} Whether output encoding is enabled.
		 */
		isOutputEncodingEnabled(): boolean;
		/**
		 * Enables or disables output encoding.
		 *
		 * @deprecated Use encodeOutput instead.
		 * @param {Boolean} value - Whether output encoding should be enabled.
		 */
		setOutputEncodingEnabled(value: boolean): void;
		set time(arg: number);
		/**
		 * The time in seconds.
		 *
		 * @type {Number}
		 */
		get time(): number;
		/**
		 * Sets the delta time.
		 *
		 * @deprecated Use time instead.
		 * @param {Number} value - The delta time in seconds.
		 */
		setDeltaTime(value: number): void;
		/**
		 * Adopts the settings of the given camera.
		 *
		 * @param {Camera} camera - A camera.
		 */
		adoptCameraSettings(camera: Camera): void;
		/**
		 * Sets the resolution.
		 *
		 * @param {Number} width - The width.
		 * @param {Number} height - The height.
		 */
		setSize(width: number, height: number): void;

	}

	/**
	 * An enumeration of shader code placeholders used by the {@link EffectPass}.
	 * @property FRAGMENT_HEAD - A placeholder for function and variable declarations inside the fragment shader.
	 * @property FRAGMENT_MAIN_UV - A placeholder for UV transformations inside the fragment shader.
	 * @property FRAGMENT_MAIN_IMAGE - A placeholder for color calculations inside the fragment shader.
	 * @property VERTEX_HEAD - A placeholder for function and variable declarations inside the vertex shader.
	 * @property VERTEX_MAIN_SUPPORT - A placeholder for supporting calculations inside the vertex shader.
	 * @deprecated Use EffectMaterial.Section instead.
	 */
	export const Section: {
		FRAGMENT_HEAD: string;
		FRAGMENT_MAIN_UV: string;
		FRAGMENT_MAIN_IMAGE: string;
		VERTEX_HEAD: string;
		VERTEX_MAIN_SUPPORT: string;
	};

	/**
	 * A crepuscular rays shader material.
	 *
	 * References:
	 *
	 * Thibaut Despoulain, 2012:
	 *	[(WebGL) Volumetric Light Approximation in Three.js](
	 *	http://bkcore.com/blog/3d/webgl-three-js-volumetric-light-godrays.html)
	 *
	 * Nvidia, GPU Gems 3, 2008:
	 *	[Chapter 13. Volumetric Light Scattering as a Post-Process](
	 *	https://developer.nvidia.com/gpugems/GPUGems3/gpugems3_ch13.html)
	 *
	 * @todo Remove dithering code from fragment shader.
	 */
	export class GodRaysMaterial extends ShaderMaterial {

		/**
		 * Constructs a new god rays material.
		 *
		 * TODO Remove lightPosition param.
		 * @param {Vector2} lightPosition - Deprecated.
		 */
		constructor(lightPosition: Vector2);
		/**
		 * The input buffer.
		 *
		 * @type {Texture}
		 */
		set inputBuffer(arg: Texture);
		/**
		 * Sets the input buffer.
		 *
		 * @deprecated Use inputBuffer instead.
		 * @param {Texture} value - The input buffer.
		 */
		setInputBuffer(value: Texture): void;
		/**
		 * The screen space position of the light source.
		 *
		 * @type {Vector2}
		 */
		get lightPosition(): Vector2;
		/**
		 * Returns the screen space position of the light source.
		 *
		 * @deprecated Use lightPosition instead.
		 * @return {Vector2} The position.
		 */
		getLightPosition(): Vector2;
		/**
		 * Sets the screen space position of the light source.
		 *
		 * @deprecated Use lightPosition instead.
		 * @param {Vector2} value - The position.
		 */
		setLightPosition(value: Vector2): void;
		set density(arg: number);
		/**
		 * The density.
		 *
		 * @type {Number}
		 */
		get density(): number;
		/**
		 * Returns the density.
		 *
		 * @deprecated Use density instead.
		 * @return {Number} The density.
		 */
		getDensity(): number;
		/**
		 * Sets the density.
		 *
		 * @deprecated Use density instead.
		 * @param {Number} value - The density.
		 */
		setDensity(value: number): void;
		set decay(arg: number);
		/**
		 * The decay.
		 *
		 * @type {Number}
		 */
		get decay(): number;
		/**
		 * Returns the decay.
		 *
		 * @deprecated Use decay instead.
		 * @return {Number} The decay.
		 */
		getDecay(): number;
		/**
		 * Sets the decay.
		 *
		 * @deprecated Use decay instead.
		 * @param {Number} value - The decay.
		 */
		setDecay(value: number): void;
		set weight(arg: number);
		/**
		 * The weight.
		 *
		 * @type {Number}
		 */
		get weight(): number;
		/**
		 * Returns the weight.
		 *
		 * @deprecated Use weight instead.
		 * @return {Number} The weight.
		 */
		getWeight(): number;
		/**
		 * Sets the weight.
		 *
		 * @deprecated Use weight instead.
		 * @param {Number} value - The weight.
		 */
		setWeight(value: number): void;
		set exposure(arg: number);
		/**
		 * The exposure.
		 *
		 * @type {Number}
		 */
		get exposure(): number;
		/**
		 * Returns the exposure.
		 *
		 * @deprecated Use exposure instead.
		 * @return {Number} The exposure.
		 */
		getExposure(): number;
		/**
		 * Sets the exposure.
		 *
		 * @deprecated Use exposure instead.
		 * @param {Number} value - The exposure.
		 */
		setExposure(value: number): void;
		set maxIntensity(arg: number);
		/**
		 * The maximum light intensity.
		 *
		 * @type {Number}
		 */
		get maxIntensity(): number;
		/**
		 * Returns the maximum light intensity.
		 *
		 * @deprecated Use maxIntensity instead.
		 * @return {Number} The maximum light intensity.
		 */
		getMaxIntensity(): number;
		/**
		 * Sets the maximum light intensity.
		 *
		 * @deprecated Use maxIntensity instead.
		 * @param {Number} value - The maximum light intensity.
		 */
		setMaxIntensity(value: number): void;
		set samples(arg: number);
		/**
		 * The amount of samples per pixel.
		 *
		 * @type {Number}
		 */
		get samples(): number;
		/**
		 * Returns the amount of samples per pixel.
		 *
		 * @deprecated Use samples instead.
		 * @return {Number} The sample count.
		 */
		getSamples(): number;
		/**
		 * Sets the amount of samples per pixel.
		 *
		 * @deprecated Use samples instead.
		 * @param {Number} value - The sample count.
		 */
		setSamples(value: number): void;

	}

	/**
	 * A box blur material.
	 *
	 * @implements {Resizable}
	 */

	export class BoxBlurMaterial extends ShaderMaterial {}

	/**
	 * A box blur pass.
	 */

	export class BoxBlurPass extends Pass {

		/**
		 * Constructs a new box blur pass.
		 *
		 * @param {Object} [options] - The options.
		 * @param {Number} [options.kernelSize=5] - The kernel size.
		 * @param {Number} [options.iterations=1] - The amount of times the blur should be applied.
		 * @param {Number} [options.bilateral=false] - Enables or disables bilateral blurring.
		 * @param {Number} [options.resolutionScale=1.0] - The resolution scale.
		 * @param {Number} [options.resolutionX=Resolution.AUTO_SIZE] - The horizontal resolution.
		 * @param {Number} [options.resolutionY=Resolution.AUTO_SIZE] - The vertical resolution.
		 */

		constructor(
			{
				kernelSize,
				iterations,
				bilateral,
				resolutionScale,
				resolutionX,
				resolutionY
			}?: {
				kernelSize?: number;
				iterations?: number;
				bilateral?: boolean;
				resolutionScale?: number;
				resolutionX?: number;
				resolutionY?: number;
			}
		);

	}

	/**
	 * An optimized Gaussian convolution shader material.
	 *
	 * References:
	 *
	 * Filip Strugar, Intel, 2014: [An investigation of fast real-time GPU-based image blur algorithms](
	 * https://www.intel.com/content/www/us/en/developer/articles/technical/an-investigation-of-fast-real-time-gpu-based-image-blur-algorithms.html)
	 *
	 * @implements {Resizable}
	 */

	export class GaussianBlurMaterial extends ShaderMaterial {

		/**
		 * Constructs a new convolution material.
		 *
		 * @param {Object} [options] - The options.
		 * @param {Number} [options.kernelSize=35] - The kernel size.
		 */
		constructor(
			{
				kernelSize
			}?: {
				kernelSize?: number;
			}
		);

	}

	/**
	 * A Gaussian blur pass.
	 */

	export class GaussianBlurPass extends Pass {

		/**
		 * Constructs a new Gaussian blur pass.
		 *
		 * @param {Object} [options] - The options.
		 * @param {Number} [options.kernelSize=35] - The kernel size. Should be an odd number in the range [3, 1020].
		 * @param {Number} [options.iterations=1] - The amount of times the blur should be applied.
		 * @param {Number} [options.resolutionScale=1.0] - The resolution scale.
		 * @param {Number} [options.resolutionX=Resolution.AUTO_SIZE] - The horizontal resolution.
		 * @param {Number} [options.resolutionY=Resolution.AUTO_SIZE] - The vertical resolution.
		 */

		constructor(
			{
				kernelSize,
				iterations,
				resolutionScale,
				resolutionX,
				resolutionY
			}?: {
				kernelSize?: number;
				iterations?: number;
				resolutionScale?: number;
				resolutionX?: number;
				resolutionY?: number;
			}
		);

	}

	/**
	 * An optimised convolution shader material.
	 *
	 * Based on the GDC2003 Presentation by Masaki Kawase, Bunkasha Games:
	 *	Frame Buffer Postprocessing Effects in DOUBLE-S.T.E.A.L (Wreckless)
	 * and an article by Filip Strugar, Intel:
	 *	An investigation of fast real-time GPU-based image blur algorithms
	 *
	 * Further modified according to Apple's [Best Practices for Shaders](https://goo.gl/lmRoM5).
	 *
	 * @todo Remove dithering code from fragment shader.
	 * @implements {Resizable}
	 */
	export class KawaseBlurMaterial extends ShaderMaterial implements Resizable {

		/**
		 * Constructs a new convolution material.
		 *
		 * TODO Remove texelSize param.
		 * @param {Vector2} [texelSize] - Deprecated.
		 */
		constructor(texelSize?: Vector2);
		/**
		 * The input buffer.
		 *
		 * @type {Texture}
		 */
		set inputBuffer(arg: Texture);
		/**
		 * Sets the input buffer.
		 *
		 * @deprecated Use inputBuffer instead.
		 * @param {Texture} value - The input buffer.
		 */
		setInputBuffer(value: Texture): void;
		set scale(arg: number);
		/**
		 * The blur scale.
		 *
		 * @type {Number}
		 */
		get scale(): number;
		/**
		 * Returns the blur scale.
		 *
		 * @deprecated Use scale instead.
		 * @return {Number} The scale.
		 */
		getScale(): number;
		/**
		 * Sets the blur scale.
		 *
		 * @deprecated Use scale instead.
		 * @param {Number} value - The scale.
		 */
		setScale(value: number): void;
		/**
		 * Returns the kernel.
		 *
		 * @return {Float32Array} The kernel.
		 * @deprecated Implementation detail, removed with no replacement.
		 */
		getKernel(): Float32Array;
		set kernel(arg: number);
		/**
		 * The current kernel.
		 *
		 * @type {Number}
		 */
		get kernel(): number;
		/**
		 * Sets the current kernel.
		 *
		 * @deprecated Use kernel instead.
		 * @param {Number} value - The kernel.
		 */
		setKernel(value: number): void;
		/**
		 * Sets the texel size.
		 *
		 * @deprecated Use setSize() instead.
		 * @param {Number} x - The texel width.
		 * @param {Number} y - The texel height.
		 */
		setTexelSize(x: number, y: number): void;
		/**
		 * Sets the size of this object.
		 *
		 * @param {Number} width - The width.
		 * @param {Number} height - The height.
		 */
		setSize(width: number, height: number): void;

	}

	export type ConvolutionMaterial = KawaseBlurMaterial;

	/**
	 * A luminance shader material.
	 *
	 * This shader produces a greyscale luminance map that describes the absolute amount of light emitted by a scene. It can
	 * also be configured to output colors that are scaled with their respective luminance value. Additionally, a range may
	 * be provided to mask out undesired texels.
	 *
	 * The alpha channel always contains the luminance value.
	 *
	 * On luminance coefficients:
	 *	http://www.poynton.com/notes/colour_and_gamma/ColorFAQ.html#RTFToC9
	 *
	 * Coefficients for different color spaces:
	 *	https://hsto.org/getpro/habr/post_images/2ab/69d/084/2ab69d084f9a597e032624bcd74d57a7.png
	 *
	 * Luminance range reference:
	 *	https://cycling74.com/2007/05/23/your-first-shader/#.Vty9FfkrL4Z
	 */
	export class LuminanceMaterial extends ShaderMaterial {

		/**
		 * Constructs a new luminance material.
		 *
		 * @param {Boolean} [colorOutput=false] - Defines whether the shader should output colors scaled with their luminance value.
		 * @param {Vector2} [luminanceRange] - If provided, the shader will mask out texels that aren't in the specified luminance range.
		 */
		constructor(colorOutput?: boolean, luminanceRange?: Vector2);
		set colorOutput(arg: boolean);
		/**
		 * Indicates whether color output is enabled.
		 *
		 * @type {Boolean}
		 */
		get colorOutput(): boolean;
		set luminanceRange(arg: boolean);
		/**
		 * The luminance range. Set to null to disable.
		 *
		 * @type {Boolean}
		 */
		get luminanceRange(): boolean;
		/**
		 * The input buffer.
		 *
		 * @type {Texture}
		 */
		set inputBuffer(arg: Texture);
		/**
		 * Sets the input buffer.
		 *
		 * @deprecated Use inputBuffer instead.
		 * @param {Texture} value - The input buffer.
		 */
		setInputBuffer(value: Texture): void;
		set threshold(arg: number);
		/**
		 * The luminance threshold.
		 *
		 * @type {Number}
		 */
		get threshold(): number;
		/**
		 * Returns the luminance threshold.
		 *
		 * @deprecated Use threshold instead.
		 * @return {Number} The threshold.
		 */
		getThreshold(): number;
		/**
		 * Sets the luminance threshold.
		 *
		 * @deprecated Use threshold instead.
		 * @param {Number} value - The threshold.
		 */
		setThreshold(value: number): void;
		set smoothing(arg: number);
		/**
		 * The luminance threshold smoothing.
		 *
		 * @type {Number}
		 */
		get smoothing(): number;
		/**
		 * Returns the luminance threshold smoothing factor.
		 *
		 * @deprecated Use smoothing instead.
		 * @return {Number} The smoothing factor.
		 */
		getSmoothingFactor(): number;
		/**
		 * Sets the luminance threshold smoothing factor.
		 *
		 * @deprecated Use smoothing instead.
		 * @param {Number} value - The smoothing factor.
		 */
		setSmoothingFactor(value: number): void;
		set useThreshold(arg: boolean);
		/**
		 * Indicates whether the luminance threshold is enabled.
		 *
		 * @type {Boolean}
		 * @deprecated Adjust the threshold or smoothing factor instead.
		 */
		get useThreshold(): boolean;
		/**
		 * Indicates whether color output is enabled.
		 *
		 * @deprecated Use colorOutput instead.
		 * @return {Boolean} Whether color output is enabled.
		 */
		isColorOutputEnabled(): boolean;
		/**
		 * Enables or disables color output.
		 *
		 * @deprecated Use colorOutput instead.
		 * @param {Boolean} value - Whether color output should be enabled.
		 */
		setColorOutputEnabled(value: boolean): void;
		set useRange(arg: boolean);
		/**
		 * Indicates whether luminance masking is enabled.
		 *
		 * @type {Boolean}
		 * @deprecated
		 */
		get useRange(): boolean;
		/**
		 * Returns the current luminance range.
		 *
		 * @deprecated Use luminanceRange instead.
		 * @return {Vector2} The luminance range.
		 */
		getLuminanceRange(): Vector2;
		/**
		 * Sets a luminance range. Set to null to disable.
		 *
		 * @deprecated Use luminanceRange instead.
		 * @param {Vector2} value - The luminance range.
		 */
		setLuminanceRange(value: Vector2): void;

	}

	/**
	 * A mask function enumeration.
	 *
	 * @type {Object}
	 * @property {Number} DISCARD - Discards elements when the respective mask value is zero.
	 * @property {Number} MULTIPLY - Multiplies the input buffer with the mask texture.
	 * @property {Number} MULTIPLY_RGB_SET_ALPHA - Multiplies the input RGB values with the mask and sets alpha to the mask value.
	 * @property {Number} MULTIPLY_RGB - Multiplies the input RGB values with the mask and keeps the original alpha.
	 */
	export enum MaskFunction {
		DISCARD,
		MULTIPLY,
		MULTIPLY_RGB_SET_ALPHA,
		MULTIPLY_RGB
	}

	/**
	 * A mask shader material.
	 *
	 * This material applies a mask texture to a buffer.
	 */
	export class MaskMaterial extends ShaderMaterial {

		/**
		 * Constructs a new mask material.
		 *
		 * @param {Texture} [maskTexture] - The mask texture.
		 */
		constructor(maskTexture?: Texture);
		/**
		 * The input buffer.
		 *
		 * @type {Texture}
		 */
		set inputBuffer(arg: Texture);
		/**
		 * Sets the input buffer.
		 *
		 * @deprecated Use inputBuffer instead.
		 * @param {Texture} value - The input buffer.
		 */
		setInputBuffer(value: Texture): void;
		/**
		 * The mask texture.
		 *
		 * @type {Texture}
		 */
		set maskTexture(arg: Texture);
		/**
		 * Sets the mask texture.
		 *
		 * @deprecated Use maskTexture instead.
		 * @param {Texture} value - The texture.
		 */
		setMaskTexture(value: Texture): void;
		/**
		 * Sets the color channel to use for masking. Default is `ColorChannel.RED`.
		 *
		 * @type {ColorChannel}
		 */
		set colorChannel(arg: ColorChannel);
		/**
		 * Sets the color channel to use for masking. Default is `ColorChannel.RED`.
		 *
		 * @deprecated Use colorChannel instead.
		 * @param {ColorChannel} value - The channel.
		 */
		setColorChannel(value: ColorChannel): void;
		/**
		 * The masking technique. Default is `MaskFunction.DISCARD`.
		 *
		 * @type {MaskFunction}
		 */
		set maskFunction(arg: MaskFunction);
		/**
		 * Sets the masking technique. Default is `MaskFunction.DISCARD`.
		 *
		 * @deprecated Use maskFunction instead.
		 * @param {MaskFunction} value - The function.
		 */
		setMaskFunction(value: MaskFunction): void;
		set inverted(arg: boolean);
		/**
		 * Indicates whether the masking is inverted.
		 *
		 * @type {Boolean}
		 */
		get inverted(): boolean;
		/**
		 * Indicates whether the masking is inverted.
		 *
		 * @deprecated Use inverted instead.
		 * @return {Boolean} Whether the masking is inverted.
		 */
		isInverted(): boolean;
		/**
		 * Determines whether the masking should be inverted.
		 *
		 * @deprecated Use inverted instead.
		 * @param {Boolean} value - Whether the masking should be inverted.
		 */
		setInverted(value: boolean): void;
		set strength(arg: number);
		/**
		 * The current mask strength.
		 *
		 * Individual mask values will be clamped to [0.0, 1.0]. Has no effect when the mask function is set to `DISCARD`.
		 *
		 * @type {Number}
		 */
		get strength(): number;
		/**
		 * Returns the current mask strength.
		 *
		 * @deprecated Use strength instead.
		 * @return {Number} The mask strength.
		 */
		getStrength(): number;
		/**
		 * Sets the mask strength.
		 *
		 * Has no effect when the mask function is set to `DISCARD`.
		 *
		 * @deprecated Use strength instead.
		 * @param {Number} value - The mask strength.
		 */
		setStrength(value: number): void;

	}

	/**
	 * An outline shader material.
	 *
	 * @implements {Resizable}
	 */
	export class OutlineMaterial extends ShaderMaterial implements Resizable {

		/**
		 * Constructs a new outline material.
		 *
		 * TODO Remove texelSize param.
		 * @param {Vector2} [texelSize] - The screen texel size.
		 */
		constructor(texelSize?: Vector2);
		/**
		 * The input buffer.
		 *
		 * @param {Texture} arg - The input buffer.
		 */
		set inputBuffer(arg: Texture);
		/**
		 * Sets the input buffer.
		 *
		 * @deprecated Use inputBuffer instead.
		 * @param {Texture} value - The input buffer.
		 */
		setInputBuffer(value: Texture): void;
		/**
		 * Sets the texel size.
		 *
		 * @deprecated Use setSize() instead.
		 * @param {Number} x - The texel width.
		 * @param {Number} y - The texel height.
		 */
		setTexelSize(x: number, y: number): void;
		/**
		 * Sets the size of this object.
		 *
		 * @param {Number} width - The width.
		 * @param {Number} height - The height.
		 */
		setSize(width: number, height: number): void;

	}

	/**
	 * An outline shader material.
	 */
	export type OutlineEdgesMaterial = OutlineMaterial;

	/**
	 * Subpixel Morphological Antialiasing.
	 *
	 * This material computes weights for detected edges.
	 *
	 * @implements {Resizable}
	 */
	export class SMAAWeightsMaterial extends ShaderMaterial implements Resizable {

		/**
		 * Constructs a new SMAA weights material.
		 *
		 * @param {Vector2} [texelSize] - The absolute screen texel size.
		 * @param {Vector2} [resolution] - The resolution.
		 */
		constructor(texelSize?: Vector2, resolution?: Vector2);
		/**
		 * The input buffer.
		 *
		 * @param {Texture} arg - The input buffer.
		 */
		set inputBuffer(arg: Texture);
		/**
		 * Sets the input buffer.
		 *
		 * @deprecated Use inputBuffer instead.
		 * @param {Texture} value - The input buffer.
		 */
		setInputBuffer(value: Texture): void;
		set searchTexture(arg: Texture);
		/**
		 * The search lookup texture.
		 *
		 * @type {Texture}
		 */
		get searchTexture(): Texture;
		set areaTexture(arg: Texture);
		/**
		 * The area lookup texture.
		 *
		 * @type {Texture}
		 */
		get areaTexture(): Texture;
		/**
		 * Sets the search and area lookup textures.
		 *
		 * @deprecated Use searchTexture and areaTexture instead.
		 * @param {Texture} search - The search lookup texture.
		 * @param {Texture} area - The area lookup texture.
		 */
		setLookupTextures(search: Texture, area: Texture): void;
		set orthogonalSearchSteps(arg: number);
		/**
		 * The maximum amount of steps performed in the horizontal/vertical pattern searches, at each side of the pixel.
		 * Range: [0, 112].
		 *
		 * In number of pixels, it's actually the double. So the maximum line length perfectly handled by, for example 16, is
		 * 64 (perfectly means that longer lines won't look as good, but are still antialiased).
		 *
		 * @type {Number}
		 */
		get orthogonalSearchSteps(): number;
		/**
		 * Sets the maximum amount of steps performed in the horizontal/vertical pattern searches, at each side of the pixel.
		 *
		 * @deprecated Use orthogonalSearchSteps instead.
		 * @param {Number} value - The search steps. Range: [0, 112].
		 */
		setOrthogonalSearchSteps(value: number): void;
		set diagonalSearchSteps(arg: number);
		/**
		 * The maximum steps performed in the diagonal pattern searches, at each side of the pixel. This search
		 * jumps one pixel at a time. Range: [0, 20].
		 *
		 * On high-end machines this search is cheap (between 0.8x and 0.9x slower for 16 steps), but it can have a
		 * significant impact on older machines.
		 *
		 * @type {Number}
		 */
		get diagonalSearchSteps(): number;
		/**
		 * Specifies the maximum steps performed in the diagonal pattern searches, at each side of the pixel.
		 *
		 * @deprecated Use diagonalSearchSteps instead.
		 * @param {Number} value - The search steps. Range: [0, 20].
		 */
		setDiagonalSearchSteps(value: number): void;
		set diagonalDetection(arg: boolean);
		/**
		 * Indicates whether diagonal pattern detection is enabled.
		 *
		 * @type {Boolean}
		 */
		get diagonalDetection(): boolean;
		/**
		 * Indicates whether diagonal pattern detection is enabled.
		 *
		 * @deprecated Use diagonalDetection instead.
		 * @return {Boolean} Whether diagonal pattern detection is enabled.
		 */
		isDiagonalDetectionEnabled(): boolean;
		/**
		 * Enables or disables diagonal pattern detection.
		 *
		 * @deprecated Use diagonalDetection instead.
		 * @param {Boolean} value - Whether diagonal pattern detection should be enabled.
		 */
		setDiagonalDetectionEnabled(value: boolean): void;
		set cornerRounding(arg: number);
		/**
		 * Specifies how much sharp corners will be rounded. Range: [0, 100].
		 *
		 * @type {Number}
		 */
		get cornerRounding(): number;
		/**
		 * Specifies how much sharp corners will be rounded.
		 *
		 * @deprecated Use cornerRounding instead.
		 * @param {Number} value - The corner rounding amount. Range: [0, 100].
		 */
		setCornerRounding(value: number): void;
		set cornerDetection(arg: number);
		/**
		 * Indicates whether corner detection is enabled.
		 *
		 * @type {Number}
		 */
		get cornerDetection(): number;
		/**
		 * Indicates whether corner rounding is enabled.
		 *
		 * @deprecated Use cornerDetection instead.
		 * @return {Boolean} Whether corner rounding is enabled.
		 */
		isCornerRoundingEnabled(): boolean;
		/**
		 * Enables or disables corner rounding.
		 *
		 * @deprecated Use cornerDetection instead.
		 * @param {Boolean} value - Whether corner rounding should be enabled.
		 */
		setCornerRoundingEnabled(value: boolean): void;
		/**
		 * Sets the size of this object.
		 *
		 * @param {Number} width - The width.
		 * @param {Number} height - The height.
		 */
		setSize(width: number, height: number): void;

	}

	/**
	 * A Screen Space Ambient Occlusion (SSAO) shader material.
	 *
	 * @implements {Resizable}
	 */
	export class SSAOMaterial extends ShaderMaterial implements Resizable {

		/**
		 * Constructs a new SSAO material.
		 *
		 * @param {Camera} camera - A camera.
		 */
		constructor(camera: Camera);
		/**
		 * The combined normal-depth buffer.
		 *
		 * @param {Texture} arg - The buffer.
		 */
		set normalDepthBuffer(arg: Texture);
		/**
		 * Sets the combined normal-depth buffer.
		 *
		 * @deprecated Use normalDepthBuffer instead.
		 * @param {Texture} value - The buffer.
		 */
		setNormalDepthBuffer(value: Texture): void;
		/**
		 * The normal buffer.
		 *
		 * @param {Texture} arg - The buffer.
		 */
		set normalBuffer(arg: Texture);
		/**
		 * Sets the normal buffer.
		 *
		 * @deprecated Use normalBuffer instead.
		 * @param {Texture} value - The buffer.
		 */
		setNormalBuffer(value: Texture): void;
		/**
		 * The depth buffer.
		 *
		 * @param {Texture} arg - The buffer.
		 */
		set depthBuffer(arg: Texture);
		/**
		 * The depth packing strategy.
		 *
		 * @param {DepthPackingStrategies} arg - The depth packing strategy.
		 */
		set depthPacking(arg: DepthPackingStrategies);
		/**
		 * Sets the depth buffer.
		 *
		 * @deprecated Use depthBuffer and depthPacking instead.
		 * @param {Texture} buffer - The depth texture.
		 * @param {DepthPackingStrategies} [depthPacking=BasicDepthPacking] - The depth packing strategy.
		 */
		setDepthBuffer(
			buffer: Texture,
			depthPacking?: DepthPackingStrategies
		): void;

		/**
		 * The noise texture.
		 *
		 * @param {Texture} arg - The texture.
		 */
		set noiseTexture(arg: Texture);
		/**
		 * Sets the noise texture.
		 *
		 * @deprecated Use noiseTexture instead.
		 * @param {Texture} value - The texture.
		 */
		setNoiseTexture(value: Texture): void;
		set samples(arg: number);
		/**
		 * The sample count.
		 *
		 * @type {Number}
		 */
		get samples(): number;
		/**
		 * Returns the amount of occlusion samples per pixel.
		 *
		 * @deprecated Use samples instead.
		 * @return {Number} The sample count.
		 */
		getSamples(): number;
		/**
		 * Sets the amount of occlusion samples per pixel.
		 *
		 * @deprecated Use samples instead.
		 * @param {Number} value - The sample count.
		 */
		setSamples(value: number): void;
		set rings(arg: number);
		/**
		 * The sampling spiral ring count.
		 *
		 * @type {Number}
		 */
		get rings(): number;
		/**
		 * Returns the amount of spiral turns in the occlusion sampling pattern.
		 *
		 * @deprecated Use rings instead.
		 * @return {Number} The radius.
		 */
		getRings(): number;
		/**
		 * Sets the amount of spiral turns in the occlusion sampling pattern.
		 *
		 * @deprecated Use rings instead.
		 * @param {Number} value - The radius.
		 */
		setRings(value: number): void;
		/**
		 * The intensity.
		 *
		 * @type {Number}
		 * @deprecated Use SSAOEffect.intensity instead.
		 */
		get intensity(): number;
		set intensity(arg: number);
		/**
		 * Returns the intensity.
		 *
		 * @deprecated Use intensity instead.
		 * @return {Number} The intensity.
		 */
		getIntensity(): number;
		/**
		 * Sets the intensity.
		 *
		 * @deprecated Use intensity instead.
		 * @param {Number} value - The intensity.
		 */
		setIntensity(value: number): void;
		set fade(arg: number);
		/**
		 * The depth fade factor.
		 *
		 * @type {Number}
		 */
		get fade(): number;
		/**
		 * Returns the depth fade factor.
		 *
		 * @deprecated Use fade instead.
		 * @return {Number} The fade factor.
		 */
		getFade(): number;
		/**
		 * Sets the depth fade factor.
		 *
		 * @deprecated Use fade instead.
		 * @param {Number} value - The fade factor.
		 */
		setFade(value: number): void;
		set bias(arg: number);
		/**
		 * The depth bias. Range: [0.0, 1.0].
		 *
		 * @type {Number}
		 */
		get bias(): number;
		/**
		 * Returns the depth bias.
		 *
		 * @deprecated Use bias instead.
		 * @return {Number} The bias.
		 */
		getBias(): number;
		/**
		 * Sets the depth bias.
		 *
		 * @deprecated Use bias instead.
		 * @param {Number} value - The bias.
		 */
		setBias(value: number): void;
		set minRadiusScale(arg: number);
		/**
		 * The minimum radius scale for distance scaling. Range: [0.0, 1.0].
		 *
		 * @type {Number}
		 */
		get minRadiusScale(): number;
		/**
		 * Returns the minimum radius scale for distance scaling.
		 *
		 * @deprecated Use minRadiusScale instead.
		 * @return {Number} The minimum radius scale.
		 */
		getMinRadiusScale(): number;
		/**
		 * Sets the minimum radius scale for distance scaling.
		 *
		 * @deprecated Use minRadiusScale instead.
		 * @param {Number} value - The minimum radius scale.
		 */
		setMinRadiusScale(value: number): void;
		set radius(arg: number);
		/**
		 * The occlusion sampling radius. Range: [0.0, 1.0].
		 *
		 * @type {Number}
		 */
		get radius(): number;
		/**
		 * Returns the occlusion sampling radius.
		 *
		 * @deprecated Use radius instead.
		 * @return {Number} The radius.
		 */
		getRadius(): number;
		/**
		 * Sets the occlusion sampling radius.
		 *
		 * @deprecated Use radius instead.
		 * @param {Number} value - The radius. Range [1e-6, 1.0].
		 */
		setRadius(value: number): void;
		set distanceScaling(arg: boolean);
		/**
		 * Indicates whether distance-based radius scaling is enabled.
		 *
		 * @type {Boolean}
		 */
		get distanceScaling(): boolean;
		/**
		 * Indicates whether distance-based radius scaling is enabled.
		 *
		 * @deprecated Use distanceScaling instead.
		 * @return {Boolean} Whether distance scaling is enabled.
		 */
		isDistanceScalingEnabled(): boolean;
		/**
		 * Enables or disables distance-based radius scaling.
		 *
		 * @deprecated Use distanceScaling instead.
		 * @param {Boolean} value - Whether distance scaling should be enabled.
		 */
		setDistanceScalingEnabled(value: boolean): void;
		set distanceThreshold(arg: number);
		/**
		 * The occlusion distance threshold. Range: [0.0, 1.0].
		 *
		 * @type {Number}
		 */
		get distanceThreshold(): number;

		/**
		 * The occlusion distance falloff.
		 * The occlusion distance threshold in world units.
		 *
		 * @type {Number}
		 */

		get worldDistanceThreshold(): number;
		set worldDistanceThreshold(value: number);

		set distanceFalloff(arg: number);
		/**
		 * The occlusion distance falloff. Range: [0.0, 1.0].
		 *
		 * @type {Number}
		 */
		get distanceFalloff(): number;

		/**
		 * The occlusion distance falloff in world units.
		 *
		 * @type {Number}
		 */

		get worldDistanceFalloff(): number;
		set worldDistanceFalloff(value: number);

		/**
		 * Sets the occlusion distance cutoff.
		 *
		 * @deprecated Use distanceThreshold and distanceFalloff instead.
		 * @param {Number} threshold - The distance threshold. Range [0.0, 1.0].
		 * @param {Number} falloff - The falloff. Range [0.0, 1.0].
		 */
		setDistanceCutoff(threshold: number, falloff: number): void;
		set proximityThreshold(arg: number);
		/**
		 * The occlusion proximity threshold. Range: [0.0, 1.0].
		 *
		 * @type {Number}
		 */
		get proximityThreshold(): number;
		/**
		 * The occlusion proximity threshold in world units.
		 *
		 * @type {Number}
		 */
		get worldProximityThreshold(): number;
		set worldProximityThreshold(value: number);

		set proximityFalloff(arg: number);
		/**
		 * The occlusion proximity falloff. Range: [0.0, 1.0].
		 *
		 * @type {Number}
		 */
		get proximityFalloff(): number;

		/**
		 * The occlusion proximity falloff in world units.
		 *
		 * @type {Number}
		 */

		get worldProximityFalloff(): number;
		set worldProximityFalloff(value: number);

		/**
		 * Sets the occlusion proximity cutoff.
		 *
		 * @deprecated Use proximityThreshold and proximityFalloff instead.
		 * @param {Number} threshold - The range threshold. Range [0.0, 1.0].
		 * @param {Number} falloff - The falloff. Range [0.0, 1.0].
		 */
		setProximityCutoff(threshold: number, falloff: number): void;
		/**
		 * Sets the texel size.
		 *
		 * @deprecated Use setSize() instead.
		 * @param {Number} x - The texel width.
		 * @param {Number} y - The texel height.
		 */
		setTexelSize(x: number, y: number): void;
		/**
		 * Adopts the settings of the given camera.
		 *
		 * @param {Camera} camera - A camera.
		 */
		adoptCameraSettings(camera: Camera): void;
		/**
		 * Sets the size of this object.
		 *
		 * @param {Number} width - The width.
		 * @param {Number} height - The height.
		 */
		setSize(width: number, height: number): void;

	}

	/**
	 * A resolution.
	 */
	export class Resolution extends EventDispatcher<import("three").Event> {

		/**
		 * An auto sizing constant.
		 *
		 * Can be used to automatically calculate the width or height based on the original aspect ratio.
		 *
		 * @type {Number}
		 */
		static get AUTO_SIZE(): number;
		/**
		 * Constructs a new resolution.
		 *
		 * TODO Remove resizable param.
		 * @param {Resizable} resizable - A resizable object.
		 * @param {Number} [width=Resolution.AUTO_SIZE] - The preferred width.
		 * @param {Number} [height=Resolution.AUTO_SIZE] - The preferred height.
		 * @param {Number} [scale=1.0] - A resolution scale.
		 */
		constructor(
			resizable: Resizable,
			width?: number,
			height?: number,
			scale?: number
		);

		/**
		 * A resizable object.
		 *
		 * @type {Resizable}
		 * @deprecated Use an event listener for "change" events instead.
		 */
		resizable: Resizable;
		/**
		 * The preferred resolution.
		 *
		 * @type {Vector2}
		 * @deprecated Added for backward-compatibility.
		 */
		target: Vector2;
		set width(arg: number);
		/**
		 * The effective width.
		 *
		 * If the preferred width and height are set to {@link Resizer.AUTO_SIZE}, the base width will be returned.
		 *
		 * @type {Number}
		 */
		get width(): number;
		set preferredWidth(arg: number);
		/**
		 * The preferred width.
		 *
		 * @type {Number}
		 */
		get preferredWidth(): number;
		set height(arg: number);
		/**
		 * The effective height.
		 *
		 * If the preferred width and height are set to {@link Resizer.AUTO_SIZE}, the base height will be returned.
		 *
		 * @type {Number}
		 */
		get height(): number;
		set preferredHeight(arg: number);
		/**
		 * The preferred height.
		 *
		 * @type {Number}
		 */
		get preferredHeight(): number;
		/**
		 * Returns the effective width.
		 *
		 * If the preferred width and height are set to {@link Resizer.AUTO_SIZE}, the base width will be returned.
		 *
		 * @deprecated Use width instead.
		 * @return {Number} The effective width.
		 */
		getWidth(): number;
		/**
		 * Returns the effective height.
		 *
		 * If the preferred width and height are set to {@link Resizer.AUTO_SIZE}, the base height will be returned.
		 *
		 * @deprecated Use height instead.
		 * @return {Number} The effective height.
		 */
		getHeight(): number;
		set scale(arg: number);
		/**
		 * The resolution scale.
		 *
		 * @type {Number}
		 */
		get scale(): number;
		/**
		 * Returns the current resolution scale.
		 *
		 * @deprecated Use scale instead.
		 * @return {Number} The scale.
		 */
		getScale(): number;
		/**
		 * Sets the resolution scale.
		 *
		 * Also sets the preferred resolution to {@link Resizer.AUTO_SIZE}.
		 *
		 * @deprecated Use scale instead.
		 * @param {Number} value - The scale.
		 */
		setScale(value: number): void;
		set baseWidth(arg: number);
		/**
		 * The base width.
		 *
		 * @type {Number}
		 */
		get baseWidth(): number;
		/**
		 * Returns the base width.
		 *
		 * @deprecated Use baseWidth instead.
		 * @return {Number} The base width.
		 */
		getBaseWidth(): number;
		/**
		 * Sets the base width.
		 *
		 * @deprecated Use baseWidth instead.
		 * @param {Number} value - The width.
		 */
		setBaseWidth(value: number): void;
		set baseHeight(arg: number);
		/**
		 * The base height.
		 *
		 * @type {Number}
		 */
		get baseHeight(): number;
		/**
		 * Returns the base height.
		 *
		 * @deprecated Use baseHeight instead.
		 * @return {Number} The base height.
		 */
		getBaseHeight(): number;
		/**
		 * Sets the base height.
		 *
		 * @deprecated Use baseHeight instead.
		 * @param {Number} value - The height.
		 */
		setBaseHeight(value: number): void;
		/**
		 * Sets the base size.
		 *
		 * @param {Number} width - The width.
		 * @param {Number} height - The height.
		 */
		setBaseSize(width: number, height: number): void;
		/**
		 * Returns the preferred width.
		 *
		 * @deprecated Use preferredWidth instead.
		 * @return {Number} The preferred width.
		 */
		getPreferredWidth(): number;
		/**
		 * Sets the preferred width.
		 *
		 * Use {@link Resizer.AUTO_SIZE} to automatically calculate the width based on the height and aspect ratio.
		 *
		 * @deprecated Use preferredWidth instead.
		 * @param {Number} value - The width.
		 */
		setPreferredWidth(value: number): void;
		/**
		 * Returns the preferred height.
		 *
		 * @deprecated Use preferredHeight instead.
		 * @return {Number} The preferred height.
		 */
		getPreferredHeight(): number;
		/**
		 * Sets the preferred height.
		 *
		 * Use {@link Resizer.AUTO_SIZE} to automatically calculate the height based on the width and aspect ratio.
		 *
		 * @deprecated Use preferredHeight instead.
		 * @param {Number} value - The height.
		 */
		setPreferredHeight(value: number): void;
		/**
		 * Sets the preferred size.
		 *
		 * @param {Number} width - The width.
		 * @param {Number} height - The height.
		 */
		setPreferredSize(width: number, height: number): void;
		/**
		 * Copies the given resolution.
		 *
		 * @param {Resolution} resolution - The resolution.
		 */
		copy(resolution: Resolution): void;

	}

	export type Resizer = Resolution;

	/**
	 * An abstract pass.
	 *
	 * Fullscreen passes use a shared fullscreen triangle:
	 * https://michaldrobot.com/2014/04/01/gcn-execution-patterns-in-full-screen-passes/
	 *
	 * @implements {Initializable}
	 * @implements {Resizable}
	 * @implements {Disposable}
	 */
	export class Pass implements Initializable, Resizable, Disposable {

		/**
		 * Constructs a new pass.
		 *
		 * @param {String} [name] - The name of this pass. Does not have to be unique.
		 * @param {Scene} [scene] - The scene to render. The default scene contains a single mesh that fills the screen.
		 * @param {Camera} [camera] - A camera. Fullscreen effect passes don't require a camera.
		 */
		constructor(name?: string, scene?: Scene, camera?: Camera);
		/**
		 * The name of this pass.
		 *
		 * @type {String}
		 */
		name: string;
		/**
		 * The renderer.
		 *
		 * @deprecated
		 * @type {WebGLRenderer}
		 * @protected
		 */
		protected renderer: WebGLRenderer;
		/**
		 * The scene to render.
		 *
		 * @type {Scene}
		 * @protected
		 */
		protected scene: Scene;
		/**
		 * The camera.
		 *
		 * @type {Camera}
		 * @protected
		 */
		protected camera: Camera;
		/**
		 * Only relevant for subclassing.
		 *
		 * Indicates whether the {@link EffectComposer} should swap the frame buffers after this pass has finished
		 * rendering. Set this to `false` if this pass doesn't render to the output buffer or the screen. Otherwise, the
		 * contents of the input buffer will be lost.
		 *
		 * @type {Boolean}
		 */
		needsSwap: boolean;
		/**
		 * Only relevant for subclassing.
		 *
		 * Indicates whether the {@link EffectComposer} should prepare a depth texture for this pass.
		 * Set this to `true` if this pass relies on depth information from a preceding {@link RenderPass}.
		 *
		 * @type {Boolean}
		 */
		needsDepthTexture: boolean;
		/**
		 * Indicates whether this pass is enabled.
		 *
		 * @type {Boolean}
		 */
		enabled: boolean;
		/**
		 * Sets the render to screen flag.
		 *
		 * If this flag is changed, the fullscreen material will be updated as well.
		 *
		 * @type {Boolean}
		 */
		set renderToScreen(arg: boolean);
		/**
		 * Indicates whether this pass should render to screen.
		 *
		 * @type {Boolean}
		 */
		get renderToScreen(): boolean;
		/**
		 * Sets the main scene.
		 *
		 * @type {Scene}
		 */
		set mainScene(arg: Scene);
		/**
		 * Sets the main camera.
		 *
		 * @type {Camera}
		 */
		set mainCamera(arg: Camera);
		/**
		 * Sets the renderer
		 *
		 * @deprecated
		 * @param {WebGLRenderer} renderer - The renderer.
		 */
		setRenderer(renderer: WebGLRenderer): void;
		/**
		 * Indicates whether this pass is enabled.
		 *
		 * @deprecated Use enabled instead.
		 * @return {Boolean} Whether this pass is enabled.
		 */
		isEnabled(): boolean;
		/**
		 * Enables or disables this pass.
		 *
		 * @deprecated Use enabled instead.
		 * @param {Boolean} value - Whether the pass should be enabled.
		 */
		setEnabled(value: boolean): void;
		set fullscreenMaterial(arg: Material);
		/**
		 * The fullscreen material.
		 *
		 * @type {Material}
		 */
		get fullscreenMaterial(): Material;
		/**
		 * Returns the current fullscreen material.
		 *
		 * @deprecated Use fullscreenMaterial instead.
		 * @return {Material} The current fullscreen material, or null if there is none.
		 */
		getFullscreenMaterial(): Material;
		/**
		 * Sets the fullscreen material.
		 *
		 * @deprecated Use fullscreenMaterial instead.
		 * @protected
		 * @param {Material} value - A fullscreen material.
		 */
		protected setFullscreenMaterial(value: Material): void;
		/**
		 * Returns the current depth texture.
		 *
		 * @return {Texture} The current depth texture, or null if there is none.
		 */
		getDepthTexture(): Texture;
		/**
		 * Sets the depth texture.
		 *
		 * This method will be called automatically by the {@link EffectComposer}.
		 * You may override this method if your pass relies on the depth information of a preceding {@link RenderPass}.
		 *
		 * @param {Texture} depthTexture - A depth texture.
		 * @param {DepthPackingStrategies} [depthPacking=BasicDepthPacking] - The depth packing.
		 */
		setDepthTexture(
			depthTexture: Texture,
			depthPacking?: DepthPackingStrategies
		): void;

		/**
		 * Renders this pass.
		 *
		 * This is an abstract method that must be overridden.
		 *
		 * @abstract
		 * @throws {Error} An error is thrown if the method is not overridden.
		 * @param {WebGLRenderer} renderer - The renderer.
		 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
		 * @param {WebGLRenderTarget} outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
		 * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
		 * @param {Boolean} [stencilTest] - Indicates whether a stencil mask is active.
		 */
		render(
			renderer: WebGLRenderer,
			inputBuffer: WebGLRenderTarget | null,
			outputBuffer: WebGLRenderTarget | null,
			deltaTime?: number,
			stencilTest?: boolean
		): void;

		/**
		 * Sets the size.
		 *
		 * You may override this method if you want to be informed about the size of the backbuffer/canvas.
		 * This method is called before {@link initialize} and every time the size of the {@link EffectComposer} changes.
		 *
		 * @param {Number} width - The width.
		 * @param {Number} height - The height.
		 */
		setSize(width: number, height: number): void;
		/**
		 * Performs initialization tasks.
		 *
		 * This method is called when this pass is added to an {@link EffectComposer}.
		 *
		 * @param {WebGLRenderer} renderer - The renderer.
		 * @param {Boolean} alpha - Whether the renderer uses the alpha channel or not.
		 * @param {Number} frameBufferType - The type of the main frame buffers.
		 */
		initialize(
			renderer: WebGLRenderer,
			alpha: boolean,
			frameBufferType: number
		): void;

		/**
		 * Performs a shallow search for disposable properties and deletes them.
		 *
		 * The {@link EffectComposer} calls this method when it is being destroyed. You can use it independently to free
		 * memory when you're certain that you don't need this pass anymore.
		 */
		dispose(): void;

	}

	/**
	 * A pass that renders an adaptive luminance map.
	 */
	export class AdaptiveLuminancePass extends Pass {

		/**
		 * Constructs a new adaptive luminance pass.
		 *
		 * @param {Texture} luminanceBuffer - A buffer that contains the current scene luminance.
		 * @param {Object} [options] - The options.
		 * @param {Number} [options.minLuminance=0.01] - The minimum luminance.
		 * @param {Number} [options.adaptationRate=1.0] - The luminance adaptation rate.
		 */
		constructor(
			luminanceBuffer: Texture,
			{
				minLuminance,
				adaptationRate
			}?: {
				minLuminance?: number;
				adaptationRate?: number;
			}
		);

		/**
		 * The adaptive luminance texture.
		 *
		 * @type {Texture}
		 */
		get texture(): Texture;
		/**
		 * Returns the adaptive 1x1 luminance texture.
		 *
		 * @deprecated Use texture instead.
		 * @return {Texture} The texture.
		 */
		getTexture(): Texture;
		/**
		 * Sets the 1x1 mipmap level.
		 *
		 * This level is used to identify the smallest mipmap of the main luminance texture which contains the downsampled
		 * average scene luminance.
		 *
		 * @type {Number}
		 * @deprecated Use fullscreenMaterial.mipLevel1x1 instead.
		 */
		set mipLevel1x1(arg: number);
		/**
		 * @type {Number}
		 * @deprecated Use fullscreenMaterial.adaptationRate instead.
		 */
		set adaptationRate(arg: number);
		/**
		 * The luminance adaptation rate.
		 *
		 * @type {Number}
		 * @deprecated Use fullscreenMaterial.adaptationRate instead.
		 */
		get adaptationRate(): number;
		/**
		 * Renders the scene normals.
		 *
		 * @param {WebGLRenderer} renderer - The renderer.
		 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
		 * @param {WebGLRenderTarget} outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
		 * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
		 * @param {Boolean} [stencilTest] - Indicates whether a stencil mask is active.
		 */
		render(
			renderer: WebGLRenderer,
			inputBuffer: WebGLRenderTarget | null,
			outputBuffer: WebGLRenderTarget | null,
			deltaTime?: number,
			stencilTest?: boolean
		): void;

	}

	/**
	 * A Kawase blur pass.
	 */
	export class KawaseBlurPass extends Pass {

		/**
		 * An auto sizing flag.
		 *
		 * @type {Number}
		 * @deprecated Use {@link Resolution.AUTO_SIZE} instead.
		 */
		static get AUTO_SIZE(): number;
		/**
		 * Constructs a new Kawase blur pass.
		 *
		 * @param {Object} [options] - The options.
		 * @param {Number} [options.resolutionScale=0.5] - The resolution scale.
		 * @param {Number} [options.resolutionX=Resolution.AUTO_SIZE] - The horizontal resolution.
		 * @param {Number} [options.resolutionY=Resolution.AUTO_SIZE] - The vertical resolution.
		 * @param {Number} [options.width=Resolution.AUTO_SIZE] - Deprecated. Use resolutionX instead.
		 * @param {Number} [options.height=Resolution.AUTO_SIZE] - Deprecated. Use resolutionY instead.
		 * @param {KernelSize} [options.kernelSize=KernelSize.MEDIUM] - The blur kernel size.
		 */
		constructor({
			resolutionScale,
			resolutionX,
			resolutionY,
			width,
			height,
			kernelSize
		}?: {
			resolutionScale?: number;
			resolutionX?: number;
			resolutionY?: number;
			width?: number;
			height?: number;
			kernelSize?: KernelSize;
		});

		resolution: Resolution;
		/**
		 * The blur material.
		 *
		 * @type {KawaseBlurMaterial}
		 */
		blurMaterial: KawaseBlurMaterial;
		/**
		 * Indicates whether dithering is enabled.
		 *
		 * @type {Boolean}
		 * @deprecated
		 */
		dithering: boolean;
		/**
		 * The kernel size.
		 *
		 * @type {KernelSize}
		 */
		kernelSize: KernelSize;
		/**
		 * Returns the resolution settings.
		 *
		 * @deprecated Use resolution instead.
		 * @return {Resolution} The resolution.
		 */
		getResolution(): Resolution;
		/**
		 * Sets the render width.
		 *
		 * @type {Number}
		 * @deprecated Use resolution.preferredWidth instead.
		 */
		set width(arg: number);
		/**
		 * The current width of the internal render targets.
		 *
		 * @type {Number}
		 * @deprecated Use resolution.width instead.
		 */
		get width(): number;
		/**
		 * Sets the render height.
		 *
		 * @type {Number}
		 * @deprecated Use resolution.preferredHeight instead.
		 */
		set height(arg: number);
		/**
		 * The current height of the internal render targets.
		 *
		 * @type {Number}
		 * @deprecated Use resolution.height instead.
		 */
		get height(): number;
		set scale(arg: number);
		/**
		 * The current blur scale.
		 *
		 * @type {Number}
		 * @deprecated Use blurMaterial.scale instead.
		 */
		get scale(): number;
		/**
		 * Returns the current blur scale.
		 *
		 * @deprecated Use blurMaterial.scale instead.
		 * @return {Number} The scale.
		 */
		getScale(): number;
		/**
		 * Sets the blur scale.
		 *
		 * This value influences the overall blur strength and should not be greater than 1. For larger blurs please increase
		 * the kernel size via {@link setKernelSize}!
		 *
		 * Note that the blur strength is closely tied to the resolution. For a smooth transition from no blur to full blur,
		 * set the width or the height to a high enough value.
		 *
		 * @deprecated Use blurMaterial.scale instead.
		 * @param {Number} value - The scale.
		 */
		setScale(value: number): void;
		/**
		 * Returns the kernel size.
		 *
		 * @deprecated Use kernelSize instead.
		 * @return {KernelSize} The kernel size.
		 */
		getKernelSize(): KernelSize;
		/**
		 * Sets the kernel size.
		 *
		 * Larger kernels require more processing power but scale well with larger render resolutions.
		 *
		 * @deprecated Use kernelSize instead.
		 * @param {KernelSize} value - The kernel size.
		 */
		setKernelSize(value: KernelSize): void;
		/**
		 * Returns the current resolution scale.
		 *
		 * @return {Number} The resolution scale.
		 * @deprecated Use resolution instead.
		 */
		getResolutionScale(): number;
		/**
		 * Sets the resolution scale.
		 *
		 * @param {Number} scale - The new resolution scale.
		 * @deprecated Use resolution instead.
		 */
		setResolutionScale(scale: number): void;
		/**
		 * Blurs the input buffer and writes the result to the output buffer. The input buffer remains intact, unless it's
		 * also used as the output buffer.
		 *
		 * @param {WebGLRenderer} renderer - The renderer.
		 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
		 * @param {WebGLRenderTarget} outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
		 * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
		 * @param {Boolean} [stencilTest] - Indicates whether a stencil mask is active.
		 */
		render(
			renderer: WebGLRenderer,
			inputBuffer: WebGLRenderTarget | null,
			outputBuffer: WebGLRenderTarget | null,
			deltaTime?: number,
			stencilTest?: boolean
		): void;

	}

	export type BlurPass = KawaseBlurPass;

	/**
	 * A pass that disables the stencil test.
	 */
	export class ClearMaskPass extends Pass {

		/**
		 * Constructs a new clear mask pass.
		 */
		constructor();

		/**
		 * Disables the global stencil test.
		 * @param renderer - The renderer.
		 * @param inputBuffer - A frame buffer that contains the result of the previous pass.
		 * @param outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
		 * @param [deltaTime] - The time between the last frame and the current one in seconds.
		 * @param [stencilTest] - Indicates whether a stencil mask is active.
		 */
		render(
			renderer: WebGLRenderer,
			inputBuffer: WebGLRenderTarget | null,
			outputBuffer: WebGLRenderTarget | null,
			deltaTime?: number,
			stencilTest?: boolean
		): void;

	}

	/**
	 * A pass that clears the input buffer or the screen.
	 */
	export class ClearPass extends Pass {

		/**
		 * Constructs a new clear pass.
		 *
		 * @param {Boolean} [color=true] - Determines whether the color buffer should be cleared.
		 * @param {Boolean} [depth=true] - Determines whether the depth buffer should be cleared.
		 * @param {Boolean} [stencil=false] - Determines whether the stencil buffer should be cleared.
		 */
		constructor(color?: boolean, depth?: boolean, stencil?: boolean);
		/**
		 * Indicates whether the color buffer should be cleared.
		 *
		 * @type {Boolean}
		 * @deprecated Use setClearFlags() instead.
		 */
		color: boolean;
		/**
		 * Indicates whether the depth buffer should be cleared.
		 *
		 * @type {Boolean}
		 * @deprecated Use setClearFlags() instead.
		 */
		depth: boolean;
		/**
		 * Indicates whether the stencil buffer should be cleared.
		 *
		 * @type {Boolean}
		 * @deprecated Use setClearFlags() instead.
		 */
		stencil: boolean;
		/**
		 * An override clear color. Default is null.
		 *
		 * @type {Color}
		 */
		overrideClearColor: Color;
		/**
		 * An override clear alpha. Default is -1.
		 *
		 * @type {Number}
		 */
		overrideClearAlpha: number;
		/**
		 * Sets the clear flags.
		 *
		 * @param {Boolean} color - Whether the color buffer should be cleared.
		 * @param {Boolean} depth - Whether the depth buffer should be cleared.
		 * @param {Boolean} stencil - Whether the stencil buffer should be cleared.
		 */
		setClearFlags(color: boolean, depth: boolean, stencil: boolean): void;
		/**
		 * Returns the override clear color. Default is null.
		 *
		 * @deprecated Use overrideClearColor instead.
		 * @return {Color} The clear color.
		 */
		getOverrideClearColor(): Color;
		/**
		 * Sets the override clear color.
		 *
		 * @deprecated Use overrideClearColor instead.
		 * @param {Color} value - The clear color.
		 */
		setOverrideClearColor(value: Color): void;
		/**
		 * Returns the override clear alpha. Default is -1.
		 *
		 * @deprecated Use overrideClearAlpha instead.
		 * @return {Number} The clear alpha.
		 */
		getOverrideClearAlpha(): number;
		/**
		 * Sets the override clear alpha.
		 *
		 * @deprecated Use overrideClearAlpha instead.
		 * @param {Number} value - The clear alpha.
		 */
		setOverrideClearAlpha(value: number): void;
		/**
		 * Clears the input buffer or the screen.
		 * @param renderer - The renderer.
		 * @param inputBuffer - A frame buffer that contains the result of the previous pass.
		 * @param outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
		 * @param [deltaTime] - The time between the last frame and the current one in seconds.
		 * @param [stencilTest] - Indicates whether a stencil mask is active.
		 */
		render(
			renderer: WebGLRenderer,
			inputBuffer: WebGLRenderTarget | null,
			outputBuffer: WebGLRenderTarget | null,
			deltaTime?: number,
			stencilTest?: boolean
		): void;

	}

	/**
	 * A pass that copies the contents of an input buffer to another render target.
	 */
	export class CopyPass extends Pass {

		/**
		 * Constructs a new save pass.
		 *
		 * @param {WebGLRenderTarget} [renderTarget] - A render target.
		 * @param {Boolean} [autoResize=true] - Whether the render target size should be updated automatically.
		 */
		constructor(renderTarget?: WebGLRenderTarget, autoResize?: boolean);
		/**
		 * Enables or disables auto resizing of the render target.
		 *
		 * @type {Boolean}
		 */
		autoResize: boolean;
		set resize(arg: boolean);
		/**
		 * Enables or disables auto resizing of the render target.
		 *
		 * @deprecated Use autoResize instead.
		 * @type {Boolean}
		 */
		get resize(): boolean;
		/**
		 * The output texture.
		 *
		 * @type {Texture}
		 */
		get texture(): Texture;
		/**
		 * Returns the output texture.
		 *
		 * @deprecated Use texture instead.
		 * @return {Texture} The texture.
		 */
		getTexture(): Texture;
		/**
		 * Enables or disables auto resizing of the render target.
		 *
		 * @deprecated Use autoResize instead.
		 * @param {Boolean} value - Whether the render target size should be updated automatically.
		 */
		setAutoResizeEnabled(value: boolean): void;
		/**
		 * Saves the input buffer.
		 *
		 * @param {WebGLRenderer} renderer - The renderer.
		 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
		 * @param {WebGLRenderTarget} outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
		 * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
		 * @param {Boolean} [stencilTest] - Indicates whether a stencil mask is active.
		 */
		render(
			renderer: WebGLRenderer,
			inputBuffer: WebGLRenderTarget | null,
			outputBuffer: WebGLRenderTarget | null,
			deltaTime?: number,
			stencilTest?: boolean
		): void;

	}

	export type SavePass = CopyPass;

	/**
	 * A pass that copies depth into a render target.
	 */
	export class DepthCopyPass extends Pass {

		/**
		 * Constructs a new depth save pass.
		 *
		 * @param {Object} [options] - The options.
		 * @param {DepthPackingStrategies} [options.depthPacking=RGBADepthPacking] - The output depth packing.
		 */
		constructor({ depthPacking }?: { depthPacking?: DepthPackingStrategies });
		/**
		 * The output depth texture.
		 *
		 * @type {Texture}
		 */
		get texture(): Texture;
		/**
		 * Returns the output depth texture.
		 *
		 * @deprecated Use texture instead.
		 * @return {Texture} The texture.
		 */
		getTexture(): Texture;
		/**
		 * The output depth packing.
		 *
		 * @type {DepthPackingStrategies}
		 */
		get depthPacking(): DepthPackingStrategies;
		/**
		 * Returns the output depth packing.
		 *
		 * @deprecated Use depthPacking instead.
		 * @return {DepthPackingStrategies} The depth packing.
		 */
		getDepthPacking(): DepthPackingStrategies;
		/**
		 * Copies depth from a depth texture.
		 *
		 * @param {WebGLRenderer} renderer - The renderer.
		 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
		 * @param {WebGLRenderTarget} outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
		 * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
		 * @param {Boolean} [stencilTest] - Indicates whether a stencil mask is active.
		 */
		render(
			renderer: WebGLRenderer,
			inputBuffer: WebGLRenderTarget | null,
			outputBuffer: WebGLRenderTarget | null,
			deltaTime?: number,
			stencilTest?: boolean
		): void;

	}

	/**
	 * A pass that downsamples the scene depth by picking the most representative depth in 2x2 texel neighborhoods. If a
	 * normal buffer is provided, the corresponding normals will be stored as well.
	 *
	 * This pass requires WebGL 2.
	 */
	export class DepthDownsamplingPass extends Pass {

		/**
		 * Constructs a new depth downsampling pass.
		 *
		 * @param {Object} [options] - The options.
		 * @param {Texture} [options.normalBuffer=null] - A texture that contains view space normals. See {@link NormalPass}.
		 * @param {Number} [options.resolutionScale=0.5] - The resolution scale.
		 * @param {Number} [options.width=Resolution.AUTO_SIZE] - The render width.
		 * @param {Number} [options.height=Resolution.AUTO_SIZE] - The render height.
		 */
		constructor({
			normalBuffer,
			resolutionScale,
			width,
			height
		}?: {
			normalBuffer?: Texture;
			resolutionScale?: number;
			width?: number;
			height?: number;
		});

		resolution: Resolution;
		/**
		 * The normal(RGB) + depth(A) texture.
		 *
		 * @type {Texture}
		 */
		get texture(): Texture;
		/**
		 * Returns the normal(RGB) + depth(A) texture.
		 *
		 * @deprecated Use texture instead.
		 * @return {Texture} The texture.
		 */
		getTexture(): Texture;
		/**
		 * Returns the resolution settings.
		 *
		 * @deprecated Use resolution instead.
		 * @return {Resolution} The resolution.
		 */
		getResolution(): Resolution;
		/**
		 * Downsamples depth and scene normals.
		 *
		 * @param {WebGLRenderer} renderer - The renderer.
		 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
		 * @param {WebGLRenderTarget} outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
		 * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
		 * @param {Boolean} [stencilTest] - Indicates whether a stencil mask is active.
		 */
		render(
			renderer: WebGLRenderer,
			inputBuffer: WebGLRenderTarget | null,
			outputBuffer: WebGLRenderTarget | null,
			deltaTime?: number,
			stencilTest?: boolean
		): void;

	}

	/**
	 * A pass that renders a given scene into the input buffer or to screen.
	 *
	 * This pass uses a {@link ClearPass} to clear the target buffer.
	 */
	export class RenderPass extends Pass {

		/**
		 * Constructs a new render pass.
		 *
		 * @param {Scene} scene - The scene to render.
		 * @param {Camera} camera - The camera to use to render the scene.
		 * @param {Material} [overrideMaterial=null] - An override material.
		 */
		constructor(scene?: Scene, camera?: Camera, overrideMaterial?: Material);
		/**
		 * A clear pass.
		 *
		 * @type {ClearPass}
		 */
		clearPass: ClearPass;
		/**
		 * Indicates whether the scene background should be ignored.
		 *
		 * @type {Boolean}
		 */
		ignoreBackground: boolean;
		/**
		 * Indicates whether the shadow map auto update should be skipped.
		 *
		 * @type {Boolean}
		 */
		skipShadowMapUpdate: boolean;
		/**
		 * A selection of objects to render.
		 *
		 * @type {Selection}
		 */
		selection: Selection;
		set overrideMaterial(arg: Material);
		/**
		 * The current override material.
		 *
		 * @type {Material}
		 */
		get overrideMaterial(): Material;
		/**
		 * Returns the current override material.
		 *
		 * @deprecated Use overrideMaterial instead.
		 * @return {Material} The material.
		 */
		getOverrideMaterial(): Material;
		/**
		 * Sets the override material.
		 *
		 * @deprecated Use overrideMaterial instead.
		 * @param {Material} value - The material.
		 */
		setOverrideMaterial(value: Material): void;
		set clear(arg: boolean);
		/**
		 * Indicates whether the target buffer should be cleared before rendering.
		 *
		 * @type {Boolean}
		 * @deprecated Use clearPass.enabled instead.
		 */
		get clear(): boolean;
		/**
		 * Returns the selection. Default is `null` (no restriction).
		 *
		 * @deprecated Use selection instead.
		 * @return {Selection} The selection.
		 */
		getSelection(): Selection;
		/**
		 * Sets the selection. Set to `null` to disable.
		 *
		 * @deprecated Use selection instead.
		 * @param {Selection} value - The selection.
		 */
		setSelection(value: Selection): void;
		/**
		 * Indicates whether the scene background is disabled.
		 *
		 * @deprecated Use ignoreBackground instead.
		 * @return {Boolean} Whether the scene background is disabled.
		 */
		isBackgroundDisabled(): boolean;
		/**
		 * Enables or disables the scene background.
		 *
		 * @deprecated Use ignoreBackground instead.
		 * @param {Boolean} value - Whether the scene background should be disabled.
		 */
		setBackgroundDisabled(value: boolean): void;
		/**
		 * Indicates whether the shadow map auto update is disabled.
		 *
		 * @deprecated Use skipShadowMapUpdate instead.
		 * @return {Boolean} Whether the shadow map update is disabled.
		 */
		isShadowMapDisabled(): boolean;
		/**
		 * Enables or disables the shadow map auto update.
		 *
		 * @deprecated Use skipShadowMapUpdate instead.
		 * @param {Boolean} value - Whether the shadow map auto update should be disabled.
		 */
		setShadowMapDisabled(value: boolean): void;
		/**
		 * Returns the clear pass.
		 *
		 * @deprecated Use clearPass.enabled instead.
		 * @return {ClearPass} The clear pass.
		 */
		getClearPass(): ClearPass;
		/**
		 * Renders the scene.
		 * @param renderer - The renderer.
		 * @param inputBuffer - A frame buffer that contains the result of the previous pass.
		 * @param outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
		 * @param [deltaTime] - The time between the last frame and the current one in seconds.
		 * @param [stencilTest] - Indicates whether a stencil mask is active.
		 */
		render(
			renderer: WebGLRenderer,
			inputBuffer: WebGLRenderTarget | null,
			outputBuffer: WebGLRenderTarget | null,
			deltaTime?: number,
			stencilTest?: boolean
		): void;

	}

	/**
	 * A pass that renders depth into an RGBA buffer.
	 */
	export class DepthPass extends Pass {

		/**
		 * Constructs a new depth pass.
		 *
		 * @param {Scene} scene - The scene to render.
		 * @param {Camera} camera - The camera to use to render the scene.
		 * @param {Object} [options] - The options.
		 * @param {Number} [options.resolutionScale=1.0] - The resolution scale.
		 * @param {Number} [options.resolutionX=Resolution.AUTO_SIZE] - The horizontal resolution.
		 * @param {Number} [options.resolutionY=Resolution.AUTO_SIZE] - The vertical resolution.
		 * @param {Number} [options.width=Resolution.AUTO_SIZE] - Deprecated. Use resolutionX instead.
		 * @param {Number} [options.height=Resolution.AUTO_SIZE] - Deprecated. Use resolutionY instead.
		 * @param {WebGLRenderTarget} [options.renderTarget] - A custom render target.
		 */
		constructor(
			scene?: Scene,
			camera?: Camera,
			{
				resolutionScale,
				resolutionX,
				resolutionY,
				width,
				height,
				renderTarget
			}?: {
				resolutionScale?: number;
				resolutionX?: number;
				resolutionY?: number;
				width?: number;
				height?: number;
				renderTarget?: WebGLRenderTarget;
			}
		);

		resolution: Resolution;
		/**
		 * The depth texture.
		 *
		 * @type {Texture}
		 */
		get texture(): Texture;
		/**
		 * Returns the depth texture.
		 *
		 * @deprecated Use texture instead.
		 * @return {Texture} The texture.
		 */
		getTexture(): Texture;
		/**
		 * Returns the resolution settings.
		 *
		 * @deprecated Use resolution instead.
		 * @return {Resolution} The resolution.
		 */
		getResolution(): Resolution;
		/**
		 * Returns the current resolution scale.
		 *
		 * @return {Number} The resolution scale.
		 * @deprecated Use resolution instead.
		 */
		getResolutionScale(): number;
		/**
		 * Sets the resolution scale.
		 *
		 * @param {Number} scale - The new resolution scale.
		 * @deprecated Use resolution instead.
		 */
		setResolutionScale(scale: number): void;
		/**
		 * Renders the scene depth.
		 *
		 * @param {WebGLRenderer} renderer - The renderer.
		 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
		 * @param {WebGLRenderTarget} outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
		 * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
		 * @param {Boolean} [stencilTest] - Indicates whether a stencil mask is active.
		 */
		render(
			renderer: WebGLRenderer,
			inputBuffer: WebGLRenderTarget | null,
			outputBuffer: WebGLRenderTarget | null,
			deltaTime?: number,
			stencilTest?: boolean
		): void;

	}

	/**
	 * A depth picking pass.
	 */
	export class DepthPickingPass extends DepthCopyPass {

		/**
		 * Constructs a new depth picking pass.
		 *
		 * @param {Object} [options] - The options.
		 * @param {DepthPackingStrategies} [options.depthPacking=RGBADepthPacking] - The depth packing.
		 * @param {Number} [options.mode=DepthCopyMode.SINGLE] - The depth copy mode.
		 */
		constructor({
			depthPacking,
			mode
		}?: {
			depthPacking?: DepthPackingStrategies;
			mode?: number;
		});

		/**
		 * Reads depth at a specific screen position.
		 *
		 * Only one depth value can be picked per frame. Calling this method multiple times per frame will overwrite the
		 * picking coordinates. Unresolved promises will be abandoned.
		 *
		 * @example
		 * const ndc = new Vector3();
		 * const clientRect = myViewport.getBoundingClientRect();
		 * const clientX = pointerEvent.clientX - clientRect.left;
		 * const clientY = pointerEvent.clientY - clientRect.top;
		 * ndc.x = (clientX / myViewport.clientWidth) * 2.0 - 1.0;
		 * ndc.y = -(clientY / myViewport.clientHeight) * 2.0 + 1.0;
		 * const depth = await depthPickingPass.readDepth(ndc);
		 * ndc.z = depth * 2.0 - 1.0;
		 *
		 * const worldPosition = ndc.unproject(camera);
		 *
		 * @param {Vector2|Vector3} ndc - Normalized device coordinates. Only X and Y are relevant.
		 * @return {Promise<Number>} A promise that returns the depth on the next frame.
		 */
		readDepth(ndc: Vector2 | Vector3): Promise<number>;
		/**
		 * Copies depth and resolves depth picking promises.
		 *
		 * @param {WebGLRenderer} renderer - The renderer.
		 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
		 * @param {WebGLRenderTarget} outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
		 * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
		 * @param {Boolean} [stencilTest] - Indicates whether a stencil mask is active.
		 */
		render(
			renderer: WebGLRenderer,
			inputBuffer: WebGLRenderTarget | null,
			outputBuffer: WebGLRenderTarget | null,
			deltaTime?: number,
			stencilTest?: boolean
		): void;

	}

	/**
	 * A blend function enumeration.
	 *
	 * Important: Do not use `BlendFunction.SKIP` to disable effects. See
	 * [Enabling and Disabling Effects](https://github.com/vanruesc/postprocessing/wiki/Enabling-and-Disabling-Effects)
	 * for more information.
	 *
	 * Based on https://www.khronos.org/registry/OpenGL/extensions/NV/NV_blend_equation_advanced.txt
	 *
	 * @type {Object}
	 * @property {Number} SKIP - Deprecated. Use DST instead. Warning: This blend function does NOT fully disable the effect.
	 * @property {Number} SET - Deprecated. Use SRC instead.
	 * @property {Number} ADD - Additive blending. Fast, but may produce washed out results.
	 * @property {Number} ALPHA - Alpha blending. Blends based on the alpha value of the new color.
	 * @property {Number} AVERAGE - Calculates the avarage of the new color and the base color.
	 * @property {Number} COLOR - Converts the colors to HSL and blends based on color.
	 * @property {Number} COLOR_BURN - Color burn.
	 * @property {Number} COLOR_DODGE - Color dodge.
	 * @property {Number} DARKEN - Prioritize darker colors.
	 * @property {Number} DIFFERENCE - Color difference.
	 * @property {Number} DIVIDE - Color division.
	 * @property {Number} DST - Overwrites the new color with the base color. Ignores opacity.
	 * @property {Number} EXCLUSION - Color exclusion.
	 * @property {Number} HARD_LIGHT - Hard light.
	 * @property {Number} HARD_MIX - Hard mix.
	 * @property {Number} HUE - Converts the colors to HSL and blends based on hue.
	 * @property {Number} INVERT - Overwrites the base color with the inverted new color.
	 * @property {Number} INVERT_RGB - Multiplies the new color with the inverted base color.
	 * @property {Number} LIGHTEN - Prioritize lighter colors.
	 * @property {Number} LINEAR_BURN - Linear burn.
	 * @property {Number} LINEAR_DODGE - Same as ADD but limits the result to 1.
	 * @property {Number} LINEAR_LIGHT - Linear light.
	 * @property {Number} LUMINOSITY - Converts the colors to HSL and blends based on luminosity.
	 * @property {Number} MULTIPLY - Color multiplication.
	 * @property {Number} NEGATION - Negates the base color using the new color.
	 * @property {Number} NORMAL - Overwrites the base color with the new one.
	 * @property {Number} OVERLAY - Color overlay.
	 * @property {Number} PIN_LIGHT - Pin light.
	 * @property {Number} REFLECT - Color reflection.
	 * @property {Number} SCREEN - Screen blending. The two colors are effectively projected on a white screen simultaneously.
	 * @property {Number} SRC - Overwrites the base color with the new one. Ignores opacity.
	 * @property {Number} SATURATION - Converts the colors to HSL and blends based on saturation.
	 * @property {Number} SOFT_LIGHT - Soft light.
	 * @property {Number} SUBTRACT - Subtracts the new color from the base color.
	 * @property {Number} VIVID_LIGHT - Vivid light.
	 */
	export enum BlendFunction {
		SKIP,
		SET,
		ADD,
		ALPHA,
		AVERAGE,
		COLOR,
		COLOR_BURN,
		COLOR_DODGE,
		DARKEN,
		DIFFERENCE,
		DIVIDE,
		DST,
		EXCLUSION,
		HARD_LIGHT,
		HARD_MIX,
		HUE,
		INVERT,
		INVERT_RGB,
		LIGHTEN,
		LINEAR_BURN,
		LINEAR_DODGE,
		LINEAR_LIGHT,
		LUMINOSITY,
		MULTIPLY,
		NEGATION,
		NORMAL,
		OVERLAY,
		PIN_LIGHT,
		REFLECT,
		SATURATION,
		SCREEN,
		SOFT_LIGHT,
		SRC,
		SUBTRACT,
		VIVID_LIGHT
	}

	/**
	 * A blend mode.
	 */
	export class BlendMode extends EventDispatcher<import("three").Event> {

		/**
		 * Constructs a new blend mode.
		 *
		 * @param {BlendFunction} blendFunction - The blend function.
		 * @param {Number} opacity - The opacity of the color that will be blended with the base color.
		 */
		constructor(blendFunction: BlendFunction, opacity?: number);
		/**
		 * A uniform that controls the opacity of this blend mode.
		 *
		 * TODO Add opacity accessors for uniform value.
		 * @type {Uniform}
		 */
		opacity: Uniform;
		/**
		 * Returns the opacity.
		 *
		 * @return {Number} The opacity.
		 */
		getOpacity(): number;
		/**
		 * Sets the opacity.
		 *
		 * @param {Number} value - The opacity.
		 */
		setOpacity(value: number): void;
		/**
		 * Returns the blend function.
		 *
		 * @deprecated Use blendFunction instead.
		 * @return {BlendFunction} The blend function.
		 */
		getBlendFunction(): BlendFunction;
		/**
		 * Sets the blend function.
		 *
		 * @deprecated Use blendFunction instead.
		 * @param {BlendFunction} value - The blend function.
		 */
		setBlendFunction(value: BlendFunction): void;
		/**
		 * Returns the blend function shader code.
		 *
		 * @return {String} The blend function shader code.
		 */
		getShaderCode(): string;
		/**
		 * The blend function.
		 *
		 * @type {BlendFunction}
		 */
		get blendFunction(): BlendFunction;
		set blendFunction(value: BlendFunction);

	}

	/**
	 * An abstract effect.
	 *
	 * Effects can be combined using the {@link EffectPass}.
	 *
	 * @implements {Initializable}
	 * @implements {Resizable}
	 * @implements {Disposable}
	 */
	export class Effect
		extends EventDispatcher<import("three").Event>
		implements Initializable, Resizable, Disposable {

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
		constructor(
			name: string,
			fragmentShader: string,
			{
				attributes,
				blendFunction,
				defines,
				uniforms,
				extensions,
				vertexShader
			}?: {
				attributes?: EffectAttribute;
				blendFunction?: BlendFunction;
				defines?: Map<string, string>;
				uniforms?: Map<string, Uniform>;
				extensions?: Set<WebGLExtension>;
				vertexShader?: string;
			}
		);

		/**
		 * The name of this effect.
		 *
		 * @type {String}
		 */
		name: string;
		/**
		 * The renderer.
		 *
		 * @type {WebGLRenderer}
		 * @protected
		 * @deprecated
		 */
		protected renderer: WebGLRenderer;
		/**
		 * Preprocessor macro definitions.
		 *
		 * Call {@link Effect.setChanged} after changing macro definitions.
		 *
		 * @type {Map<String, String>}
		 */
		readonly defines: Map<string, string>;
		/**
		 * Shader uniforms.
		 *
		 * Call {@link Effect.setChanged} after adding or removing uniforms.
		 *
		 * @type {Map<String, Uniform>}
		 */
		readonly uniforms: Map<string, Uniform>;
		/**
		 * WebGL extensions that are required by this effect.
		 *
		 * Call {@link Effect.setChanged} after adding or removing extensions.
		 *
		 * @type {Set<WebGLExtension>}
		 */
		readonly extensions: Set<WebGLExtension>;
		/**
		 * The blend mode of this effect.
		 *
		 * @type {BlendMode}
		 */
		readonly blendMode: BlendMode;
		/**
		 * The input color space.
		 *
		 * @type {ColorSpace}
		 * @experimental
		 */
		get inputColorSpace(): ColorSpace;
		/**
		 * @type {ColorSpace}
		 * @protected
		 * @experimental
		 */
		protected set inputColorSpace(arg: ColorSpace);
		/**
		 * The output color space.
		 *
		 * Should only be changed if this effect converts the input colors to a different color space.
		 *
		 * @type {ColorSpace}
		 * @experimental
		 */
		get outputColorSpace(): ColorSpace;
		/**
		 * @type {ColorSpace}
		 * @protected
		 * @experimental
		 */
		protected set outputColorSpace(arg: ColorSpace);
		/**
		 * Sets the main scene.
		 *
		 * @type {Scene}
		 */
		set mainScene(arg: Scene);
		/**
		 * Sets the main camera.
		 *
		 * @type {Camera}
		 */
		set mainCamera(arg: Camera);
		/**
		 * Returns the name of this effect.
		 *
		 * @deprecated Use name instead.
		 * @return {String} The name.
		 */
		getName(): string;
		/**
		 * Sets the renderer.
		 *
		 * @deprecated
		 * @param {WebGLRenderer} renderer - The renderer.
		 */
		setRenderer(renderer: WebGLRenderer): void;
		/**
		 * Returns the preprocessor macro definitions.
		 *
		 * @deprecated Use defines instead.
		 * @return {Map<String, String>} The extensions.
		 */
		getDefines(): Map<string, string>;
		/**
		 * Returns the uniforms of this effect.
		 *
		 * @deprecated Use uniforms instead.
		 * @return {Map<String, Uniform>} The extensions.
		 */
		getUniforms(): Map<string, Uniform>;
		/**
		 * Returns the WebGL extensions that are required by this effect.
		 *
		 * @deprecated Use extensions instead.
		 * @return {Set<WebGLExtension>} The extensions.
		 */
		getExtensions(): Set<WebGLExtension>;
		/**
		 * Returns the blend mode.
		 *
		 * The result of this effect will be blended with the result of the previous effect using this blend mode.
		 *
		 * @deprecated Use blendMode instead.
		 * @return {BlendMode} The blend mode.
		 */
		getBlendMode(): BlendMode;
		/**
		 * Returns the effect attributes.
		 *
		 * @return {EffectAttribute} The attributes.
		 */
		getAttributes(): EffectAttribute;
		/**
		 * Sets the effect attributes.
		 *
		 * Effects that have the same attributes will be executed in the order in which they were registered. Some attributes
		 * imply a higher priority.
		 *
		 * @protected
		 * @param {EffectAttribute} attributes - The attributes.
		 */
		protected setAttributes(attributes: EffectAttribute): void;
		/**
		 * Returns the fragment shader.
		 *
		 * @return {String} The fragment shader.
		 */
		getFragmentShader(): string;
		/**
		 * Sets the fragment shader.
		 *
		 * @protected
		 * @param {String} fragmentShader - The fragment shader.
		 */
		protected setFragmentShader(fragmentShader: string): void;
		/**
		 * Returns the vertex shader.
		 *
		 * @return {String} The vertex shader.
		 */
		getVertexShader(): string;
		/**
		 * Sets the vertex shader.
		 *
		 * @protected
		 * @param {String} vertexShader - The vertex shader.
		 */
		protected setVertexShader(vertexShader: string): void;
		/**
		 * Informs the associated {@link EffectPass} that this effect requires a shader recompilation.
		 *
		 * Should be called after changing macros or extensions and after adding/removing uniforms.
		 *
		 * @protected
		 */
		protected setChanged(): void;
		/**
		 * Sets the depth texture.
		 *
		 * You may override this method if your effect requires direct access to the depth texture that is bound to the
		 * associated {@link EffectPass}.
		 *
		 * @param {Texture} depthTexture - A depth texture.
		 * @param {DepthPackingStrategies} [depthPacking=BasicDepthPacking] - The depth packing.
		 */
		setDepthTexture(
			depthTexture: Texture,
			depthPacking?: DepthPackingStrategies
		): void;

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
		update(
			renderer: WebGLRenderer,
			inputBuffer: WebGLRenderTarget,
			deltaTime?: number
		): void;

		/**
		 * Updates the size of this effect.
		 *
		 * You may override this method if you want to be informed about the size of the backbuffer/canvas.
		 * This method is called before {@link initialize} and every time the size of the {@link EffectComposer} changes.
		 *
		 * @param {Number} width - The width.
		 * @param {Number} height - The height.
		 */
		setSize(width: number, height: number): void;
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
		initialize(
			renderer: WebGLRenderer,
			alpha: boolean,
			frameBufferType: number
		): void;

		/**
		 * Performs a shallow search for properties that define a dispose method and deletes them.
		 *
		 * The {@link EffectComposer} calls this method when it is being destroyed.
		 */
		dispose(): void;

	}

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
	export enum EffectAttribute {
		CONVOLUTION,
		DEPTH,
		NONE,
	}

	/**
	 * An enumeration of WebGL extensions.
	 *
	 * @type {Object}
	 * @property {String} DERIVATIVES - Enables derivatives by adding the functions dFdx, dFdy and fwidth.
	 * @property {String} FRAG_DEPTH - Enables gl_FragDepthEXT to set a depth value of a fragment from within the fragment shader.
	 * @property {String} DRAW_BUFFERS - Enables multiple render targets (MRT) support.
	 * @property {String} SHADER_TEXTURE_LOD - Enables explicit control of texture LOD.
	 */
	export enum WebGLExtension {
		DERIVATIVES = "derivatives",
		FRAG_DEPTH = "fragDepth",
		DRAW_BUFFERS = "drawBuffers",
		SHADER_TEXTURE_LOD = "shaderTextureLOD",
	}

	/**
	 * An effect pass.
	 *
	 * Use this pass to combine {@link Effect} instances.
	 */
	export class EffectPass extends Pass {

		/**
		 * Constructs a new effect pass.
		 *
		 * @param {Camera} camera - The main camera.
		 * @param {...Effect} effects - The effects that will be rendered by this pass.
		 */
		constructor(camera?: Camera, ...effects: Effect[]);
		/**
		 * The effects.
		 *
		 * Use `updateMaterial` or `recompile` after changing the effects and consider calling `dispose` to free resources
		 * of unused effects.
		 *
		 * @type {Effect[]}
		 * @protected
		 */
		private effects: Effect[];
		/**
		 * A time offset.
		 *
		 * Elapsed time will start at this value.
		 *
		 * @type {Number}
		 * @deprecated
		 */
		minTime: number;
		/**
		 * The maximum time.
		 *
		 * If the elapsed time exceeds this value, it will be reset.
		 *
		 * @type {Number}
		 * @deprecated
		 */
		maxTime: number;
		set encodeOutput(arg: boolean);
		/**
		 * Indicates whether this pass encodes its output when rendering to screen.
		 *
		 * @type {Boolean}
		 * @deprecated Use fullscreenMaterial.encodeOutput instead.
		 */
		get encodeOutput(): boolean;
		set dithering(arg: boolean);
		/**
		 * Indicates whether dithering is enabled.
		 *
		 * @type {Boolean}
		 */
		get dithering(): boolean;
		/**
		 * Updates the compound shader material.
		 */
		protected updateMaterial(): void;
		/**
		 * Rebuilds the shader material.
		 */
		recompile(): void;
		/**
		 * Sets the effects.
		 *
		 * @param effects - The effects.
		 */
		protected setEffects(effects: Effect[]): void;
		/**
		 * Returns the current depth texture.
		 * @returns The current depth texture, or null if there is none.
		 */
		getDepthTexture(): Texture;
		/**
		 * Sets the depth texture.
		 * @param depthTexture - A depth texture.
		 * @param [depthPacking = 0] - The depth packing.
		 */
		setDepthTexture(depthTexture: Texture, depthPacking?: number): void;
		/**
		 * Renders the effect.
		 * @param renderer - The renderer.
		 * @param inputBuffer - A frame buffer that contains the result of the previous pass.
		 * @param outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
		 * @param [deltaTime] - The time between the last frame and the current one in seconds.
		 * @param [stencilTest] - Indicates whether a stencil mask is active.
		 */
		render(
			renderer: WebGLRenderer,
			inputBuffer: WebGLRenderTarget | null,
			outputBuffer: WebGLRenderTarget | null,
			deltaTime?: number,
			stencilTest?: boolean
		): void;

		/**
		 * Updates the size of this pass.
		 * @param width - The width.
		 * @param height - The height.
		 */
		setSize(width: number, height: number): void;
		/**
		 * Performs initialization tasks.
		 * @param renderer - The renderer.
		 * @param alpha - Whether the renderer uses the alpha channel or not.
		 * @param frameBufferType - The type of the main frame buffers.
		 */
		initialize(
			renderer: WebGLRenderer,
			alpha: boolean,
			frameBufferType: number
		): void;

		/**
		 * Deletes disposable objects.
		 * This pass will be inoperative after this method was called!
		 */
		dispose(): void;
		/**
		 * Handles events.
		 *
		 * @param {Event} event - An event.
		 */
		handleEvent(event: Event): void;

	}

	/**
	 * A pass that executes a given function.
	 */
	export class LambdaPass extends Pass {

		/**
		 * Constructs a new lambda pass.
		 *
		 * @param {Function} f - A function.
		 */
		constructor(f: Function);

	}

	/**
	 * A pass that renders luminance.
	 */
	export class LuminancePass extends Pass {

		/**
		 * Constructs a new luminance pass.
		 *
		 * @param {Object} [options] - The options. See {@link LuminanceMaterial} for additional options.
		 * @param {Number} [options.resolutionScale=1.0] - The resolution scale.
		 * @param {Number} [options.resolutionX=Resolution.AUTO_SIZE] - The horizontal resolution.
		 * @param {Number} [options.resolutionY=Resolution.AUTO_SIZE] - The vertical resolution.
		 * @param {Number} [options.width=Resolution.AUTO_SIZE] - Deprecated. Use resolutionX instead.
		 * @param {Number} [options.height=Resolution.AUTO_SIZE] - Deprecated. Use resolutionY instead.
		 * @param {WebGLRenderTarget} [options.renderTarget] - A custom render target.
		 */
		constructor({
			resolutionScale,
			resolutionX,
			resolutionY,
			width,
			height,
			renderTarget
		}?: {
			resolutionScale?: number;
			resolutionX?: number;
			resolutionY?: number;
			width?: number;
			height?: number;
			renderTarget?: WebGLRenderTarget;
		});

		resolution: Resolution;
		/**
		 * The luminance texture.
		 *
		 * @type {Texture}
		 */
		get texture(): Texture;
		/**
		 * Returns the luminance texture.
		 *
		 * @deprecated Use texture instead.
		 * @return {Texture} The texture.
		 */
		getTexture(): Texture;
		/**
		 * Returns the resolution settings.
		 *
		 * @deprecated Use resolution instead.
		 * @return {Resolution} The resolution.
		 */
		getResolution(): Resolution;
		/**
		 * Renders the luminance.
		 *
		 * @param {WebGLRenderer} renderer - The renderer.
		 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
		 * @param {WebGLRenderTarget} outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
		 * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
		 * @param {Boolean} [stencilTest] - Indicates whether a stencil mask is active.
		 */
		render(
			renderer: WebGLRenderer,
			inputBuffer: WebGLRenderTarget | null,
			outputBuffer: WebGLRenderTarget | null,
			deltaTime?: number,
			stencilTest?: boolean
		): void;

	}

	/**
	 * A stencil mask pass.
	 *
	 * This pass requires that the input and output buffers have a stencil buffer. You can enable the stencil buffer via the
	 * {@link EffectComposer} constructor.
	 */
	export class MaskPass extends Pass {

		/**
		 * Constructs a new mask pass.
		 *
		 * @param {Scene} scene - The scene to render.
		 * @param {Camera} camera - The camera to use.
		 */
		constructor(scene?: Scene, camera?: Camera);
		/**
		 * A clear pass.
		 *
		 * @type {ClearPass}
		 */
		clearPass: ClearPass;
		/**
		 * Inverse flag.
		 *
		 * @type {Boolean}
		 * @deprecated Use inverted instead.
		 */
		inverse: boolean;
		set inverted(arg: boolean);
		/**
		 * Indicates whether the mask should be inverted.
		 *
		 * @type {Boolean}
		 */
		get inverted(): boolean;
		set clear(arg: boolean);
		/**
		 * Indicates whether this pass should clear the stencil buffer.
		 *
		 * @type {Boolean}
		 * @deprecated Use clearPass.enabled instead.
		 */
		get clear(): boolean;
		/**
		 * Returns the internal clear pass.
		 *
		 * @deprecated Use clearPass.enabled instead.
		 * @return {ClearPass} The clear pass.
		 */
		getClearPass(): ClearPass;
		/**
		 * Indicates whether the mask is inverted.
		 *
		 * @deprecated Use inverted instead.
		 * @return {Boolean} Whether the mask is inverted.
		 */
		isInverted(): boolean;
		/**
		 * Enables or disable mask inversion.
		 *
		 * @deprecated Use inverted instead.
		 * @param {Boolean} value - Whether the mask should be inverted.
		 */
		setInverted(value: boolean): void;
		/**
		 * Renders the effect.
		 * @param renderer - The renderer.
		 * @param inputBuffer - A frame buffer that contains the result of the previous pass.
		 * @param outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
		 * @param [deltaTime] - The time between the last frame and the current one in seconds.
		 * @param [stencilTest] - Indicates whether a stencil mask is active.
		 */
		render(
			renderer: WebGLRenderer,
			inputBuffer: WebGLRenderTarget | null,
			outputBuffer: WebGLRenderTarget | null,
			deltaTime?: number,
			stencilTest?: boolean
		): void;

	}

	/**
	 * A pass that renders the normals of a given scene.
	 */
	export class NormalPass extends Pass {

		/**
		 * Constructs a new normal pass.
		 *
		 * @param {Scene} scene - The scene to render.
		 * @param {Camera} camera - The camera to use to render the scene.
		 * @param {Object} [options] - The options.
		 * @param {Number} [options.resolutionScale=1.0] - The resolution scale.
		 * @param {Number} [options.resolutionX=Resolution.AUTO_SIZE] - The horizontal resolution.
		 * @param {Number} [options.resolutionY=Resolution.AUTO_SIZE] - The vertical resolution.
		 * @param {Number} [options.width=Resolution.AUTO_SIZE] - Deprecated. Use resolutionX instead.
		 * @param {Number} [options.height=Resolution.AUTO_SIZE] - Deprecated. Use resolutionY instead.
		 * @param {WebGLRenderTarget} [options.renderTarget] - A custom render target.
		 */
		constructor(
			scene?: Scene,
			camera?: Camera,
			{
				resolutionScale,
				resolutionX,
				resolutionY,
				width,
				height,
				renderTarget
			}?: {
				resolutionScale?: number;
				resolutionX?: number;
				resolutionY?: number;
				width?: number;
				height?: number;
				renderTarget?: WebGLRenderTarget;
			}
		);

		resolution: Resolution;
		/**
		 * The normal texture.
		 *
		 * @type {Texture}
		 */
		get texture(): Texture;
		/**
		 * The normal texture.
		 *
		 * @deprecated Use texture instead.
		 * @return {Texture} The texture.
		 */
		getTexture(): Texture;
		/**
		 * Returns the resolution settings.
		 *
		 * @deprecated Use resolution instead.
		 * @return {Resolution} The resolution.
		 */
		getResolution(): Resolution;
		/**
		 * Returns the current resolution scale.
		 *
		 * @return {Number} The resolution scale.
		 * @deprecated Use resolution.preferredWidth or resolution.preferredHeight instead.
		 */
		getResolutionScale(): number;
		/**
		 * Sets the resolution scale.
		 *
		 * @param {Number} scale - The new resolution scale.
		 * @deprecated Use resolution.preferredWidth or resolution.preferredHeight instead.
		 */
		setResolutionScale(scale: number): void;
		/**
		 * Renders the scene normals.
		 *
		 * @param {WebGLRenderer} renderer - The renderer.
		 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
		 * @param {WebGLRenderTarget} outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
		 * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
		 * @param {Boolean} [stencilTest] - Indicates whether a stencil mask is active.
		 */
		render(
			renderer: WebGLRenderer,
			inputBuffer: WebGLRenderTarget | null,
			outputBuffer: WebGLRenderTarget | null,
			deltaTime?: number,
			stencilTest?: boolean
		): void;

	}

	/**
	 * A shader pass.
	 *
	 * Renders any shader material as a fullscreen effect. This pass should not be used to create multiple chained effects.
	 * For a more efficient solution, please refer to the {@link EffectPass}.
	 */
	export class ShaderPass extends Pass {

		/**
		 * Constructs a new shader pass.
		 *
		 * @param {ShaderMaterial} material - A shader material.
		 * @param {String} [input="inputBuffer"] - The name of the input buffer uniform.
		 */
		constructor(material: ShaderMaterial, input?: string);
		/**
		 * Sets the name of the input buffer uniform.
		 *
		 * Most fullscreen materials modify texels from an input texture. This pass automatically assigns the main input
		 * buffer to the uniform identified by the given name.
		 *
		 * @param {String} input - The name of the input buffer uniform.
		 */
		setInput(input: string): void;
		/**
		 * Renders the effect.
		 * @param renderer - The renderer.
		 * @param inputBuffer - A frame buffer that contains the result of the previous pass.
		 * @param outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
		 * @param [deltaTime] - The time between the last frame and the current one in seconds.
		 * @param [stencilTest] - Indicates whether a stencil mask is active.
		 */
		render(
			renderer: WebGLRenderer,
			inputBuffer: WebGLRenderTarget | null,
			outputBuffer: WebGLRenderTarget | null,
			deltaTime?: number,
			stencilTest?: boolean
		): void;

	}

	/**
	 * The EffectComposer may be used in place of a normal WebGLRenderer.
	 *
	 * The auto clear behaviour of the provided renderer will be disabled to prevent unnecessary clear operations.
	 *
	 * It is common practice to use a {@link RenderPass} as the first pass to automatically clear the buffers and render a
	 * scene for further processing.
	 *
	 * @implements {Resizable}
	 * @implements {Disposable}
	 */
	export class EffectComposer implements Resizable, Disposable {

		/**
		 * Constructs a new effect composer.
		 *
		 * @param {WebGLRenderer} renderer - The renderer that should be used.
		 * @param {Object} [options] - The options.
		 * @param {Boolean} [options.depthBuffer=true] - Whether the main render targets should have a depth buffer.
		 * @param {Boolean} [options.stencilBuffer=false] - Whether the main render targets should have a stencil buffer.
		 * @param {Boolean} [options.alpha] - Deprecated. Buffers are always RGBA since three r137.
		 * @param {Number} [options.multisampling=0] - The number of samples used for multisample antialiasing. Requires WebGL 2.
		 * @param {Number} [options.frameBufferType] - The type of the internal frame buffers. It's recommended to use HalfFloatType if possible.
		 */
		constructor(
			renderer?: WebGLRenderer,
			{
				depthBuffer,
				stencilBuffer,
				multisampling,
				frameBufferType
			}?: {
				depthBuffer?: boolean;
				stencilBuffer?: boolean;
				alpha?: boolean;
				multisampling?: number;
				frameBufferType?: number;
			}
		);

		/**
		 * The input buffer.
		 *
		 * Two identical buffers are used to avoid reading from and writing to the same render target.
		 *
		 * @type {WebGLRenderTarget}
		 */
		inputBuffer: WebGLRenderTarget;
		/**
		 * The output buffer.
		 *
		 * @type {WebGLRenderTarget}
		 */
		outputBuffer: WebGLRenderTarget;
		/**
		 * The passes.
		 *
		 * @type {Pass[]}
		 */
		passes: Pass[];
		/**
		 * Determines whether the last pass automatically renders to screen.
		 *
		 * @type {Boolean}
		 */
		autoRenderToScreen: boolean;
		/**
		 * Sets the amount of MSAA samples.
		 *
		 * Requires WebGL 2. Set to zero to disable multisampling.
		 *
		 * @type {Number}
		 */
		set multisampling(arg: number);
		/**
		 * The current amount of samples used for multisample anti-aliasing.
		 *
		 * @type {Number}
		 */
		get multisampling(): number;
		/**
		 * Returns the internal timer.
		 *
		 * @return {Timer} The timer.
		 */
		getTimer(): Timer;
		/**
		 * Returns the renderer.
		 *
		 * @return {WebGLRenderer} The renderer.
		 */
		getRenderer(): WebGLRenderer;
		/**
		 * Sets the renderer.
		 *
		 * @param {WebGLRenderer} renderer - The renderer.
		 */
		setRenderer(renderer: WebGLRenderer): void;
		/**
		 * Replaces the current renderer with the given one.
		 *
		 * The auto clear mechanism of the provided renderer will be disabled. If the new render size differs from the
		 * previous one, all passes will be updated.
		 *
		 * By default, the DOM element of the current renderer will automatically be removed from its parent node and the DOM
		 * element of the new renderer will take its place.
		 *
		 * @deprecated Use setRenderer instead.
		 * @param {WebGLRenderer} renderer - The new renderer.
		 * @param {Boolean} updateDOM - Indicates whether the old canvas should be replaced by the new one in the DOM.
		 * @return {WebGLRenderer} The old renderer.
		 */
		replaceRenderer(
			renderer: WebGLRenderer,
			updateDOM?: boolean
		): WebGLRenderer;
		/**
		 * Creates a new render target.
		 *
		 * @deprecated Create buffers manually via WebGLRenderTarget instead.
		 * @param {Boolean} depthBuffer - Whether the render target should have a depth buffer.
		 * @param {Boolean} stencilBuffer - Whether the render target should have a stencil buffer.
		 * @param {Number} type - The frame buffer type.
		 * @param {Number} multisampling - The number of samples to use for antialiasing.
		 * @return {WebGLRenderTarget} A new render target that equals the renderer's canvas.
		 */
		createBuffer(
			depthBuffer: boolean,
			stencilBuffer: boolean,
			type: number,
			multisampling: number
		): WebGLRenderTarget;
		/**
		 * Can be used to change the main scene for all registered passes and effects.
		 *
		 * @param {Scene} scene - The scene.
		 */
		setMainScene(scene: Scene): void;
		/**
		 * Can be used to change the main camera for all registered passes and effects.
		 *
		 * @param {Camera} camera - The camera.
		 */
		setMainCamera(camera: Camera): void;
		/**
		 * Adds a pass, optionally at a specific index.
		 *
		 * @param {Pass} pass - A new pass.
		 * @param {Number} [index] - An index at which the pass should be inserted.
		 */
		addPass(pass: Pass, index?: number): void;
		/**
		 * Removes a pass.
		 *
		 * @param {Pass} pass - The pass.
		 */
		removePass(pass: Pass): void;
		/**
		 * Removes all passes.
		 */
		removeAllPasses(): void;
		/**
		 * Renders all enabled passes in the order in which they were added.
		 *
		 * @param {Number} [deltaTime] - The time since the last frame in seconds.
		 */
		render(deltaTime?: number): void;
		/**
		 * Sets the size of the buffers, passes and the renderer.
		 *
		 * @param {Number} width - The width.
		 * @param {Number} height - The height.
		 * @param {Boolean} [updateStyle] - Determines whether the style of the canvas should be updated.
		 */
		setSize(width: number, height: number, updateStyle?: boolean): void;
		/**
		 * Resets this composer by deleting all passes and creating new buffers.
		 */
		reset(): void;
		/**
		 * Disposes this composer and all passes.
		 */
		dispose(): void;

	}

	/**
	 * An override material manager.
	 *
	 * Includes a workaround that fixes override materials for skinned meshes and instancing. Doesn't fix uniforms such as
	 * normal maps and displacement maps. Using the workaround may have a negative impact on performance if the scene
	 * contains a lot of meshes.
	 *
	 * @implements {Disposable}
	 */
	export class OverrideMaterialManager implements Disposable {

		/**
		 * Enables or disables the override material workaround globally.
		 *
		 * This only affects post processing passes and effects.
		 *
		 * @type {Boolean}
		 */
		static set workaroundEnabled(arg: boolean);
		/**
		 * Indicates whether the override material workaround is enabled.
		 *
		 * @type {Boolean}
		 */
		static get workaroundEnabled(): boolean;
		/**
		 * Constructs a new override material manager.
		 *
		 * @param {Material} [material=null] - An override material.
		 */
		constructor(material?: Material);
		/**
		 * Sets the override material.
		 *
		 * @param {Material} material - The material.
		 */
		setMaterial(material: Material): void;
		/**
		 * Performs cleanup tasks.
		 */
		dispose(): void;

	}

	/**
	 * The Resizable contract.
	 *
	 * Implemented by objects that can be resized.
	 *
	 * @interface
	 */
	export interface Resizable {

		/**
		 * Sets the size of this object.
		 *
		 * @param {number} width - The width.
		 * @param {number} height - The height.
		 */
		setSize(width: number, height: number): void;

	}

	/**
	 * A timer that provides read access to time data.
	 *
	 * @interface
	 */
	export interface ImmutableTimer {

		/**
		* The current delta time in seconds.
		*
		* @type {Number}
		*/
		get delta(): number;
		/**
		* The fixed delta time in seconds.
		*
		* @type {Number}
		*/
		get fixedDelta(): number;
		/**
		* The elapsed time in seconds.
		*
		* @type {Number}
		*/
		get elapsed(): number;

	}

	/**
	 * An object selection.
	 *
	 * Object selections use render layers to facilitate quick and efficient visibility changes.
	 */
	export class Selection extends Set<Object3D> {

		/**
		 * Constructs a new selection.
		 *
		 * @param {Iterable<Object3D>} [iterable] - A collection of objects that should be added to this selection.
		 * @param {Number} [layer=10] - A dedicated render layer for selected objects.
		 */
		constructor(iterable?: Iterable<Object3D>, layer?: number);
		/**
		 * Controls whether objects that are added to this selection should be removed from all other layers.
		 *
		 * @type {Boolean}
		 */
		exclusive: boolean;
		set layer(arg: number);
		/**
		 * The render layer for selected objects.
		 *
		 * @type {Number}
		 */
		get layer(): number;
		/**
		 * Returns the current render layer for selected objects.
		 *
		 * The default layer is 10. If this collides with your own custom layers, please change it before rendering!
		 *
		 * @deprecated Use layer instead.
		 * @return {Number} The layer.
		 */
		getLayer(): number;
		/**
		 * Sets the render layer for selected objects.
		 *
		 * The current selection will be updated accordingly.
		 *
		 * @deprecated Use layer instead.
		 * @param {Number} value - The layer. Range is [0, 31].
		 */
		setLayer(value: number): void;
		/**
		 * Indicates whether objects that are added to this selection will be removed from all other layers.
		 *
		 * @deprecated Use exclusive instead.
		 * @return {Number} Whether this selection is exclusive. Default is false.
		 */
		isExclusive(): number;
		/**
		 * Controls whether objects that are added to this selection should be removed from all other layers.
		 *
		 * @deprecated Use exclusive instead.
		 * @param {Number} value - Whether this selection should be exclusive.
		 */
		setExclusive(value: number): void;
		/**
		 * Clears this selection.
		 *
		 * @return {Selection} This selection.
		 */
		clear(): this;
		/**
		 * Clears this selection and adds the given objects.
		 *
		 * @param {Iterable<Object3D>} objects - The objects that should be selected.
		 * @return {Selection} This selection.
		 */
		set(objects: Iterable<Object3D>): this;
		/**
		 * An alias for {@link has}.
		 *
		 * @param {Object3D} object - An object.
		 * @return {Number} Returns 0 if the given object is currently selected, or -1 otherwise.
		 * @deprecated Added for backward-compatibility.
		 */
		indexOf(object: Object3D): number;
		/**
		 * Adds an object to this selection.
		 *
		 * If {@link exclusive} is set to `true`, the object will also be removed from all other layers.
		 *
		 * @param {Object3D} object - The object that should be selected.
		 * @return {Selection} This selection.
		 */
		add(object: Object3D): this;
		/**
		 * Removes an existing object from the selection. If the object doesn't exist it's added instead.
		 *
		 * @param {Object3D} object - The object.
		 * @return {Boolean} Returns true if the object is added, false otherwise.
		 */
		toggle(object: Object3D): boolean;
		/**
		 * Sets the visibility of all selected objects.
		 *
		 * This method enables or disables render layer 0 of all selected objects.
		 *
		 * @param {Boolean} visible - Whether the selected objects should be visible.
		 * @return {Selection} This selection.
		 */
		setVisible(visible: boolean): this;

	}

	/**
	 * A timer.
	 *
	 * Original implementation by Michael Herzog (Mugen87).
	 *
	 * @experimental Temporary substitute for {@link https://github.com/mrdoob/three.js/pull/17912}
	 * @implements {Disposable}
	 * @implements {EventListenerObject}
	 */
	export class Timer implements ImmutableTimer, Disposable, EventListenerObject {
		handleEvent(object: Event): void;

		/**
		 * The current delta time in seconds.
		 */
		get delta(): number;
		/**
		 * The fixed delta time in seconds.
		 */
		get fixedDelta(): number;
		set fixedDelta(value: number);
		/**
		 * The elapsed time in seconds.
		 */
		get elapsed(): number;
		/**
		 * Determines whether this timer should use a fixed time step.
		 */
		useFixedDelta: boolean;
		/**
		 * The timescale.
		 */
		timescale: number;
		/**
		 * Enables or disables auto reset based on page visibility.
		 *
		 * If enabled, the timer will be reset when the page becomes visible. This effectively pauses the timer when the page
		 * is hidden. Has no effect if the API is not supported.
		 *
		 * @see https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API
		 */
		get autoReset(): boolean;
		set autoReset(value: boolean);
		/**
		 * Updates this timer.
		 *
		 * @param {Number} [timestamp] - The current time in milliseconds.
		 */
		update(timestamp?: number): void;
		/**
		 * Resets this timer.
		 *
		 * @return {Timer} This timer.
		 */
		reset(): Timer;
		/**
		 * Disposes this timer.
		 */
		dispose(): void;

	}

	export type BloomEffectOptions = {
		blendFunction?: BlendFunction;
		luminanceThreshold?: number;
		luminanceSmoothing?: number;
		mipmapBlur?: boolean;
		intensity?: number;
		radius?: number;
		levels?: number;
		kernelSize?: KernelSize;
		resolutionScale?: number;
		width?: number;
		height?: number;
		resolutionX?: number;
		resolutionY?: number;
	};

	/**
	 * A bloom effect.
	 */
	export class BloomEffect extends Effect {

		/**
		 * Constructs a new bloom effect.
		 *
		 * @param {Object} [options] - The options.
		 * @param {BlendFunction} [options.blendFunction=BlendFunction.SCREEN] - The blend function of this effect.
		 * @param {Number} [options.luminanceThreshold=0.9] - The luminance threshold. Raise this value to mask out darker elements in the scene.
		 * @param {Number} [options.luminanceSmoothing=0.025] - Controls the smoothness of the luminance threshold.
		 * @param {Boolean} [options.mipmapBlur=false] - Enables or disables mipmap blur.
		 * @param {Number} [options.intensity=1.0] - The bloom intensity.
		 * @param {Number} [options.radius=0.85] - The blur radius. Only applies to mipmap blur.
		 * @param {Number} [options.levels=8] - The amount of MIP levels. Only applies to mipmap blur.
		 * @param {KernelSize} [options.kernelSize=KernelSize.LARGE] - Deprecated. Use mipmapBlur instead.
		 * @param {Number} [options.resolutionScale=0.5] - Deprecated. Use mipmapBlur instead.
		 * @param {Number} [options.resolutionX=Resolution.AUTO_SIZE] - Deprecated. Use mipmapBlur instead.
		 * @param {Number} [options.resolutionY=Resolution.AUTO_SIZE] - Deprecated. Use mipmapBlur instead.
		 * @param {Number} [options.width=Resolution.AUTO_SIZE] - Deprecated. Use mipmapBlur instead.
		 * @param {Number} [options.height=Resolution.AUTO_SIZE] - Deprecated. Use mipmapBlur instead.
		 */
		constructor({
			blendFunction,
			luminanceThreshold,
			luminanceSmoothing,
			mipmapBlur,
			intensity,
			radius,
			levels,
			kernelSize,
			resolutionScale,
			width,
			height,
			resolutionX,
			resolutionY
		}?: BloomEffectOptions);

		/**
		 * A luminance shader pass.
		 *
		 * This pass can be disabled to skip luminance filtering.
		 *
		 * @type {LuminancePass}
		 */
		luminancePass: LuminancePass;
		/**
		 * A blur pass.
		 *
		 * @type {KawaseBlurPass}
		 */
		blurPass: KawaseBlurPass;
		/**
		 * A texture that contains the intermediate result of this effect.
		 *
		 * @type {Texture}
		 */
		get texture(): Texture;
		/**
		 * Returns the generated bloom texture.
		 *
		 * @deprecated Use texture instead.
		 * @return {Texture} The texture.
		 */
		getTexture(): Texture;
		/**
		 * The resolution of this effect.
		 *
		 * @type {Resolution}
		 */
		get resolution(): Resolution;
		/**
		 * Returns the resolution settings.
		 *
		 * @deprecated Use resolution instead.
		 * @return {Resolution} The resolution.
		 */
		getResolution(): Resolution;
		/**
		 * Returns the blur pass.
		 *
		 * @deprecated Use blurPass instead.
		 * @return {KawaseBlurPass} The blur pass.
		 */
		getBlurPass(): KawaseBlurPass;
		/**
		 * Returns the luminance pass.
		 *
		 * @deprecated Use luminancePass instead.
		 * @return {LuminancePass} The luminance pass.
		 */
		getLuminancePass(): LuminancePass;
		/**
		 * The luminance material.
		 *
		 * @type {LuminanceMaterial}
		 */
		get luminanceMaterial(): LuminanceMaterial;
		/**
		 * Returns the luminance material.
		 *
		 * @deprecated Use luminanceMaterial instead.
		 * @return {LuminanceMaterial} The material.
		 */
		getLuminanceMaterial(): LuminanceMaterial;
		set width(arg: number);
		/**
		 * The current width of the internal render targets.
		 *
		 * @type {Number}
		 * @deprecated Use resolution.width instead.
		 */
		get width(): number;
		set height(arg: number);
		/**
		 * The current height of the internal render targets.
		 *
		 * @type {Number}
		 * @deprecated Use resolution.height instead.
		 */
		get height(): number;
		set dithering(arg: boolean);
		/**
		 * Indicates whether dithering is enabled.
		 *
		 * @type {Boolean}
		 * @deprecated Use EffectPass.fullscreenMaterial.dithering instead.
		 */
		get dithering(): boolean;
		set kernelSize(arg: KernelSize);
		/**
		 * The blur kernel size.
		 *
		 * @type {KernelSize}
		 * @deprecated Use blurPass.kernelSize instead.
		 */
		get kernelSize(): KernelSize;
		set distinction(arg: number);
		/**
		 * @type {Number}
		 * @deprecated Use luminanceMaterial instead.
		 */
		get distinction(): number;
		set intensity(arg: number);
		/**
		 * The bloom intensity.
		 *
		 * @type {Number}
		 */
		get intensity(): number;
		/**
		 * The bloom intensity.
		 *
		 * @deprecated Use intensity instead.
		 * @return {Number} The intensity.
		 */
		getIntensity(): number;
		/**
		 * Sets the bloom intensity.
		 *
		 * @deprecated Use intensity instead.
		 * @param {Number} value - The intensity.
		 */
		setIntensity(value: number): void;
		/**
		 * Returns the current resolution scale.
		 *
		 * @return {Number} The resolution scale.
		 * @deprecated Use resolution instead.
		 */
		getResolutionScale(): number;
		/**
		 * Sets the resolution scale.
		 *
		 * @param {Number} scale - The new resolution scale.
		 * @deprecated Use resolution instead.
		 */
		setResolutionScale(scale: number): void;
		/**
		 * Updates this effect.
		 *
		 * @param {WebGLRenderer} renderer - The renderer.
		 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
		 * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
		 */
		update(
			renderer: WebGLRenderer,
			inputBuffer: WebGLRenderTarget,
			deltaTime?: number
		): void;

		/**
		 * Updates the size of internal render targets.
		 *
		 * @param {Number} width - The width.
		 * @param {Number} height - The height.
		 */
		setSize(width: number, height: number): void;
		/**
		 * Performs initialization tasks.
		 *
		 * @param {WebGLRenderer} renderer - The renderer.
		 * @param {Boolean} alpha - Whether the renderer uses the alpha channel or not.
		 * @param {Number} frameBufferType - The type of the main frame buffers.
		 */
		initialize(
			renderer: WebGLRenderer,
			alpha: boolean,
			frameBufferType: number
		): void;

	}

	/**
	 * A depth of field (bokeh) effect.
	 *
	 * Original shader code by Martins Upitis:
	 *	http://artmartinsh.blogspot.com/2010/02/glsl-lens-blur-filter-with-bokeh.html
	 *
	 * @deprecated Use DepthOfFieldEffect instead.
	 */
	export class BokehEffect extends Effect {

		/**
		 * Constructs a new bokeh effect.
		 *
		 * @param {Object} [options] - The options.
		 * @param {BlendFunction} [options.blendFunction=BlendFunction.NORMAL] - The blend function of this effect.
		 * @param {Number} [options.focus=0.5] - The focus distance ratio, ranging from 0.0 to 1.0.
		 * @param {Number} [options.dof=0.02] - Depth of field. An area in front of and behind the focal point that still appears sharp.
		 * @param {Number} [options.aperture=0.015] - Camera aperture scale. Bigger values for stronger blur and shallower depth of field.
		 * @param {Number} [options.maxBlur=1.0] - The maximum blur strength.
		 */
		constructor({
			blendFunction,
			focus,
			dof,
			aperture,
			maxBlur
		}?: {
			blendFunction?: BlendFunction;
			focus?: number;
			dof?: number;
			aperture?: number;
			maxBlur?: number;
		});

	}

	/**
	 * A brightness/contrast effect.
	 *
	 * Reference: https://github.com/evanw/glfx.js
	 */
	export class BrightnessContrastEffect extends Effect {

		/**
		 * Constructs a new brightness/contrast effect.
		 *
		 * @param {Object} [options] - The options.
		 * @param {BlendFunction} [options.blendFunction=BlendFunction.NORMAL] - The blend function of this effect.
		 * @param {Number} [options.brightness=0.0] - The brightness factor, ranging from -1 to 1, where 0 means no change.
		 * @param {Number} [options.contrast=0.0] - The contrast factor, ranging from -1 to 1, where 0 means no change.
		 */
		constructor({
			blendFunction,
			brightness,
			contrast
		}?: {
			blendFunction?: BlendFunction;
			brightness?: number;
			contrast?: number;
		});

		set brightness(arg: number);
		/**
		 * The brightness.
		 *
		 * @type {Number}
		 */
		get brightness(): number;
		/**
		 * Returns the brightness.
		 *
		 * @deprecated Use brightness instead.
		 * @return {Number} The brightness.
		 */
		getBrightness(): number;
		/**
		 * Sets the brightness.
		 *
		 * @deprecated Use brightness instead.
		 * @param {Number} value - The brightness.
		 */
		setBrightness(value: number): void;
		set contrast(arg: number);
		/**
		 * The contrast.
		 *
		 * @type {Number}
		 */
		get contrast(): number;
		/**
		 * Returns the contrast.
		 *
		 * @deprecated Use contrast instead.
		 * @return {Number} The contrast.
		 */
		getContrast(): number;
		/**
		 * Sets the contrast.
		 *
		 * @deprecated Use contrast instead.
		 * @param {Number} value - The contrast.
		 */
		setContrast(value: number): void;

	}

	/**
	 * A chromatic aberration effect.
	 */
	export class ChromaticAberrationEffect extends Effect {

		/**
		 * Constructs a new chromatic aberration effect.
		 *
		 * @param {Object} [options] - The options.
		 * @param {BlendFunction} [options.blendFunction=BlendFunction.NORMAL] - The blend function of this effect.
		 * @param {Vector2} [options.offset] - The color offset.
		 * @param {Boolean} [options.radialModulation=false] - Whether the effect should be modulated with a radial gradient.
		 * @param {Number} [options.modulationOffset=0.15] - The modulation offset. Only applies if `radialModulation` is enabled.
		 */
		constructor({
			blendFunction,
			offset,
			radialModulation,
			modulationOffset
		}?: {
			blendFunction?: BlendFunction;
			offset?: Vector2;
			radialModulation: boolean,
			modulationOffset: number
		});

		set offset(arg: Vector2);
		/**
		 * The color offset.
		 *
		 * @type {Vector2}
		 */
		get offset(): Vector2;
		/**
		 * Indicates whether radial modulation is enabled.
		 *
		 * When enabled, the effect will be weaker in the middle and stronger towards the screen edges.
		 *
		 * @type {Boolean}
		 */
		get radialModulation(): boolean;
		set radialModulation(arg: boolean);
		/**
		 * The modulation offset.
		 *
		 * @type {Number}
		 */
		get modulationOffset(): number;
		set modulationOffset(arg: number);
		/**
		 * Returns the color offset vector.
		 *
		 * @deprecated Use offset instead.
		 * @return {Vector2} The offset.
		 */
		getOffset(): Vector2;
		/**
		 * Sets the color offset vector.
		 *
		 * @deprecated Use offset instead.
		 * @param {Vector2} value - The offset.
		 */
		setOffset(value: Vector2): void;

	}

	/**
	 * A fast greyscale effect.
	 */
	export class ColorAverageEffect extends Effect {

		/**
		 * Constructs a new color average effect.
		 *
		 * @param {BlendFunction} [blendFunction=BlendFunction.NORMAL] - The blend function of this effect.
		 */
		constructor(blendFunction?: BlendFunction);

	}

	/**
	 * A color depth effect.
	 *
	 * Simulates a hardware limitation to achieve a retro feel. The real color depth will not be altered by this effect.
	 */
	export class ColorDepthEffect extends Effect {

		/**
		 * Constructs a new color depth effect.
		 *
		 * @param {Object} [options] - The options.
		 * @param {BlendFunction} [options.blendFunction=BlendFunction.NORMAL] - The blend function of this effect.
		 * @param {Number} [options.bits=16] - The color bit depth.
		 */
		constructor({
			blendFunction,
			bits
		}?: {
			blendFunction?: BlendFunction;
			bits?: number;
		});

		set bitDepth(arg: number);
		/**
		 * The virtual amount of color bits.
		 *
		 * Each color channel effectively uses a fourth of the total amount of bits. Alpha remains unaffected.
		 *
		 * @type {Number}
		 */
		get bitDepth(): number;
		/**
		 * Returns the current color bit depth.
		 *
		 * @return {Number} The bit depth.
		 */
		getBitDepth(): number;
		/**
		 * Sets the virtual amount of color bits.
		 *
		 * @param {Number} value - The bit depth.
		 */
		setBitDepth(value: number): void;

	}

	/**
	 * A depth visualization effect.
	 *
	 * Useful for debugging.
	 */
	export class DepthEffect extends Effect {

		/**
		 * Constructs a new depth effect.
		 *
		 * @param {Object} [options] - The options.
		 * @param {BlendFunction} [options.blendFunction=BlendFunction.NORMAL] - The blend function of this effect.
		 * @param {Boolean} [options.inverted=false] - Whether the depth should be inverted.
		 */
		constructor({
			blendFunction,
			inverted
		}?: {
			blendFunction?: BlendFunction;
			inverted?: boolean;
		});

		set inverted(arg: boolean);
		/**
		 * Indicates whether depth should be inverted.
		 *
		 * @type {Boolean}
		 */
		get inverted(): boolean;
		/**
		 * Indicates whether the rendered depth is inverted.
		 *
		 * @deprecated Use inverted instead.
		 * @return {Boolean} Whether the rendered depth is inverted.
		 */
		isInverted(): boolean;
		/**
		 * Enables or disables depth inversion.
		 *
		 * @deprecated Use inverted instead.
		 * @param {Boolean} value - Whether depth should be inverted.
		 */
		setInverted(value: boolean): void;

	}

	/**
	 * A depth of field effect.
	 *
	 * Based on a graphics study by Adrian Courrèges and an article by Steve Avery:
	 *	https://www.adriancourreges.com/blog/2016/09/09/doom-2016-graphics-study/
	 *	https://pixelmischiefblog.wordpress.com/2016/11/25/bokeh-depth-of-field/
	 */
	export class DepthOfFieldEffect extends Effect {

		/**
		 * Constructs a new depth of field effect.
		 *
		 * @param {Camera} camera - The main camera.
		 * @param {Object} [options] - The options.
		 * @param {BlendFunction} [options.blendFunction=BlendFunction.NORMAL] - The blend function of this effect.
		 * @param {Number} [options.worldFocusDistance] - The focus distance in world units.
		 * @param {Number} [options.worldFocusRange] - The focus distance in world units.
		 * @param {Number} [options.focusDistance=0.0] - The normalized focus distance. Range is [0.0, 1.0].
		 * @param {Number} [options.focalLength=0.1] - The focal length. Range is [0.0, 1.0].
		 * @param {Number} [options.focusRange=0.1] - The focus range. Range is [0.0, 1.0].
		 * @param {Number} [options.focalLength=0.1] - Deprecated.
		 * @param {Number} [options.bokehScale=1.0] - The scale of the bokeh blur.
		 * @param {Number} [options.resolutionScale=1.0] - The resolution scale.
		 * @param {Number} [options.resolutionX=Resolution.AUTO_SIZE] - The horizontal resolution.
		 * @param {Number} [options.resolutionY=Resolution.AUTO_SIZE] - The vertical resolution.
		 * @param {Number} [options.width=Resolution.AUTO_SIZE] - Deprecated. Use resolutionX instead.
		 * @param {Number} [options.height=Resolution.AUTO_SIZE] - Deprecated. Use resolutionY instead.
		 */
		constructor(
			camera?: Camera,
			{
				blendFunction,
				worldFocusDistance,
				worldFocusRange,
				focusDistance,
				focalLength,
				focusRange,
				bokehScale,
				resolutionScale,
				resolutionX,
				resolutionY,
				width,
				height
			}?: {
				blendFunction?: BlendFunction;
				worldFocusDistance?: number;
				worldFocusRange?: number;
				focusDistance?: number;
				focalLength?: number;
				focusRange?: number;
				bokehScale?: number;
				resolutionScale?: number;
				resolutionX?: number;
				resolutionY?: number;
				width?: number;
				height?: number;
			}
		);

		/**
		 * This pass blurs the foreground CoC buffer to soften edges.
		 *
		 * @type {KawaseBlurPass}
		 */
		readonly blurPass: KawaseBlurPass;
		/**
		 * A target position that should be kept in focus. Set to `null` to disable auto focus.
		 *
		 * @type {Vector3}
		 */
		target: Vector3;
		set bokehScale(arg: number);
		/**
		 * The current bokeh scale.
		 *
		 * @type {Number}
		 */
		get bokehScale(): number;
		/**
		 * The circle of confusion texture.
		 *
		 * @type {Texture}
		 */
		get cocTexture(): Texture;
		/**
		 * The mask function. Default is `MULTIPLY_RGB`.
		 *
		 * @type {MaskFunction}
		 */
		get maskFunction(): MaskFunction;
		set maskFunction(arg: MaskFunction);
		/**
		 * The circle of confusion material.
		 *
		 * @type {CircleOfConfusionMaterial}
		 */
		get cocMaterial(): CircleOfConfusionMaterial;
		/**
		 * The circle of confusion material.
		 *
		 * @deprecated Use cocMaterial instead.
		 * @type {CircleOfConfusionMaterial}
		 */
		get circleOfConfusionMaterial(): CircleOfConfusionMaterial;
		/**
		 * Returns the circle of confusion material.
		 *
		 * @deprecated Use cocMaterial instead.
		 * @return {CircleOfConfusionMaterial} The material.
		 */
		getCircleOfConfusionMaterial(): CircleOfConfusionMaterial;
		/**
		 * Returns the pass that blurs the foreground CoC buffer to soften edges.
		 *
		 * @deprecated Use blurPass instead.
		 * @return {KawaseBlurPass} The blur pass.
		 */
		getBlurPass(): KawaseBlurPass;
		/**
		 * The resolution of this effect.
		 *
		 * @type {Resolution}
		 */
		get resolution(): Resolution;
		/**
		 * Returns the resolution settings.
		 *
		 * @deprecated Use resolution instead.
		 * @return {Resolution} The resolution.
		 */
		getResolution(): Resolution;
		/**
		 * Returns the current bokeh scale.
		 *
		 * @deprecated Use bokehScale instead.
		 * @return {Number} The scale.
		 */
		getBokehScale(): number;
		/**
		 * Sets the bokeh scale.
		 *
		 * @deprecated Use bokehScale instead.
		 * @param {Number} value - The scale.
		 */
		setBokehScale(value: number): void;
		/**
		 * Returns the current auto focus target.
		 *
		 * @deprecated Use target instead.
		 * @return {Vector3} The target.
		 */
		getTarget(): Vector3;
		/**
		 * Sets the auto focus target.
		 *
		 * @deprecated Use target instead.
		 * @param {Vector3} value - The target.
		 */
		setTarget(value: Vector3): void;
		/**
		 * Calculates the focus distance from the camera to the given position.
		 *
		 * @param {Vector3} target - The target.
		 * @return {Number} The normalized focus distance.
		 */
		calculateFocusDistance(target: Vector3): number;
		/**
		 * Updates this effect.
		 *
		 * @param {WebGLRenderer} renderer - The renderer.
		 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
		 * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
		 */
		update(
			renderer: WebGLRenderer,
			inputBuffer: WebGLRenderTarget,
			deltaTime?: number
		): void;

		/**
		 * Updates the size of internal render targets.
		 *
		 * @param {Number} width - The width.
		 * @param {Number} height - The height.
		 */
		setSize(width: number, height: number): void;
		/**
		 * Performs initialization tasks.
		 *
		 * @param {WebGLRenderer} renderer - The renderer.
		 * @param {Boolean} alpha - Whether the renderer uses the alpha channel or not.
		 * @param {Number} frameBufferType - The type of the main frame buffers.
		 */
		initialize(
			renderer: WebGLRenderer,
			alpha: boolean,
			frameBufferType: number
		): void;

	}

	/**
	 * A dot screen effect.
	 */
	export class DotScreenEffect extends Effect {

		/**
		 * Constructs a new dot screen effect.
		 *
		 * @param {Object} [options] - The options.
		 * @param {BlendFunction} [options.blendFunction=BlendFunction.NORMAL] - The blend function of this effect.
		 * @param {Number} [options.angle=1.57] - The angle of the dot pattern.
		 * @param {Number} [options.scale=1.0] - The scale of the dot pattern.
		 */
		constructor({
			blendFunction,
			angle,
			scale
		}?: {
			blendFunction?: BlendFunction;
			angle?: number;
			scale?: number;
		});

		set angle(arg: number);
		/**
		 * The angle.
		 *
		 * @type {Number}
		 */
		get angle(): number;
		/**
		 * Returns the pattern angle.
		 *
		 * @deprecated Use angle instead.
		 * @return {Number} The angle in radians.
		 */
		getAngle(): number;
		/**
		 * Sets the pattern angle.
		 *
		 * @deprecated Use angle instead.
		 * @param {Number} value - The angle in radians.
		 */
		setAngle(value: number): void;
		set scale(arg: number);
		/**
		 * The scale.
		 *
		 * @type {Number}
		 */
		get scale(): number;

	}

	/**
	 * A gamma correction effect.
	 *
	 * @deprecated Set WebGLRenderer.outputEncoding to sRGBEncoding instead.
	 */
	export class GammaCorrectionEffect extends Effect {

		/**
		 * Constructs a new gamma correction effect.
		 *
		 * @param {Object} [options] - The options.
		 * @param {BlendFunction} [options.blendFunction=BlendFunction.NORMAL] - The blend function of this effect.
		 * @param {Number} [options.gamma=2.0] - The gamma factor.
		 */
		constructor({
			blendFunction,
			gamma
		}?: {
			blendFunction?: BlendFunction;
			gamma?: number;
		});

	}

	/**
	 * A tilt shift effect.
	 */
	export class TiltShiftEffect extends Effect {

		/**
		 * Constructs a new tilt shift Effect
		 *
		 * @param {Object} [options] - The options.
		 * @param {BlendFunction} [options.blendFunction] - The blend function of this effect.
		 * @param {Number} [options.offset=0.0] - The relative offset of the focus area.
		 * @param {Number} [options.rotation=0.0] - The rotation of the focus area in radians.
		 * @param {Number} [options.focusArea=0.4] - The relative size of the focus area.
		 * @param {Number} [options.feather=0.3] - The softness of the focus area edges.
		 * @param {Number} [options.bias=0.06] - Deprecated.
		 * @param {KernelSize} [options.kernelSize=KernelSize.MEDIUM] - The blur kernel size.
		 * @param {Number} [options.resolutionScale=0.5] - The resolution scale.
		 * @param {Number} [options.resolutionX=Resolution.AUTO_SIZE] - The horizontal resolution.
		 * @param {Number} [options.resolutionY=Resolution.AUTO_SIZE] - The vertical resolution.
		 */
		constructor({
			blendFunction,
			offset,
			rotation,
			focusArea,
			feather,
			bias,
			kernelSize,
			resolutionScale,
			resolutionX,
			resolutionY
		}?: {
			blendFunction?: BlendFunction,
			offset?: number,
			rotation?: number,
			focusArea?: number,
			feather?: number,
			bias?: number,
			kernelSize?: KernelSize,
			resolutionScale?: number,
			resolutionX?: number,
			resolutionY?: number
		});

		/**
		 * A blur pass.
		 *
		 * @type {KawaseBlurPass}
		 */
		readonly blurPass: KawaseBlurPass;
		/**
		 * The resolution.
		 *
		 * @type {Resolution}
		 * @readonly
		 */
		get resolution(): Resolution;
		/**
		 * The rotation of the focus area in radians.
		 *
		 * @type {Number}
		 */
		get rotation(): number;
		set rotation(arg: number);
		/**
		 * The relative offset of the focus area.
		 *
		 * @type {Number}
		 */
		get offset(): number;
		set offset(arg: number);
		/**
		 * The relative size of the focus area.
		 *
		 * @type {Number}
		 */

		get focusArea(): number;
		set focusArea(arg: number);
		/**
		 * The softness of the focus area edges.
		 *
		 * @type {Number}
		 */
		get feather(): number;
		set feather(arg: number);
		/**
		 * A blend bias.
		 *
		 * @type {Number}
		 * @deprecated
		 */
		get bias(): number;
		set bias(arg: number);
	}

	/**
	 * A glitch effect.
	 *
	 * This effect can be used in conjunction with the {@link ChromaticAberrationEffect}.
	 *
	 * Reference: https://github.com/staffantan/unityglitch
	 */
	export class GlitchEffect extends Effect {

		/**
		 * Constructs a new glitch effect.
		 *
		 * TODO Change ratio to 0.15.
		 * @param {Object} [options] - The options.
		 * @param {BlendFunction} [options.blendFunction=BlendFunction.NORMAL] - The blend function of this effect.
		 * @param {Vector2} [options.chromaticAberrationOffset] - A chromatic aberration offset. If provided, the glitch effect will influence this offset.
		 * @param {Vector2} [options.delay] - The minimum and maximum delay between glitch activations in seconds.
		 * @param {Vector2} [options.duration] - The minimum and maximum duration of a glitch in seconds.
		 * @param {Vector2} [options.strength] - The strength of weak and strong glitches.
		 * @param {Texture} [options.perturbationMap] - A perturbation map. If none is provided, a noise texture will be created.
		 * @param {Number} [options.dtSize=64] - The size of the generated noise map. Will be ignored if a perturbation map is provided.
		 * @param {Number} [options.columns=0.05] - The scale of the blocky glitch columns.
		 * @param {Number} [options.ratio=0.85] - The threshold for strong glitches.
		 */
		constructor({
			blendFunction,
			chromaticAberrationOffset,
			delay,
			duration,
			strength,
			columns,
			ratio,
			perturbationMap,
			dtSize
		}?: {
			blendFunction?: BlendFunction;
			chromaticAberrationOffset?: Vector2;
			delay?: Vector2;
			duration?: Vector2;
			strength?: Vector2;
			perturbationMap?: Texture;
			dtSize?: number;
			columns?: number;
			ratio?: number;
		});

		set perturbationMap(arg: Texture);
		/**
		 * The perturbation map.
		 *
		 * @type {Texture}
		 */
		get perturbationMap(): Texture;
		/**
		 * The minimum and maximum delay between glitch activations in seconds.
		 *
		 * @type {Vector2}
		 * @deprecated Use minDelay and maxDelay instead.
		 */
		delay: Vector2;
		/**
		 * The minimum and maximum duration of a glitch in seconds.
		 *
		 * @type {Vector2}
		 * @deprecated Use minDuration and maxDuration instead.
		 */
		duration: Vector2;
		/**
		 * The strength of weak and strong glitches.
		 *
		 * @type {Vector2}
		 * @deprecated Use minStrength and maxStrength instead.
		 */
		strength: Vector2;
		/**
		 * The effect mode.
		 *
		 * @type {GlitchMode}
		 */
		mode: GlitchMode;
		/**
		 * The ratio between weak (0.0) and strong (1.0) glitches. Range is [0.0, 1.0].
		 *
		 * This value is currently being treated as a threshold for strong glitches, i.e. it's inverted.
		 *
		 * TODO Resolve inversion.
		 * @type {Number}
		 */
		ratio: number;
		/**
		 * The chromatic aberration offset.
		 *
		 * @type {Vector2}
		 */
		chromaticAberrationOffset: Vector2;
		/**
		 * Indicates whether the glitch effect is currently active.
		 *
		 * @type {Boolean}
		 */
		get active(): boolean;
		/**
		 * Indicates whether the glitch effect is currently active.
		 *
		 * @deprecated Use active instead.
		 * @return {Boolean} Whether the glitch effect is active.
		 */
		isActive(): boolean;
		set minDelay(arg: number);
		/**
		 * The minimum delay between glitch activations.
		 *
		 * @type {Number}
		 */
		get minDelay(): number;
		/**
		 * Returns the minimum delay between glitch activations.
		 *
		 * @deprecated Use minDelay instead.
		 * @return {Number} The minimum delay in seconds.
		 */
		getMinDelay(): number;
		/**
		 * Sets the minimum delay between glitch activations.
		 *
		 * @deprecated Use minDelay instead.
		 * @param {Number} value - The minimum delay in seconds.
		 */
		setMinDelay(value: number): void;
		set maxDelay(arg: number);
		/**
		 * The maximum delay between glitch activations.
		 *
		 * @type {Number}
		 */
		get maxDelay(): number;
		/**
		 * Returns the maximum delay between glitch activations.
		 *
		 * @deprecated Use maxDelay instead.
		 * @return {Number} The maximum delay in seconds.
		 */
		getMaxDelay(): number;
		/**
		 * Sets the maximum delay between glitch activations.
		 *
		 * @deprecated Use maxDelay instead.
		 * @param {Number} value - The maximum delay in seconds.
		 */
		setMaxDelay(value: number): void;
		set minDuration(arg: number);
		/**
		 * The minimum duration of sporadic glitches.
		 *
		 * @type {Number}
		 */
		get minDuration(): number;
		/**
		 * Returns the minimum duration of sporadic glitches.
		 *
		 * @deprecated Use minDuration instead.
		 * @return {Number} The minimum duration in seconds.
		 */
		getMinDuration(): number;
		/**
		 * Sets the minimum duration of sporadic glitches.
		 *
		 * @deprecated Use minDuration instead.
		 * @param {Number} value - The minimum duration in seconds.
		 */
		setMinDuration(value: number): void;
		set maxDuration(arg: number);
		/**
		 * The maximum duration of sporadic glitches.
		 *
		 * @type {Number}
		 */
		get maxDuration(): number;
		/**
		 * Returns the maximum duration of sporadic glitches.
		 *
		 * @deprecated Use maxDuration instead.
		 * @return {Number} The maximum duration in seconds.
		 */
		getMaxDuration(): number;
		/**
		 * Sets the maximum duration of sporadic glitches.
		 *
		 * @deprecated Use maxDuration instead.
		 * @param {Number} value - The maximum duration in seconds.
		 */
		setMaxDuration(value: number): void;
		set minStrength(arg: number);
		/**
		 * The strength of weak glitches.
		 *
		 * @type {Number}
		 */
		get minStrength(): number;
		/**
		 * Returns the strength of weak glitches.
		 *
		 * @deprecated Use minStrength instead.
		 * @return {Number} The strength.
		 */
		getMinStrength(): number;
		/**
		 * Sets the strength of weak glitches.
		 *
		 * @deprecated Use minStrength instead.
		 * @param {Number} value - The strength.
		 */
		setMinStrength(value: number): void;
		set maxStrength(arg: number);
		/**
		 * The strength of strong glitches.
		 *
		 * @type {Number}
		 */
		get maxStrength(): number;
		/**
		 * Returns the strength of strong glitches.
		 *
		 * @deprecated Use maxStrength instead.
		 * @return {Number} The strength.
		 */
		getMaxStrength(): number;
		/**
		 * Sets the strength of strong glitches.
		 *
		 * @deprecated Use maxStrength instead.
		 * @param {Number} value - The strength.
		 */
		setMaxStrength(value: number): void;
		/**
		 * Returns the current glitch mode.
		 *
		 * @deprecated Use mode instead.
		 * @return {GlitchMode} The mode.
		 */
		getMode(): GlitchMode;
		/**
		 * Sets the current glitch mode.
		 *
		 * @deprecated Use mode instead.
		 * @param {GlitchMode} value - The mode.
		 */
		setMode(value: GlitchMode): void;
		/**
		 * Returns the glitch ratio.
		 *
		 * @deprecated Use ratio instead.
		 * @return {Number} The ratio.
		 */
		getGlitchRatio(): number;
		/**
		 * Sets the ratio of weak (0.0) and strong (1.0) glitches.
		 *
		 * @deprecated Use ratio instead.
		 * @param {Number} value - The ratio. Range is [0.0, 1.0].
		 */
		setGlitchRatio(value: number): void;
		set columns(arg: number);
		/**
		 * The glitch column size.
		 *
		 * @type {Number}
		 */
		get columns(): number;
		/**
		 * Returns the glitch column size.
		 *
		 * @deprecated Use columns instead.
		 * @return {Number} The glitch column size.
		 */
		getGlitchColumns(): number;
		/**
		 * Sets the glitch column size.
		 *
		 * @deprecated Use columns instead.
		 * @param {Number} value - The glitch column size.
		 */
		setGlitchColumns(value: number): void;
		/**
		 * Returns the chromatic aberration offset.
		 *
		 * @deprecated Use chromaticAberrationOffset instead.
		 * @return {Vector2} The offset.
		 */
		getChromaticAberrationOffset(): Vector2;
		/**
		 * Sets the chromatic aberration offset.
		 *
		 * @deprecated Use chromaticAberrationOffset instead.
		 * @param {Vector2} value - The offset.
		 */
		setChromaticAberrationOffset(value: Vector2): void;
		/**
		 * Returns the current perturbation map.
		 *
		 * @deprecated Use perturbationMap instead.
		 * @return {Texture} The current perturbation map.
		 */
		getPerturbationMap(): Texture;
		/**
		 * Replaces the current perturbation map with the given one.
		 *
		 * The current map will be disposed if it was generated by this effect.
		 *
		 * @deprecated Use perturbationMap instead.
		 * @param {Texture} value - The new perturbation map.
		 */
		setPerturbationMap(value: Texture): void;
		/**
		 * Generates a perturbation map.
		 *
		 * @deprecated Use NoiseTexture instead.
		 * @param {Number} [value=64] - The texture size.
		 * @return {DataTexture} The perturbation map.
		 */
		generatePerturbationMap(value?: number): DataTexture;
		/**
		 * Updates this effect.
		 *
		 * @param {WebGLRenderer} renderer - The renderer.
		 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
		 * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
		 */
		update(
			renderer: WebGLRenderer,
			inputBuffer: WebGLRenderTarget,
			deltaTime?: number
		): void;

		/**
		 * Deletes generated resources.
		 */
		dispose(): void;

	}

	/**
	 * A glitch mode enumeration.
	 *
	 * @type {Object}
	 * @property {Number} DISABLED - No glitches.
	 * @property {Number} SPORADIC - Sporadic glitches.
	 * @property {Number} CONSTANT_MILD - Constant mild glitches.
	 * @property {Number} CONSTANT_WILD - Constant wild glitches.
	 */
	export enum GlitchMode {
		DISABLED,
		SPORADIC,
		CONSTANT_MILD,
		CONSTANT_WILD,
	}

	/**
	 * A god rays effect.
	 */
	export class GodRaysEffect extends Effect {

		/**
		 * Constructs a new god rays effect.
		 *
		 * @param {Camera} [camera] - The main camera.
		 * @param {Mesh|Points} [lightSource] - The light source. Must not write depth and has to be flagged as transparent.
		 * @param {Object} [options] - The options.
		 * @param {BlendFunction} [options.blendFunction=BlendFunction.SCREEN] - The blend function of this effect.
		 * @param {Number} [options.samples=60.0] - The number of samples per pixel.
		 * @param {Number} [options.density=0.96] - The density of the light rays.
		 * @param {Number} [options.decay=0.9] - An illumination decay factor.
		 * @param {Number} [options.weight=0.4] - A light ray weight factor.
		 * @param {Number} [options.exposure=0.6] - A constant attenuation coefficient.
		 * @param {Number} [options.clampMax=1.0] - An upper bound for the saturation of the overall effect.
		 * @param {Number} [options.resolutionScale=0.5] - The resolution scale.
		 * @param {Number} [options.resolutionX=Resolution.AUTO_SIZE] - The horizontal resolution.
		 * @param {Number} [options.resolutionY=Resolution.AUTO_SIZE] - The vertical resolution.
		 * @param {Number} [options.width=Resolution.AUTO_SIZE] - Deprecated. Use resolutionX instead.
		 * @param {Number} [options.height=Resolution.AUTO_SIZE] - Deprecated. Use resolutionY instead.
		 * @param {KernelSize} [options.kernelSize=KernelSize.SMALL] - The blur kernel size. Has no effect if blur is disabled.
		 * @param {Boolean} [options.blur=true] - Whether the god rays should be blurred to reduce artifacts.
		 */
		constructor(
			camera?: Camera,
			lightSource?: Mesh | Points,
			{
				blendFunction,
				samples,
				density,
				decay,
				weight,
				exposure,
				clampMax,
				resolutionScale,
				resolutionX,
				resolutionY,
				width,
				height,
				kernelSize,
				blur
			}?: {
				blendFunction?: BlendFunction;
				samples?: number;
				density?: number;
				decay?: number;
				weight?: number;
				exposure?: number;
				clampMax?: number;
				resolutionScale?: number;
				resolutionX?: number;
				resolutionY?: number;
				width?: number;
				height?: number;
				kernelSize?: KernelSize;
				blur?: boolean;
			}
		);

		/**
		 * A blur pass that reduces aliasing artifacts and makes the light softer.
		 *
		 * This pass can be disabled to improve performance.
		 *
		 * @type {KawaseBlurPass}
		 */
		blurPass: KawaseBlurPass;
		/**
		 * Returns the blur pass that reduces aliasing artifacts and makes the light softer.
		 *
		 * @deprecated Use blurPass instead.
		 * @return {KawaseBlurPass} The blur pass.
		 */
		getBlurPass(): KawaseBlurPass;
		/**
		 * Sets the light source.
		 *
		 * @type {Mesh|Points}
		 */
		get lightSource(): Mesh | Points | null;
		set lightSource(value: Mesh | Points | null);
		/**
		 * A texture that contains the intermediate result of this effect.
		 *
		 * @type {Texture}
		 */
		get texture(): Texture;
		/**
		 * The depth mask material.
		 *
		 * @type {DepthMaskMaterial}
		 */
		get depthMaskMaterial(): DepthMaskMaterial;
		/**
		 * Returns the god rays texture.
		 *
		 * @deprecated Use texture instead.
		 * @return {Texture} The texture.
		 */
		getTexture(): Texture;
		/**
		 * The internal god rays material.
		 *
		 * @type {GodRaysMaterial}
		 */
		get godRaysMaterial(): GodRaysMaterial;
		/**
		 * Returns the god rays material.
		 *
		 * @deprecated Use godRaysMaterial instead.
		 * @return {GodRaysMaterial} The material.
		 */
		getGodRaysMaterial(): GodRaysMaterial;
		/**
		 * The resolution of this effect.
		 *
		 * @type {Resolution}
		 */
		get resolution(): Resolution;
		/**
		 * Returns the resolution of this effect.
		 *
		 * @deprecated Use resolution instead.
		 * @return {GodRaysMaterial} The material.
		 */
		getResolution(): GodRaysMaterial;
		set width(arg: number);
		/**
		 * The current width of the internal render targets.
		 *
		 * @type {Number}
		 * @deprecated Use resolution.width instead.
		 */
		get width(): number;
		set height(arg: number);
		/**
		 * The current height of the internal render targets.
		 *
		 * @type {Number}
		 * @deprecated Use resolution.height instead.
		 */
		get height(): number;
		set dithering(arg: boolean);
		/**
		 * Indicates whether dithering is enabled.
		 *
		 * @type {Boolean}
		 * @deprecated
		 */
		get dithering(): boolean;
		set blur(arg: boolean);
		/**
		 * Indicates whether the god rays should be blurred to reduce artifacts.
		 *
		 * @type {Boolean}
		 * @deprecated Use blurPass.enabled instead.
		 */
		get blur(): boolean;
		set kernelSize(arg: KernelSize);
		/**
		 * The blur kernel size.
		 *
		 * @type {KernelSize}
		 * @deprecated Use blurPass.kernelSize instead.
		 */
		get kernelSize(): KernelSize;
		/**
		 * Returns the current resolution scale.
		 *
		 * @return {Number} The resolution scale.
		 * @deprecated Use resolution instead.
		 */
		getResolutionScale(): number;
		/**
		 * Sets the resolution scale.
		 *
		 * @param {Number} scale - The new resolution scale.
		 * @deprecated Use resolution instead.
		 */
		setResolutionScale(scale: number): void;
		/**
		 * A higher sample count improves quality at the cost of performance.
		 *
		 * @type {Number}
		 * @deprecated Use godRaysMaterial.samples instead.
		 */
		set samples(arg: number);
		/**
		 * The number of samples per pixel.
		 *
		 * @type {Number}
		 * @deprecated Use godRaysMaterial.samples instead.
		 */
		get samples(): number;
		/**
		 * Sets the depth texture.
		 *
		 * @param {Texture} depthTexture - A depth texture.
		 * @param {Number} [depthPacking=BasicDepthPacking] - The depth packing.
		 */
		setDepthTexture(depthTexture: Texture, depthPacking?: number): void;
		/**
		 * Updates this effect.
		 *
		 * @param {WebGLRenderer} renderer - The renderer.
		 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
		 * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
		 */
		update(
			renderer: WebGLRenderer,
			inputBuffer: WebGLRenderTarget,
			deltaTime?: number
		): void;

		/**
		 * Updates the size of internal render targets.
		 *
		 * @param {Number} width - The width.
		 * @param {Number} height - The height.
		 */
		setSize(width: number, height: number): void;
		/**
		 * Performs initialization tasks.
		 *
		 * @param {WebGLRenderer} renderer - The renderer.
		 * @param {Boolean} alpha - Whether the renderer uses the alpha channel or not.
		 * @param {Number} frameBufferType - The type of the main frame buffers.
		 */
		initialize(
			renderer: WebGLRenderer,
			alpha: boolean,
			frameBufferType: number
		): void;

	}

	/**
	 * A grid effect.
	 */
	export class GridEffect extends Effect {

		/**
		 * Constructs a new grid effect.
		 *
		 * @param {Object} [options] - The options.
		 * @param {BlendFunction} [options.blendFunction=BlendFunction.OVERLAY] - The blend function of this effect.
		 * @param {Number} [options.scale=1.0] - The scale of the grid pattern.
		 * @param {Number} [options.lineWidth=0.0] - The line width of the grid pattern.
		 */
		constructor({
			blendFunction,
			scale,
			lineWidth
		}?: {
			blendFunction?: BlendFunction;
			scale?: number;
			lineWidth?: number;
		});

		set scale(arg: number);
		/**
		 * The scale.
		 *
		 * @type {Number}
		 */
		get scale(): number;
		set lineWidth(arg: number);
		/**
		 * The line width.
		 *
		 * @type {Number}
		 */
		get lineWidth(): number;
		/**
		 * Returns the current grid scale.
		 *
		 * @deprecated Use scale instead.
		 * @return {Number} The grid scale.
		 */
		getScale(): number;
		/**
		 * Sets the grid scale.
		 *
		 * @deprecated Use scale instead.
		 * @param {Number} value - The new grid scale.
		 */
		setScale(value: number): void;
		/**
		 * Returns the current grid line width.
		 *
		 * @deprecated Use lineWidth instead.
		 * @return {Number} The grid line width.
		 */
		getLineWidth(): number;
		/**
		 * Sets the grid line width.
		 *
		 * @deprecated Use lineWidth instead.
		 * @param {Number} value - The new grid line width.
		 */
		setLineWidth(value: number): void;
		/**
		 * Updates the size of this pass.
		 *
		 * @param {Number} width - The width.
		 * @param {Number} height - The height.
		 */
		setSize(width: number, height: number): void;

	}

	/**
	 * A hue/saturation effect.
	 *
	 * Reference: https://github.com/evanw/glfx.js
	 */
	export class HueSaturationEffect extends Effect {

		/**
		 * Constructs a new hue/saturation effect.
		 *
		 * @param {Object} [options] - The options.
		 * @param {BlendFunction} [options.blendFunction=BlendFunction.NORMAL] - The blend function of this effect.
		 * @param {Number} [options.hue=0.0] - The hue in radians.
		 * @param {Number} [options.saturation=0.0] - The saturation factor, ranging from -1 to 1, where 0 means no change.
		 */
		constructor({
			blendFunction,
			hue,
			saturation
		}?: {
			blendFunction?: BlendFunction;
			hue?: number;
			saturation?: number;
		});

		set hue(arg: number);
		/**
		 * The hue.
		 *
		 * @type {Number}
		 */
		get hue(): number;
		set saturation(arg: number);
		/**
		 * The saturation.
		 *
		 * @type {Number}
		 */
		get saturation(): number;
		/**
		 * Returns the saturation.
		 *
		 * @deprecated Use saturation instead.
		 * @return {Number} The saturation.
		 */
		getSaturation(): number;
		/**
		 * Sets the saturation.
		 *
		 * @deprecated Use saturation instead.
		 * @param {Number} value - The saturation.
		 */
		setSaturation(value: number): void;
		/**
		 * Returns the hue.
		 *
		 * @deprecated Use hue instead.
		 * @return {Number} The hue in radians.
		 */
		getHue(): number;
		/**
		 * Sets the hue.
		 *
		 * @deprecated Use hue instead.
		 * @param {Number} value - The hue in radians.
		 */
		setHue(value: number): void;

	}

	/**
	 * A 1D LUT effect.
	 */

	export class LUT1DEffect extends Effect {

		/**
		 * Constructs a new color grading effect.
		 *
		 * @param {Texture} lut - The lookup texture.
		 * @param {Object} [options] - The options.
		 * @param {BlendFunction} [options.blendFunction=BlendFunction.SET] - The blend function of this effect.
		 */
		constructor(
			lut: Texture,
			{
				blendFunction
			}?: {
				blendFunction?: BlendFunction;
			}
		);

	}
	/**
	 * A LUT effect.
	 *
	 * The tetrahedral interpolation algorithm was inspired by an implementation from OpenColorIO which is licensed under
	 * the BSD 3-Clause License.
	 *
	 * The manual trilinear interpolation algorithm is based on an implementation by Garret Johnson which is licensed under
	 * the MIT License.
	 *
	 * References:
	 * https://developer.nvidia.com/gpugems/gpugems2/part-iii-high-quality-rendering/chapter-24-using-lookup-tables-accelerate-color
	 * https://www.nvidia.com/content/GTC/posters/2010/V01-Real-Time-Color-Space-Conversion-for-High-Resolution-Video.pdf
	 * https://github.com/AcademySoftwareFoundation/OpenColorIO/blob/master/src/OpenColorIO/ops/lut3d/
	 * https://github.com/gkjohnson/threejs-sandbox/tree/master/3d-lut
	 */
	export class LUT3DEffect extends Effect {

		/**
		 * Constructs a new color grading effect.
		 *
		 * @param {Texture} lut - The lookup texture.
		 * @param {Object} [options] - The options.
		 * @param {BlendFunction} [options.blendFunction=BlendFunction.SET] - The blend function of this effect.
		 * @param {Boolean} [options.tetrahedralInterpolation=false] - Enables or disables tetrahedral interpolation.
		 * @param {TextureEncoding} [options.inputEncoding=sRGBEncoding] - Deprecated.
		 * @param {ColorSpace} [options.inputColorSpace=SRGBColorSpace] - The input color space.
		 */
		constructor(
			lut: Texture,
			{
				blendFunction,
				tetrahedralInterpolation,
				inputEncoding,
				inputColorSpace
			}?: {
				blendFunction?: BlendFunction;
				tetrahedralInterpolation?: boolean;
				inputEncoding?: TextureEncoding;
				inputColorSpace?: ColorSpace;
			}
		);

		/**
		 * Indicates whether tetrahedral interpolation is enabled. Requires a 3D LUT, disabled by default.
		 *
		 * Tetrahedral interpolation produces highly accurate results but is slower than hardware interpolation.
		 *
		 * @type {Boolean}
		 */
		get tetrahedralInterpolation(): boolean;
		set tetrahedralInterpolation(arg: boolean);
		/**
		 * The input encoding. Default is `sRGBEncoding`.
		 *
		 * Set this to `LinearEncoding` if your LUT expects linear color input.
		 *
		 * @deprecated Use inputColorSpace instead.
		 * @type {TextureEncoding}
		 */
		get inputEncoding(): TextureEncoding;
		set inputEncoding(arg: TextureEncoding);
		/**
		 * The LUT.
		 *
		 * @type {Texture}
		 */
		get lut(): Texture;
		set lut(arg: Texture);
		/**
		 * Returns the output encoding.
		 *
		 * @deprecated
		 * @return {TextureEncoding} The encoding.
		 */
		getOutputEncoding(): TextureEncoding;
		/**
		 * Returns the input encoding.
		 *
		 * @deprecated Use inputEncoding instead.
		 * @return {TextureEncoding} The encoding.
		 */
		getInputEncoding(): TextureEncoding;
		/**
		 * Sets the input encoding.
		 *
		 * @deprecated Use inputEncoding instead.
		 * @param {TextureEncoding} value - The encoding.
		 */
		setInputEncoding(value: TextureEncoding): void;
		/**
		 * Returns the current LUT.
		 *
		 * @deprecated Use lut instead.
		 * @return {Texture} The LUT.
		 */
		getLUT(): Texture;
		/**
		 * Sets the LUT.
		 *
		 * @deprecated Use lut instead.
		 * @param {Texture} value - The LUT.
		 */
		setLUT(value: Texture): void;
		/**
		 * Enables or disables tetrahedral interpolation.
		 *
		 * @deprecated Use tetrahedralInterpolation instead.
		 * @param {Boolean} value - Whether tetrahedral interpolation should be enabled.
		 */
		setTetrahedralInterpolationEnabled(value: boolean): void;

	}

	/**
	 * A noise effect.
	 */
	export class NoiseEffect extends Effect {

		/**
		 * Constructs a new noise effect.
		 *
		 * @param {Object} [options] - The options.
		 * @param {BlendFunction} [options.blendFunction=BlendFunction.SCREEN] - The blend function of this effect.
		 * @param {Boolean} [options.premultiply=false] - Whether the noise should be multiplied with the input colors prior to blending.
		 */
		constructor({
			blendFunction,
			premultiply
		}?: {
			blendFunction?: BlendFunction;
			premultiply?: boolean;
		});

		set premultiply(arg: boolean);
		/**
		 * Indicates whether noise will be multiplied with the input colors prior to blending.
		 *
		 * @type {Boolean}
		 */
		get premultiply(): boolean;
		/**
		 * Indicates whether noise will be multiplied with the input colors prior to blending.
		 *
		 * @deprecated Use premultiply instead.
		 * @return {Boolean} Whether noise is premultiplied.
		 */
		isPremultiplied(): boolean;
		/**
		 * Controls whether noise should be multiplied with the input colors prior to blending.
		 *
		 * @deprecated Use premultiply instead.
		 * @param {Boolean} value - Whether noise should be premultiplied.
		 */
		setPremultiplied(value: boolean): void;

	}

	/**
	 * An outline effect.
	 */
	export class OutlineEffect extends Effect {

		/**
		 * Constructs a new outline effect.
		 *
		 * @param {Scene} scene - The main scene.
		 * @param {Camera} camera - The main camera.
		 * @param {Object} [options] - The options.
		 * @param {BlendFunction} [options.blendFunction=BlendFunction.SCREEN] - The blend function. Use `BlendFunction.ALPHA` for dark outlines.
		 * @param {Texture} [options.patternTexture=null] - A pattern texture.
		 * @param {Number} [options.patternScale=1.0] - The pattern scale.
		 * @param {Number} [options.edgeStrength=1.0] - The edge strength.
		 * @param {Number} [options.pulseSpeed=0.0] - The pulse speed. A value of zero disables the pulse effect.
		 * @param {Number} [options.visibleEdgeColor=0xffffff] - The color of visible edges.
		 * @param {Number} [options.hiddenEdgeColor=0x22090a] - The color of hidden edges.
		 * @param {KernelSize} [options.kernelSize=KernelSize.VERY_SMALL] - The blur kernel size.
		 * @param {Boolean} [options.blur=false] - Whether the outline should be blurred.
		 * @param {Boolean} [options.xRay=true] - Whether occluded parts of selected objects should be visible.
		 * @param {Number} [options.multisampling=0] - The number of samples used for multisample antialiasing. Requires WebGL 2.
		 * @param {Number} [options.resolutionScale=0.5] - The resolution scale.
		 * @param {Number} [options.resolutionX=Resolution.AUTO_SIZE] - The horizontal resolution.
		 * @param {Number} [options.resolutionY=Resolution.AUTO_SIZE] - The vertical resolution.
		 * @param {Number} [options.width=Resolution.AUTO_SIZE] - Deprecated. Use resolutionX instead.
		 * @param {Number} [options.height=Resolution.AUTO_SIZE] - Deprecated. Use resolutionY instead.
		 */
		constructor(
			scene?: Scene,
			camera?: Camera,
			{
				blendFunction,
				patternTexture,
				patternScale,
				edgeStrength,
				pulseSpeed,
				visibleEdgeColor,
				hiddenEdgeColor,
				multisampling,
				resolutionScale,
				resolutionX,
				resolutionY,
				width,
				height,
				kernelSize,
				blur,
				xRay
			}?: {
				blendFunction?: BlendFunction;
				patternTexture?: Texture;
				patternScale?: number;
				edgeStrength?: number;
				pulseSpeed?: number;
				visibleEdgeColor?: number;
				hiddenEdgeColor?: number;
				multisampling?: number;
				resolutionScale?: number;
				resolutionX?: number;
				resolutionY?: number;
				width?: number;
				height?: number;
				kernelSize?: KernelSize;
				blur?: boolean;
				xRay?: boolean;
			}
		);

		set patternTexture(arg: Texture);
		/**
		 * The pattern texture. Set to `null` to disable.
		 *
		 * @type {Texture}
		 */
		get patternTexture(): Texture;
		set xRay(arg: boolean);
		/**
		 * Indicates whether X-ray mode is enabled.
		 *
		 * @type {Boolean}
		 */
		get xRay(): boolean;
		/**
		 * A blur pass.
		 *
		 * @type {KawaseBlurPass}
		 */
		blurPass: KawaseBlurPass;
		/**
		 * A selection of objects that will be outlined.
		 *
		 * The default layer of this selection is 10.
		 *
		 * @type {Selection}
		 */
		selection: Selection;
		/**
		 * The pulse speed. Set to 0 to disable.
		 *
		 * @type {Number}
		 */
		pulseSpeed: number;
		/**
		 * The resolution of this effect.
		 *
		 * @type {Resolution}
		 */
		get resolution(): Resolution;
		/**
		 * Returns the resolution.
		 *
		 * @return {Resizer} The resolution.
		 */
		getResolution(): Resizer;
		set patternScale(arg: number);
		/**
		 * The pattern scale.
		 *
		 * @type {Number}
		 */
		get patternScale(): number;
		set edgeStrength(arg: number);
		/**
		 * The edge strength.
		 *
		 * @type {Number}
		 */
		get edgeStrength(): number;
		set visibleEdgeColor(arg: Color);
		/**
		 * The visible edge color.
		 *
		 * @type {Color}
		 */
		get visibleEdgeColor(): Color;
		set hiddenEdgeColor(arg: Color);
		/**
		 * The hidden edge color.
		 *
		 * @type {Color}
		 */
		get hiddenEdgeColor(): Color;
		/**
		 * The amount of MSAA samples.
		 *
		 * Requires WebGL 2. Set to zero to disable multisampling.
		 *
		 * @experimental Requires three >= r138.
		 * @type {Number}
		 */
		get multisampling(): number;
		set multisampling(arg: number);
		/**
		 * Returns the blur pass.
		 *
		 * @deprecated Use blurPass instead.
		 * @return {KawaseBlurPass} The blur pass.
		 */
		getBlurPass(): KawaseBlurPass;
		/**
		 * Returns the selection.
		 *
		 * @deprecated Use selection instead.
		 * @return {Selection} The selection.
		 */
		getSelection(): Selection;
		/**
		 * Returns the pulse speed.
		 *
		 * @deprecated Use pulseSpeed instead.
		 * @return {Number} The speed.
		 */
		getPulseSpeed(): number;
		/**
		 * Sets the pulse speed. Set to zero to disable.
		 *
		 * @deprecated Use pulseSpeed instead.
		 * @param {Number} value - The speed.
		 */
		setPulseSpeed(value: number): void;
		set width(arg: number);
		/**
		 * The current width of the internal render targets.
		 *
		 * @type {Number}
		 * @deprecated Use resolution.width instead.
		 */
		get width(): number;
		set height(arg: number);
		/**
		 * The current height of the internal render targets.
		 *
		 * @type {Number}
		 * @deprecated Use resolution.height instead.
		 */
		get height(): number;
		set selectionLayer(arg: number);
		/**
		 * The selection layer.
		 *
		 * @type {Number}
		 * @deprecated Use selection.layer instead.
		 */
		get selectionLayer(): number;
		set dithering(arg: boolean);
		/**
		 * Indicates whether dithering is enabled.
		 *
		 * @type {Boolean}
		 * @deprecated
		 */
		get dithering(): boolean;
		set kernelSize(arg: KernelSize);
		/**
		 * The blur kernel size.
		 *
		 * @type {KernelSize}
		 * @deprecated Use blurPass.kernelSize instead.
		 */
		get kernelSize(): KernelSize;
		set blur(arg: boolean);
		/**
		 * Indicates whether the outlines should be blurred.
		 *
		 * @type {Boolean}
		 * @deprecated Use blurPass.enabled instead.
		 */
		get blur(): boolean;
		/**
		 * Indicates whether X-ray mode is enabled.
		 *
		 * @deprecated Use xRay instead.
		 * @return {Boolean} Whether X-ray mode is enabled.
		 */
		isXRayEnabled(): boolean;
		/**
		 * Enables or disables X-ray outlines.
		 *
		 * @deprecated Use xRay instead.
		 * @param {Boolean} value - Whether X-ray should be enabled.
		 */
		setXRayEnabled(value: boolean): void;
		/**
		 * Sets the pattern texture.
		 *
		 * @deprecated Use patternTexture instead.
		 * @param {Texture} value - The new texture.
		 */
		setPatternTexture(value: Texture): void;
		/**
		 * Returns the current resolution scale.
		 *
		 * @return {Number} The resolution scale.
		 * @deprecated Use resolution instead.
		 */
		getResolutionScale(): number;
		/**
		 * Sets the resolution scale.
		 *
		 * @param {Number} scale - The new resolution scale.
		 * @deprecated Use resolution instead.
		 */
		setResolutionScale(scale: number): void;
		/**
		 * Clears the current selection and selects a list of objects.
		 *
		 * @param {Object3D[]} objects - The objects that should be outlined. This array will be copied.
		 * @return {OutlineEffect} This pass.
		 * @deprecated Use selection.set() instead.
		 */
		setSelection(objects: Object3D[]): OutlineEffect;
		/**
		 * Clears the list of selected objects.
		 *
		 * @return {OutlineEffect} This pass.
		 * @deprecated Use selection.clear() instead.
		 */
		clearSelection(): OutlineEffect;
		/**
		 * Selects an object.
		 *
		 * @param {Object3D} object - The object that should be outlined.
		 * @return {OutlineEffect} This pass.
		 * @deprecated Use selection.add() instead.
		 */
		selectObject(object: Object3D): OutlineEffect;
		/**
		 * Deselects an object.
		 *
		 * @param {Object3D} object - The object that should no longer be outlined.
		 * @return {OutlineEffect} This pass.
		 * @deprecated Use selection.delete() instead.
		 */
		deselectObject(object: Object3D): OutlineEffect;
		/**
		 * Updates this effect.
		 *
		 * @param {WebGLRenderer} renderer - The renderer.
		 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
		 * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
		 */
		update(
			renderer: WebGLRenderer,
			inputBuffer: WebGLRenderTarget,
			deltaTime?: number
		): void;

		/**
		 * Updates the size of internal render targets.
		 *
		 * @param {Number} width - The width.
		 * @param {Number} height - The height.
		 */
		setSize(width: number, height: number): void;
		/**
		 * Performs initialization tasks.
		 *
		 * @param {WebGLRenderer} renderer - The renderer.
		 * @param {Boolean} alpha - Whether the renderer uses the alpha channel or not.
		 * @param {Number} frameBufferType - The type of the main frame buffers.
		 */
		initialize(
			renderer: WebGLRenderer,
			alpha: boolean,
			frameBufferType: number
		): void;

	}

	/**
	 * A pixelation effect.
	 *
	 * Warning: This effect cannot be merged with convolution effects.
	 */
	export class PixelationEffect extends Effect {

		/**
		 * Constructs a new pixelation effect.
		 *
		 * @param {Number} [granularity=30.0] - The pixel granularity.
		 */
		constructor(granularity?: number);
		set granularity(arg: number);
		/**
		 * The pixel granularity.
		 *
		 * A higher value yields coarser visuals.
		 *
		 * @type {Number}
		 */
		get granularity(): number;
		/**
		 * Returns the pixel granularity.
		 *
		 * @deprecated Use granularity instead.
		 * @return {Number} The granularity.
		 */
		getGranularity(): number;
		/**
		 * Sets the pixel granularity.
		 *
		 * @deprecated Use granularity instead.
		 * @param {Number} value - The new granularity.
		 */
		setGranularity(value: number): void;
		/**
		 * Updates the granularity.
		 *
		 * @param {Number} width - The width.
		 * @param {Number} height - The height.
		 */
		setSize(width: number, height: number): void;

	}

	/**
	 * Depth of Field shader v2.4.
	 *
	 * Yields more realistic results but is also more demanding.
	 *
	 * Original shader code by Martins Upitis:
	 *	http://blenderartists.org/forum/showthread.php?237488-GLSL-depth-of-field-with-bokeh-v2-4-(update)
	 *
	 * @deprecated Use DepthOfFieldEffect instead.
	 */
	export class RealisticBokehEffect extends Effect {

		/**
		 * Constructs a new bokeh effect.
		 *
		 * @param {Object} [options] - The options.
		 * @param {BlendFunction} [options.blendFunction=BlendFunction.NORMAL] - The blend function of this effect.
		 * @param {Number} [options.focus=1.0] - The focus distance in world units.
		 * @param {Number} [options.focalLength=24.0] - The focal length of the main camera.
		 * @param {Number} [options.fStop=0.9] - The ratio of the lens focal length to the diameter of the entrance pupil (aperture).
		 * @param {Number} [options.luminanceThreshold=0.5] - A luminance threshold.
		 * @param {Number} [options.luminanceGain=2.0] - A luminance gain factor.
		 * @param {Number} [options.bias=0.5] - A blur bias.
		 * @param {Number} [options.fringe=0.7] - A blur offset.
		 * @param {Number} [options.maxBlur=1.0] - The maximum blur strength.
		 * @param {Boolean} [options.rings=3] - The number of blur iterations.
		 * @param {Boolean} [options.samples=2] - The amount of samples taken per ring.
		 * @param {Boolean} [options.showFocus=false] - Whether the focal point should be highlighted. Useful for debugging.
		 * @param {Boolean} [options.manualDoF=false] - Enables manual control over the depth of field.
		 * @param {Boolean} [options.pentagon=false] - Enables pentagonal blur shapes. Requires a high number of rings and samples.
		 */
		constructor({
			blendFunction,
			focus,
			focalLength,
			fStop,
			luminanceThreshold,
			luminanceGain,
			bias,
			fringe,
			maxBlur,
			rings,
			samples,
			showFocus,
			manualDoF,
			pentagon
		}?: {
			blendFunction?: BlendFunction;
			focus?: number;
			focalLength?: number;
			fStop?: number;
			luminanceThreshold?: number;
			luminanceGain?: number;
			bias?: number;
			fringe?: number;
			maxBlur?: number;
			rings?: boolean;
			samples?: boolean;
			showFocus?: boolean;
			manualDoF?: boolean;
			pentagon?: boolean;
		});

		set rings(arg: number);
		/**
		 * The amount of blur iterations.
		 *
		 * @type {Number}
		 */
		get rings(): number;
		set samples(arg: number);
		/**
		 * The amount of blur samples per ring.
		 *
		 * @type {Number}
		 */
		get samples(): number;
		set showFocus(arg: boolean);
		/**
		 * Indicates whether the focal point will be highlighted.
		 *
		 * @type {Boolean}
		 */
		get showFocus(): boolean;
		set manualDoF(arg: boolean);
		/**
		 * Indicates whether the Depth of Field should be calculated manually.
		 *
		 * If enabled, the Depth of Field can be adjusted via the `dof` uniform.
		 *
		 * @type {Boolean}
		 */
		get manualDoF(): boolean;
		set pentagon(arg: boolean);
		/**
		 * Indicates whether the blur shape should be pentagonal.
		 *
		 * @type {Boolean}
		 */
		get pentagon(): boolean;

	}

	/**
	 * A scanline effect.
	 *
	 * Based on an implementation by Georg 'Leviathan' Steinrohder (CC BY 3.0):
	 * http://www.truevision3d.com/forums/showcase/staticnoise_colorblackwhite_scanline_shaders-t18698.0.html
	 */
	export class ScanlineEffect extends Effect {

		/**
		 * Constructs a new scanline effect.
		 *
		 * @param {Object} [options] - The options.
		 * @param {BlendFunction} [options.blendFunction=BlendFunction.OVERLAY] - The blend function of this effect.
		 * @param {Number} [options.density=1.25] - The scanline density.
		 */
		constructor({
			blendFunction,
			density
		}?: {
			blendFunction?: BlendFunction;
			density?: number;
		});

		set density(arg: number);
		/**
		 * The scanline density.
		 *
		 * @type {Number}
		 */
		get density(): number;
		/**
		 * Returns the current scanline density.
		 *
		 * @deprecated Use density instead.
		 * @return {Number} The scanline density.
		 */
		getDensity(): number;
		/**
		 * Sets the scanline density.
		 *
		 * @deprecated Use density instead.
		 * @param {Number} value - The new scanline density.
		 */
		setDensity(value: number): void;
		/**
		 * Updates the size of this pass.
		 *
		 * @param {Number} width - The width.
		 * @param {Number} height - The height.
		 */
		setSize(width: number, height: number): void;
		/**
		 * The scanline scroll speed. Default is 0 (disabled).
		 *
		 * @type {Number}
		 */
		get scrollSpeed(): number;
		set scrollSpeed(value: number);

	}

	/**
	 * A selective bloom effect.
	 *
	 * This effect applies bloom to selected objects only.
	 */
	export class SelectiveBloomEffect extends BloomEffect {

		/**
		 * Constructs a new selective bloom effect.
		 *
		 * @param {Scene} scene - The main scene.
		 * @param {Camera} camera - The main camera.
		 * @param {BloomEffectOptions} [options] - The options. See {@link BloomEffect} for details.
		 */
		constructor(scene?: Scene, camera?: Camera, options?: BloomEffectOptions);
		/**
		 * A selection of objects.
		 *
		 * The default layer of this selection is 11.
		 *
		 * @type {Selection}
		 */
		selection: Selection;
		/**
		 * Returns the selection.
		 *
		 * @deprecated Use selection instead.
		 * @return {Selection} The selection.
		 */
		getSelection(): Selection;
		set inverted(arg: boolean);
		/**
		 * Indicates whether the selection should be considered inverted.
		 *
		 * @type {Boolean}
		 */
		get inverted(): boolean;
		/**
		 * Indicates whether the mask is inverted.
		 *
		 * @deprecated Use inverted instead.
		 * @return {Boolean} Whether the mask is inverted.
		 */
		isInverted(): boolean;
		/**
		 * Enables or disable mask inversion.
		 *
		 * @deprecated Use inverted instead.
		 * @param {Boolean} value - Whether the mask should be inverted.
		 */
		setInverted(value: boolean): void;
		set ignoreBackground(arg: boolean);
		/**
		 * Indicates whether the background colors will be ignored.
		 *
		 * @type {Boolean}
		 */
		get ignoreBackground(): boolean;
		/**
		 * Indicates whether the background is disabled.
		 *
		 * @deprecated Use ignoreBackground instead.
		 * @return {Boolean} Whether the background is disabled.
		 */
		isBackgroundDisabled(): boolean;
		/**
		 * Enables or disables the background.
		 *
		 * @deprecated Use ignoreBackground instead.
		 * @param {Boolean} value - Whether the background should be disabled.
		 */
		setBackgroundDisabled(value: boolean): void;
		/**
		 * Sets the depth texture.
		 *
		 * @param {Texture} depthTexture - A depth texture.
		 * @param {DepthPackingStrategies} [depthPacking=BasicDepthPacking] - The depth packing.
		 */
		setDepthTexture(
			depthTexture: Texture,
			depthPacking?: DepthPackingStrategies
		): void;

		/**
		 * Updates this effect.
		 *
		 * @param {WebGLRenderer} renderer - The renderer.
		 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
		 * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
		 */
		update(
			renderer: WebGLRenderer,
			inputBuffer: WebGLRenderTarget,
			deltaTime: number
		): void;

		/**
		 * Updates the size of internal render targets.
		 *
		 * @param {Number} width - The width.
		 * @param {Number} height - The height.
		 */
		setSize(width: number, height: number): void;

		/**
		 * Performs initialization tasks.
		 *
		 * @param {WebGLRenderer} renderer - The renderer.
		 * @param {Boolean} alpha - Whether the renderer uses the alpha channel.
		 * @param {Number} frameBufferType - The type of the main frame buffers.
		 */
		initialize(
			renderer: WebGLRenderer,
			alpha: boolean,
			frameBufferType: number
		): void;

	}

	/**
	 * A sepia effect.
	 */
	export class SepiaEffect extends Effect {

		/**
		 * Constructs a new sepia effect.
		 *
		 * @param {Object} [options] - The options.
		 * @param {BlendFunction} [options.blendFunction=BlendFunction.NORMAL] - The blend function of this effect.
		 * @param {Number} [options.intensity=1.0] - The intensity of the effect.
		 */
		constructor({
			blendFunction,
			intensity
		}?: {
			blendFunction?: BlendFunction;
			intensity?: number;
		});

		set intensity(arg: number);
		/**
		 * The intensity.
		 *
		 * @deprecated Use blendMode.opacity instead.
		 * @type {Number}
		 */
		get intensity(): number;
		/**
		 * Returns the current sepia intensity.
		 *
		 * @deprecated Use blendMode.opacity instead.
		 * @return {Number} The intensity.
		 */
		getIntensity(): number;
		/**
		 * Sets the sepia intensity.
		 *
		 * @deprecated Use blendMode.opacity instead.
		 * @param {Number} value - The intensity.
		 */
		setIntensity(value: number): void;

	}

	/**
	 * A shock wave effect.
	 *
	 * Based on a Gist by Jean-Philippe Sarda:
	 *	https://gist.github.com/jpsarda/33cea67a9f2ecb0a0eda
	 */
	export class ShockWaveEffect extends Effect {

		/**
		 * Constructs a new shock wave effect.
		 *
		 * @param {Camera} camera - The main camera.
		 * @param {Vector3} [position] - The world position of the shock wave.
		 * @param {Object} [options] - The options.
		 * @param {Number} [options.speed=2.0] - The animation speed.
		 * @param {Number} [options.maxRadius=1.0] - The extent of the shock wave.
		 * @param {Number} [options.waveSize=0.2] - The wave size.
		 * @param {Number} [options.amplitude=0.05] - The distortion amplitude.
		 */
		constructor(
			camera?: Camera,
			position?: Vector3,
			{
				speed,
				maxRadius,
				waveSize,
				amplitude
			}?: {
				speed?: number;
				maxRadius?: number;
				waveSize?: number;
				amplitude?: number;
			}
		);

		/**
		 * The position of the shock wave.
		 *
		 * @type {Vector3}
		 */
		position: Vector3;
		/**
		 * The speed of the shock wave animation.
		 *
		 * @type {Number}
		 */
		speed: number;
		set amplitude(arg: number);
		/**
		 * The amplitude.
		 *
		 * @type {Number}
		 */
		get amplitude(): number;
		set waveSize(arg: number);
		/**
		 * The wave size.
		 *
		 * @type {Number}
		 */
		get waveSize(): number;
		set maxRadius(arg: number);
		/**
		 * The maximum radius.
		 *
		 * @type {Number}
		 */
		get maxRadius(): number;
		set epicenter(arg: Vector3);
		/**
		 * The position of the shock wave.
		 *
		 * @type {Vector3}
		 * @deprecated Use position instead.
		 */
		get epicenter(): Vector3;
		/**
		 * Returns the position of the shock wave.
		 *
		 * @deprecated Use position instead.
		 * @return {Vector3} The position.
		 */
		getPosition(): Vector3;
		/**
		 * Sets the position of the shock wave.
		 *
		 * @deprecated Use position instead.
		 * @param {Vector3} value - The position.
		 */
		setPosition(value: Vector3): void;
		/**
		 * Returns the speed of the shock wave.
		 *
		 * @deprecated Use speed instead.
		 * @return {Number} The speed.
		 */
		getSpeed(): number;
		/**
		 * Sets the speed of the shock wave.
		 *
		 * @deprecated Use speed instead.
		 * @param {Number} value - The speed.
		 */
		setSpeed(value: number): void;
		/**
		 * Emits the shock wave.
		 */
		explode(): void;
		/**
		 * Updates this effect.
		 *
		 * @param {WebGLRenderer} renderer - The renderer.
		 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
		 * @param {Number} [delta] - The time between the last frame and the current one in seconds.
		 */

		update(
			renderer: WebGLRenderer,
			inputBuffer: WebGLRenderTarget,
			delta: number
		): void;

	}

	/**
	 * NVIDIA FXAA 3.11 by Timothy Lottes:
	 * https://developer.download.nvidia.com/assets/gamedev/files/sdk/11/FXAA_WhitePaper.pdf
	 *
	 * Based on an implementation by Simon Rodriguez:
	 * https://github.com/kosua20/Rendu/blob/master/resources/common/shaders/screens/fxaa.frag
	 */
	export class FXAAEffect extends Effect {

		/**
		 * Constructs a new FXAA effect.
		 *
		 * @param {Object} [options] - The options.
		 * @param {BlendFunction} [options.blendFunction=BlendFunction.SRC] - The blend function of this effect.
		 */
		constructor({
			blendFunction
		}?: {
			blendFunction?: BlendFunction
		});

		/**
		 * The minimum edge detection threshold. Range is [0.0, 1.0].
		 *
		 * @type {Number}
		 */
		get minEdgeThreshold(): number;
		set minEdgeThreshold(arg: number);

		/**
		 * The maximum edge detection threshold. Range is [0.0, 1.0].
		 *
		 * @type {Number}
		 */
		get maxEdgeThreshold(): number;
		set maxEdgeThreshold(arg: number);

		/**
		 * The subpixel blend quality. Range is [0.0, 1.0].
		 *
		 * @type {Number}
		 */
		get subpixelQuality(): number;
		set subpixelQuality(arg: number);

		/**
		 * The maximum amount of edge detection samples.
		 *
		 * @type {Number}
		 */
		get samples(): number;
		set samples(arg: number);

	}

	/**
	 * Subpixel Morphological Antialiasing (SMAA).
	 *
	 * https://github.com/iryoku/smaa/releases/tag/v2.8
	 */
	export class SMAAEffect extends Effect {

		/**
		 * The SMAA search image, encoded as a base64 data URL.
		 *
		 * @type {String}
		 * @deprecated
		 */
		static get searchImageDataURL(): string;
		/**
		 * The SMAA area image, encoded as a base64 data URL.
		 *
		 * @type {String}
		 * @deprecated
		 */
		static get areaImageDataURL(): string;
		/**
		 * Constructs a new SMAA effect.
		 *
		 * @param {Object} [options] - The options.
		 * @param {SMAAPreset} [options.preset=SMAAPreset.MEDIUM] - The quality preset.
		 * @param {EdgeDetectionMode} [options.edgeDetectionMode=EdgeDetectionMode.COLOR] - The edge detection mode.
		 * @param {PredicationMode} [options.predicationMode=PredicationMode.DISABLED] - The predication mode.
		 */
		constructor({
			preset,
			edgeDetectionMode,
			predicationMode
		}?: {
			preset?: SMAAPreset;
			edgeDetectionMode?: EdgeDetectionMode;
			predicationMode?: PredicationMode;
		});

		/**
		 * The edges texture.
		 *
		 * @type {Texture}
		 */
		get edgesTexture(): Texture;
		/**
		 * Returns the edges texture.
		 *
		 * @deprecated Use edgesTexture instead.
		 * @return {Texture} The texture.
		 */
		getEdgesTexture(): Texture;
		/**
		 * The edge weights texture.
		 *
		 * @type {Texture}
		 */
		get weightsTexture(): Texture;
		/**
		 * Returns the edge weights texture.
		 *
		 * @deprecated Use weightsTexture instead.
		 * @return {Texture} The texture.
		 */
		getWeightsTexture(): Texture;
		/**
		 * The edge detection material.
		 *
		 * @type {EdgeDetectionMaterial}
		 */
		get edgeDetectionMaterial(): EdgeDetectionMaterial;
		/**
		 * The edge detection material.
		 *
		 * @type {EdgeDetectionMaterial}
		 * @deprecated Use edgeDetectionMaterial instead.
		 */
		get colorEdgesMaterial(): EdgeDetectionMaterial;
		/**
		 * Returns the edge detection material.
		 *
		 * @deprecated Use edgeDetectionMaterial instead.
		 * @return {EdgeDetectionMaterial} The material.
		 */
		getEdgeDetectionMaterial(): EdgeDetectionMaterial;
		/**
		 * The edge weights material.
		 *
		 * @type {SMAAWeightsMaterial}
		 */
		get weightsMaterial(): SMAAWeightsMaterial;
		/**
		 * Returns the edge weights material.
		 *
		 * @deprecated Use weightsMaterial instead.
		 * @return {SMAAWeightsMaterial} The material.
		 */
		getWeightsMaterial(): SMAAWeightsMaterial;
		/**
		 * Sets the edge detection sensitivity.
		 *
		 * See {@link EdgeDetectionMaterial#setEdgeDetectionThreshold} for more details.
		 *
		 * @deprecated Use edgeDetectionMaterial instead.
		 * @param {Number} threshold - The edge detection sensitivity. Range: [0.05, 0.5].
		 */
		setEdgeDetectionThreshold(threshold: number): void;
		/**
		 * Sets the maximum amount of horizontal/vertical search steps.
		 *
		 * See {@link SMAAWeightsMaterial#setOrthogonalSearchSteps} for more details.
		 *
		 * @deprecated Use weightsMaterial instead.
		 * @param {Number} steps - The search steps. Range: [0, 112].
		 */
		setOrthogonalSearchSteps(steps: number): void;
		/**
		 * Applies the given quality preset.
		 *
		 * @param {SMAAPreset} preset - The preset.
		 */
		applyPreset(preset: SMAAPreset): void;
		/**
		 * Sets the depth texture.
		 *
		 * @param {Texture} depthTexture - A depth texture.
		 * @param {DepthPackingStrategies} [depthPacking=BasicDepthPacking] - The depth packing.
		 */
		setDepthTexture(
			depthTexture: Texture,
			depthPacking?: DepthPackingStrategies
		): void;

		/**
		 * Updates this effect.
		 *
		 * @param {WebGLRenderer} renderer - The renderer.
		 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
		 * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
		 */
		update(
			renderer: WebGLRenderer,
			inputBuffer: WebGLRenderTarget,
			deltaTime?: number
		): void;

		/**
		 * Updates the size of internal render targets.
		 *
		 * @param {Number} width - The width.
		 * @param {Number} height - The height.
		 */
		setSize(width: number, height: number): void;
		/**
		 * Deletes internal render targets and textures.
		 */
		dispose(): void;

	}

	/**
	 * An enumeration of SMAA presets.
	 *
	 * @type {Object}
	 * @property {Number} LOW - Results in around 60% of the maximum quality.
	 * @property {Number} MEDIUM - Results in around 80% of the maximum quality.
	 * @property {Number} HIGH - Results in around 95% of the maximum quality.
	 * @property {Number} ULTRA - Results in around 99% of the maximum quality.
	 */
	export enum SMAAPreset {
		LOW,
		MEDIUM,
		HIGH,
		ULTRA,
	}

	/**
	 * A Screen Space Ambient Occlusion (SSAO) effect.
	 *
	 * For high quality visuals use two SSAO effect instances in a row with different radii, one for rough AO and one for
	 * fine details.
	 *
	 * This effect supports depth-aware upsampling and should be rendered at a lower resolution. The resolution should match
	 * that of the downsampled normals and depth. If you intend to render SSAO at full resolution, do not provide a
	 * downsampled `normalDepthBuffer`.
	 *
	 * It's recommended to specify a relative render resolution using the `resolutionScale` constructor parameter to avoid
	 * undesired sampling patterns.
	 *
	 * Based on "Scalable Ambient Obscurance" by Morgan McGuire et al. and "Depth-aware upsampling experiments" by Eleni
	 * Maria Stea:
	 * https://research.nvidia.com/publication/scalable-ambient-obscurance
	 * https://eleni.mutantstargoat.com/hikiko/on-depth-aware-upsampling
	 *
	 * The view position calculation is based on a shader by Norbert Nopper:
	 * https://github.com/McNopper/OpenGL/blob/master/Example28/shader/ssao.frag.glsl
	 */
	export class SSAOEffect extends Effect {

		/**
		 * Constructs a new SSAO effect.
		 *
		 * @todo Move normalBuffer to options.
		 * @param {Camera} [camera] - The main camera.
		 * @param {Texture} [normalBuffer] - A texture that contains the scene normals.
		 * @param {Object} [options] - The options.
		 * @param {BlendFunction} [options.blendFunction=BlendFunction.MULTIPLY] - The blend function of this effect.
		 * @param {Boolean} [options.distanceScaling=true] - Deprecated.
		 * @param {Boolean} [options.depthAwareUpsampling=true] - Enables or disables depth-aware upsampling. Has no effect if WebGL 2 is not supported.
		 * @param {Texture} [options.normalDepthBuffer=null] - Deprecated.
		 * @param {Number} [options.samples=9] - The amount of samples per pixel. Should not be a multiple of the ring count.
		 * @param {Number} [options.rings=7] - The amount of spiral turns in the occlusion sampling pattern. Should be a prime number.
		 * @param {Number} [options.worldDistanceThreshold] - The world distance threshold at which the occlusion effect starts to fade out.
		 * @param {Number} [options.worldDistanceFalloff] - The world distance falloff. Influences the smoothness of the occlusion cutoff.
		 * @param {Number} [options.worldProximityThreshold] - The world proximity threshold at which the occlusion starts to fade out.
		 * @param {Number} [options.worldProximityFalloff] - The world proximity falloff. Influences the smoothness of the proximity cutoff.
		 * @param {Number} [options.distanceThreshold=0.97] - Deprecated.
		 * @param {Number} [options.distanceFalloff=0.03] - Deprecated.
		 * @param {Number} [options.rangeThreshold=0.0005] - Deprecated.
		 * @param {Number} [options.rangeFalloff=0.001] - Deprecated.
		 * @param {Number} [options.minRadiusScale=0.1] - The minimum radius scale.
		 * @param {Number} [options.luminanceInfluence=0.7] - Determines how much the luminance of the scene influences the ambient occlusion.
		 * @param {Number} [options.radius=0.1825] - The occlusion sampling radius, expressed as a scale relative to the resolution. Range [1e-6, 1.0].
		 * @param {Number} [options.intensity=1.0] - The intensity of the ambient occlusion.
		 * @param {Number} [options.bias=0.025] - An occlusion bias. Eliminates artifacts caused by depth discontinuities.
		 * @param {Number} [options.fade=0.01] - Influences the smoothness of the shadows. A lower value results in higher contrast.
		 * @param {Color} [options.color=null] - The color of the ambient occlusion.
		 * @param {Number} [options.resolutionScale=1.0] - The resolution scale.
		 * @param {Number} [options.resolutionX=Resolution.AUTO_SIZE] - The horizontal resolution.
		 * @param {Number} [options.resolutionY=Resolution.AUTO_SIZE] - The vertical resolution.
		 * @param {Number} [options.width=Resolution.AUTO_SIZE] - Deprecated. Use resolutionX instead.
		 * @param {Number} [options.height=Resolution.AUTO_SIZE] - Deprecated. Use resolutionY instead.
		 */
		constructor(
			camera?: Camera,
			normalBuffer?: Texture,
			{
				blendFunction,
				distanceScaling,
				depthAwareUpsampling,
				normalDepthBuffer,
				samples,
				rings,
				worldDistanceThreshold,
				worldDistanceFalloff,
				worldProximityThreshold,
				worldProximityFalloff,
				distanceThreshold,
				distanceFalloff,
				rangeThreshold,
				rangeFalloff,
				minRadiusScale,
				luminanceInfluence,
				radius,
				intensity,
				bias,
				fade,
				color,
				resolutionScale,
				resolutionX,
				resolutionY,
				width,
				height
			}?: {
				blendFunction?: BlendFunction;
				distanceScaling?: boolean;
				depthAwareUpsampling?: boolean;
				normalDepthBuffer?: Texture;
				samples?: number;
				rings?: number;
				worldDistanceThreshold: number;
				worldDistanceFalloff: number;
				worldProximityThreshold: number;
				worldProximityFalloff: number;
				distanceThreshold?: number;
				distanceFalloff?: number;
				rangeThreshold?: number;
				rangeFalloff?: number;
				minRadiusScale?: number;
				luminanceInfluence?: number;
				radius?: number;
				intensity?: number;
				bias?: number;
				fade?: number;
				color?: Color;
				resolutionScale?: number;
				resolutionX?: number;
				resolutionY?: number;
				width?: number;
				height?: number;
			}
		);

		resolution: Resolution;
		/**
		 * Sets the normal buffer.
		 *
		 * @type {Texture}
		 */
		get normalBuffer(): Texture | null;
		set normalBuffer(value: Texture | null);
		/**
		 * Indicates whether depth-aware upsampling is enabled.
		 *
		 * @type {Boolean}
		 */
		get depthAwareUpsampling(): boolean;
		set depthAwareUpsampling(arg: boolean);
		/**
		 * The color of the ambient occlusion. Set to `null` to disable.
		 *
		 * @type {Color}
		 */
		get color(): Color;
		set color(arg: Color);
		/**
		 * Returns the resolution settings.
		 *
		 * @deprecated Use resolution instead.
		 * @return {Resolution} The resolution.
		 */
		getResolution(): Resolution;
		/**
		 * The SSAO material.
		 *
		 * @type {SSAOMaterial}
		 */
		get ssaoMaterial(): SSAOMaterial;
		/**
		 * Returns the SSAO material.
		 *
		 * @deprecated Use ssaoMaterial instead.
		 * @return {SSAOMaterial} The material.
		 */
		getSSAOMaterial(): SSAOMaterial;
		/**
		 * The amount of occlusion samples per pixel.
		 *
		 * @type {Number}
		 * @deprecated Use ssaoMaterial.samples instead.
		 */
		get samples(): number;
		set samples(arg: number);
		/**
		 * The amount of spiral turns in the occlusion sampling pattern.
		 *
		 * @type {Number}
		 * @deprecated Use ssaoMaterial.rings instead.
		 */
		get rings(): number;
		set rings(arg: number);
		/**
		 * The occlusion sampling radius.
		 *
		 * @type {Number}
		 * @deprecated Use ssaoMaterial.radius instead.
		 */
		get radius(): number;
		set radius(arg: number);
		/**
		 * The intensity.
		 *
		 * @type {Number}
		 */
		get intensity(): number;
		set intensity(arg: number);
		/**
		 * Indicates whether depth-aware upsampling is enabled.
		 *
		 * @deprecated Use depthAwareUpsampling instead.
		 * @return {Boolean} Whether depth-aware upsampling is enabled.
		 */
		isDepthAwareUpsamplingEnabled(): boolean;
		/**
		 * Enables or disables depth-aware upsampling.
		 *
		 * @deprecated Use depthAwareUpsampling instead.
		 * @param {Boolean} value - Whether depth-aware upsampling should be enabled.
		 */
		setDepthAwareUpsamplingEnabled(value: boolean): void;
		/**
		 * Indicates whether distance-based radius scaling is enabled.
		 *
		 * @type {Boolean}
		 * @deprecated Use ssaoMaterial.distanceScaling instead.
		 */
		get distanceScaling(): boolean;
		set distanceScaling(arg: boolean);
		/**
		 * Returns the color of the ambient occlusion.
		 *
		 * @deprecated Use color instead.
		 * @return {Color} The color.
		 */
		getColor(): Color;
		/**
		 * Sets the color of the ambient occlusion. Set to `null` to disable colorization.
		 *
		 * @deprecated Use color instead.
		 * @param {Color} value - The color.
		 */
		setColor(value: Color): void;
		/**
		 * Sets the occlusion distance cutoff.
		 *
		 * @deprecated Use ssaoMaterial instead.
		 * @param {Number} threshold - The distance threshold. Range [0.0, 1.0].
		 * @param {Number} falloff - The falloff. Range [0.0, 1.0].
		 */
		setDistanceCutoff(threshold: number, falloff: number): void;
		/**
		 * Sets the occlusion proximity cutoff.
		 *
		 * @deprecated Use ssaoMaterial instead.
		 * @param {Number} threshold - The proximity threshold. Range [0.0, 1.0].
		 * @param {Number} falloff - The falloff. Range [0.0, 1.0].
		 */
		setProximityCutoff(threshold: number, falloff: number): void;
		/**
		 * Updates this effect.
		 *
		 * @param {WebGLRenderer} renderer - The renderer.
		 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
		 * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
		 */
		update(
			renderer: WebGLRenderer,
			inputBuffer: WebGLRenderTarget,
			deltaTime?: number
		): void;
		/**
		 * Sets the size.
		 *
		 * @param {Number} width - The width.
		 * @param {Number} height - The height.
		 */
		setSize(width: number, height: number): void;
		/**
		 * The luminance influence factor. Range: [0.0, 1.0].
		 *
		 * @type {Boolean}
		 */
		get luminanceInfluence(): boolean;
		set luminanceInfluence(value: boolean);

	}

	/**
	 * A texture effect.
	 */
	export class TextureEffect extends Effect {

		/**
		 * Constructs a new texture effect.
		 *
		 * @param {Object} [options] - The options.
		 * @param {BlendFunction} [options.blendFunction=BlendFunction.NORMAL] - The blend function of this effect.
		 * @param {Texture} [options.texture] - A texture.
		 * @param {Boolean} [options.aspectCorrection=false] - Deprecated. Adjust the texture's offset, repeat and center instead.
		 */
		constructor({
			blendFunction,
			texture,
			aspectCorrection
		}?: {
			blendFunction?: BlendFunction;
			texture?: Texture;
			aspectCorrection?: boolean;
		});

		set texture(arg: Texture);
		/**
		 * The texture.
		 *
		 * @type {Texture}
		 */
		get texture(): Texture;
		set aspectCorrection(arg: number);
		/**
		 * Indicates whether aspect correction is enabled.
		 *
		 * @type {Number}
		 * @deprecated Adjust the texture's offset, repeat, rotation and center instead.
		 */
		get aspectCorrection(): number;
		/**
		 * Returns the texture.
		 *
		 * @deprecated Use texture instead.
		 * @return {Texture} The texture.
		 */
		getTexture(): Texture;
		/**
		 * Sets the texture.
		 *
		 * @deprecated Use texture instead.
		 * @param {Texture} value - The texture.
		 */
		setTexture(value: Texture): void;
		set uvTransform(arg: boolean);
		/**
		 * Indicates whether the texture UV coordinates will be transformed using the transformation matrix of the texture.
		 *
		 * @type {Boolean}
		 * @deprecated Use texture.matrixAutoUpdate instead.
		 */
		get uvTransform(): boolean;
		/**
		 * Sets the swizzles that will be applied to the components of a texel before it is written to the output color.
		 *
		 * @param {ColorChannel} r - The swizzle for the `r` component.
		 * @param {ColorChannel} [g=r] - The swizzle for the `g` component.
		 * @param {ColorChannel} [b=r] - The swizzle for the `b` component.
		 * @param {ColorChannel} [a=r] - The swizzle for the `a` component.
		 */
		setTextureSwizzleRGBA(
			r: ColorChannel,
			g?: ColorChannel,
			b?: ColorChannel,
			a?: ColorChannel
		): void;

		/**
		 * Updates this effect.
		 *
		 * @param {WebGLRenderer} renderer - The renderer.
		 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
		 * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
		 */

		update(
			renderer: WebGLRenderer,
			inputBuffer: WebGLRenderTarget,
			deltaTime: number
		): void;

		/**
		 * Performs initialization tasks.
		 *
		 * @param {WebGLRenderer} renderer - The renderer.
		 * @param {Boolean} alpha - Whether the renderer uses the alpha channel or not.
		 * @param {Number} frameBufferType - The type of the main frame buffers.
		 */

		initialize(
			renderer: WebGLRenderer,
			alpha: boolean,
			frameBufferType: number
		): void;

	}

	/**
	 * A tone mapping mode enumeration.
	 *
	 * @type {Object}
	 * @property {Number} REINHARD - Simple Reinhard tone mapping.
	 * @property {Number} REINHARD2 - Modified Reinhard tone mapping.
	 * @property {Number} REINHARD2_ADAPTIVE - Simulates the optic nerve responding to the amount of light it is receiving.
	 * @property {Number} UNCHARTED2 - Uncharted 2 tone mapping. http://filmicworlds.com/blog/filmic-tonemapping-operators.
	 * @property {Number} OPTIMIZED_CINEON - Optimized filmic operator by Jim Hejl and Richard Burgess-Dawson.
	 * @property {Number} ACES_FILMIC - ACES tone mapping with a scale of 1.0/0.6.
	 * @property {Number} AGX - Filmic tone mapping. Requires three r160 or higher. https://github.com/EaryChow/AgX.
	 */
	export enum ToneMappingMode {
		REINHARD,
		REINHARD2,
		REINHARD2_ADAPTIVE,
		UNCHARTED2,
		OPTIMIZED_CINEON,
		ACES_FILMIC,
		AGX,
	}

	/**
	 * A tone mapping effect.
	 *
	 * Note: `ToneMappingMode.REINHARD2_ADAPTIVE` requires support for `EXT_shader_texture_lod`.
	 *
	 * Reference:
	 * GDC2007 - Wolfgang Engel, Post-Processing Pipeline
	 * http://perso.univ-lyon1.fr/jean-claude.iehl/Public/educ/GAMA/2007/gdc07/Post-Processing_Pipeline.pdf
	 */
	export class ToneMappingEffect extends Effect {

		/**
		 * Constructs a new tone mapping effect.
		 *
		 * The additional parameters only affect the Reinhard2 operator.
		 *
		 * @param {Object} [options] - The options.
		 * @param {BlendFunction} [options.blendFunction=BlendFunction.NORMAL] - The blend function of this effect.
		 * @param {Boolean} [options.adaptive=false] - Deprecated. Use mode instead.
		 * @param {ToneMappingMode} [options.mode=ToneMappingMode.ACES_FILMIC] - The tone mapping mode.
		 * @param {Number} [options.resolution=256] - The resolution of the luminance texture. Must be a power of two.
		 * @param {Number} [options.maxLuminance=4.0] - Deprecated. Same as whitePoint.
		 * @param {Number} [options.whitePoint=4.0] - The white point.
		 * @param {Number} [options.middleGrey=0.6] - The middle grey factor.
		 * @param {Number} [options.minLuminance=0.01] - The minimum luminance. Prevents very high exposure in dark scenes.
		 * @param {Number} [options.averageLuminance=1.0] - The average luminance. Used for the non-adaptive Reinhard operator.
		 * @param {Number} [options.adaptationRate=1.0] - The luminance adaptation rate.
		 */
		constructor({
			blendFunction,
			adaptive,
			mode,
			resolution,
			maxLuminance,
			whitePoint,
			middleGrey,
			minLuminance,
			averageLuminance,
			adaptationRate
		}?: {
			blendFunction?: BlendFunction;
			adaptive?: boolean;
			mode?: ToneMappingMode;
			resolution?: number;
			maxLuminance?: number;
			whitePoint?: number;
			middleGrey?: number;
			minLuminance?: number;
			averageLuminance?: number;
			adaptationRate?: number;
		});

		set resolution(arg: number);
		/**
		 * The resolution of the luminance texture. Must be a power of two.
		 *
		 * @type {Number}
		 */
		get resolution(): number;
		set mode(arg: ToneMappingMode);
		/**
		 * The tone mapping mode.
		 *
		 * @type {ToneMappingMode}
		 */
		get mode(): ToneMappingMode;
		/**
		 * The white point. Default is `16.0`.
		 *
		 * Only applies to Reinhard2 (Modified & Adaptive).
		 *
		 * @type {Number}
		 */
		get whitePoint(): number;
		/**
		 * The middle grey factor. Default is `0.6`.
		 *
		 * Only applies to Reinhard2 (Modified & Adaptive).
		 *
		 * @type {Number}
		 */
		get middleGrey(): number;
		/**
		 * The average luminance.
		 *
		 * Only applies to Reinhard2 (Modified).
		 *
		 * @type {Number}
		 */
		get averageLuminance(): number;
		/**
		 * Returns the current tone mapping mode.
		 *
		 * @deprecated Use mode instead.
		 * @return {ToneMappingMode} The tone mapping mode.
		 */
		getMode(): ToneMappingMode;
		/**
		 * Sets the tone mapping mode.
		 *
		 * @deprecated Use mode instead.
		 * @param {ToneMappingMode} value - The tone mapping mode.
		 */
		setMode(value: ToneMappingMode): void;
		/**
		 * The adaptive luminance material.
		 *
		 * @type {AdaptiveLuminanceMaterial}
		 */
		get adaptiveLuminanceMaterial(): AdaptiveLuminanceMaterial;
		/**
		 * Returns the adaptive luminance material.
		 *
		 * @deprecated Use adaptiveLuminanceMaterial instead.
		 * @return {AdaptiveLuminanceMaterial} The material.
		 */
		getAdaptiveLuminanceMaterial(): AdaptiveLuminanceMaterial;
		/**
		 * Returns the resolution of the luminance texture.
		 *
		 * @deprecated Use resolution instead.
		 * @return {Number} The resolution.
		 */
		getResolution(): number;
		/**
		 * Sets the resolution of the luminance texture. Must be a power of two.
		 *
		 * @deprecated Use resolution instead.
		 * @param {Number} value - The resolution.
		 */
		setResolution(value: number): void;
		set adaptive(arg: boolean);
		/**
		 * Indicates whether this pass uses adaptive luminance.
		 *
		 * @type {Boolean}
		 * @deprecated Use mode instead.
		 */
		get adaptive(): boolean;
		set adaptationRate(arg: number);
		/**
		 * The luminance adaptation rate.
		 *
		 * @type {Number}
		 * @deprecated Use adaptiveLuminanceMaterial.adaptationRate instead.
		 */
		get adaptationRate(): number;
		set distinction(arg: number);
		/**
		 * @type {Number}
		 * @deprecated
		 */
		get distinction(): number;
		/**
		 * Updates this effect.
		 *
		 * @param {WebGLRenderer} renderer - The renderer.
		 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
		 * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
		 */
		update(
			renderer: WebGLRenderer,
			inputBuffer: WebGLRenderTarget,
			deltaTime?: number
		): void;

		/**
		 * Performs initialization tasks.
		 *
		 * @param {WebGLRenderer} renderer - The renderer.
		 * @param {Boolean} alpha - Whether the renderer uses the alpha channel or not.
		 * @param {Number} frameBufferType - The type of the main frame buffers.
		 */
		initialize(
			renderer: WebGLRenderer,
			alpha: boolean,
			frameBufferType: number
		): void;

	}

	/**
	 * An enumeration of Vignette techniques.
	 *
	 * @type {Object}
	 * @property {Number} DEFAULT - Produces a dusty look.
	 * @property {Number} ESKIL - Produces a burned look.
	 */
	export enum VignetteTechnique {
		DEFAULT,
		ESKIL,
	}
	/**
	 * A Vignette effect.
	 */
	export class VignetteEffect extends Effect {

		/**
		 * Constructs a new Vignette effect.
		 *
		 * @param {Object} [options] - The options.
		 * @param {BlendFunction} [options.blendFunction=BlendFunction.NORMAL] - The blend function of this effect.
		 * @param {VignetteTechnique} [options.technique=VignetteTechnique.DEFAULT] - The Vignette technique.
		 * @param {Boolean} [options.eskil=false] - Deprecated. Use technique instead.
		 * @param {Number} [options.offset=0.5] - The Vignette offset.
		 * @param {Number} [options.darkness=0.5] - The Vignette darkness.
		 */
		constructor({
			blendFunction,
			technique,
			eskil,
			offset,
			darkness
		}?: {
			blendFunction?: BlendFunction;
			technique?: VignetteTechnique;
			eskil?: boolean;
			offset?: number;
			darkness?: number;
		});

		set technique(arg: VignetteTechnique);
		/**
		 * The Vignette technique.
		 *
		 * @type {VignetteTechnique}
		 */
		get technique(): VignetteTechnique;
		/**
		 * Indicates whether Eskil's Vignette technique is enabled.
		 *
		 * @type {Boolean}
		 * @deprecated Use technique instead.
		 */
		set eskil(arg: boolean);
		/**
		 * Indicates whether Eskil's Vignette technique is enabled.
		 *
		 * @type {Boolean}
		 * @deprecated Use technique instead.
		 */
		get eskil(): boolean;
		/**
		 * Returns the Vignette technique.
		 *
		 * @deprecated Use technique instead.
		 * @return {VignetteTechnique} The technique.
		 */
		getTechnique(): VignetteTechnique;
		/**
		 * Sets the Vignette technique.
		 *
		 * @deprecated Use technique instead.
		 * @param {VignetteTechnique} value - The technique.
		 */
		setTechnique(value: VignetteTechnique): void;
		set offset(arg: number);
		/**
		 * The Vignette offset.
		 *
		 * @type {Number}
		 */
		get offset(): number;
		/**
		 * Returns the Vignette offset.
		 *
		 * @deprecated Use offset instead.
		 * @return {Number} The offset.
		 */
		getOffset(): number;
		/**
		 * Sets the Vignette offset.
		 *
		 * @deprecated Use offset instead.
		 * @param {Number} value - The offset.
		 */
		setOffset(value: number): void;
		set darkness(arg: number);
		/**
		 * The Vignette darkness.
		 *
		 * @type {Number}
		 */
		get darkness(): number;
		/**
		 * Returns the Vignette darkness.
		 *
		 * @deprecated Use darkness instead.
		 * @return {Number} The darkness.
		 */
		getDarkness(): number;
		/**
		 * Sets the Vignette darkness.
		 *
		 * @deprecated Use darkness instead.
		 * @param {Number} value - The darkness.
		 */
		setDarkness(value: number): void;

	}

	/**
	 * An enumeration of LUT worker operations.
	 *
	 * @type {Object}
	 * @property {String} SCALE_UP - Tetrahedral upscale operation.
	 */
	export enum LUTOperation {
		SCALE_UP = "lut.scaleup",
	}

	/**
	 * A tetrahedral upscaler that can be used to augment 3D LUTs.
	 *
	 * Based on an implementation by Garrett Johnson:
	 * https://github.com/gkjohnson/threejs-sandbox/blob/master/3d-lut/src/TetrahedralUpscaler.js
	 */
	export class TetrahedralUpscaler {

		/**
		 * Expands the given data to the target size.
		 *
		 * @param {ArrayBufferView} data - The input RGBA data. Assumed to be cubic.
		 * @param {Number} size - The target size.
		 * @return {ArrayBufferView} The new data.
		 */
		static expand(data: ArrayBufferView, size: number): ArrayBufferView;

	}

	/**
	 * SMAA area image data.
	 *
	 * This texture allows to obtain the area for a certain pattern and distances to the left and right of identified lines.
	 *
	 * Based on the official python scripts:
	 *	https://github.com/iryoku/smaa/tree/master/Scripts
	 */
	export class SMAAAreaImageData {

		/**
		 * Creates a new area image.
		 *
		 * @return {RawImageData} The generated image data.
		 */
		static generate(): RawImageData;

	}

	/**
	 * An SMAA image generator.
	 *
	 * This class uses a worker thread to generate the search and area images. The generated data URLs will be cached using
	 * localStorage, if available. To disable caching use {@link SMAAImageGenerator.setCacheEnabled}.
	 */
	export class SMAAImageGenerator {

		/**
		 * Indicates whether data image caching is disabled.
		 *
		 * @type {Boolean}
		 * @deprecated Use setCacheEnabled() instead.
		 */
		disableCache: boolean;
		/**
		 * Enables or disables caching via localStorage.
		 *
		 * @param {Boolean} value - Whether the cache should be enabled.
		 */
		setCacheEnabled(value: boolean): void;
		/**
		 * Generates the SMAA data images.
		 *
		 * @example
		 * SMAAImageGenerator.generate().then(([search, area]) => {
		 *		const smaaEffect = new SMAAEffect(search, area);
		 * });
		 * @return {Promise<Image[]>} A promise that returns the search image and area image as a pair.
		 */
		generate(): Promise<
		(new (width?: number, height?: number) => HTMLImageElement)[]
		>;

	}

	/**
	 * SMAA search image data.
	 *
	 * This image stores information about how many pixels the line search algorithm must advance in the last step.
	 *
	 * Based on the official python scripts:
	 *	https://github.com/iryoku/smaa/tree/master/Scripts
	 */
	export class SMAASearchImageData {

		/**
		 * Creates a new search image.
		 *
		 * @return {RawImageData} The generated image data.
		 */
		static generate(): RawImageData;

	}

	/**
	 * A 3D lookup texture (LUT).
	 *
	 * This texture can be used as-is in a WebGL 2 context. It can also be converted into a 2D texture.
	 */
	export class LookupTexture extends Data3DTexture {

		/**
		 * Creates a new 3D LUT by copying a given LUT.
		 *
		 * Common image-based textures will be converted into 3D data textures.
		 *
		 * @param {Texture} texture - The LUT. Assumed to be cubic.
		 * @return {LookupTexture} A new 3D LUT.
		 */
		static from(texture: Texture): LookupTexture;
		/**
		 * Creates a neutral 3D LUT.
		 *
		 * @param {Number} size - The sidelength.
		 * @return {LookupTexture} A neutral 3D LUT.
		 */
		static createNeutral(size: number): LookupTexture;
		/**
		 * Constructs a cubic 3D lookup texture.
		 *
		 * @param {TypedArray} data - The pixel data. The default format is RGBA.
		 * @param {Number} size - The sidelength.
		 */
		constructor(data: ArrayBufferView, size: number);
		/**
		 * The lower bounds of the input domain.
		 *
		 * @type {Vector3}
		 */
		domainMin: Vector3;
		/**
		 * The upper bounds of the input domain.
		 *
		 * @type {Vector3}
		 */
		domainMax: Vector3;
		/**
		 * Indicates that this is an instance of LookupTexture3D.
		 *
		 * @type {Boolean}
		 * @deprecated
		 */
		get isLookupTexture3D(): boolean;
		/**
		 * Scales this LUT up to a given target size using tetrahedral interpolation.
		 *
		 * @param {Number} size - The target sidelength.
		 * @param {Boolean} [transferData=true] - Extra fast mode. Set to false to keep the original data intact.
		 * @return {Promise<LookupTexture>} A promise that resolves with a new LUT upon completion.
		 */
		scaleUp(size: number, transferData?: boolean): Promise<LookupTexture>;
		/**
		 * Applies the given LUT to this one.
		 *
		 * @param {LookupTexture} lut - A LUT. Must have the same dimensions, type and format as this LUT.
		 * @return {LookupTexture} This texture.
		 */
		applyLUT(lut: LookupTexture): LookupTexture;
		/**
		 * Converts the LUT data into unsigned byte data.
		 *
		 * This is a lossy operation which should only be performed after all other transformations have been applied.
		 *
		 * @return {LookupTexture} This texture.
		 */
		convertToUint8(): LookupTexture;
		/**
		 * Converts the LUT data into float data.
		 *
		 * @return {LookupTexture} This texture.
		 */
		convertToFloat(): LookupTexture;
		/**
		 * Converts this LUT into RGBA data.
		 *
		 * @deprecated LUTs are RGBA by default since three r137.
		 * @return {LookupTexture} This texture.
		 */
		convertToRGBA(): LookupTexture;
		/**
		 * Converts the output of this LUT into sRGB color space.
		 *
		 * @return {LookupTexture} This texture.
		 */
		convertLinearToSRGB(): LookupTexture;
		/**
		 * Converts the output of this LUT into linear color space.
		 *
		 * @return {LookupTexture} This texture.
		 */
		convertSRGBToLinear(): LookupTexture;
		/**
		 * Converts this LUT into a 2D data texture.
		 *
		 * Please note that custom input domains are not carried over to 2D textures.
		 *
		 * @return {DataTexture} The texture.
		 */
		toDataTexture(): DataTexture;

	}

	export type LookupTexture3D = LookupTexture;

	/**
	 * A simple noise texture.
	 */
	export class NoiseTexture extends DataTexture {

		/**
		 * Constructs a new noise texture.
		 *
		 * The texture format can be either `LuminanceFormat` or `RGBAFormat`. Additionally, the formats `RedFormat` and
		 * `RGFormat` can be used in a WebGL 2 context.
		 *
		 * @param {Number} width - The width.
		 * @param {Number} height - The height.
		 * @param {Number} [format=LuminanceFormat] - The texture format.
		 * @param {Number} [type=UnsignedByteType] - The texture type.
		 */
		constructor(width: number, height: number, format?: number, type?: number);

	}

	/**
	 * A container for raw RGBA image data.
	 *
	 * @implements {ImageData}
	 */
	export class RawImageData implements ImageData {

		/**
		 * Creates a new image data container.
		 *
		 * @param {ImageData|Image} image - An image or plain image data.
		 * @return {RawImageData} The image data.
		 */
		static from(
			image:
			| ImageData
			| (new (width?: number, height?: number) => HTMLImageElement)
		): RawImageData;

		/**
		 * Constructs a new image data container.
		 *
		 * @param {Number} [width=0] - The width of the image.
		 * @param {Number} [height=0] - The height of the image.
		 * @param {Uint8ClampedArray} [data=null] - The image data.
		 */
		constructor(width?: number, height?: number, data?: Uint8ClampedArray);
        colorSpace: PredefinedColorSpace;
		/**
		 * The width of the image.
		 *
		 * @type {Number}
		 */
		width: number;
		/**
		 * The height of the image.
		 *
		 * @type {Number}
		 */
		height: number;
		/**
		 * The RGBA image data.
		 *
		 * @type {Uint8ClampedArray}
		 */
		data: Uint8ClampedArray;
		/**
		 * Creates a canvas from this image data.
		 *
		 * @return {HTMLCanvasElement} The canvas, or null if it couldn't be created.
		 */
		toCanvas(): HTMLCanvasElement;

	}

	/**
	 * An SMAA image loader.
	 *
	 * @deprecated Preloading the SMAA lookup textures is no longer required.
	 * @experimental Added for testing, API might change in patch or minor releases. Requires three >= r108.
	 */
	export class SMAAImageLoader extends Loader {

		/**
		 * Loads the SMAA data images.
		 *
		 * @param {Function} [onLoad] - A callback that receives the search image and area image as a pair.
		 * @param {Function} [onError] - An error callback that receives the URL of the image that failed to load.
		 * @return {Promise<Image[]>} A promise that returns the search image and area image as a pair.
		 */
		load(
			url?: string | null,
			onLoad?: Function,
			onError?: Function
		): Promise<(new (width?: number, height?: number) => HTMLImageElement)[]>;

	}

	/**
	 * A 3D LUT loader that supports the .cube file format.
	 *
	 * Based on an implementation by Garrett Johnson:
	 * https://github.com/gkjohnson/threejs-sandbox/tree/master/3d-lut
	 *
	 * For more details see:
	 * https://wwwimages2.adobe.com/content/dam/acom/en/products/speedgrade/cc/pdfs/cube-lut-specification-1.0.pdf
	 */
	export class LUTCubeLoader extends Loader {

		/**
		 * Loads a LUT.
		 *
		 * @param {String} url - The URL of the CUBE-file.
		 * @param {Function} [onLoad] - A callback that receives the loaded lookup texture.
		 * @param {Function} [onProgress] - A progress callback that receives the XMLHttpRequest instance.
		 * @param {Function} [onError] - An error callback that receives the URL of the file that failed to load.
		 * @return {Promise<LookupTexture>} A promise that returns the lookup texture.
		 */
		load(
			url: string,
			onLoad?: Function,
			onProgress?: Function,
			onError?: Function
		): Promise<LookupTexture>;

		/**
		 * Parses the given data.
		 *
		 * @param {String} input - The LUT data.
		 * @return {LookupTexture} The lookup texture.
		 * @throws {Error} Fails if the data is invalid.
		 */
		parse(input: string): LookupTexture;

	}

	/**
	 * A 3D LUT loader that supports the .3dl file format.
	 *
	 * Based on an implementation by Garrett Johnson:
	 * https://github.com/gkjohnson/threejs-sandbox/tree/master/3d-lut
	 *
	 * For more details see:
	 * http://download.autodesk.com/us/systemdocs/help/2011/lustre/index.html?url=./files/WSc4e151a45a3b785a24c3d9a411df9298473-7ffd.htm,topicNumber=d0e9492
	 */
	export class LUT3dlLoader extends Loader {

		/**
		 * Loads a LUT.
		 *
		 * @param {String} url - The URL of the 3dl-file.
		 * @param {Function} [onLoad] - A callback that receives the loaded lookup texture.
		 * @param {Function} [onProgress] - A progress callback that receives the XMLHttpRequest instance.
		 * @param {Function} [onError] - An error callback that receives the URL of the file that failed to load.
		 * @return {Promise<LookupTexture>} A promise that returns the lookup texture.
		 */
		load(
			url: string,
			onLoad?: Function,
			onProgress?: Function,
			onError?: Function
		): Promise<LookupTexture>;

		/**
		 * Parses the given data.
		 *
		 * @param {String} input - The LUT data.
		 * @return {LookupTexture} The lookup texture.
		 * @throws {Error} Fails if the data is invalid.
		 */
		parse(input: string): LookupTexture;

	}

	/**
	 * Determines the texture inline decoding.
	 *
	 * @param {Texture} texture - A texture.
	 * @param {Boolean} isWebGL2 - Whether the context is WebGL 2.
	 * @return {String} The decoding.
	 * @ignore
	 */
	export function getTextureDecoding(
		texture: Texture,
		isWebGL2: boolean
	): string;

	/**
	 * Converts orthographic depth to view Z.
	 *
	 * @see https://github.com/mrdoob/three.js/blob/0de4e75ee65c3238957318b88ef91b6597e23c1e/src/renderers/shaders/ShaderChunk/packing.glsl.js#L42
	 * @param {Number} depth - The linear clip Z.
	 * @param {Number} near - The camera near plane.
	 * @param {Number} far - The camera far plane.
	 * @return {Number} The view Z.
	 * @ignore
	 */
	export function orthographicDepthToViewZ(
		depth: number,
		near: number,
		far: number
	): number;

	/**
	 * Converts view Z to orthographic depth.
	 *
	 * @see https://github.com/mrdoob/three.js/blob/0de4e75ee65c3238957318b88ef91b6597e23c1e/src/renderers/shaders/ShaderChunk/packing.glsl.js#L39
	 * @param {Number} viewZ - The view Z. Expected to be negative.
	 * @param {Number} near - The camera near plane.
	 * @param {Number} far - The camera far plane.
	 * @return {Number} The depth.
	 * @ignore
	 */
	export function viewZToOrthographicDepth(
		viewZ: number,
		near: number,
		far: number
	): number;

	/**
	 * A lens distortion effect.
	 *
	 * Original shader ported from https://github.com/ycw/three-lens-distortion
	 */

	export class LensDistortionEffect extends Effect {

		/**
		* Constructs a new lens distortion effect.
		*
		* @param {Object} [options] - The options.
		* @param {Vector2} [options.distortion] - The distortion value.
		* @param {Vector2} [options.principalPoint] - The center point.
		* @param {Vector2} [options.focalLength] - The focal length.
		* @param {Number} [options.skew=0] - The skew value.
		*/

		constructor({
			distortion,
			principalPoint,
			focalLength,
			skew
		}?: {
			distortion: Vector2;
			principalPoint: Vector2;
			focalLength: Vector2;
			skew?: number;
		});

		/**
		 * The radial distortion coefficients. Default is (0, 0).
		 *
		 * @type {Vector2}
		 */

		get distortion(): Vector2;
		set distortion(value: Vector2);

		/**
		 * The principal point. Default is (0, 0).
		 *
		 * @type {Vector2}
		 */

		get principalPoint(): Vector2;
		set principalPoint(value: Vector2);

		/**
		 * The focal length. Default is (1, 1).
		 *
		 * @type {Vector2}
		 */

		get focalLength(): Vector2;
		set focalLength(value: Vector2);

		/**
		 * The skew factor in radians.
		 *
		 * @type {Number}
		 */

		get skew(): number;
		set skew(value: number);

	}

}
