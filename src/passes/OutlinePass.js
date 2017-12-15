import {
  Vector2,
  Color,
  LinearFilter,
  RGBAFormat,
  DoubleSide,
  WebGLRenderTarget,
  MeshBasicMaterial,
  MeshDepthMaterial,
  RGBADepthPacking,
  NoBlending,
  UniformsUtils,
  ShaderMaterial,
  Mesh,
  Line,
  Sprite,
  Matrix4
} from "three";

import {
  CopyMaterial,
  PrepareMaskMaterial,
  EdgeDetectionMaterial,
  SeperableBlurMaterial,
  OverlayMaterial
} from "../materials";
import { Pass } from "./Pass.js";

const MAX_EDGE_THICKNESS = 4;
const MAX_EDGE_GLOW = 4;

const BlurDirectionX = new Vector2(1.0, 0.0);
const BlurDirectionY = new Vector2(0.0, 1.0);

const copyShader = new CopyMaterial();

/**
 * A pass that renders selected objects with an outline
 */

export class OutlinePass extends Pass {

  /**
   * Constructs a new outline pass
   *
   * @param {Vector2}         resolution      The screen width and height
   * @param {Scene}           scene           The scene to render
   * @param {Camera}          camera          The camera to use to trender the scene
   * @param {Array<Object3D>} selectedObjects An array of selected objects to outline
   */

