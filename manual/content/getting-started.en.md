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
npm install postprocessing
```

## Usage

The `renderer`, `scene` and `camera` are created as normal. Please refer to the [three.js manual](https://threejs.org/manual/#en/creating-a-scene) for more information on how to create a scene.

```ts
import { PerspectiveCamera, Scene, WebGLRenderer } from "three";

// Recommended settings for postprocessing:
const renderer = new WebGLRenderer({
	powerPreference: "high-performance",
	antialias: false,
	stencil: false,
	depth: false
});

document.body.append(renderer.domElement);

const scene = new Scene();
const camera = new PerspectiveCamera();
```

Postprocessing uses [FrameGraphs](../docs/classes/FrameGraph.html) to render [Passes](../docs/classes/Pass.html). Common setups will only require one frame graph that contains a [ClearPass](../docs/classes/ClearPass.html), a [GeometryPass](../docs/classes/GeometryPass.html) and one or more [EffectPass](../docs/classes/EffectPass.html) instances. The latter is used to render fullscreen [Effects](../docs/classes/Effect.html). 

```ts
import {
	ClearPass,
	EffectPass,
	FrameGraph,
	GeometryPass,
	ToneMappingEffect
} from "postprocessing";

const clearPass = new ClearPass();
const geoPass = new GeometryPass(scene, camera);
const effectPass = new EffectPass(new ToneMappingEffect());
const aaPass = new EffectPass(new SMAAEffect());

clearPass.output.connect(geoPass.output);
geoPass.output.connect(effectPass.input);
geoPass.output.connect(aaPass.input);
effectPass.output.connectDefaultBuffer(aaPass.input);

const frameGraph = new FrameGraph(renderer);
frameGraph.add(clearPass, geoPass, effectPass, aaPass);

renderer.setAnimationLoop(timestamp => frameGraph.render(timestamp));
```

> [!TIP]
> It's recommended to apply anti-aliasing effects with an additional, separate `EffectPass`. See the anti-aliasing demos for details.

## Resolution

Frame graphs adjust internal buffer sizes automatically by using [mutation observers](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver) to detect canvas size changes. Therefore, the canvas resolution (and pixel ratio) should be set as usual via the renderer:

```ts
renderer.setPixelRatio(window.devicePixelRatio);

function onResize(): void {

	const width = container.clientWidth;
	const height = container.clientHeight;
	camera.aspect = width / height;
	camera.updateProjectionMatrix();
	renderer.setSize(width, height);

}

window.addEventListener("resize", onResize);
onResize();
```

Passes also have their own `resolution` property which allows customization of internal buffer sizes based on the main resolution.

## Precompilation

Render pipelines can be precompiled to avoid frame stuttering during the initial render call. The `compile` method takes care of compiling fullscreen shaders as well as all shaders used by 3D objects that are rendered by a `GeometryPass`. It's also possible to recompile individual passes if, for example, the `scene` of a `GeometryPass` is changed at runtime or the `effects` of an `EffectPass` are replaced.

```ts
await frameGraph.compile();
renderer.setAnimationLoop(timestamp => frameGraph.render(timestamp));
```

## Color Space Considerations

It's recommended to follow a [linear workflow](https://docs.unity3d.com/Manual/LinearRendering-LinearOrGammaWorkflow.html) for color management and postprocessing supports this automatically. In most cases, `WebGLRenderer.outputColorSpace` can be left at default and postprocessing will follow suit. Built-in passes automatically convert colors when they render to screen and internal render operations are always performed in the appropriate color space.

Postprocessing uses `HalfFloatType` frame buffers by default to store intermediate results with minimal information loss. Linear colors normally require at least 12 bits per color channel to prevent [color degradation and banding](https://blog.demofox.org/2018/03/10/dont-convert-srgb-u8-to-linear-u8/). The default buffer type supports HDR-like workflows with correct tone mapping. When alpha is disabled, postprocessing will use the compact `R11F_G11F_B10F` framebuffer format to save space. For more details see [Geometry Buffer]({{< relref "gbuffer/#alpha" >}}).

If hardware support and resource efficiency is a concern, postprocessing can be configured to use `UnsignedByteType` sRGB frame buffers as shown below. With low precision sRGB buffers, colors will be clamped to [0.0, 1.0] and information loss will shift to the darker spectrum which still leads to noticable banding in dark scenes. Linear, high precision `HalfFloatType` buffers don't have these issues and are generally the preferred option.

```ts
import { UnsignedByteType } from "three";

const geoPass = new GeometryPass(scene, camera, {
	frameBufferType: UnsignedByteType // enables low precision buffers
});
```

See [three's color management manual](https://threejs.org/docs/#manual/en/introduction/Color-management) for more information on the topic.
