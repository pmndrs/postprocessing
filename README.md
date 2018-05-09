# Post Processing

[![Build status](https://travis-ci.org/vanruesc/postprocessing.svg?branch=master)](https://travis-ci.org/vanruesc/postprocessing)
[![npm version](https://badge.fury.io/js/postprocessing.svg)](http://badge.fury.io/js/postprocessing)
[![Peer dependencies](https://david-dm.org/vanruesc/postprocessing/peer-status.svg)](https://david-dm.org/vanruesc/postprocessing?type=peer)

A post processing library that provides the means to implement image filter effects for [three.js](https://threejs.org/).

*[Extensive Demo](https://vanruesc.github.io/postprocessing/public/demo) &there4;
[API Reference](https://vanruesc.github.io/postprocessing/public/docs) &there4;
[Wiki](https://github.com/vanruesc/postprocessing/wiki)*


## Installation

```sh
npm install postprocessing
``` 


## Usage

Please refer to the [usage example](https://github.com/mrdoob/three.js/blob/master/README.md) of three.js for information
about how to setup the renderer, scene and camera.

#### Basics

```javascript
import { Clock, PerspectiveCamera, Scene, WebGLRenderer } from "three";
import { EffectComposer, GlitchPass, RenderPass } from "postprocessing";

const composer = new EffectComposer(new WebGLRenderer());
composer.addPass(new RenderPass(new Scene(), new PerspectiveCamera()));

const pass = new GlitchPass();
pass.renderToScreen = true;
composer.addPass(pass);

const clock = new Clock();

(function render() {

	requestAnimationFrame(render);
	composer.render(clock.getDelta());

}());
```

#### Custom Passes

```javascript
import { Pass } from "postprocessing";
import { MyMaterial } from "./MyMaterial.js";

export class MyPass extends Pass {

	constructor() {

		super("MyPass");

		this.material = new MyMaterial();

	}

	render(renderer, inputBuffer, outputBuffer, delta, stencilTest) {

		this.material.uniforms.tDiffuse.value = inputBuffer.texture;
		renderer.render(this.scene, this.camera, this.renderToScreen ? null : outputBuffer);

	}

}

```

See the [Wiki](https://github.com/vanruesc/postprocessing/wiki/Custom-Passes) for more information.


## Included Filters

 - [Bloom](http://vanruesc.github.io/postprocessing/public/demo/#bloom)
 - [Blur](http://vanruesc.github.io/postprocessing/public/demo/#blur)
 - [Bokeh](http://vanruesc.github.io/postprocessing/public/demo/#bokeh)
 - [Realistic Bokeh](http://vanruesc.github.io/postprocessing/public/demo/#realistic-bokeh)
 - [Depth](http://vanruesc.github.io/postprocessing/public/demo/#depth)
 - [Dot Screen](http://vanruesc.github.io/postprocessing/public/demo/#dot-screen)
 - [Film](http://vanruesc.github.io/postprocessing/public/demo/#film)
 - [Glitch](http://vanruesc.github.io/postprocessing/public/demo/#glitch)
 - [God Rays](http://vanruesc.github.io/postprocessing/public/demo/#god-rays)
 - [Outline](http://vanruesc.github.io/postprocessing/public/demo/#outline)
 - [Pixelation](http://vanruesc.github.io/postprocessing/public/demo/#pixelation)
 - [Render](http://vanruesc.github.io/postprocessing/public/demo/#render)
 - [Shock Wave](http://vanruesc.github.io/postprocessing/public/demo/#shock-wave)
 - [SMAA](http://vanruesc.github.io/postprocessing/public/demo/#smaa)
 - [Tone Mapping](http://vanruesc.github.io/postprocessing/public/demo/#tone-mapping)


## Contributing

Please refer to the [contribution guidelines](https://github.com/vanruesc/postprocessing/blob/master/.github/CONTRIBUTING.md) for details.


## License

This library is licensed under the [Zlib license](https://github.com/vanruesc/postprocessing/blob/master/LICENSE.md).

The original code that this library is based on, was written by [alteredq](http://alteredqualia.com),
[miibond](https://github.com/MiiBond), [zz85](https://github.com/zz85), [felixturner](http://airtight.cc),
[spidersharma](http://eduperiment.com) and [huwb](http://huwbowles.com)
and is licensed under the [MIT license](https://github.com/mrdoob/three.js/blob/master/LICENSE).

The film effect incorporates code written by Georg Steinrohder and Pat Shearon which was released under the
[Creative Commons Attribution 3.0 License](http://creativecommons.org/licenses/by/3.0/).
