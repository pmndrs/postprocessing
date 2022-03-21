# Post Processing

[![CI](https://github.com/pmndrs/postprocessing/actions/workflows/ci.yml/badge.svg)](https://github.com/pmndrs/postprocessing/actions/workflows/ci.yml)
[![Version](https://badgen.net/npm/v/postprocessing?color=green)](https://www.npmjs.com/package/postprocessing)

A post processing library that provides the means to implement image filter effects for [three.js](https://threejs.org/).

*[Demo](https://pmndrs.github.io/postprocessing/public/demo)&ensp;&middot;&ensp;[Sandbox](https://codesandbox.io/s/postprocessing-25rts)&ensp;&middot;&ensp;[Documentation](https://pmndrs.github.io/postprocessing/public/docs)&ensp;&middot;&ensp;[Wiki](https://github.com/pmndrs/postprocessing/wiki)*

## Installation

This library requires the peer dependency [three](https://github.com/mrdoob/three.js/).

```sh
npm install three postprocessing
```

## Usage

Post processing introduces the concept of passes and effects to extend the common rendering workflow with fullscreen image manipulation tools. The following WebGL attributes should be used for an optimal post processing workflow:

```js
import { WebGLRenderer } from "three";

const renderer = new WebGLRenderer({
	powerPreference: "high-performance",
	antialias: false,
	stencil: false,
	depth: false
});
```

The [EffectComposer](https://pmndrs.github.io/postprocessing/public/docs/class/src/core/EffectComposer.js~EffectComposer.html) manages and runs passes. It is common practice to use a [RenderPass](https://pmndrs.github.io/postprocessing/public/docs/class/src/passes/RenderPass.js~RenderPass.html) as the first pass to automatically clear the buffers and render a scene for further processing. Fullscreen image effects are rendered via the [EffectPass](https://pmndrs.github.io/postprocessing/public/docs/class/src/passes/EffectPass.js~EffectPass.html). Please refer to the [usage example](https://github.com/mrdoob/three.js/blob/master/README.md) of three.js for more information on how to setup the renderer, scene and camera.

```js
import { BloomEffect, EffectComposer, EffectPass, RenderPass } from "postprocessing";

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new EffectPass(camera, new BloomEffect()));

requestAnimationFrame(function render() {

	requestAnimationFrame(render);
	composer.render();

});
```

## Output Encoding

Simply set `WebGLRenderer.outputEncoding` to the desired target color space and `postprocessing` will follow suit. Built-in passes automatically encode colors when they render to screen and internal render operations are always performed in linear color space.

## Performance

This library provides an [EffectPass](https://pmndrs.github.io/postprocessing/public/docs/class/src/passes/EffectPass.js~EffectPass.html) which automatically organizes and merges any given combination of effects. This minimizes the amount of render operations and makes it possible to combine many effects without the performance penalties of traditional pass chaining. Additionally, every effect can choose its own [blend function](https://pmndrs.github.io/postprocessing/public/docs/variable/index.html#static-variable-BlendFunction).

All fullscreen render operations also use a [single triangle](https://michaldrobot.com/2014/04/01/gcn-execution-patterns-in-full-screen-passes/) that fills the screen. Compared to using a quad, this approach harmonizes with modern GPU rasterization patterns and eliminates unnecessary fragment calculations along the screen diagonal. This is especially beneficial for GPGPU passes and effects that use complex fragment shaders.

[Performance Test](https://pmndrs.github.io/postprocessing/public/demo/#performance)

## Included Effects

_The total demo download size is about `60 MB`._

 - [Antialiasing](https://pmndrs.github.io/postprocessing/public/demo/#antialiasing)
 - [Bloom](https://pmndrs.github.io/postprocessing/public/demo/#bloom)
 - [Blur](https://pmndrs.github.io/postprocessing/public/demo/#blur)
 - [Color Depth](https://pmndrs.github.io/postprocessing/public/demo/#color-depth)
 - [Color Grading](https://pmndrs.github.io/postprocessing/public/demo/#color-grading)
   - Color Average
   - Sepia
   - Brightness & Contrast
   - Hue & Saturation
   - LUT
 - [Depth of Field](https://pmndrs.github.io/postprocessing/public/demo/#depth-of-field)
   - Vignette
 - [Glitch](https://pmndrs.github.io/postprocessing/public/demo/#glitch)
   - Chromatic Aberration
   - Noise
 - [God Rays](https://pmndrs.github.io/postprocessing/public/demo/#god-rays)
 - [Pattern](https://pmndrs.github.io/postprocessing/public/demo/#pattern)
   - Dot-Screen
   - Grid
   - Scanline
 - [Pixelation](https://pmndrs.github.io/postprocessing/public/demo/#pixelation)
 - [Outline](https://pmndrs.github.io/postprocessing/public/demo/#outline)
 - [Shock Wave](https://pmndrs.github.io/postprocessing/public/demo/#shock-wave)
   - Depth Picking
 - [SSAO](https://pmndrs.github.io/postprocessing/public/demo/#ssao)
 - [Texture](https://pmndrs.github.io/postprocessing/public/demo/#texture)
 - [Tone Mapping](https://pmndrs.github.io/postprocessing/public/demo/#tone-mapping)

## Custom Effects

If you want to learn how to create custom effects or passes, please check the [Wiki](https://github.com/pmndrs/postprocessing/wiki).

## Contributing

Please refer to the [contribution guidelines](https://github.com/pmndrs/postprocessing/blob/main/.github/CONTRIBUTING.md) for details.

## License

This library is licensed under the [Zlib license](https://github.com/pmndrs/postprocessing/blob/main/LICENSE.md).

The original code that this library is based on, was written by [mrdoob](https://mrdoob.com) and the [three.js contributors](https://github.com/mrdoob/three.js/graphs/contributors) and is licensed under the [MIT license](https://github.com/mrdoob/three.js/blob/master/LICENSE).
