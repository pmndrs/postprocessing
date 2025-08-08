---
layout: single
collection: sections
title: Geometry Buffer
draft: false
menu:
  demos:
    parent: utility
script: gbuffer
---

# Geometry Buffer

## GeometryPass

The `GeometryPass` is responsible for rendering a scene and its output serves as the starting point in a render pipeline. This output is generally referred to as a "G-Buffer" and in its simplest form, it only consists of a single color texture attachment. With [MRT](https://registry.khronos.org/webgl/specs/latest/2.0/#3.7.11) it's possible to render to multiple buffers at once which enables more advanced effects. Without MRT, the entire scene would have to be rendered multiple times to obtain various types of geometry data.

Depending on the requirements of other passes in the pipeline, the `GeometryPass` will configure a G-Buffer that contains the needed texture attachments. The individual render textures will then be provided to the passes that requested them.

### Alpha

Postprocessing uses the compact `R11F_G11F_B10F` framebuffer format by default which requires alpha to be disabled. This reduces memory usage for most internal color buffers by 50% while still yielding sufficient precision to combat banding. However, if you need to use transparent framebuffers, you can enable alpha as follows:

```ts
const geoPass = new GeometryPass(scene, camera, { alpha: true });
```

> [!NOTE]
> Enabling alpha changes the internal framebuffer format to `RGBA16F`.

### Depth

Scene depth is usually stored in a standard depth buffer for fixed-function depth testing only. However, if there is any pass that requires depth input, the depth data will be stored in a `DepthTexture` instead. The format of the depth texture will either be `UnsignedInt248Type` if the `stencilBuffer` setting is enabled, or `FloatType` if it's disabled.

### Normals

View space normals are encoded using Octahedron Normal Vector Encoding which converts the normal vectors into 2 uniformly packed floats. Not only does this save space in the G-Buffer but it also increases the effective precision of the normals because it uses the whole range of values that can be expressed with 16 bit floats.

## ClearPass

Postprocessing pipelines process image data in a step-by-step fashion and it's crucial to not clear intermediate results unintentionally. Therefor, clearing has to be performed explicitly by using instances of `ClearPass` where needed. This special pass operates on the default output buffer of the next pass. If that next pass is a `GeometryPass`, clearing will be performed on the G-Buffer.

> [!NOTE]
> The `GeometryPass` does not clear its output buffer automatically. Instead, an explicit `ClearPass` must be used before it.

```ts
const pipeline = new RenderPipeline(renderer);

pipeline.add(
  new ClearPass(),
  new GeometryPass(scene, camera)
);
```

## External Resources

* [Buffer Clearing](https://www.khronos.org/opengl/wiki/Framebuffer#Buffer_clearing)
* [Octahedron Normal Vector Encoding](https://knarkowicz.wordpress.com/2014/04/16/octahedron-normal-vector-encoding/)
* [Survey of Efficient Representations for Independent Unit Vectors](https://jcgt.org/published/0003/02/01/)
* [Signed Octahedron Normal Encoding](https://johnwhite3d.blogspot.com/2017/10/signed-octahedron-normal-encoding.html)
* [A Comprehensive Explanation of Deferred Rendering](https://discuss.cocos2d-x.org/t/tutorial-a-comprehensive-explanation-of-deferred-rendering-guide-to-cocos-cyberpunk-source-code/58769)
