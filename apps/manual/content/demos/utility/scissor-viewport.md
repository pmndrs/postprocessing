---
layout: single
collection: sections
title: Scissor & Viewport
draft: false
menu:
  demos:
    parent: utility
script: scissor-viewport
---

# Scissor & Viewport

`Pass` has `viewport` and `scissor` properties and `RenderPipeline` can set the viewport/scissor for all passes via `setViewport` and `setScissor`. Scissor and viewport settings need to be enabled explicitly to take effect. Doing so will limit rendering of that pass to the specified region.

```ts
const pipeline = new RenderPipeline(renderer);
const geometryPassA = new GeometryPass(sceneA, camera, { samples: 4 });
const geometryPassB = new GeometryPass(sceneB, camera);
const effectPass = new EffectPass(new ToneMappingEffect());

// Render to the same buffer.
geometryPassB.output.shareBufferWith(geometryPassA.output);

geometryPassA.scissor.enabled = true;
geometryPassA.viewport.enabled = true;
geometryPassB.scissor.enabled = true;
geometryPassB.viewport.enabled = true;

pipeline.add(geometryPassA, geometryPassB, effectPass);

function onResize(): void {

  const width = container.clientWidth;
  const height = container.clientHeight;
  const widthHalf = Math.round(width / 2);

  camera.aspect = widthHalf / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);

  // Scissor & Viewport use logical sizes (without pixel ratio).
  geometryPassA.scissor.set(0, 0, widthHalf, height);
  geometryPassA.viewport.set(0, 0, widthHalf, height);
  geometryPassB.scissor.set(widthHalf, 0, widthHalf, height);
  geometryPassB.viewport.set(widthHalf, 0, widthHalf, height);

}

window.addEventListener("resize", onResize);
onResize();
```

## External Resources

- [scissor](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/scissor)
- [viewport](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/viewport)
