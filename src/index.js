/**
 * Exposure of the library components.
 *
 * @module postprocessing
 * @main postprocessing
 */

export { EffectComposer } from "./effect-composer";

export {
	BloomPass,
	BokehPass,
	Bokeh2Pass,
	ClearMaskPass,
	DotScreenPass,
	FilmPass,
	GlitchPass,
	GodRaysPass,
	MaskPass,
	Pass,
	RenderPass,
	SavePass,
	SMAAPass,
	ShaderPass,
	ToneMappingPass
} from "./passes";

export {
	AdaptiveLuminosityMaterial,
	BokehMaterial,
	Bokeh2Material,
	CombineMaterial,
	ConvolutionMaterial,
	CopyMaterial,
	DotScreenMaterial,
	FilmMaterial,
	GlitchMaterial,
	GodRaysMaterial,
	LuminosityMaterial,
	SMAABlendMaterial,
	SMAAColorEdgesMaterial,
	SMAAWeightsMaterial,
	ToneMappingMaterial
} from "./materials";
