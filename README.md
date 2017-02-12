# Post Processing

[![Build status](https://travis-ci.org/vanruesc/postprocessing.svg?branch=master)](https://travis-ci.org/vanruesc/postprocessing)
[![npm version](https://badge.fury.io/js/postprocessing.svg)](http://badge.fury.io/js/postprocessing)
[![Dependencies](https://david-dm.org/vanruesc/postprocessing.svg?branch=master)](https://david-dm.org/vanruesc/postprocessing)

A post processing library that provides the means to implement 2D filter effects for three.js.

*[Extensive Demo](http://vanruesc.github.io/postprocessing/public) &there4;
[API Reference](http://vanruesc.github.io/postprocessing/docs)*


## Installation

```sh
npm install postprocessing
``` 


## Usage

Please refer to the [usage example](https://github.com/mrdoob/three.js/blob/master/README.md) of three.js for information
about how to setup the renderer, scene and camera.

##### Basics

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

##### Custom Passes

```javascript
import { Pass } from "postprocessing";
import { MyMaterial } from "./my-material.js";

export class MyPass extends Pass {

	constructor() {

		super();

		this.needsSwap = true;
		this.material = new MyMaterial();
		this.quad.material = this.material;

	}

	render(renderer, readBuffer, writeBuffer) {

		this.material.uniforms.tDiffuse.value = readBuffer.texture;
		renderer.render(this.scene, this.camera, this.renderToScreen ? null : writeBuffer, this.clear);

	}

}

```

Passes don't have to use the buffers that are provided in the render method.
Writing self-contained render-to-texture passes is also a feasible option.


## Included Filters

 - [Bloom](http://vanruesc.github.io/postprocessing/public/#bloom)
 - [Blur](http://vanruesc.github.io/postprocessing/public/#blur)
 - [Bokeh](http://vanruesc.github.io/postprocessing/public/#bokeh)
 - [Bokeh v2](http://vanruesc.github.io/postprocessing/public/#bokeh2)
 - [Depth](http://vanruesc.github.io/postprocessing/public/#depth)
 - [Dot Screen](http://vanruesc.github.io/postprocessing/public/#dot-screen)
 - [Film](http://vanruesc.github.io/postprocessing/public/#film)
 - [Glitch](http://vanruesc.github.io/postprocessing/public/#glitch)
 - [God Rays](http://vanruesc.github.io/postprocessing/public/#god-rays)
 - [Render](http://vanruesc.github.io/postprocessing/public/#render)
 - [SMAA](http://vanruesc.github.io/postprocessing/public/#smaa)
 - [Tone Mapping](http://vanruesc.github.io/postprocessing/public/#tone-mapping)


## Contributing

Maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code.


## License

This library is licensed under the [Zlib license](https://github.com/vanruesc/postprocessing/blob/master/LICENSE).

The original code that this library is based on, was written by [alteredq](http://alteredqualia.com),
[miibond](https://github.com/MiiBond), [zz85](https://github.com/zz85),
[felixturner](http://airtight.cc) and [huwb](http://huwbowles.com)
and is licensed under the [MIT license](https://github.com/mrdoob/three.js/blob/master/LICENSE).

The film effect incorporates code written by Georg Steinrohder and Pat Shearon which was released under the
[Creative Commons Attribution 3.0 License](http://creativecommons.org/licenses/by/3.0/).
