# Post Processing 
[![Build status](https://travis-ci.org/vanruesc/postprocessing.svg?branch=master)](https://travis-ci.org/vanruesc/postprocessing) 
[![GitHub version](https://badge.fury.io/gh/vanruesc%2Fpostprocessing.svg)](http://badge.fury.io/gh/vanruesc%2Fpostprocessing) 
[![npm version](https://badge.fury.io/js/%40vanruesc%2Fpostprocessing.svg)](http://badge.fury.io/js/%40vanruesc%2Fpostprocessing) 
[![Dependencies](https://david-dm.org/vanruesc/postprocessing.svg?branch=master)](https://david-dm.org/vanruesc/postprocessing)

A post processing library for filter effects and GPGPU algorithms with three.js. 


## Installation

```sh
$ npm install @vanruesc/postprocessing
``` 


## Usage

```javascript
import {
	EffectComposer,
	RenderPass,
	GlitchPass
} from "@vanruesc/postprocessing";

// Three is no ES6 module yet so this won't work.
// Use the global THREE variable instead!
import {
	WebGLRenderer,
	Scene,
	Camera
} from "three";

var composer = new EffectComposer(new WebGLRenderer());

composer.addPass(new RenderPass(new Scene(), new Camera()));

var glitchPass = new GlitchPass();
glitchPass.renderToScreen = true;
composer.addPass(glitchPass);

composer.render();
```


## Documentation
[API](http://vanruesc.github.io/postprocessing/docs)


## Contributing
Maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code.


## License
The original code was written by [alteredq](http://alteredqualia.com), 
[miibond](https://github.com/MiiBond) [zz85](https://github.com/zz85) and 
[felixturner](http://airtight.cc/) 
and is licensed under the [MIT license](http://vanruesc.github.io/postprocessing/LICENSE).  
