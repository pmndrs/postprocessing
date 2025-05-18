---
layout: single
collection: sections
title: Migration Guide
draft: false
menu: main
weight: 50
---

# Migration Guide

## v6 &rarr; v7

* `RenderPass` was replaced by `GeometryPass`.
	* A `ClearPass` must now be used to explicitly clear the screen.
* `EffectComposer` was replaced by `RenderPipeline`.
	* Most options have been moved to `GeometryPass`.
	* The method `addPass` was replaced by `add`.
	* The method `render` now expects a `timestamp` parameter.
* The `EffectPass` constructor no longer requires a `camera` parameter.
* The `Pass.renderToScreen` flag was removed.
	* The last pass in the pipeline will automatically render to screen.
	* To force any pass to render to screen, set `pass.output.defaultBuffer` to `null`.
* The same instances of `Pass` can not be added to multiple `RenderPipelines`.
* The same instances of `Effect` can not be added to multiple `EffectPasses`.
