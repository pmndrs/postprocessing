/**
 * Exposure of the library components.
 *
 * @module postprocessing
 * @main postprocessing
 */

export { EffectComposer } from "./core";

export {
	BloomPass,
	BlurPass,
	BokehPass,
	Bokeh2Pass,
	ClearMaskPass,
	DepthPass,
	DotScreenPass,
	FilmPass,
	GlitchMode,
	GlitchPass,
	GodRaysPass,
	MaskPass,
	Pass,
	PixellationPass,
	RenderPass,
	SavePass,
	ShaderPass,
	SMAAPass,
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
	KernelSize,
	LuminosityMaterial,
	PixellationMaterial,
	SMAABlendMaterial,
	SMAAColorEdgesMaterial,
	SMAAWeightsMaterial,
	ToneMappingMaterial
} from "./materials";
