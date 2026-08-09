import { EventDispatcher } from "three";
import { BaseEventMap } from "../../core/BaseEventMap.js";
import { GBuffer } from "../../enums/GBuffer.js";
import { GData } from "../../enums/GData.js";
import { ObservableMap } from "../ObservableMap.js";

/**
 * A G-Buffer schema.
 *
 * @category Utils
 */

export class GBufferSchema extends EventDispatcher<BaseEventMap> {

	/**
	 * A collection that maps G-Buffer components to G-Buffer struct field names that are used in effects.
	 */

	readonly gBufferStructFields: Map<string, string>;

	/**
	 * A collection that maps G-Buffer components to shader code that declares the respective G-Buffer struct field.
	 */

	readonly gBufferStructDeclaration: Map<string, string>;

	/**
	 * A collection that maps G-Data to shader code that declares the respective G-Data struct field.
	 */

	readonly gDataStructDeclaration: Map<string, string>;

	/**
	 * A collection that maps G-Data to shader code that fills the respective G-Data struct field.
	 */

	readonly gDataStructInitialization: Map<string, string>;

	/**
	 * A collection that describes G-Data interdependencies.
	 */

	readonly gDataDependencies: Map<string, ReadonlySet<string>>;

	/**
	 * A collection that describes which G-Buffer components are required for the G-Data.
	 */

	readonly gDataBufferSources: Map<string, ReadonlySet<string>>;

	/**
	 * Constructs a new G-Buffer schema.
	 */

	constructor() {

		super();

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
			[GBuffer.EMISSION, "mediump sampler2D emission;"]
		]);

		const gDataStructDeclaration = new ObservableMap([
			[GData.COLOR, "vec4 color;"],
			[GData.DEPTH, "float depth;"],
			[GData.NORMAL, "vec3 normal;"],
			[GData.POSITION, "vec3 position;"],
			[GData.ORM, "lowp vec3 orm;"],
			[GData.EMISSION, "mediump vec3 emission;"],
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
		gBufferStructFields.addEventListener("change", listener);
		gBufferStructDeclaration.addEventListener("change", listener);
		gDataStructDeclaration.addEventListener("change", listener);
		gDataStructInitialization.addEventListener("change", listener);
		gDataDependencies.addEventListener("change", listener);
		gDataBufferSources.addEventListener("change", listener);

		this.gBufferStructFields = gBufferStructFields;
		this.gBufferStructDeclaration = gBufferStructDeclaration;
		this.gDataStructDeclaration = gDataStructDeclaration;
		this.gDataStructInitialization = gDataStructInitialization;
		this.gDataDependencies = gDataDependencies;
		this.gDataBufferSources = gDataBufferSources;

	}

	/**
	 * Resolves G-Data dependencies.
	 *
	 * @param roots - The base G-Data.
	 * @return The resolved G-Data dependencies.
	 */

	resolveGDataGraph(roots: Iterable<string>): Map<string, Iterable<string>> {

		const graph = new Map<string, Set<string>>();
		const visiting = new Set<string>();

		const visit = (value: string): void => {

			if(visiting.has(value)) {

				throw new Error(`Circular GData dependency involving "${value}"`);

			}

			if(graph.has(value)) {

				return;

			}

			visiting.add(value);

			const dependencies = new Set(this.gDataDependencies.get(value) ?? []);
			graph.set(value, dependencies);

			for(const dependency of dependencies) {

				visit(dependency);

			}

			visiting.delete(value);

		};

		for(const root of roots) {

			visit(root);

		}

		return graph;

	}

	/**
	 * Resolves G-Data dependencies.
	 *
	 * @param roots - The base G-Data.
	 * @return The resolved G-Data dependencies.
	 */

	resolveGData(roots: Iterable<string>): Set<string> {

		return new Set(this.resolveGDataGraph(roots).keys());

	}

	/**
	 * Resolves G-Buffer components based on G-Data usage.
	 *
	 * @param roots - The G-Data for which to find the required components.
	 * @return The G-Buffer components needed for the given G-Data.
	 */

	resolveGBufferComponents(roots: Iterable<string>): Set<string> {

		const result = new Set<string>();
		const graph = this.resolveGDataGraph(roots);

		for(const gData of graph.keys()) {

			for(const component of this.gDataBufferSources.get(gData) ?? []) {

				result.add(component);

			}

		}

		return result;

	}

}
