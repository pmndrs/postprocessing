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

> [!INFO]
> This manual is currently under development.

Postprocessing is an advanced, real-time image processing library for [three.js](https://threejs.org/). It was originally created based on the [three.js examples](https://threejs.org/examples/?q=postprocessing) in the context of a university research project in 2015 and continues to evolve as a free, open-source library.

## Compatibility Policy

This library aims to support the six most recent releases of three. Older releases may still work but are not officially supported. The release schedule of this library is not strictly tied to three, meaning that official support for the latest release can fall behind by a few days. Releases follow [semantic versioning](https://semver.org/).

> [!NOTE]
> Please note that this library is not compatible with three's own postprocessing examples due to API differences.

## Concepts

Postprocessing extends the common rendering workflow with fullscreen image manipulation tools. It uses render pipelines to organize and run passes with explicit input/output management to facilitate smart resource usage and efficiency. Render logic and shaders are highly optimized to ensure production-ready performance and reliability across devices.

## Performance

This library provides an `EffectPass` that implements a structured mechanism for merging fullscreen effects into a single composite shader with configurable blend functions per effect. This minimizes the amount of render operations and makes it possible to combine many effects in interesting ways without the performance penalties of traditional pass chaining.

All fullscreen render operations also use a [single shared triangle](https://michaldrobot.com/2014/04/01/gcn-execution-patterns-in-full-screen-passes/) that fills the screen. Compared to using a quad, this approach harmonizes with modern GPU rasterization patterns and eliminates unnecessary fragment calculations along the screen diagonal. This is especially beneficial for effects that use complex fragment shaders.

Modern image effects rely on additional geometry data such as view space normals and fragment velocity. Postprocessing uses [MRT](https://registry.khronos.org/webgl/specs/latest/2.0/#3.7.11) under the hood to render this data as needed during the main scene render operation.
