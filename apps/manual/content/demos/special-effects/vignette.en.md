---
layout: single
collection: sections
title: Vignette
draft: false
menu:
  demos:
    parent: special-effects
script: vignette
---

# Vignette

Postprocessing supports two different Vignette techniques that produce slightly different gradients. Both techniques support a custom `color`.

## Usage

```ts
const vignetteEffect = new VignetteEffect({
  technique: VignetteTechnique.DEFAULT,
  offset: 0.5,
  feather: 0.5,
  color: 0x000000
});
```

### Default Technique

A versatile Vignette shape based on a `smoothstep` gradient with a configurable `offset` and `feather`.

### Eskil's Technique

An alternative Vignette shape that treats the `feather` setting as a color scale.

## External Resources

* [PaintEffect](https://github.com/dataarts/3-dreams-of-black/blob/master/deploy/js/effects/PaintEffect.js)
* [Vignetting](https://en.wikipedia.org/wiki/Vignetting)
