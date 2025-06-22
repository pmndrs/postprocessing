import { EventDispatcher } from "three";
import { BaseEventMap } from "../core/BaseEventMap.js";
import { GBuffer } from "../enums/GBuffer.js";
import { GData } from "../enums/GData.js";
import { GBufferTextureConfig } from "./GBufferTextureConfig.js";
import { ObservableMap } from "./ObservableMap.js";

/**
 * A G-Buffer configuration.
 *
 * @category Utils
 */

export class GBufferConfig extends EventDispatcher<BaseEventMap> {

	/**
	 * A collection that maps G-Buffer components to G-Buffer texture configurations.
	 */

	readonly textureConfigs: Map<GBuffer | string, GBufferTextureConfig>;

	/**
	 * A collection that maps G-Buffer components to G-Buffer struct field names that are used in effects.
	 */

	readonly gBufferStructFields: Map<GBuffer | string, string>;

	/**
	 * A collection that maps GData to shader code that declares the G-Buffer struct.
	 */

	readonly gBufferStructDeclaration: Map<GData | string, string>;

	/**
	 * A collection that maps GData to shader code that declares the GData struct.
	 */

	readonly gDataStructDeclaration: Map<GData | string, string>;

	/**
	 * A collection that maps GData to shader code that fills the respective GData struct field.
	 */

	readonly gDataStructInitialization: Map<GData | string, string>;

	/**
	 * A collection that describes GData interdependencies.
	 */

	readonly gDataDependencies: Map<GData | string, Set<GData | string>>;

	/**
	 * A collection that describes which G-Buffer components are required for the GData.
	 */

	readonly gDataBufferSources: Map<GData | string, Set<GBuffer | string>>;

	/**
	 * Constructs a new G-Buffer config.
	 */

	constructor() {

		super();

		const textureConfigs = new ObservableMap<GBuffer | string, GBufferTextureConfig>();

		const gBufferStructFields = new ObservableMap([
			[GBuffer.COLOR, "color"],
			[GBuffer.DEPTH, "depth"],
			[GBuffer.NORMAL, "normal"],
			[GBuffer.ORM, "orm"],
			[GBuffer.EMISSION, "emission"]
		]);

		const gBufferStructDeclaration = new ObservableMap([
			[GBuffer.COLOR, "FRAME_BUFFER_PRECISION sampler2D color;"],
			[GBuffer.DEPTH, "DEPTH_BUFFER_PRECISION sampler2D depth;"],
			[GBuffer.NORMAL, "mediump sampler2D normal;"],
			[GBuffer.ORM, "lowp sampler2D orm;"],
			[GBuffer.EMISSION, "FRAME_BUFFER_PRECISION sampler2D emission;"]
		]);

		const gDataStructDeclaration = new ObservableMap([
			[GData.COLOR, "vec4 color;"],
			[GData.DEPTH, "float depth;"],
			[GData.NORMAL, "vec3 normal;"],
			[GData.POSITION, "vec3 position;"],
			[GData.ORM, "vec3 orm;"],
			[GData.EMISSION, "vec3 emission;"],
			[GData.LUMINANCE, "float luminance;"]
		]);

		const gDataStructInitialization = new ObservableMap([
			[GData.COLOR, "gData.color = texture(gBuffer.color, UV);"],
			[GData.DEPTH, "gData.depth = readDepth(gBuffer.depth, UV);"],
			[GData.NORMAL, "gData.normal = readNormal(gBuffer.normal, UV);"],
			[GData.POSITION, "gData.position = getViewPosition(UV, gData.depth);"],
			[GData.ORM, "gData.orm = texture(gBuffer.orm, UV).xyz;"],
			[GData.EMISSION, "gData.emission = texture(gBuffer.emission, UV).rgb;"],
			[GData.LUMINANCE, "gData.luminance = luminance(gData.color.rgb);"]
		]);

		const gDataDependencies = new ObservableMap([
			[GData.POSITION, new Set([GData.DEPTH])],
			[GData.LUMINANCE, new Set([GData.COLOR])]
		]);

		const gDataBufferSources = new ObservableMap([
			[GData.COLOR, new Set([GBuffer.COLOR])],
			[GData.DEPTH, new Set([GBuffer.DEPTH])],
			[GData.NORMAL, new Set([GBuffer.NORMAL])],
			[GData.POSITION, new Set([GBuffer.DEPTH])],
			[GData.ORM, new Set([GBuffer.ORM])],
			[GData.EMISSION, new Set([GBuffer.EMISSION])],
			[GData.LUMINANCE, new Set([GBuffer.COLOR])]
		]);

		const listener = () => this.dispatchEvent({ type: "change" });
		textureConfigs.addEventListener("change", listener);
		gBufferStructFields.addEventListener("change", listener);
		gBufferStructDeclaration.addEventListener("change", listener);
		gDataStructDeclaration.addEventListener("change", listener);
		gDataStructInitialization.addEventListener("change", listener);
		gDataDependencies.addEventListener("change", listener);
		gDataBufferSources.addEventListener("change", listener);

		this.textureConfigs = textureConfigs;
		this.gBufferStructFields = gBufferStructFields;
		this.gBufferStructDeclaration = gBufferStructDeclaration;
		this.gDataStructDeclaration = gDataStructDeclaration;
		this.gDataStructInitialization = gDataStructInitialization;
		this.gDataDependencies = gDataDependencies;
		this.gDataBufferSources = gDataBufferSources;

	}

}
