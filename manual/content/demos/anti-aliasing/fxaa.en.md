---
layout: single
collection: sections
title: FXAA
draft: false
menu:
  demos:
    parent: anti-aliasing
script: fxaa
---

# Fast Approximate Anti-Aliasing

FXAA is a lightweight, image-based anti-aliasing solution. It's less stable in terms of shimmering compared to MSAA but oftentimes much faster. Its edge detection algorithm is based on luminance. The current implementation is based on FXAA version 3.11.

```ts
const effect = new FXAAEffect({
  minEdgeThreshold: 0.0312,
  maxEdgeThreshold: 0.125,
  subpixelQuality: 0.75,
  samples: 12
});
```

> [!TIP]
> Anti-aliasing works best when applied after tone-mapping because it requires LDR input colors.

## External Resources

* [FXAA white paper](https://developer.download.nvidia.com/assets/gamedev/files/sdk/11/FXAA_WhitePaper.pdf)
* [Implementing FXAA](http://blog.simonrodriguez.fr/articles/2016/07/implementing_fxaa.html)
