import { ShaderMaterial, Uniform, Vector2, Vector3, Matrix4, AdditiveBlending } from "three";

import edgeDetectionFragment from "./glsl/outline/edge-detection.frag";
import edgeDetectionVertex from "./glsl/outline/edge-detection.vert";
import overlayFragment from "./glsl/outline/overlay.frag";
import overlayVertex from "./glsl/outline/overlay.vert";
import prepareMaskFragment from "./glsl/outline/prepare-mask.frag";
import prepareMaskVertex from "./glsl/outline/prepare-mask.vert";
import seperableBlurFragment from "./glsl/outline/seperable-blur.frag";
import seperableBlurVertex from "./glsl/outline/seperable-blur.vert";

/**
 * A material to create a texture mask based off of the relative depths of
 * selected and non selected objects
 */
export class PrepareMaskMaterial extends ShaderMaterial {

  /**
   * Constructs a new PrepareMask material
   *
   * @param  {Side} options.side The threejs side type
   */

  constructor({ side }) {
    super({
      uniforms: {
        depthTexture: new Uniform(null),
        cameraNearFar: new Uniform(new Vector2(0.5, 0.5)),
        textureMatrix: new Uniform(new Matrix4())
      },

      vertexShader: prepareMaskVertex,
      fragmentShader: prepareMaskFragment
    });
  }
}

/**
 * A material to detect edges based on the passed in mask texture
 */

export class EdgeDetectionMaterial extends ShaderMaterial {

  /**
   * Constructs a new EdgeDetection material
   */

  constructor() {
    super({
      uniforms: {
        maskTexture: new Uniform(null),
        texSize: new Uniform(new Vector2(0.5, 0.5)),
        visibleEdgeColor: new Uniform(new Vector3(1.0, 1.0, 1.0)),
        hiddenEdgeColor: new Uniform(new Vector3(1.0, 1.0, 1.0))
      },

      vertexShader: edgeDetectionVertex,
      fragmentShader: edgeDetectionFragment
    });
  }
}

/**
 * Create a gaussian blur of the passed in texture
 */

export class SeperableBlurMaterial extends ShaderMaterial {

  /**
   * Constructs a new SeperableBlur material
   * @param  {Number}  maxRadius    The max radius for the blur
   * @param  {Vector2} texSize      The texture size as a Vector2, x is width, y is height
   * @param  {Number}  kernelRadius The kernal radius to blur
   */

  constructor(maxRadius, texSize, kernelRadius) {
    super({
      defines: {
        MAX_RADIUS: maxRadius
      },

      uniforms: {
        colorTexture: new Uniform(null),
        texSize: new Uniform(texSize),
        direction: new Uniform(new Vector2(0.5, 0.5)),
        kernelRadius: new Uniform(kernelRadius)
      },

      vertexShader: seperableBlurVertex,
      fragmentShader: seperableBlurFragment
    });
  }
}

/**
 * Overlay textures together to create the final scene
 */

export class OverlayMaterial extends ShaderMaterial {

  /**
   * Constructs a new Overlay material
   */

  constructor() {
    super({
      uniforms: {
        maskTexture: new Uniform(null),
        edgeTexture1: new Uniform(null),
        edgeTexture2: new Uniform(null),
        patternTexture: new Uniform(null),
        edgeStrength: new Uniform(1.0),
        edgeGlow: new Uniform(1.0),
        usePatternTexture: new Uniform(0.0)
      },

      vertexShader: overlayVertex,
      fragmentShader: overlayFragment,

      blending: AdditiveBlending,
      depthTest: false,
      depthWrite: false,
      transparent: true
    });
  }
}
