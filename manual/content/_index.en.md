---
collection: sections
title: Introduction
draft: false
menu: main
weight: 10
---

# Introduction

[![CI](https://github.com/pmndrs/postprocessing/actions/workflows/ci.yml/badge.svg)](https://github.com/pmndrs/postprocessing/actions/workflows/ci.yml)
[![Version](https://badgen.net/npm/v/postprocessing)](https://www.npmjs.com/package/postprocessing)
[![License](https://badgen.net/github/license/pmndrs/postprocessing)](https://github.com/pmndrs/postprocessing/blob/main/LICENSE.md)

Welcome to the postprocessing manual!

## Motivation

The purpose of the postprocessing library is to provide a package of advanced, well maintained and fully documented filter effects for the popular 3D library [three.js](https://threejs.org/). It was originally created based on the [three.js examples](https://threejs.org/examples/?q=postprocessing) in the context of a university research project in 2015 and continues to evolve as a free, open-source library.

## Compatibility Policy

Postprocessing aims to support the six most recent releases of three. Older releases may still work but are not officially supported. The release schedule of this library is not strictly tied to three, meaning that official support for the latest release can lag behind by a few days. Releases follow [semantic versioning](https://semver.org/).

_Please note that this library is not compatible with the postprocessing examples from three due to API differences._

## Concepts

WIP

## Color Space Considerations

New applications should follow a [linear workflow](https://docs.unity3d.com/Manual/LinearRendering-LinearOrGammaWorkflow.html) for color management and postprocessing supports this automatically. Simply set `WebGLRenderer.canvasColorSpace` to `SRGBColorSpace` and postprocessing will follow suit. Built-in passes automatically encode colors when they render to screen and internal render operations are always performed in the most appropriate color space.

Postprocessing uses `UnsignedByteType` sRGB frame buffers to store intermediate results due to good hardware support and resource efficiency. This is a compromise because linear results normally require at least 12 bits per color channel to prevent [color degradation and banding](https://blog.demofox.org/2018/03/10/dont-convert-srgb-u8-to-linear-u8/). With low precision sRGB buffers, colors will be clamped to [0.0, 1.0] and information loss will shift to the darker spectrum which leads to noticable banding in dark scenes. Linear, high precision `HalfFloatType` buffers don't have these issues and are the preferred option for HDR-like workflows on desktop devices. You can enable high precision frame buffers like so:

```js
import { HalfFloatType } from "three";

const pipeline = new RenderPipeline(renderer);
pipeline.bufferManager.frameBufferType = HalfFloatType;
```

See [three's color management manual](https://threejs.org/docs/#manual/en/introduction/Color-management) for more information on the topic.

## Performance

This library provides an `EffectPass` that implements a structured mechanism for merging fullscreen effects into a single compound shader by gathering and prefixing shader functions, varyings, uniforms, macros and individual blend functions. This minimizes the amount of render operations and makes it possible to combine many effects without the performance penalties of traditional pass chaining.

All fullscreen render operations also use a [single shared triangle](https://michaldrobot.com/2014/04/01/gcn-execution-patterns-in-full-screen-passes/) that fills the screen. Compared to using a quad, this approach harmonizes with modern GPU rasterization patterns and eliminates unnecessary fragment calculations along the screen diagonal. This is especially beneficial for GPGPU passes and effects that use complex fragment shaders.
