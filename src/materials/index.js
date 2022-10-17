export * from "./AdaptiveLuminanceMaterial";
export * from "./BokehMaterial";
export * from "./BoxBlurMaterial";
export * from "./CircleOfConfusionMaterial";
export * from "./KawaseBlurMaterial";
export * from "./CopyMaterial";
export * from "./DepthComparisonMaterial";
export * from "./DepthCopyMaterial";
export * from "./DepthDownsamplingMaterial";
export * from "./DepthMaskMaterial";
export * from "./DownsamplingMaterial";
export * from "./EdgeDetectionMaterial";
export * from "./EdgeDetectionMaterial";
export * from "./EffectMaterial";
export * from "./GaussianBlurMaterial";
export * from "./GodRaysMaterial";
export * from "./LuminanceMaterial";
export * from "./MaskMaterial";
export * from "./OutlineMaterial";
export * from "./SMAAWeightsMaterial";
export * from "./SSAOMaterial";
export * from "./TiltShiftBlurMaterial";
export * from "./UpsamplingMaterial";

/** @deprecated Renamed to KawaseBlurMaterial. */
export { KawaseBlurMaterial as ConvolutionMaterial } from "./KawaseBlurMaterial";
/** @deprecated Renamed to EdgeDetectionMaterial. */
export { EdgeDetectionMaterial as ColorEdgesMaterial } from "./EdgeDetectionMaterial";
/** @deprecated Renamed to OutlineMaterial. */
export { OutlineMaterial as OutlineEdgesMaterial } from "./OutlineMaterial";
