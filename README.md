# Post Processing

[![Build status](https://travis-ci.org/vanruesc/postprocessing.svg?branch=master)](https://travis-ci.org/vanruesc/postprocessing)
[![npm version](https://badgen.net/npm/v/postprocessing?color=green)](https://www.npmjs.com/package/postprocessing)
[![Peer dependencies](https://img.shields.io/david/peer/vanruesc/postprocessing)](https://david-dm.org/vanruesc/postprocessing?type=peer)
[![CDN](https://badgen.net/jsdelivr/hits/npm/postprocessing)](https://www.jsdelivr.com/package/npm/postprocessing)

A post processing library that provides the means to implement image filter effects for [three.js](https://threejs.org/).

*[Demo](https://vanruesc.github.io/postprocessing/public/demo)&ensp;&middot;&ensp;[Sandbox](https://codesandbox.io/s/postprocessing-25rts)&ensp;&middot;&ensp;[Documentation](https://vanruesc.github.io/postprocessing/public/docs)&ensp;&middot;&ensp;[Wiki](https://github.com/vanruesc/postprocessing/wiki)*


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

The [EffectComposer](https://vanruesc.github.io/postprocessing/public/docs/class/src/core/EffectComposer.js~EffectComposer.html) manages and runs passes. It is common practice to use a [RenderPass](https://vanruesc.github.io/postprocessing/public/docs/class/src/passes/RenderPass.js~RenderPass.html) as the first pass to automatically clear the buffers and render a scene for further processing. Fullscreen image effects are rendered via the [EffectPass](https://vanruesc.github.io/postprocessing/public/docs/class/src/passes/EffectPass.js~EffectPass.html). Please refer to the [usage example](https://github.com/mrdoob/three.js/blob/master/README.md) of three.js for more information on how to setup the renderer, scene and camera.

```js
import { BloomEffect, EffectComposer, EffectPass, RenderPass } from "postprocessing";
import { Clock } from "three";

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new EffectPass(camera, new BloomEffect()));

const clock = new Clock();

(function render() {

	requestAnimationFrame(render);
	composer.render(clock.getDelta());

}());
```


## Output Encoding

Simply set `WebGLRenderer.outputEncoding` to the desired target color space and `postprocessing` will follow suit. Built-in passes automatically encode colors when they render to screen and internal render operations are always performed in linear color space. It's [recommended](https://blog.demofox.org/2018/03/10/dont-convert-srgb-u8-to-linear-u8/) to enable high precision frame buffers when using `sRGBEncoding`:

```js
import { HalfFloatType } from "three";

const composer = new EffectComposer(renderer, {
	frameBufferType: HalfFloatType
});
```


## Performance

This library provides an [EffectPass](https://vanruesc.github.io/postprocessing/public/docs/class/src/passes/EffectPass.js~EffectPass.html) which automatically organizes and merges any given combination of effects. This minimizes the amount of render operations and makes it possible to combine many effects without the performance penalties of traditional pass chaining. Additionally, every effect can choose its own [blend function](https://vanruesc.github.io/postprocessing/public/docs/variable/index.html#static-variable-BlendFunction).

All fullscreen render operations also use a [single triangle](https://michaldrobot.com/2014/04/01/gcn-execution-patterns-in-full-screen-passes/) that fills the screen. Compared to using a quad, this approach harmonizes with modern GPU rasterization patterns and eliminates unnecessary fragment calculations along the screen diagonal. This is especially beneficial for GPGPU passes and effects that use complex fragment shaders.

[Performance Test](https://vanruesc.github.io/postprocessing/public/demo/#performance)

## Included Effects

_The total demo download size is about `60 MB`._

 - [Antialiasing](https://vanruesc.github.io/postprocessing/public/demo/#antialiasing)
 - [Bloom](https://vanruesc.github.io/postprocessing/public/demo/#bloom)
 - [Blur](https://vanruesc.github.io/postprocessing/public/demo/#blur)
 - [Color Depth](https://vanruesc.github.io/postprocessing/public/demo/#color-depth)
 - [Color Grading](https://vanruesc.github.io/postprocessing/public/demo/#color-grading)
   - Color Average
   - Sepia
   - Brightness & Contrast
   - Hue & Saturation
 - [Depth of Field](https://vanruesc.github.io/postprocessing/public/demo/#depth-of-field)
   - Vignette
 - [Glitch](https://vanruesc.github.io/postprocessing/public/demo/#glitch)
   - Chromatic Aberration
   - Noise
 - [God Rays](https://vanruesc.github.io/postprocessing/public/demo/#god-rays)
 - [Pattern](https://vanruesc.github.io/postprocessing/public/demo/#pattern)
   - Dot-Screen
   - Grid
   - Scanline
 - [Pixelation](https://vanruesc.github.io/postprocessing/public/demo/#pixelation)
 - [Outline](https://vanruesc.github.io/postprocessing/public/demo/#outline)
 - [Shock Wave](https://vanruesc.github.io/postprocessing/public/demo/#shock-wave)
 - [SSAO](https://vanruesc.github.io/postprocessing/public/demo/#ssao)
 - [Texture](https://vanruesc.github.io/postprocessing/public/demo/#texture)
 - [Tone Mapping](https://vanruesc.github.io/postprocessing/public/demo/#tone-mapping)


## Custom Effects

If you want to learn how to create custom effects or passes, please check the [Wiki](https://github.com/vanruesc/postprocessing/wiki).


## Contributing

Please refer to the [contribution guidelines](https://github.com/vanruesc/postprocessing/blob/master/.github/CONTRIBUTING.md) for details.


## License

This library is licensed under the [Zlib license](https://github.com/vanruesc/postprocessing/blob/master/LICENSE.md).

The original code that this library is based on, was written by [mrdoob](https://mrdoob.com) and the [three.js contributors](https://github.com/mrdoob/three.js/graphs/contributors) and is licensed under the [MIT license](https://github.com/mrdoob/three.js/blob/master/LICENSE).

The noise and scanline effects incorporate code written by Georg Steinrohder and Pat Shearon which was released under the [Creative Commons Attribution 3.0 License](https://creativecommons.org/licenses/by/3.0/).
