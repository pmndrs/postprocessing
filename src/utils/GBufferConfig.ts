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
			[GData.COLOR, "FRAME_BUFFER_PRECISION sampler2D color;"],
			[GData.DEPTH, "DEPTH_BUFFER_PRECISION sampler2D depth;"],
			[GData.NORMAL, "mediump sampler2D normal;"],
			[GData.ORM, "lowp sampler2D orm;"],
			[GData.EMISSION, "FRAME_BUFFER_PRECISION sampler2D emission;"]
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
			[GData.DEPTH, "gData.depth = texture(gBuffer.depth, UV).r;"],
			[GData.NORMAL, "gData.normal = texture(gBuffer.normal, UV).xyz;"],
			[GData.POSITION, "gData.position = getViewPosition(UV, gData.depth);"],
			[GData.ORM, "gData.orm = texture(gBuffer.orm, UV).xyz;"],
			[GData.EMISSION, "gData.emission = texture(gBuffer.emission, UV).rgb;"],
			[GData.LUMINANCE, "gData.luminance = luminance(gData.color.rgb);"]
		]);

		const gDataDependencies = new ObservableMap([
			[GData.POSITION, new Set([GData.DEPTH])],
			[GData.LUMINANCE, new Set([GData.COLOR])]
		]);

		const listener = () => this.dispatchEvent({ type: "change" });
		textureConfigs.addEventListener("change", listener);
		gBufferStructFields.addEventListener("change", listener);
		gBufferStructDeclaration.addEventListener("change", listener);
		gDataStructDeclaration.addEventListener("change", listener);
		gDataStructInitialization.addEventListener("change", listener);
		gDataDependencies.addEventListener("change", listener);

		this.textureConfigs = textureConfigs;
		this.gBufferStructFields = gBufferStructFields;
		this.gBufferStructDeclaration = gBufferStructDeclaration;
		this.gDataStructDeclaration = gDataStructDeclaration;
		this.gDataStructInitialization = gDataStructInitialization;
		this.gDataDependencies = gDataDependencies;

	}

}
