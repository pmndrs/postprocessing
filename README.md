# Post Processing

[![Build status](https://travis-ci.org/vanruesc/postprocessing.svg?branch=master)](https://travis-ci.org/vanruesc/postprocessing)
[![npm version](https://badgen.net/npm/v/postprocessing?color=green)](https://www.npmjs.com/package/postprocessing)
[![Peer dependencies](https://david-dm.org/vanruesc/postprocessing/peer-status.svg)](https://david-dm.org/vanruesc/postprocessing?type=peer)
[![CDN](https://badgen.net/jsdelivr/hits/npm/postprocessing)](https://www.jsdelivr.com/package/npm/postprocessing)

A post processing library that provides the means to implement image filter effects for [three.js](https://threejs.org/).

*[Extensive Demo](https://vanruesc.github.io/postprocessing/public/demo)&ensp;&middot;&ensp;[Sandbox](https://codesandbox.io/s/postprocessing-25rts)&ensp;&middot;&ensp;[API Reference](https://vanruesc.github.io/postprocessing/public/docs)&ensp;&middot;&ensp;[Wiki](https://github.com/vanruesc/postprocessing/wiki)*


## Installation

This library requires the peer dependency [three](https://github.com/mrdoob/three.js/).

```sh
npm install three postprocessing
```


## Usage

Please refer to the [usage example](https://github.com/mrdoob/three.js/blob/master/README.md) of three.js for information about how to setup the renderer, scene and camera.

```javascript
import { Clock, PerspectiveCamera, Scene, WebGLRenderer } from "three";
import { BloomEffect, EffectComposer, EffectPass, RenderPass } from "postprocessing";

const composer = new EffectComposer(new WebGLRenderer());
const camera = new PerspectiveCamera();
const scene = new Scene();

const effectPass = new EffectPass(camera, new BloomEffect());
effectPass.renderToScreen = true;

composer.addPass(new RenderPass(scene, camera));
composer.addPass(effectPass);

const clock = new Clock();

(function render() {

	requestAnimationFrame(render);
	composer.render(clock.getDelta());

}());
```


## Performance

This library provides an [EffectPass](https://vanruesc.github.io/postprocessing/public/docs/class/src/passes/EffectPass.js~EffectPass.html) which automatically organizes and merges any given combination of effects. This minimizes the amount of render operations and makes it possible to combine many effects without the performance penalties of traditional pass chaining. Additionally, every effect can choose its own [blend function](https://vanruesc.github.io/postprocessing/public/docs/variable/index.html#static-variable-BlendFunction).

Furthermore, all fullscreen render operations use a [single triangle](https://michaldrobot.com/2014/04/01/gcn-execution-patterns-in-full-screen-passes/) that fills the screen. Compared to using a quad, this approach harmonizes with modern GPU rasterization patterns and eliminates unnecessary fragment calculations along the screen diagonal which is especially beneficial for GPGPU passes and effects that use complex fragment shaders.

[Performance Test](http://vanruesc.github.io/postprocessing/public/demo/#performance)

## Included Effects

 - [Bloom](http://vanruesc.github.io/postprocessing/public/demo/#bloom)
 - [Blur](http://vanruesc.github.io/postprocessing/public/demo/#blur)
 - [Bokeh](http://vanruesc.github.io/postprocessing/public/demo/#bokeh) & [Realistic Bokeh](http://vanruesc.github.io/postprocessing/public/demo/#realistic-bokeh)
 - [Color Grading](http://vanruesc.github.io/postprocessing/public/demo/#color-grading)
   - Color Average
   - Sepia
   - Brightness & Contrast
   - Gamma Correction
   - Hue & Saturation
 - [Color Depth](http://vanruesc.github.io/postprocessing/public/demo/#color-depth)
 - [Glitch](http://vanruesc.github.io/postprocessing/public/demo/#glitch)
   - Chromatic Aberration
   - Noise
 - [God Rays](http://vanruesc.github.io/postprocessing/public/demo/#god-rays)
 - [Pattern](http://vanruesc.github.io/postprocessing/public/demo/#pattern)
   - Dot-Screen
   - Grid
   - Scanline
 - [Pixelation](http://vanruesc.github.io/postprocessing/public/demo/#pixelation)
   - Masking
 - [Outline](http://vanruesc.github.io/postprocessing/public/demo/#outline)
 - [Shock Wave](http://vanruesc.github.io/postprocessing/public/demo/#shock-wave)
 - [SMAA](http://vanruesc.github.io/postprocessing/public/demo/#smaa)
 - [SSAO](http://vanruesc.github.io/postprocessing/public/demo/#ssao)
 - [Texture](http://vanruesc.github.io/postprocessing/public/demo/#texture)
 - [Tone Mapping](http://vanruesc.github.io/postprocessing/public/demo/#tone-mapping)
 - [Vignette](http://vanruesc.github.io/postprocessing/public/demo/#vignette)


## Custom Effects

If you want to learn how to create custom effects or passes, please check the [Wiki](https://github.com/vanruesc/postprocessing/wiki).


## Contributing

Please refer to the [contribution guidelines](https://github.com/vanruesc/postprocessing/blob/master/.github/CONTRIBUTING.md) for details.


## License

This library is licensed under the [Zlib license](https://github.com/vanruesc/postprocessing/blob/master/LICENSE.md).

The original code that this library is based on, was written by [mrdoob](http://mrdoob.com) and the
[three.js contributors](https://github.com/mrdoob/three.js/graphs/contributors)
and is licensed under the [MIT license](https://github.com/mrdoob/three.js/blob/master/LICENSE).

The noise and scanline effects incorporate code written by Georg Steinrohder and Pat Shearon which was released under the
[Creative Commons Attribution 3.0 License](http://creativecommons.org/licenses/by/3.0/).
