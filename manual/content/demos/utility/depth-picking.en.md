---
layout: single
collection: sections
title: Depth Picking
draft: false
menu:
  demos:
    parent: utility
    weight: 30
script: depth-picking
---

# Depth Picking

A 2D point on screen can be converted into normalized device coordinates (NDC, -1 to 1 on each axis). The `DepthPickingPass` uses the X and Y coordinates to read a single texel from the depth buffer back into a pixel array. The retrieved data is the raw depth at that location which can be used to complete the NDC. The obtained coordinates can be used to calculate the 3D world position based on the camera perspective/transformation matrices via unprojection.

```ts
const ndc = new Vector3();
const clientRect = myViewport.getBoundingClientRect();
const clientX = pointerEvent.clientX - clientRect.left;
const clientY = pointerEvent.clientY - clientRect.top;

ndc.x = (clientX / myViewport.clientWidth) * 2.0 - 1.0;
ndc.y = -(clientY / myViewport.clientHeight) * 2.0 + 1.0;

const depth = await depthPickingPass.readDepth(ndc);
ndc.z = depth * 2.0 - 1.0;

const worldPosition = ndc.unproject(camera);
```

If the depth picking mode is set to `DepthCopyMode.SINGLE`, only one depth value can be picked per frame. Calling the `readDepth` method multiple times per frame will then overwrite the picking coordinates and unresolved promises will be abandoned. Depth values are returned immediately when using `DepthCopyMode.FULL`, but this mode requires more bandwidth.

### External Resources

* https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/readPixels
* https://carmencincotti.com/2022-11-28/from-clip-space-to-ndc-space/
