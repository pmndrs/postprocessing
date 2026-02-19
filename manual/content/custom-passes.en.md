---
layout: single
collection: sections
title: Custom Passes
draft: false
menu: main
weight: 40
---

# Custom Passes

## Introduction

At a closer look, passes can be divided into four groups. The first group consists of passes that render normal scenes like the `GeometryPass`. The second type doesn't render anything but performs supporting operations like the `ClearPass` or `LambdaPass`. Passes that render textures for further use make up the third group. One example would be the `LuminancePass`. The fourth and most prominent group contains the fullscreen effect passes. If you want to make a pass that belongs to the last group, you should consider [creating an Effect]({{< relref "custom-effects" >}}) instead.

There are two options for creating custom passes. You can either rely on the general-purpose `ShaderPass` or extend `Pass`.

## ShaderPass

<details><summary>TL;DR</summary>
<p>

```js
import { ShaderMaterial, Uniform } from "three";
import { ShaderPass } from "postprocessing";

const myShaderMaterial = new ShaderMaterial({

	defines: { SOMETHING: "value" },
	uniforms: { tDiffuse: new Uniform(null) },
	vertexShader: "...",
	fragmentShader: "..."

});

const myShaderPass = new ShaderPass(myShaderMaterial, "tDiffuse");
```

</p>
</details>

The `ShaderPass` expects an instance of `ShaderMaterial` as its first argument. The second argument specifies the name of the texture sampler uniform of the shader you provide. This name defaults to `"inputBuffer"` and the `ShaderPass` binds its `input.defaultBuffer` to this uniform.

In order to render a simple `ShaderMaterial`, you have to pass your shader object (uniforms, defines, fragment and vertex shader code) to `ShaderMaterial` and then pass that material instance to `ShaderPass`. Depending on the material you use, you may have to adjust the name of the input texture.

## Extending Pass

<details><summary>TL;DR</summary>
<p>

##### shader.frag

```glsl
#include <pp_default_output_pars_fragment>
#include <pp_input_buffer_pars_fragment>

uniform vec3 weights;

in vec2 vUv;

void main() {

	vec4 texel = texture(inputBuffer, vUv);
	out_Color = vec4(texel.rgb * weights, texel.a);

}
```

##### CustomMaterial.ts

```ts
import { ShaderMaterial, Uniform, Vector3 } from "three";
import { FullscreenMaterial, Uniform, Vector3 } from "postprocessing";

// Tip: Use a bundler plugin like esbuild-plugin-glsl to import shaders as text.
import fragmentShader from "./shader.frag";

export class CustomMaterial extends FullscreenMaterial {

	constructor() {

		super({
			name: "LuminanceMaterial",
			fragmentShader,
			uniforms: {
				weights: new Uniform(new Vector3())
			}
		});

	}

}
```

##### CustomPass.js

```ts
import { Pass } from "postprocessing";
import { CustomMaterial } from "./CustomMaterial.js";

export class CustomPass extends Pass<CustomMaterial> {

	constructor() {

		super("CustomPass");
		this.fullscreenMaterial = new CustomMaterial();

	}

	override render(): void {

		this.setRenderTarget(this.output.defaultBuffer?.value);
		this.renderFullscreen();

	}

}
```

</p>
</details>

By extending `Pass`, you can decide what happens during resizing, initialization and rendering. There are also several lifecycle hooks that you can take advantage of. Passes in postprocessing receive various input data from the main `GeometryPass` and the preceding pass in a render pipeline.

The minimum requirement to create a custom pass is to override the `render` method. If you're creating a fullscreen effect, you'll need to assign a `fullscreenMaterial`:

```ts
this.fullscreenMaterial = new MyMaterial();
```

> [!TIP]
> If your pass uses multiple materials, add them to the `materials` set so that they can be precompiled. The `fullscreenMaterial` is added automatically.

### Resources

Framebuffers can be created manually or via the `createFrambuffer` method. All framebuffers should be added to the `output` buffer resources so that the pipeline can optimize them:

```ts
this.output.setBuffer(MyPass.BUFFER_ID, this.createFramebuffer());
```

A convenience getter can be defined to retrieve the buffer as needed:

```ts
private get renderTarget(): WebGLRenderTarget {

	return this.output.getBuffer(MyPass.BUFFER_ID)!;

}
```

> [!TIP]
> If your pass uses disposable resources that don't fit into the existing `input` and `output` resources, add them to the `disposables` set instead.

### G-Buffer

Passes can request [GBuffer](../docs/enums/GBuffer.html) components via `input.gBuffer`. The actual textures will be supplied via `input.buffers` and can be retrieved by using the `GBuffer` value as the key. Passes should override the `onInputChange` hook to fetch and utilize the requested textures.

#### G-Buffer Packing

WebGL 2 guarantees that a compatible device supports at least 4 texture attachments per render target. For broad device support, postprocessing stays within this limitation and packs certain combinations of G-Buffer components into a single texture attachment. To be able to unpack this data, special shader macros that control predefined unpacking functions are provided to the requesting passes via input `defines`. If a pass uses a fullscreen material that extends `FullscreenMaterial`, these `defines` will automatically be integrated into the shaders. To finally read the data, the following shader chunks must be included in the fragment shader as needed:

```glsl
#include <pp_depth_utils_pars_fragment>
#include <pp_normal_codec_pars_fragment>
#include <pp_normal_utils_pars_fragment>
#include <pp_velocity_utils_pars_fragment>
```

This include adds the following utility functions that should be used to read the respective G-Buffer data:

```glsl
float readDepth(sampler2D depthBuffer, vec2 uv);
vec3 readNormal(sampler2D normalBuffer, vec2 uv);
vec2 readVelocity(sampler2D velocityBuffer, vec2 uv);
```


### Lifecycle Hooks

The `Pass` base class defines lifecycle methods that can be overridden to react to various events:
* `checkRequirements(): void;`
* `onInputChange(): void;`
* `onOutputChange(): void;`
* `onResolutionChange(): void;`
* `onViewportChange(): void;`
* `onScissorChange(): void;`
* `onSceneChildAdded(): void;`
* `onSceneChildRemoved(): void;`

### Fullscreen Passes

It's recommended to use materials that extend [FullscreenMaterial](../docs/classes/FullscreenMaterial.html) for passes that perform fullscreen render operations. This base class defines the following uniforms by default and populates them automatically:

```glsl
uniform mat4 projectionMatrix;
uniform mat4 projectionMatrixInverse;
uniform mat4 viewMatrix;
uniform mat4 viewMatrixInverse;
uniform vec3 cameraParams; // near, far, aspect
uniform vec4 resolution; // screen resolution (xy), texel size (zw)
uniform sampler2D inputBuffer;
```

To render a fullscreen material, first set the render target and then use the `renderFullscreen` method:

```ts
override render(): void {

	this.setRenderTarget(this.output.defaultBuffer?.value);
	this.renderFullscreen();

}
```
