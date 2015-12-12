# Post Processing 
[![Build status](https://travis-ci.org/vanruesc/postprocessing.svg?branch=master)](https://travis-ci.org/vanruesc/postprocessing) 
[![GitHub version](https://badge.fury.io/gh/vanruesc%2Fpostprocessing.svg)](http://badge.fury.io/gh/vanruesc%2Fpostprocessing) 
[![npm version](https://badge.fury.io/js/postprocessing.svg)](http://badge.fury.io/js/postprocessing) 
[![Dependencies](https://david-dm.org/vanruesc/postprocessing.svg?branch=master)](https://david-dm.org/vanruesc/postprocessing)

A post processing library that provides the means to implement 2D filter effects for three.js. 
Common implementations such as god rays and bloom are included. 


## Installation

```sh
$ npm install postprocessing
``` 


## Usage

```javascript
// Attention: Three is not yet an ES6 module!
import { WebGLRenderer, Scene, Camera } from "three";
import { EffectComposer, RenderPass, GlitchPass } from "postprocessing";

var composer = new EffectComposer(new WebGLRenderer());
composer.addPass(new RenderPass(new Scene(), new Camera()));

var glitchPass = new GlitchPass();
glitchPass.renderToScreen = true;
composer.addPass(glitchPass);

(function render(now) {

	composer.render();
	requestAnimationFrame(render);

}());
```


## Documentation
[API](http://vanruesc.github.io/postprocessing/docs)


## Demo
See the [Post Processing](http://vanruesc.github.io/postprocessing/public/god-rays.html) in action!


## Contributing
Maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code.


## License
The original code was written by [alteredq](http://alteredqualia.com), 
[miibond](https://github.com/MiiBond), [zz85](https://github.com/zz85), 
[felixturner](http://airtight.cc) and [huwb](http://huwbowles.com) 
and is licensed under the [MIT license](https://github.com/vanruesc/postprocessing/blob/master/LICENSE).  
