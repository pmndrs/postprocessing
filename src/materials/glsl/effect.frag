#include <common>
#include <packing>
#include <dithering_pars_fragment>

#define packFloatToRGBA(v) packDepthToRGBA(v)
#define unpackRGBAToFloat(v) unpackRGBAToDepth(v)

#ifdef FRAMEBUFFER_PRECISION_HIGH

	uniform mediump sampler2D inputBuffer;

#else

	uniform lowp sampler2D inputBuffer;

#endif

#if DEPTH_PACKING == 3201

	uniform lowp sampler2D depthBuffer;

#elif defined(GL_FRAGMENT_PRECISION_HIGH)

	uniform highp sampler2D depthBuffer;

#else

	uniform mediump sampler2D depthBuffer;

#endif

uniform vec2 resolution;
uniform vec2 texelSize;

uniform float cameraNear;
uniform float cameraFar;
uniform float aspect;
uniform float time;

varying vec2 vUv;

vec4 sRGBToLinear(const in vec4 value) {

	return vec4(mix(
		pow(value.rgb * 0.9478672986 + vec3(0.0521327014), vec3(2.4)),
		value.rgb * 0.0773993808,
		vec3(lessThanEqual(value.rgb, vec3(0.04045)))
	), value.a);

}

float readDepth(const in vec2 uv) {

	#if DEPTH_PACKING == 3201

		return unpackRGBAToDepth(texture2D(depthBuffer, uv));

	#else

		return texture2D(depthBuffer, uv).r;

	#endif

}

float getViewZ(const in float depth) {

	#ifdef PERSPECTIVE_CAMERA

		return perspectiveDepthToViewZ(depth, cameraNear, cameraFar);

	#else

		return orthographicDepthToViewZ(depth, cameraNear, cameraFar);

	#endif

}

/**
 * Based on work by Sam Hocevar, Emil Persson and Ian Taylor.
 * https://www.chilliant.com/rgb2hsv.html
 */

vec3 RGBToHCV(const in vec3 RGB) {

	vec4 P = mix(vec4(RGB.bg, -1.0, 2.0 / 3.0), vec4(RGB.gb, 0.0, -1.0 / 3.0), step(RGB.b, RGB.g));
	vec4 Q = mix(vec4(P.xyw, RGB.r), vec4(RGB.r, P.yzx), step(P.x, RGB.r));
	float C = Q.x - min(Q.w, Q.y);
	float H = abs((Q.w - Q.y) / (6.0 * C + EPSILON) + Q.z);
	return vec3(H, C, Q.x);

}

vec3 RGBToHSL(const in vec3 RGB) {

	vec3 HCV = RGBToHCV(RGB);
	float L = HCV.z - HCV.y * 0.5;
	float S = HCV.y / (1.0 - abs(L * 2.0 - 1.0) + EPSILON);
	return vec3(HCV.x, S, L);

}

vec3 HueToRGB(const in float H) {

	float R = abs(H * 6.0 - 3.0) - 1.0;
	float G = 2.0 - abs(H * 6.0 - 2.0);
	float B = 2.0 - abs(H * 6.0 - 4.0);
	return clamp(vec3(R, G, B), 0.0, 1.0);

}

vec3 HSLToRGB(const in vec3 HSL) {

	vec3 RGB = HueToRGB(HSL.x);
	float C = (1.0 - abs(2.0 * HSL.z - 1.0)) * HSL.y;
	return (RGB - 0.5) * C + HSL.z;

}

FRAGMENT_HEAD

void main() {

	FRAGMENT_MAIN_UV

	vec4 color0 = texture2D(inputBuffer, UV);
	vec4 color1 = vec4(0.0);

	FRAGMENT_MAIN_IMAGE

	color0.a = clamp(color0.a, 0.0, 1.0);
	gl_FragColor = color0;

	#ifdef ENCODE_OUTPUT

		#include <colorspace_fragment>

	#endif

	#include <dithering_fragment>

}
