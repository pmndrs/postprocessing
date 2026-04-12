---
layout: single
collection: sections
title: Texture
draft: false
menu:
  demos:
    parent: utility
script: texture
---

# Texture

A `TextureEffect` can be used to blend any texture with the input buffer. This effect respects the `offset`, `rotation` and `repeat` of the source texture. Furthermore, it's possible to remap color channels via `setTextureSwizzleRGBA(r, g, b, a)`:

The `texture` can be any 2D texture, including render target textures.

```ts
const effect = new TexturEffect({ texture });

// Texture settings can be configured as usual
texture.offset.set(0, 0);
texture.repeat.set(1, 1);
texture.rotation = 0;

// Remaps channels to .gbra
effect.setTextureSwizzleRGBA(
  ColorChannel.BLUE,
  ColorChannel.GREEN,
  ColorChannel.RED
);

// Remaps channels to .rrra
effect.setTextureSwizzleRGBA(
  ColorChannel.RED
);
```

## External Resources

* [Texture docs](https://threejs.org/docs/?q=texture#Texture)
* [Swizzling (computer graphics)](https://en.wikipedia.org/wiki/Swizzling_(computer_graphics))
