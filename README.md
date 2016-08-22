# Post Processing

[![Build status](https://travis-ci.org/vanruesc/postprocessing.svg?branch=master)](https://travis-ci.org/vanruesc/postprocessing)
[![npm version](https://badge.fury.io/js/postprocessing.svg)](http://badge.fury.io/js/postprocessing)
[![Dependencies](https://david-dm.org/vanruesc/postprocessing.svg?branch=master)](https://david-dm.org/vanruesc/postprocessing)

A post processing library that provides the means to implement 2D filter effects for three.js.


## Installation

```sh
$ npm install postprocessing
``` 


## Usage

```javascript
// Attention: Three is not yet an ES6 module!
import { WebGLRenderer, Scene, PerspectiveCamera } from "three";
import { EffectComposer, RenderPass, GlitchPass } from "postprocessing";

const composer = new EffectComposer(new WebGLRenderer());
composer.addPass(new RenderPass(new Scene(), new PerspectiveCamera()));

const pass = new GlitchPass();
pass.renderToScreen = true;
composer.addPass(pass);

let lastTime = performance.now();

(function render(now) {

	requestAnimationFrame(render);
	composer.render((now - lastTime) / 1000);
	lastTime = now;

}());
```

In order to create your own pass, simply extend the
[Pass](http://vanruesc.github.io/postprocessing/docs/files/src_passes_pass.js.html) class:

```javascript
import { Pass } from "postprocessing";
import { MyMaterial } from "./materials";

export class MyPass extends Pass {

	constructor() {

		super();

		this.needsSwap = true;
		this.material = new MyMaterial();
		this.quad.material = this.material;

	}

	render(renderer, readBuffer, writeBuffer) {

		this.material.uniforms.tDiffuse.value = readBuffer.texture;

		if(this.renderToScreen) {

			renderer.render(this.scene, this.camera);

		} else {

			renderer.render(this.scene, this.camera, writeBuffer, false);

		}

	}

}

```
Passes don't have to use the buffers that are provided in the render method.
Writing self-contained render-to-texture passes is also a feasible option.


## Included Filters

 - [Tone Mapping](http://vanruesc.github.io/postprocessing/public/tone-mapping.html)
 - [Crepuscular Rays](http://vanruesc.github.io/postprocessing/public/god-rays.html)
 - [Dot Screen](http://vanruesc.github.io/postprocessing/public/dot-screen.html)
 - [Glitch](http://vanruesc.github.io/postprocessing/public/glitch.html)
 - [Bloom](http://vanruesc.github.io/postprocessing/public/bloom.html)
 - [Bokeh](http://vanruesc.github.io/postprocessing/public/bokeh.html)
 - [SMAA](http://vanruesc.github.io/postprocessing/public/smaa.html)
 - [Film](http://vanruesc.github.io/postprocessing/public/film.html)


## Documentation

[API](http://vanruesc.github.io/postprocessing/docs)


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
