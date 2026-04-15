---
layout: single
collection: sections
title: Blur
draft: false
menu:
  demos:
    parent: utility
script: blur
---

# Blur

## Mipmap Blur

Mipmap blur is a dual technique that performs multiple blur passes using a constant blur kernel to create a chain of intermediate results. Each blur level halves the size of the render target and the downsampled images are then incrementally upsampled into a combined result. The technique is called "dual" because it uses two input textures at each upsampling step for improved image stability.

Mipmap blur is fast, efficient and stable in terms of aliasing and it can produce very large blurs. The only downside is that it can't smoothly transition from a non-blurred image to a blurred one because it relies on downsampling which always introduces blur.

## Gaussian Blur

The Gaussian blur implementation in postprocessing is separated into horizontal/vertical blur steps with optimized linear sampling. The first 1D blur step renders into a low-resolution render target which is then further processed by the second blur step. Downsampling from high-resolution to low-resolution improves performance but introduces aliasing artifacts along the direction which hasn't been blurred yet. This is because less texels are sampled for downsampling the non-blurred direction during this first step.

Gaussian blur is primarily included as a reference implementation that is inferior to mipmap blur in almost every way. The only advantage it has is the ability to smoothly transition from a non-blurred image to a blurred one at full resolution.

A large blur kernel is required to achieve bigger blurs compared to mipmap blur. Multiple blur passes are needed to achieve similarly large blur results.

## External Resources

* [Downsample Shader](https://www.froyok.fr/blog/2021-12-ue4-custom-bloom/#downsample_shader)
* [Upsample Shader](https://www.froyok.fr/blog/2021-12-ue4-custom-bloom/#upsample_shader)
* [Fast Gaussian Blur](https://github.com/Jam3/glsl-fast-gaussian-blur)
* [Pascal's Triangle](https://mathworld.wolfram.com/PascalsTriangle.html)
