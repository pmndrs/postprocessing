---
layout: single
collection: sections
title: Passes
draft: false
menu: main
weight: 40
---

# Passes

## Introduction

Passes are concrete [RenderTasks](../docs/interfaces/RenderTask.html) that participate in a frame graph. A pass may render a 3D scene, perform supporting operations, produce intermediate textures, or render a fullscreen result. For example, the `GeometryPass` renders a scene, the `ClearPass` clears an output that is often shared with another pass, and the `LuminancePass` produces a texture for later use. Fullscreen effects are typically combined and rendered by the `EffectPass`. If you want to create a fullscreen effect, you should consider [creating an Effect]({{< relref "effects" >}}) instead.

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

The [ShaderPass](../docs/classes/ShaderPass.html) expects an instance of `ShaderMaterial` as its first argument. The second argument specifies the name of the texture sampler uniform of the shader you provide. This name defaults to `"inputBuffer"` and the `ShaderPass` binds its `input.defaultBuffer` to this uniform.

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
import { Uniform, Vector3 } from "three";
import { FullscreenMaterial } from "postprocessing";

// Tip: Use a bundler plugin like esbuild-plugin-glsl to import shaders as text.
import fragmentShader from "./shader.frag";

export class CustomMaterial extends FullscreenMaterial {

	constructor() {

		super({
			name: "CustomMaterial",
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
		this.output.createDefaultBuffer();

	}

	override render(): void {

		this.setRenderTarget(this.output.defaultBuffer?.value);
		this.renderFullscreen();

	}

}
```

</p>
</details>

By extending [Pass](../docs/classes/Pass.html), you can decide what happens during various lifecycle stages and rendering. The minimum requirement to create a custom pass is to override the `render` method. If you're creating a fullscreen effect, you'll also need to define a `fullscreenMaterial`:

```ts
this.fullscreenMaterial = new MyMaterial();
```

> [!TIP]
> If your pass uses multiple materials, add them to the `materials` set so that they can be precompiled. The `fullscreenMaterial` is added automatically.

### Resources

Render targets are fully managed by the frame graph; Passes operate on [render target resources](../docs/classes/RenderTargetResource.html) which rely on [render target descriptors](../docs/classes/RenderTargetDescriptor.html) to define framebuffers. The actual render targets are assigned by the frame graph at runtime.  The `Output` API provides convenience methods for specifying framebuffers:

```ts
// Creates a "defaultBuffer" with a default descriptor that is suitable for fullscreen passes.
this.output.createDefaultBuffer();

// Creates a private buffer with a default descriptor.
this.output.setBuffer("my-buffer");

// Buffers can be retrieved by their name.
const myBuffer = this.output.buffers.get("my-buffer");

// The default buffer has a dedicated accessor.
this.output.defaultBuffer;

// Creates a private buffer with a customized descriptor (and keeps a reference for convenience).
const otherBuffer = this.output.setBuffer("other-buffer", {
	// Specified fields overwrite defaults.
	depthBuffer: true
});
```

> [!TIP]
> If your pass uses custom disposable objects that don't fit into `input` or `output`, add them to `disposables` instead.

### G-Buffer

Passes can request [GBuffer](../docs/enums/GBuffer.html) components via `input.requiredTextures`. The actual textures will be supplied via `input.buffers` and can be retrieved by using the `GBuffer` value as the key. Passes should override the `onInputChange` hook to fetch and utilize the requested textures.

#### G-Buffer Packing

WebGL 2 guarantees that a compatible device supports at least 4 texture attachments per render target. For broad device support, postprocessing stays within this limitation and packs certain combinations of G-Buffer components into a single texture attachment. To be able to unpack this data, special shader macros that control predefined unpacking functions are provided to the requesting passes via input `defines`. If a pass uses a fullscreen material that extends `FullscreenMaterial`, these `defines` will automatically be integrated into the shaders. The following shader chunks must be included in the fragment shader as needed:

```glsl
#include <pp_depth_utils_pars_fragment>
#include <pp_normal_codec_pars_fragment>
#include <pp_normal_utils_pars_fragment>
#include <pp_velocity_utils_pars_fragment>
```

These includes add the following utility functions for reading data from the G-Buffer:

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
* `onSceneChange(previous: Object3D | null, current: Object3D | null): void;`
* `onCameraChange(previous: Camera | null, current: Camera | null): void;`
* `onSceneChildAdded(object: Object3D): void;`
* `onSceneChildRemoved(object: Object3D): void;`

### Subpasses

Passes may define `subpasses` which are considered part of the parent pass:

```ts
this.subpasses = [subpass1, subpass2, ...];
```

Subpasses can be rendered in the order in which they were defined by calling `renderSubpasses`:

```ts
override render(): void {

	this.renderSubpasses();

}
```

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
