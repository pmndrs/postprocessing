---
layout: single
collection: sections
title: User Interface
draft: false
menu:
  demos:
    parent: utility
script: ui
---

# User Interface

UI rendering requires special treatment when combined with postprocessing. There are several approaches to consider.

## Depth-Aware UI

Excluding UI elements, or any other 3D object, from being affected by image effects can be done by using a second `GeometryPass` with a separate UI scene. By default, the pass will copy the output of the preceding pass to its own output buffer before rendering the UI scene. If the UI pass was configured to use a `depthBuffer`, depth will either be reused, if possible, or copied. This allows UI elements to be occluded by other objects. However, there are three problems with this approach:

1. Overlay effects such as bloom don't use depth, so they will always be overwritten by the UI elements.
2. MSAA is not supported because the image has already been resolved at this point.
3. The additional copy operation is fast but not free.

> [!NOTE]
> Bloom and similar overlay effects may be applied after the UI elements, but tone mapping must then be applied afterwards to avoid clipping.

## HUD Overlay

### Single Render Pipeline

Instead of using a depth-aware `GeometryPass`, the UI elements can be rendered directly on top of the output buffer of a preceding fullscreen pass. To do this, the `GeometryPass` must be instantiated without a `depthBuffer` and its `output.defaultBuffer` must be set to the `output.defaultBuffer` of the preceding pass. The result then needs to be rendered to screen with a final `CopyPass` or `EffectPass`.

> [!TIP]
> It's recommended to use an `EffectPass` with an antialiasing effect as the final pass.

Due to the lack of depth information, MSAA is not supported.

### Multiple Render Pipelines

UI elements can also be rendered in a separate pipeline with a `ClearPass` and a `GeometryPass`. The `GeometryPass` can make use of MSAA if it has a `depthBuffer` and the UI scene can be rendered only when needed. The resulting UI output texture can then be integrated into the main pipeline by using a `TextureEffect`. This approach is not depth-aware.
