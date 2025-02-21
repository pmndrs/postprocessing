#define NOISECOLOR 0
#define ORDERED 1
#define LUMABASED 2

uniform float intensity;

float rand(vec2 co) {
  return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

#if DITHERING_TYPE == ORDERED
// Bayer matrix for ordered dithering.
const mat4 bayerMatrix = mat4(
    0.0/16.0,  8.0/16.0,  2.0/16.0, 10.0/16.0,
   12.0/16.0,  4.0/16.0, 14.0/16.0,  6.0/16.0,
    3.0/16.0, 11.0/16.0,  1.0/16.0,  9.0/16.0,
   15.0/16.0,  7.0/16.0, 13.0/16.0,  5.0/16.0
);

vec3 orderedDithering(vec3 color, vec2 fragCoord) {
  ivec2 pixelCoord = ivec2(fragCoord) & 3;
  float bayerValue = bayerMatrix[pixelCoord.x][pixelCoord.y];
  return color + (bayerValue - 0.5) * intensity * 0.01;
}
#endif

#if DITHERING_TYPE == NOISECOLOR
vec3 noiseDitheringColor(vec3 color, vec2 fragCoord) {
  float grid_position = rand(fragCoord);
  vec3 dither_shift_RGB = vec3(0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0);
  dither_shift_RGB = mix(2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position);
  return color + dither_shift_RGB * intensity;
}
#endif

#if DITHERING_TYPE == LUMABASED
vec3 lumaNoiseDithering(vec3 color, vec2 fragCoord) {
  float luma = max(dot(color, vec3(0.2126, 0.7152, 0.0722)), 1e-6);
  float noise = rand(fragCoord) - 0.5;
  float ditheredLuma = luma + noise * intensity * 0.0015;
  return color * (ditheredLuma / luma);
}
#endif

vec3 doDither(vec3 color, vec2 fragCoord) {
    #if DITHERING_TYPE == NOISECOLOR
        return noiseDitheringColor(color, fragCoord);
    #elif DITHERING_TYPE == ORDERED
        return orderedDithering(color, fragCoord);
    #elif DITHERING_TYPE == LUMABASED
        return lumaNoiseDithering(color, fragCoord);
    #else
        return color;
    #endif
}

vec4 mainImage(const in vec4 inputColor, const in vec2 uv, const in GData gData) {
  vec2 fragCoord = uv * resolution.xy;
  return vec4(doDither(inputColor.rgb, fragCoord), inputColor.a);
}