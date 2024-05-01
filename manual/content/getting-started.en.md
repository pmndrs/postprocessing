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

## Usage

Postprocessing extends the common rendering workflow with fullscreen image manipulation tools. The following WebGL attributes should be used for an optimal workflow:

```ts
import { WebGLRenderer } from "three";

const renderer = new WebGLRenderer({
	powerPreference: "high-performance",
	antialias: false,
	stencil: false,
	depth: false
});

```

[RenderPipelines]() are used to group passes. Common setups will only require one pipeline that contains a [ClearPass](), a [GeometryPass]() and one or more [EffectPass]() instances. The latter is used to render fullscreen [Effects](). Please refer to the [three.js manual](https://threejs.org/docs/#manual/en/introduction/Creating-a-scene) for more information on how to setup the renderer, scene and camera.

```ts
import {
	BloomEffect,
	ClearPass,
	EffectPass,
	GeometryPass,
	RenderPipeline
} from "postprocessing";

const container = document.querySelector(".viewport");
container.prepend(renderer.domElement);

const scene = new Scene();
const camera = new PerspectiveCamera();
const pipeline = new RenderPipeline(renderer);

pipeline.add(
	new ClearPass(),
	new GeometryPass(scene, camera),
	new EffectPass(new BloomEffect())
);

function onResize(): void {

	const width = container.clientWidth, height = container.clientHeight;
	camera.aspect = width / height;
	camera.updateProjectionMatrix();
	pipeline.setSize(width, height);

}

window.addEventListener("resize", onResize);
onResize();

requestAnimationFrame(function render(timestamp: number): void {

	requestAnimationFrame(render);
	pipeline.render(timestamp);

});
```

## Color Space Considerations

New applications should follow a [linear workflow](https://docs.unity3d.com/Manual/LinearRendering-LinearOrGammaWorkflow.html) for color management and postprocessing supports this automatically. Simply set `WebGLRenderer.outputColorSpace` to `SRGBColorSpace` and postprocessing will follow suit. Built-in passes automatically convert colors when they render to screen and internal render operations are always performed in the correct color space.

Postprocessing uses `UnsignedByteType` sRGB frame buffers to store intermediate results due to good hardware support and resource efficiency. This is a compromise because linear results normally require at least 12 bits per color channel to prevent [color degradation and banding](https://blog.demofox.org/2018/03/10/dont-convert-srgb-u8-to-linear-u8/). With low precision sRGB buffers, colors will be clamped to [0.0, 1.0] and information loss will shift to the darker spectrum which leads to noticable banding in dark scenes. Linear, high precision `HalfFloatType` buffers don't have these issues and are the preferred option for HDR-like workflows on desktop devices. You can enable high precision frame buffers like so:

```ts
import { HalfFloatType } from "three";

const geoPass = new GeometryPass(scene, camera, {
	frameBufferType: HalfFloatType
});
```

See [three's color management manual](https://threejs.org/docs/#manual/en/introduction/Color-management) for more information on the topic.
