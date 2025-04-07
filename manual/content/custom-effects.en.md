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

vec4 mainImage(const in vec4 inputColor, const in vec2 uv, const in GData gData) {

	return vec4(inputColor.rgb * weights, inputColor.a);

}
```

__CustomEffect.js__

```js
import { Uniform, Vector3 } from "three";
import { Effect } from "postprocessing";

// Tip: Use a bundler plugin like esbuild-plugin-glsl to import shaders as text.
import fragmentShader from "./shader.frag";

export class CustomEffect extends Effect {

	constructor() {

		super("CustomEffect");

		this.fragmentShader = fragmentShader;

		const uniforms = this.input.uniforms;
		uniforms.set("weights", new Uniform(new Vector3()));

	}

}

```

</p>
</details>

## Shader Function Signatures

### Fragment Shader

Every effect must provide a fragment shader that implements at least one of these two functions:

```glsl
vec4 mainImage(in vec4 inputColor, in vec2 uv, in GData gData);
void mainUv(inout vec2 uv);
```

### Vertex Shader

Effects may also provide a vertex shader that implements the following function:

```glsl
void mainSupport(in vec2 uv);
```

### Geometry Data

Effects have access to the geometry data of the current fragment via the `data` parameter of the `mainImage` function. The `EffectPass` detects whether an effect reads a value from this struct and only fetches the relevant data from the respective textures when it's actually needed. The `GData` struct is defined as follows:

```glsl
struct GData {
	vec4 color;
	float depth
	vec3 normal;
	vec3 position;
	vec3 orm;
	vec3 emission;
	vec3 velocity;
	float luminance;
}
```

### Convolution

Effects that fetch additional samples from the input buffer inside the fragment shader are considered convolution effects. To prevent bad results, it is not allowed to have more than one convolution effect per `EffectPass`. These effects are also incompatible with effects that implement the `mainUv` function. The `EffectPass` will warn you when it encounters incompatible effects.

## Uniforms, Macros and Varyings

All shaders have access to the following uniforms:

```glsl
uniform mat4 projectionMatrix;
uniform mat4 projectionMatrixInverse;
uniform vec3 cameraParams; // near, far, aspect
uniform vec4 resolution; // screen resolution (xy), texel size (zw)
uniform sampler2D inputBuffer;
uniform float time;
```

The fragment shader has access to the following G-Buffer uniform:

```glsl
struct GBuffer {
	sampler2D color;
	sampler2D depth;
	sampler2D normal;
	sampler2D orm;
	sampler2D emission;
	sampler2D velocity;
}

uniform GBuffer gBuffer;
```

The following varyings are reserved:

```glsl
inout vec2 vUv;
```

Available vertex attributes:

```glsl
in vec3 position;
```

Available macros:

- If the main camera is a `PerspectiveCamera`, the macro `PERSPECTIVE_CAMERA` will be defined.
- If the geometry pass uses a float type color buffer, the macro `FRAMEBUFFER_PRECISION_HIGH` will be defined.

> [!WARNING]
> Effects may define custom uniforms, varyings, functions and preprocessor macros as usual, but should not define global variables or constants.

## Functions

The shader chunks [common](https://github.com/mrdoob/three.js/blob/dev/src/renderers/shaders/ShaderChunk/common.glsl.js)
and [packing](https://github.com/mrdoob/three.js/blob/dev/src/renderers/shaders/ShaderChunk/packing.glsl.js) are included in the fragment shader by default.

* The functions `packDepthToRGBA(v)` and `unpackRGBAToDepth(v)` are also available as `packFloatToRGBA(v)` and `unpackRGBAToFloat(v)`
* To sample depth at any location, use `readDepth(gBuffer.depth, uv)`
* To calculate the view Z based on depth, use `getViewZ(depth)`
* To reconstruct the view position, use `getViewPosition(uv, depth)`
* To calculate the world position, use `getWorldPosition(viewPosition)`
