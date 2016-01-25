# Post Processing 
[![Build status](https://travis-ci.org/vanruesc/postprocessing.svg?branch=master)](https://travis-ci.org/vanruesc/postprocessing) 
[![GitHub version](https://badge.fury.io/gh/vanruesc%2Fpostprocessing.svg)](http://badge.fury.io/gh/vanruesc%2Fpostprocessing) 
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

var composer = new EffectComposer(new WebGLRenderer());
composer.addPass(new RenderPass(new Scene(), new PerspectiveCamera()));

var glitchPass = new GlitchPass();
glitchPass.renderToScreen = true;
composer.addPass(glitchPass);

(function render(now) {

	composer.render();
	requestAnimationFrame(render);

}());
```


## Included Filters
 - Adaptive Tone Mapping 
 - [Crepuscular Rays](http://vanruesc.github.io/postprocessing/public/god-rays.html) 
 - [Dot Screen](http://vanruesc.github.io/postprocessing/public/dot-screen.html) 
 - [Glitch](http://vanruesc.github.io/postprocessing/public/glitch.html) 
 - [Bloom](http://vanruesc.github.io/postprocessing/public/bloom.html) 
 - Bokeh 
 - [Film](http://vanruesc.github.io/postprocessing/public/film.html) 


## Documentation
[API](http://vanruesc.github.io/postprocessing/docs)


## Contributing
Maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code.


## License
This library is licensed under the [Zlib license](https://github.com/vanruesc/postprocessing/blob/master/LICENSE).  
The original code was written by [alteredq](http://alteredqualia.com), 
[miibond](https://github.com/MiiBond), [zz85](https://github.com/zz85), 
[felixturner](http://airtight.cc) and [huwb](http://huwbowles.com) 
and is licensed under the [MIT license](https://github.com/mrdoob/three.js/blob/master/LICENSE). 
