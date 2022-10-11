---
layout: single
collection: sections
title: Getting Started
draft: false
menu: main
weight: 30
---

# Getting Started

## Installation

This library requires the peer dependency [three](https://github.com/mrdoob/three.js/). Check the [release notes](https://github.com/vanruesc/postprocessing/releases) for supported versions.

```sh
npm install three postprocessing
```

## Build Setup

To get started, pick a bundler of your choice:
- [esbuild](https://github.com/evanw/esbuild)
- [swc](https://github.com/swc-project/swc)
- [rollup](https://github.com/rollup/rollup)
- [webpack](https://github.com/webpack/webpack)
- [parcel](https://github.com/parcel-bundler/parcel)

This list is not exhaustive, so feel free to look around for another tool that best suits your needs. For more information about configuration, features and plugins, see the official documentation of your chosen bundler.

### Example

The following example uses esbuild for bundling.

__package.json__

```json
{
	"scripts": {
		"build": "esbuild src/app.js --bundle --minify --outfile=dist/app.js"
	},
	"dependencies": {
		"postprocessing": "x.x.x",
		"three": "x.x.x"
	},
	"devDependencies": {
		"esbuild": "x.x.x"
	}
}
```

__src/app.js__

```js
import { RenderPipeline } from "postprocessing";
console.log(RenderPipeline);
```

Install [node.js](https://nodejs.org) and use the command `npm run build` to generate the code bundle. Include the bundle in an HTML file to run it in a browser.

## Usage

Postprocessing extends the common rendering workflow with fullscreen image manipulation tools. The following WebGL attributes should be used for an optimal workflow:

```js
import { WebGLRenderer } from "three";

const renderer = new WebGLRenderer({
	powerPreference: "high-performance",
	antialias: false,
	stencil: false,
	depth: false
});
```

[RenderPipelines]() are used to group passes. Common setups will only require one pipeline that contains a [ClearPass](), a [GeometryPass]() and one or more [EffectPass]() instances. The latter is used to render fullscreen [Effects](). Please refer to the [three.js manual](https://threejs.org/docs/#manual/en/introduction/Creating-a-scene) for more information on how to setup the renderer, scene and camera.

```js
import {
	BloomEffect,
	ClearPass,
	EffectPass,
	GeometryPass,
	RenderPipeline
} from "postprocessing";

const renderer = ...;
const scene = ...;
const camera = ...;

const pipeline = new RenderPipeline(renderer);
pipeline.addPass(new ClearPass());
pipeline.addPass(new GeometryPass(scene, camera, { samples: 4 }));
pipeline.addPass(new EffectPass(new BloomEffect()));

requestAnimationFrame(function render() {

	requestAnimationFrame(render);
	pipeline.render();

});
```

## Color Space Considerations

New applications should follow a [linear workflow](https://docs.unity3d.com/Manual/LinearRendering-LinearOrGammaWorkflow.html) for color management and postprocessing supports this automatically. Simply set `WebGLRenderer.canvasColorSpace` to `SRGBColorSpace` and postprocessing will follow suit. Built-in passes automatically encode colors when they render to screen and internal render operations are always performed in the most appropriate color space.

Postprocessing uses `UnsignedByteType` sRGB frame buffers to store intermediate results due to good hardware support and resource efficiency. This is a compromise because linear results normally require at least 12 bits per color channel to prevent [color degradation and banding](https://blog.demofox.org/2018/03/10/dont-convert-srgb-u8-to-linear-u8/). With low precision sRGB buffers, colors will be clamped to [0.0, 1.0] and information loss will shift to the darker spectrum which leads to noticable banding in dark scenes. Linear, high precision `HalfFloatType` buffers don't have these issues and are the preferred option for HDR-like workflows on desktop devices. You can enable high precision frame buffers like so:

```js
import { HalfFloatType } from "three";

const pipeline = new RenderPipeline(renderer);
pipeline.bufferManager.frameBufferType = HalfFloatType;
```

See [three's color management manual](https://threejs.org/docs/#manual/en/introduction/Color-management) for more information on the topic.
