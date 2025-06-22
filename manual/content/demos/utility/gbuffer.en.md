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

> [!NOTE]
> The GeometryPass does not clear its output buffer automatically. Instead, an explicit ClearPass must be used before it:

```ts
const pipeline = new RenderPipeline(renderer);

pipeline.add(
  new ClearPass(),
  new GeometryPass(scene, camera)
);
```

Depending on the requirements of other passes in the pipeline, the `GeometryPass` will configure a G-Buffer that contains the needed texture attachments. The individual render textures will then be provided to the passes that requested them.

## G-Buffer Packing

WebGL 2 guarantees that a compatible device supports at least 4 texture attachments per render target. For a broad device support, postprocessing stays within this limitation and packs certain combinations of G-Buffer components into a single texture attachment. To be able to unpack this data, special shader macros that control predefined unpacking functions are provided to the requesting passes via input `defines`. If a pass uses a fullscreen material that extends `FullscreenMaterial`, these `defines` will automatically be integrated into the shaders. To finally read the data, the following shader chunk must be included in the fragment shader:

```glsl
#include <pp_gbuffer_packing>
```

This include adds the following utility functions that should be used to read the respective G-Buffer data:

```glsl
float readDepth(sampler2D depthBuffer, vec2 uv);
vec3 readNormal(sampler2D normalBuffer, vec2 uv);
vec2 readVelocity(sampler2D velocityBuffer, vec2 uv);
```

### External Resources

* [Buffer Clearing](https://www.khronos.org/opengl/wiki/Framebuffer#Buffer_clearing)
* [Octahedron Normal Vector Encoding](https://knarkowicz.wordpress.com/2014/04/16/octahedron-normal-vector-encoding/)
* [Survey of Efficient Representations for Independent Unit Vectors](https://jcgt.org/published/0003/02/01/)
* [Signed Octahedron Normal Encoding](https://johnwhite3d.blogspot.com/2017/10/signed-octahedron-normal-encoding.html)
* [A Comprehensive Explanation of Deferred Rendering](https://discuss.cocos2d-x.org/t/tutorial-a-comprehensive-explanation-of-deferred-rendering-guide-to-cocos-cyberpunk-source-code/58769)
