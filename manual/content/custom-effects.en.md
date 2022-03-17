---
layout: single
collection: sections
title: Custom Effects
draft: false
menu: main
weight: 40
---

# Custom Effects

## Introduction

[Effects]() are headless fullscreen passes. They can be combined and rendered using the [EffectPass](). Just like passes, effects may perform initialization tasks, react to render size changes and execute supporting render operations if needed but they don't have access to an output buffer and are not supposed to render to screen by themselves.

<details><summary>TL;DR</summary>
<p>

__shader.frag__

```glsl
uniform vec3 weights;

vec4 mainImage(in vec4 inputColor, in vec2 uv, in GData data) {

	return vec4(inputColor.rgb * weights, inputColor.a);

}
```

__CustomEffect.js__

```js
import { Uniform, Vector3 } from "three";
import { Effect } from "postprocessing";

// Use a bundler plugin like esbuild-plugin-glsl to import shaders as text.
import fragmentShader from "./shader.frag";

export class CustomEffect extends Effect {

	constructor() {

		super("CustomEffect", fragmentShader, {
			uniforms: new Map([
				["weights", new Uniform(new Vector3())]
			])
		});

	}

}

```

</p>
</details>

## Shader Function Signatures

### Fragment Shader

Every effect must provide a fragment shader that implements at least one of these two functions:

```glsl
vec4 mainImage(in vec4 inputColor, in vec2 uv, in GData data);
void mainUv(inout vec2 uv);
```

### Vertex Shader

Effects may also provide a vertex shader that implements the following function:

```glsl
void mainSupport(in vec2 uv);
```

### Geometry Data

Effects have access to the geometry data of the current fragment via the `data` parameter of the `mainImage` function. The `EffectPass` detects whether an effect reads a value from this struct and only fetches the relevant data from the respective textures when it's actually needed. If you wish to sample depth at another coordinate, use the predefined function `float readDepth(in vec2 uv)`. To calculate the view Z based on depth, you can use the predefined function `float getViewZ(in float depth)`. The `GData` is defined as follows:

```glsl
struct GData {
	vec3 position;
	vec3 normal;
	float depth;
	float luminance;
	float roughness;
}
```

### Convolution

Effects that fetch additional samples from the input buffer inside the fragment shader are considered convolution effects. To prevent bad results, it is not allowed to have more than one convolution effect per `EffectPass`. These effects are also incompatible with effects that implement the `mainUv` function. The `EffectPass` will warn you when it encounters incompatible effects.

## Uniforms, Macros and Varyings

All shaders have access to the following uniforms:

```glsl
uniform vec4 resolution; // screen resolution (xy), texel size (zw)
uniform vec3 cameraParams; // near, far, aspect
uniform float time;
```

The fragment shader has access to the following additional uniforms:

```glsl
struct GBuffer {
	sampler2D color;
	sampler2D depth;
	sampler2D position;
	sampler2D normal;
}

uniform GBuffer gBuffer;
```

The following varyings are reserved:

```glsl
varying vec2 vUv;
```

Available vertex attributes:

```glsl
attribute vec3 position;
```

Available macros:

- If the camera of the associated `EffectPass` is a `PerspectiveCamera`, the macro `PERSPECTIVE_CAMERA` will be defined.
- If the composer uses `HalfFloatType` frame buffers, the macro `FRAMEBUFFER_PRECISION_HIGH` will be defined.

_Effects may define custom uniforms, varyings, functions and preprocessor macros as usual, but should not define global variables or constants._

Furthermore, the shader chunks [common](https://github.com/mrdoob/three.js/blob/dev/src/renderers/shaders/ShaderChunk/common.glsl.js)
and [packing](https://github.com/mrdoob/three.js/blob/dev/src/renderers/shaders/ShaderChunk/packing.glsl.js) are included in the fragment shader by default. The functions `packDepthToRGBA(v)` and `unpackRGBAToDepth(v)` are also available under the aliases `packFloatToRGBA(v)` and `unpackRGBAToFloat(v)`.

## WebGL Extensions

Effects can enable WebGL 1 shader extensions via the `extensions` constructor option. The available [WebGLExtensions]() are `DERIVATIVES`, `FRAG_DEPTH`, `DRAW_BUFFERS` and `SHADER_TEXTURE_LOD`.

```js
class MyEffect extends Effect {

	constructor() {

		super(name, fragmentShader, {
			extensions: new Set([WebGLExtension.DERIVATIVES])
		});

	}

}
```
