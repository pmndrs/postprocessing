---
layout: single
collection: sections
title: Tone Mapping
draft: false
menu:
  demos:
    parent: color-grading
script: tone-mapping
---

# Tone Mapping

> Most monitors are capable of displaying RGB values in the range of [0, 255]. However, in real life, there is no limit on the amount of light 'energy' incident on a point. Most renderers output linear radiance values in [0, ∞), which needs to be mapped into a viewable range. Those radiance values are described as High Dynamic Range (HDR), because they are unlimited, and the viewable target range is described as Low Dynamic Range (LDR), because there is a fixed limit of 255. Put simply, tone mapping is the process of mapping HDR values in [0, ∞) into LDR values (e.g values in [0, 255] or [0.0, 1.0]).  
> <cite>[Matt Taylor](https://github.com/64), 2019</cite>

## Usage

```ts
const toneMappingEffect = new ToneMappingEffect({
  toneMapping: ToneMapping.AGX // default
});
```

> [!TIP]
> Tone mapping should generally be applied late in a render pipeline, but before anti-aliasing and the final color space conversion.

## Primary Color Grading

The `ToneMappingEffect` uses the American Society of Cinematographers Color Decision List (ASC CDL) format to configure primary
color grading information. This format defines the math for Slope, Offset, Power and Saturation and provides a way to influence the look of the tone-mapped image.

> [!INFO]
> Only `ToneMapping.AGX` currently supports CDL parameters.

## External Resources

* [Tone Mapping Techniques](https://64.github.io/tonemapping)
* [ASC CDL](https://en.wikipedia.org/wiki/ASC_CDL)
