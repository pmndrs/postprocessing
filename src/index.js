/**
 * Exposure of the library components.
 *
 * @module postprocessing
 * @main postprocessing
 */

export { EffectComposer } from "./core";

export {
	BloomPass,
	BokehPass,
	Bokeh2Pass,
	ClearMaskPass,
	DepthPass,
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
	TexturePass,
	ToneMappingPass
} from "./passes";

export {
	AdaptiveLuminosityMaterial,
	BokehMaterial,
	Bokeh2Material,
	CombineMaterial,
	ConvolutionMaterial,
	CopyMaterial,
	DepthMaterial,
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
