import { GBuffer } from "../enums/GBuffer.js";
import { GData } from "../enums/GData.js";
import { GBufferTextureConfig } from "./GBufferTextureConfig.js";

/**
 * A G-Buffer configuration.
 *
 * @category Utils
 * @internal
 */

export class GBufferConfig {

	/**
	 * A collection that maps {@link GBuffer} components to G-Buffer struct field names that are used in effects.
	 */

	readonly textureConfigs: Map<GBuffer | string, GBufferTextureConfig>;

	/**
	 * A collection that maps {@link GBuffer} components to texture names.
	 */

	readonly gBufferTextures: Map<GBuffer | string, string>;

	/**
	 * A collection that maps {@link GBuffer} components to G-Buffer struct field names that are used in effects.
	 */

	readonly gBufferStructFields: Map<GBuffer | string, string>;

	/**
	 * A collection that maps {@link GData} to shader code that declares the GBuffer struct.
	 */

	readonly gBufferStructDeclaration: Map<GData | string, string>;

	/**
	 * A collection that maps {@link GData} to shader code that declares the GData struct.
	 */

	readonly gDataStructDeclaration: Map<GData | string, string>;

	/**
	 * A collection that maps {@link GData} to shader code that fills the respective GData struct field.
	 */

	readonly gDataStructInitialization: Map<GData | string, string>;

	/**
	 * Constructs new a new G-Buffer config.
	 */

	constructor() {

		this.textureConfigs = new Map<GBuffer | string, GBufferTextureConfig>();

		this.gBufferTextures = new Map<GBuffer | string, string>([
			[GBuffer.COLOR, "outputColor"],
			[GBuffer.NORMAL, "outputNormal"],
			[GBuffer.ORM, "outputORM"],
			[GBuffer.EMISSION, "outputEmission"]
		]);

		this.gBufferStructFields = new Map<GBuffer | string, string>([
			[GBuffer.COLOR, "color"],
			[GBuffer.DEPTH, "depth"],
			[GBuffer.NORMAL, "normal"],
			[GBuffer.ORM, "orm"],
			[GBuffer.EMISSION, "emission"]
		]);

		this.gBufferStructDeclaration = new Map<GData | string, string>([
			[GData.COLOR, "FRAME_BUFFER_PRECISION sampler2D color;"],
			[GData.DEPTH, "DEPTH_BUFFER_PRECISION sampler2D depth;"],
			[GData.NORMAL, "mediump sampler2D normal;"],
			[GData.ORM, "lowp sampler2D orm;"],
			[GData.EMISSION, "FRAME_BUFFER_PRECISION sampler2D emission;"]
		]);

		this.gDataStructDeclaration = new Map<GData | string, string>([
			[GData.COLOR, "vec4 color;"],
			[GData.DEPTH, "float depth;"],
			[GData.NORMAL, "vec3 normal;"],
			[GData.ORM, "vec3 orm;"],
			[GData.EMISSION, "vec3 emission;"],
			[GData.LUMINANCE, "float luminance;"]
		]);

		this.gDataStructInitialization = new Map<GData | string, string>([
			[GData.COLOR, "gData.color = texture(gBuffer.color, UV);"],
			[GData.DEPTH, "gData.depth = texture(gBuffer.depth, UV).r;"],
			[GData.NORMAL, "gData.normal = texture(gBuffer.normal, UV).xyz;"],
			[GData.ORM, "gData.orm = texture(gBuffer.orm, UV).xyz;"],
			[GData.EMISSION, "gData.emission = texture(gBuffer.emission, UV).rgb;"],
			[GData.LUMINANCE, "gData.luminance = luminance(gData.color.rgb);"]
		]);

	}

}
