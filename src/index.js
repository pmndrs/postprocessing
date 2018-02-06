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
	RealisticBokehPass,
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
	ColorEdgesMaterial,
	CombineMaterial,
	ConvolutionMaterial,
	CopyMaterial,
	DepthComparisonMaterial,
	DotScreenMaterial,
	FilmMaterial,
	GlitchMaterial,
	GodRaysMaterial,
	KernelSize,
	LuminosityMaterial,
	OutlineBlendMaterial,
	PixelationMaterial,
	RealisticBokehMaterial,
	ShockWaveMaterial,
	SMAABlendMaterial,
	SMAAWeightsMaterial,
	ToneMappingMaterial
} from "./materials";

export {
	RawImageData,
	SMAAAreaImageData,
	SMAASearchImageData
} from "./materials/images";
