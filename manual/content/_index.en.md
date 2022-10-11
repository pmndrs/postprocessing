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

## Performance

This library provides an `EffectPass` that implements a structured mechanism for merging fullscreen effects into a single compound shader by gathering and prefixing shader functions, varyings, uniforms, macros and individual blend functions. This minimizes the amount of render operations and makes it possible to combine many effects without the performance penalties of traditional pass chaining.

All fullscreen render operations also use a [single shared triangle](https://michaldrobot.com/2014/04/01/gcn-execution-patterns-in-full-screen-passes/) that fills the screen. Compared to using a quad, this approach harmonizes with modern GPU rasterization patterns and eliminates unnecessary fragment calculations along the screen diagonal. This is especially beneficial for GPGPU passes and effects that use complex fragment shaders.
