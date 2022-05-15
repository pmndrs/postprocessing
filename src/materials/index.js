export * from "./AdaptiveLuminanceMaterial";
export * from "./BokehMaterial";
export * from "./CircleOfConfusionMaterial";
export * from "./KawaseBlurMaterial";
export * from "./CopyMaterial";
export * from "./DepthComparisonMaterial";
export * from "./DepthCopyMaterial";
export * from "./DepthDownsamplingMaterial";
export * from "./DepthMaskMaterial";
export * from "./EdgeDetectionMaterial";
export * from "./EdgeDetectionMaterial";
export * from "./EffectMaterial";
export * from "./GodRaysMaterial";
export * from "./LuminanceMaterial";
export * from "./MaskMaterial";
export * from "./OutlineMaterial";
export * from "./SMAAWeightsMaterial";
export * from "./SSAOMaterial";

// Added for backward compatibility.
export { KawaseBlurMaterial as ConvolutionMaterial } from "./KawaseBlurMaterial";
export { EdgeDetectionMaterial as ColorEdgesMaterial } from "./EdgeDetectionMaterial";
export { OutlineMaterial as OutlineEdgesMaterial } from "./OutlineMaterial";
