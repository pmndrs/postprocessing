# Post Processing

[![Build status](https://travis-ci.org/vanruesc/postprocessing.svg?branch=master)](https://travis-ci.org/vanruesc/postprocessing)
[![npm version](https://badge.fury.io/js/postprocessing.svg)](http://badge.fury.io/js/postprocessing)
[![Peer dependencies](https://david-dm.org/vanruesc/postprocessing/peer-status.svg)](https://david-dm.org/vanruesc/postprocessing?type=peer)

A post processing library that provides the means to implement image filter effects for [three.js](https://threejs.org/).

*[Extensive Demo](https://vanruesc.github.io/postprocessing/public/demo) &there4;
[API Reference](https://vanruesc.github.io/postprocessing/public/docs) &there4;
[Wiki](https://github.com/vanruesc/postprocessing/wiki)*


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

This library provides an [EffectPass](https://vanruesc.github.io/postprocessing/public/docs/class/src/passes/EffectPass.js~EffectPass.html) which automatically organizes and merges any given combination of effects. This minimizes the amount of render operations and makes it possible to combine many effects without the performance penalties of traditional pass chaining. Additionally, every effect can choose its own blend function from a list of [built-in functions](https://vanruesc.github.io/postprocessing/public/docs/variable/index.html#static-variable-BlendFunction).


## Included Effects

 - [Bloom](http://vanruesc.github.io/postprocessing/public/demo/#bloom)
 - [Blur](http://vanruesc.github.io/postprocessing/public/demo/#blur)
 - [Bokeh](http://vanruesc.github.io/postprocessing/public/demo/#bokeh) & [Realistic Bokeh](http://vanruesc.github.io/postprocessing/public/demo/#realistic-bokeh)
 - [Color Correction](http://vanruesc.github.io/postprocessing/public/demo/#color-correction)
   - Brightness & Contrast
   - Gamma Correction
   - Hue & Saturation
 - [Dot Screen](http://vanruesc.github.io/postprocessing/public/demo/#dot-screen)
 - [Glitch](http://vanruesc.github.io/postprocessing/public/demo/#glitch)
   - Chromatic Aberration
   - Noise
 - [God Rays](http://vanruesc.github.io/postprocessing/public/demo/#god-rays)
 - [Grid](http://vanruesc.github.io/postprocessing/public/demo/#grid)
 - [Outline](http://vanruesc.github.io/postprocessing/public/demo/#outline)
 - [Pixelation](http://vanruesc.github.io/postprocessing/public/demo/#pixelation)
 - [Scanline](http://vanruesc.github.io/postprocessing/public/demo/#scanline)
 - [Sepia](http://vanruesc.github.io/postprocessing/public/demo/#sepia)
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