  constructor(resolution = { x: 256, y: 256 }, scene, camera, selectedObjects = []) {

    /**
     * Call the constructor for Pass, which will create this.scene, this.camera,
     * and this.quad as new resources for the pass to use
     */

    super();

    /**
     * The name of this pass
     */

    this.name = "OutlinePass";

    /**
     * The resolution of the scene, as a Vector2 with x and y pixel values
     *
     * @type {Vector2}
     */

    this.resolution = new Vector2(resolution.x, resolution.y);

    /**
     * The scene to apply the effect to
     *
     * @type {Scene}
     */

    this.renderScene = scene;

    /**
     * The camera to for the existing scene
     *
     * @type {PerspectiveCamera}
     */

    this.renderCamera = camera;

    /**
     * An array of selected objects to outline
     *
     * @type {Array<Object3D>}
     */

    this.selectedObjects = selectedObjects;

    /**
     * The edge color displayed for the outline
     *
     * @type {Color}
     * @default [1.0, 1.0, 1.0]
     */

    this.visibleEdgeColor = new Color(1, 1, 1);

    /**
     * The edge color displayed when occluded by another object
     *
     * @type {Color}
     * @default [0.1, 0.04, 0.02]
     */

    this.hiddenEdgeColor = new Color(0.1, 0.04, 0.02);

    /**
     * The glow emanating from from the outline. Value capped at 4
     *
     * @type {Number}
     * @default 0.0
     */

    this.edgeGlow = 0.0;

    /**
     * Should a texture be applied to the surface of the object selected
     *
     * @type {Boolean}
     * @default false
     */

    this.usePatternTexture = false;

    /**
     * The edge thickness to display. Larger values create a larger outline effect
     *
     * @type {Number}
     * @default 1.0
     */

    this.edgeThickness = 1.0;

    /**
     * The edge strength to display. Larger values create a stronger outline effect
     *
     * @type {Number}
     * @default 3.0
     */

    this.edgeStrength = 3.0;

    /**
     * The downsample ratio when computing the glow effect
     *
     * @type {Number}
     * @default 2.0
     */

    this.downSampleRatio = 2.0;

    /**
     * The period, in radians, that the glow will pulse at
     *
     * @type {Number}
     * @default 0.0
     */

    this.pulsePeriod = 0;

    const pars = { minFilter: LinearFilter, magFilter: LinearFilter, format: RGBAFormat };

    const resx = Math.round(this.resolution.x / this.downSampleRatio);
    const halfResx = Math.round(resx / 2);
    const resy = Math.round(this.resolution.y / this.downSampleRatio);
    const halfResy = Math.round(resy / 2);

    this.maskBufferMaterial = new MeshBasicMaterial({ color: 0xffffff, side: DoubleSide });
    this.renderTargetMaskBuffer = new WebGLRenderTarget(this.resolution.x, this.resolution.y, pars);
    this.renderTargetMaskBuffer.texture.name = "OutlinePass.mask";
    this.renderTargetMaskBuffer.texture.generateMipmaps = false;

    this.depthMaterial = new MeshDepthMaterial({
      side: DoubleSide,
      depthPacking: RGBADepthPacking,
      blending: NoBlending
    });

    this.prepareMaskMaterial = new PrepareMaskMaterial({ side: DoubleSide });

    this.renderTargetDepthBuffer = new WebGLRenderTarget(
      this.resolution.x,
      this.resolution.y,
      pars
    );
    this.renderTargetDepthBuffer.texture.name = "OutlinePass.depth";
    this.renderTargetDepthBuffer.texture.generateMipmaps = false;

    this.renderTargetMaskDownSampleBuffer = new WebGLRenderTarget(resx, resy, pars);
    this.renderTargetMaskDownSampleBuffer.texture.name = "OutlinePass.depthDownSample";
    this.renderTargetMaskDownSampleBuffer.texture.generateMipmaps = false;

    this.renderTargetBlurBuffer1 = new WebGLRenderTarget(resx, resy, pars);
    this.renderTargetBlurBuffer1.texture.name = "OutlinePass.blur1";
    this.renderTargetBlurBuffer1.texture.generateMipmaps = false;

    this.renderTargetBlurBuffer2 = new WebGLRenderTarget(halfResx, halfResy, pars);
    this.renderTargetBlurBuffer2.texture.name = "OutlinePass.blur2";
    this.renderTargetBlurBuffer2.texture.generateMipmaps = false;

    this.edgeDetectionMaterial = new EdgeDetectionMaterial();

    this.renderTargetEdgeBuffer1 = new WebGLRenderTarget(resx, resy, pars);
    this.renderTargetEdgeBuffer1.texture.name = "OutlinePass.edge1";
    this.renderTargetEdgeBuffer1.texture.generateMipmaps = false;

    this.renderTargetEdgeBuffer2 = new WebGLRenderTarget(halfResx, halfResy, pars);
    this.renderTargetEdgeBuffer2.texture.name = "OutlinePass.edge2";
    this.renderTargetEdgeBuffer2.texture.generateMipmaps = false;

    this.separableBlurMaterial1 = new SeperableBlurMaterial(
      MAX_EDGE_THICKNESS,
      new Vector2(resx, resy),
      1
    );

    this.separableBlurMaterial2 = new SeperableBlurMaterial(
      MAX_EDGE_GLOW,
      new Vector2(halfResx, halfResy),
      MAX_EDGE_GLOW
    );

    // Overlay material
    this.overlayMaterial = new OverlayMaterial();

    this.copyUniforms = UniformsUtils.clone(copyShader.uniforms);
    this.copyUniforms.opacity.value = 1.0;

    this.materialCopy = new ShaderMaterial({
      uniforms: this.copyUniforms,
      vertexShader: copyShader.vertexShader,
      fragmentShader: copyShader.fragmentShader,
      blending: NoBlending,
      depthTest: false,
      depthWrite: false,
      transparent: true
    });

    this.enabled = true;
    this.needsSwap = false;

    this.oldClearColor = new Color();
    this.oldClearAlpha = 1;

    this.tempPulseColor1 = new Color();
    this.tempPulseColor2 = new Color();
    this.textureMatrix = new Matrix4();
  }

  /**
   * When the resolution size is updated, update the necessary sizes for each of the
   * implemented Renderer targets
   *
   * @param {Number} width  The new pixel width
   * @param {Number} height The new pixel height
   */

  setSize(width, height) {
    this.renderTargetMaskBuffer.setSize(width, height);

    const resx = Math.round(width / this.downSampleRatio);
    const halfResx = Math.round(resx / 2);
    const resy = Math.round(height / this.downSampleRatio);
    const halfResy = Math.round(resy / 2);

    this.renderTargetMaskDownSampleBuffer.setSize(resx, resy);
    this.renderTargetBlurBuffer1.setSize(resx, resy);
    this.renderTargetEdgeBuffer1.setSize(resx, resy);
    this.separableBlurMaterial1.uniforms.texSize.value.set(resx, resy);

    this.renderTargetBlurBuffer2.setSize(halfResx, halfResy);
    this.renderTargetEdgeBuffer2.setSize(halfResx, halfResy);

    this.separableBlurMaterial2.uniforms.texSize.value.set(halfResx, halfResy);
  }

