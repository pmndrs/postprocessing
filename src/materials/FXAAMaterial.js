import { ShaderMaterial, Uniform, Vector2 } from "three";

import fragment from "./glsl/fxaa/shader.frag";
import vertex from "./glsl/fxaa/shader.vert";

/**
 * An FXAA (Fast Approximate Anti-Aliasing) material. Can be used to smooth a screen
 */

export class FXAAMaterial extends ShaderMaterial {

  /**
   * Constructs a new FXAA material
   *
   * @param {Vector2} resolution The screen size resolution, in pixel width (x) and height (y)
   */

  constructor(resolution = { x: 1024, y: 512 }) {

    const resUniform = new Vector2(1 / resolution.x, 1 / resolution.y);

    super({

      type: "FXAAMaterial",

      uniforms: {
        tDiffuse: new Uniform(null),
        resolution: new Uniform(resUniform)
      },

      fragmentShader: fragment,
      vertexShader: vertex

    });

  }

  /**
   * Set the uniform resolution of the material
   *
   * @param {Vector2} resolution The screen size resolution
   */

  setResolution(resolution) {
    this.uniforms.resolution.value = new Vector2(1 / resolution.x, 1 / resolution.y);
  }

}
