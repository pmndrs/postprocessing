---
layout: single
collection: sections
title: MSAA
draft: false
menu:
  demos:
    parent: anti-aliasing
script: msaa
---

# Multisample Anti-Aliasing

MSAA is a depth-based anti-aliasing technique that renders additional fragments around object edges. This makes it much more stable in motion compared to non-temporal image-based solutions but it can also be more expensive depending on the complexity of the rendered geometry and shaders. This technique also doesn't remove aliasing artifacts that can occur in texture details.

In WebGL and WebGPU, MSAA is implemented natively and can be enabled on a per-rendertarget basis. In postprocessing, this can be achieved by using the `samples` option of the `GeometryPass`.

```ts
const geoPass = new GeometryPass(scene, camera, { samples: 4 });
```

> [!TIP]
> Anti-aliasing works best when applied after tone-mapping because the blurring around the detected edges is supposed to produce renderable LDR color gradients, i.e. values between 0.0 and 1.0. As such, the algorithm requires input colors in that same range.

> [!WARNING]
> In practice, MSAA can work with postprocessing before tone-mapping is applied, but it may fail to properly smooth edges if HDR colors are present in the scene colors. Furthermore, MSAA is currently not compatible with depth-based effects.

### External Resources

* [Learn OpenGL - Anti Aliasing](https://learnopengl.com/Advanced-OpenGL/Anti-Aliasing)
* [ARM Documentation](https://developer.arm.com/documentation/102479/0100/Multi-Sample-Anti-Aliasing)
* [Multisample Anti-Aliasing Rasterization Rules](https://docs.microsoft.com/en-us/windows/win32/direct3d11/d3d10-graphics-programming-guide-rasterizer-stage-rules#multisample-anti-aliasing-rasterization-rules)
* [Interpolation qualifiers](https://www.khronos.org/opengl/wiki/Type_Qualifier_(GLSL)#Interpolation_qualifiers)