  /**
   * Change the visibility of all selected objects to the passed in visibility value
   *
   * @param {Boolean} bVisible What to change visibility the object visibility to
   * @private
   */

  changeVisibilityOfSelectedObjects(bVisible) {
    function gatherSelectedMeshesCallback(object) {
      if(object.type === "Mesh") { object.visible = bVisible; }
    }

    for(let i = 0; i < this.selectedObjects.length; i++) {
      this.selectedObjects[i].traverse(gatherSelectedMeshesCallback);
    }
  }

  /**
   * Change the visibility of all non-selected objects to the passed in visibility value
   *
   * @param {Boolean} bVisible What to change visibility the object visibility to
   * @private
   */

  changeVisibilityOfNonSelectedObjects(bVisible) {
    const selectedMeshes = [];

    function gatherSelectedMeshesCallback(object) {
      if(object.type === "Mesh") { selectedMeshes.push(object); }
    }

    for(let i = 0; i < this.selectedObjects.length; i++) {
      this.selectedObjects[i].traverse(gatherSelectedMeshesCallback);
    }

    function VisibilityChangeCallback(object) {
      if(object.type === "Mesh" || object.type === "Line" || object.type === "Sprite") {
        let bFound = false;

        for(let i = 0; i < selectedMeshes.length; i++) {
          const selectedObjectId = selectedMeshes[i].id;

          if(selectedObjectId === object.id) {
            bFound = true;
            break;
          }
        }

        if(!bFound) {
          const visibility = object.visible;

          if(!bVisible || object.bVisible) { object.visible = bVisible; }

          object.bVisible = visibility;
        }
      }
    }

    this.renderScene.traverse(VisibilityChangeCallback);
  }

  /**
   * Update the texture matrix with the new camera information
   *
   * @private
   */

  updateTextureMatrix() {
    this.textureMatrix.set(0.5, 0.0, 0.0, 0.5,
                           0.0, 0.5, 0.0, 0.5,
                           0.0, 0.0, 0.5, 0.5,
                           0.0, 0.0, 0.0, 1.0);

    this.textureMatrix.multiply(this.renderCamera.projectionMatrix);
    this.textureMatrix.multiply(this.renderCamera.matrixWorldInverse);
  }

  /**
   * Renders the scene
   * @param  {WebGLRenderer}     renderer    The renderer
   * @param  {WebGLRenderTarget} readBuffer  The read buffer that will be passed to the next pass
   * @param  {WebGLRenderTarget} writeBuffer The write buffer that will be passed to the next pass
   * @param  {Number}            delta       The time difference between render passes
   * @param  {Boolean}           maskActive  Is the mask active
   */

