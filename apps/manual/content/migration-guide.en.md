---
layout: single
collection: sections
title: Migration Guide
draft: false
menu: main
weight: 100
---

# Migration Guide

## v6 &rarr; v7

### How to install

```json
{
	"dependencies": {
		"postprocessing": ">= 7.0.0-beta.17"
	}
}
```

* `RenderPass` was replaced by `GeometryPass`.
	* `GeometryPass` automatically clears its render target.
	* Clearing can be disabled by setting `autoClear` to `false`.
* `EffectComposer` was replaced by `FrameGraph`.
	* Most options have been moved to `GeometryPass`.
	* The method `addPass` was replaced by `add`.
	* The method `render` now expects a `timestamp` parameter.
* The `EffectPass` constructor no longer requires a `camera` parameter.
* The `Pass.renderToScreen` flag was removed.
	* Passes whose output is not consumed by another pass render to the screen automatically.
* The same instances of `Pass` can not be added to multiple `FrameGraphs`.
* The same instances of `Effect` can not be added to multiple `EffectPasses`.
