---
layout: single
collection: sections
title: Bloom
draft: false
menu:
  demos:
    parent: light-shadow
script: bloom
---

# Bloom

The `BloomEffect` uses a fast `MipmapBlurPass` to blur bright scene highlights. By default, any colors that exceed the LDR range `[0.0, 1.0]` will be affected by bloom. The luminance filter can be adjusting via the `luminanceThreshold` and `luminanceSmoothing` settings. It can also be disabled entirely by setting `luminancePass.enabled` to `false`.

The mipmap blur algorithm downsamples the input buffer multiple times based on the number of `levels`. At each level, the target buffer size is halved, creating a manual mipmap chain. After reaching the highest mipmap level, i.e. the smallest buffer size, the image is upsampled again using an additional support buffer at each level. The sampling patterns have been chosen carefully to create stable blurs with minimal aliasing, even at the screen's edges. The following images roughly visualize the blurring process and the resulting bloom texture:

<img src="img/bloom.gif" width="256" height="128">
<img src="img/bloom.png" width="256" height="128">

> [!TIP]
> The number of levels does not have a big impact on performance because the working buffer size quickly shrinks to negligible sizes. However, there is an upper limit to the level count which can be calculated based on the resolution: `maxLevels = log2(min(width, height))`

## External Resources

* [UE4 Custom Bloom](https://www.froyok.fr/blog/2021-12-ue4-custom-bloom/)
