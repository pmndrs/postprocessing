---
layout: single
collection: sections
title: SMAA
draft: false
menu:
  demos:
    parent: anti-aliasing
script: smaa
---

# Subpixel Morphological Anti-Aliasing

SMAA can be regarded as an improvement over FXAA with more accurate edge detection and advanced gradient smoothing. It can be configured to use an additional predication buffer to further reduce false positives in the edge detection step.

```ts
const effect = new SMAAEffect({
  preset: SMAAPreset.MEDIUM,
  edgeDetectionMode: SMAAEdgeDetectionMode.COLOR,
  predicationMode: SMAAPredicationMode.DEPTH
});
```

> [!TIP]
> Anti-aliasing works best when applied after tone-mapping because the blurring around the detected edges is supposed to produce renderable LDR color gradients, i.e. values between 0.0 and 1.0. As such, the algorithm requires input colors in that same range.

### External Resources

* [iryoku/smaa](https://github.com/iryoku/smaa)
