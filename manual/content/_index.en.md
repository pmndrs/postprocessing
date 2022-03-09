---
collection: sections
title: Introduction
draft: false
menu: main
weight: 10
---

# Introduction

[![CI](https://github.com/vanruesc/postprocessing/actions/workflows/ci.yml/badge.svg)](https://github.com/vanruesc/postprocessing/actions/workflows/ci.yml)

Welcome to the `postprocessing` manual!

## Motivation

The purpose of `postprocessing` is to provide a package of advanced, well maintained and fully documented filter effects for the popular 3D library [three.js](https://threejs.org/). It was originally created based on the [three.js examples](https://threejs.org/examples/?q=postprocessing) in the context of a university research project in 2015 and continues to evolve as a free, open-source library.

## Compatibility

The compatibility policy of `postprocessing` is to support the 6 most recent releases of `three`. The release schedule of this library is not strictly tied to `three`, meaning that official support for the latest release can lag behind by a few days. Releases follow [semantic versioning](https://semver.org/).

_Please note that this library is not compatible with the postprocessing examples from `three` due to API differences._

## Concepts

WIP

## Output Encoding

New applications should follow a [linear workflow](https://docs.unity3d.com/Manual/LinearRendering-LinearOrGammaWorkflow.html) for color management and `postprocessing` supports this automatically. Simply set `WebGLRenderer.outputEncoding` to `sRGBEncoding` and `postprocessing` will follow suit. Built-in passes automatically encode colors when they render to screen and internal render operations are always performed in linear color space.

## Performance

This library provides a specialized `EffectPass` that offers a structured and well defined mechanism for merging fullscreen effects into a single compound shader. This minimizes the amount of render operations and makes it possible to combine many effects without the performance penalties of traditional pass chaining. Additionally, every effect can choose its own blend function.

All fullscreen render operations also use a [single triangle](https://michaldrobot.com/2014/04/01/gcn-execution-patterns-in-full-screen-passes/) that fills the screen. Compared to using a quad, this approach harmonizes with modern GPU rasterization patterns and eliminates unnecessary fragment calculations along the screen diagonal. This is especially beneficial for GPGPU passes and effects that use complex fragment shaders.
