/**
 * Exposure of the library components.
 *
 * @module postprocessing
 */

export { EffectComposer } from "./core";

export {
	BloomPass,
	BlurPass,
	BokehPass,
	Bokeh2Pass,
	ClearPass,
	ClearMaskPass,
	DotScreenPass,
	FilmPass,
	GlitchMode,
	GlitchPass,
	GodRaysPass,
	MaskPass,
	Pass,
	PixelationPass,
	RenderPass,
	SavePass,
	ShaderPass,
	ShockWavePass,
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
	DotScreenMaterial,
	FilmMaterial,
	GlitchMaterial,
	GodRaysMaterial,
	KernelSize,
	LuminosityMaterial,
	PixelationMaterial,
	ShockWaveMaterial,
	SMAABlendMaterial,
	SMAAColorEdgesMaterial,
	SMAAWeightsMaterial,
	ToneMappingMaterial
} from "./materials";

export {
	RawImageData,
	SMAAAreaImageData,
	SMAASearchImageData
} from "./materials/images";