  render(renderer, readBuffer, writeBuffer, delta, maskActive) {
    if(this.selectedObjects.length === 0) { return; }

    this.oldClearColor.copy(renderer.getClearColor());
    this.oldClearAlpha = renderer.getClearAlpha();
    const oldAutoClear = renderer.autoClear;

    renderer.autoClear = false;

    if(maskActive) { renderer.context.disable(renderer.context.STENCIL_TEST); }

    renderer.setClearColor(0xffffff, 1);

    // Make selected objects invisible
    this.changeVisibilityOfSelectedObjects(false);

    const currentBackground = this.renderScene.background;
    this.renderScene.background = null;

    // 1. Draw Non Selected objects in the depth buffer
    this.renderScene.overrideMaterial = this.depthMaterial;
    renderer.render(this.renderScene, this.renderCamera, this.renderTargetDepthBuffer, true);

    // Make selected objects visible
    this.changeVisibilityOfSelectedObjects(true);

    // Update Texture Matrix for Depth compare
    this.updateTextureMatrix();

    // Make non selected objects invisible, and draw only the selected objects,
    // by comparing the depth buffer of non selected objects
    this.changeVisibilityOfNonSelectedObjects(false);
    this.renderScene.overrideMaterial = this.prepareMaskMaterial;
    this.prepareMaskMaterial.uniforms.cameraNearFar.value = new Vector2(
      this.renderCamera.near,
      this.renderCamera.far
    );
    this.prepareMaskMaterial.uniforms.depthTexture.value = this.renderTargetDepthBuffer.texture;
    this.prepareMaskMaterial.uniforms.textureMatrix.value = this.textureMatrix;
    renderer.render(this.renderScene, this.renderCamera, this.renderTargetMaskBuffer, true);

    this.renderScene.overrideMaterial = null;
    this.changeVisibilityOfNonSelectedObjects(true);

    this.renderScene.background = currentBackground;

    // 2. Downsample to Half resolution
    this.quad.material = this.materialCopy;
    this.copyUniforms.tDiffuse.value = this.renderTargetMaskBuffer.texture;
    renderer.render(this.scene, this.camera, this.renderTargetMaskDownSampleBuffer, true);

    this.tempPulseColor1.copy(this.visibleEdgeColor);
    this.tempPulseColor2.copy(this.hiddenEdgeColor);

    if (this.pulsePeriod > 0) {
      const scalar = ((1 + 0.25) / 2) +
        (Math.cos((performance.now() * 0.01) / this.pulsePeriod) * ((1.0 - 0.25) / 2));
      this.tempPulseColor1.multiplyScalar(scalar);
      this.tempPulseColor2.multiplyScalar(scalar);
    }

    // 3. Apply Edge Detection Pass
    this.quad.material = this.edgeDetectionMaterial;
    this.edgeDetectionMaterial.uniforms.maskTexture.value = this.renderTargetMaskDownSampleBuffer.texture;
    this.edgeDetectionMaterial.uniforms.texSize.value = new Vector2(
      this.renderTargetMaskDownSampleBuffer.width,
      this.renderTargetMaskDownSampleBuffer.height
    );
    this.edgeDetectionMaterial.uniforms.visibleEdgeColor.value = this.tempPulseColor1;
    this.edgeDetectionMaterial.uniforms.hiddenEdgeColor.value = this.tempPulseColor2;
    renderer.render(this.scene, this.camera, this.renderTargetEdgeBuffer1, true);

    // 4. Apply Blur on Half res
    this.quad.material = this.separableBlurMaterial1;
    this.separableBlurMaterial1.uniforms.colorTexture.value = this.renderTargetEdgeBuffer1.texture;
    this.separableBlurMaterial1.uniforms.direction.value = BlurDirectionX;
    this.separableBlurMaterial1.uniforms.kernelRadius.value = this.edgeThickness;
    renderer.render(this.scene, this.camera, this.renderTargetBlurBuffer1, true);
    this.separableBlurMaterial1.uniforms.colorTexture.value = this.renderTargetBlurBuffer1.texture;
    this.separableBlurMaterial1.uniforms.direction.value = BlurDirectionY;
    renderer.render(this.scene, this.camera, this.renderTargetEdgeBuffer1, true);

    // Apply Blur on quarter res
    this.quad.material = this.separableBlurMaterial2;
    this.separableBlurMaterial2.uniforms.colorTexture.value = this.renderTargetEdgeBuffer1.texture;
    this.separableBlurMaterial2.uniforms.direction.value = BlurDirectionX;
    renderer.render(this.scene, this.camera, this.renderTargetBlurBuffer2, true);
    this.separableBlurMaterial2.uniforms.colorTexture.value = this.renderTargetBlurBuffer2.texture;
    this.separableBlurMaterial2.uniforms.direction.value = BlurDirectionY;
    renderer.render(this.scene, this.camera, this.renderTargetEdgeBuffer2, true);

    // Blend it additively over the input texture
    this.quad.material = this.overlayMaterial;
    this.overlayMaterial.uniforms.maskTexture.value = this.renderTargetMaskBuffer.texture;
    this.overlayMaterial.uniforms.edgeTexture1.value = this.renderTargetEdgeBuffer1.texture;
    this.overlayMaterial.uniforms.edgeTexture2.value = this.renderTargetEdgeBuffer2.texture;
    this.overlayMaterial.uniforms.patternTexture.value = this.patternTexture;
    this.overlayMaterial.uniforms.edgeStrength.value = this.edgeStrength;
    this.overlayMaterial.uniforms.edgeGlow.value = this.edgeGlow;
    this.overlayMaterial.uniforms.usePatternTexture.value = this.usePatternTexture;

    if (maskActive) { renderer.context.enable(renderer.context.STENCIL_TEST); }

    renderer.render(this.scene, this.camera, readBuffer, false);

    renderer.setClearColor(this.oldClearColor, this.oldClearAlpha);
    renderer.autoClear = oldAutoClear;
  }
}
