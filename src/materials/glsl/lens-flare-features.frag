#include <common>

#ifdef FRAMEBUFFER_PRECISION_HIGH

	uniform mediump sampler2D inputBuffer;

#else

	uniform lowp sampler2D inputBuffer;

#endif

#define SQRT_2 (0.7071067811865476)

uniform vec2 texelSize;
uniform float ghostAmount;
uniform float haloAmount;
uniform float chromaticAberration;

varying vec2 vUv;
varying vec2 vAspectRatio;

vec3 sampleGhost(const vec2 direction, const vec3 color, const float offset) {

	vec2 suv = clamp(1.0 - vUv + direction * offset, 0.0, 1.0);
	vec3 result = texture(inputBuffer, suv).rgb * color;

	// Falloff at the perimeter.
	float d = clamp(length(0.5 - suv) / (0.5 * SQRT_2), 0.0, 1.0);
	result *= pow(1.0 - d, 3.0);
	return result;

}

vec4 sampleGhosts(float amount) {

	vec3 color = vec3(0.0);
	vec2 direction = vUv - 0.5;

	color += sampleGhost(direction, vec3(0.8, 0.8, 1.0), -5.0);
	color += sampleGhost(direction, vec3(1.0, 0.8, 0.4), -1.5);
	color += sampleGhost(direction, vec3(0.9, 1.0, 0.8), -0.4);
	color += sampleGhost(direction, vec3(1.0, 0.8, 0.4), -0.2);
	color += sampleGhost(direction, vec3(0.9, 0.7, 0.7), -0.1);
	color += sampleGhost(direction, vec3(0.5, 1.0, 0.4), 0.7);
	color += sampleGhost(direction, vec3(0.5, 0.5, 0.5), 1.0);
	color += sampleGhost(direction, vec3(1.0, 1.0, 0.6), 2.5);
	color += sampleGhost(direction, vec3(0.5, 0.8, 1.0), 10.0);

	return vec4(color * amount, 1.0);

}

// Reference: https://john-chapman.github.io/2017/11/05/pseudo-lens-flare.html
float cubicRingMask(const float x, const float radius, const float thickness) {

	float v = min(abs(x - radius) / thickness, 1.0);
	return 1.0 - v * v * (3.0 - 2.0 * v);

}

vec3 sampleHalo(const float radius) {

	vec2 direction = normalize((vUv - 0.5) / vAspectRatio) * vAspectRatio;
	vec3 offset = vec3(texelSize.x * chromaticAberration) * vec3(-1.0, 0.0, 1.0);
	vec2 suv = fract(1.0 - vUv + direction * radius);
	vec3 result = vec3(
		texture(inputBuffer, suv + direction * offset.r).r,
		texture(inputBuffer, suv + direction * offset.g).g,
		texture(inputBuffer, suv + direction * offset.b).b
	);

	// Falloff at the center and perimeter.
	vec2 wuv = (vUv - vec2(0.5, 0.0)) / vAspectRatio + vec2(0.5, 0.0);
	float d = saturate(distance(wuv, vec2(0.5)));
	result *= cubicRingMask(d, 0.45, 0.25);
	return result;

}

vec4 sampleHalos(const float amount) {

	vec3 color = vec3(0.0);
	color += sampleHalo(0.3);
	return vec4(color, 1.0) * amount;

}

void main() {

	vec4 color = vec4(0.0);
	color += sampleGhosts(ghostAmount);
	color += sampleHalos(haloAmount);
	gl_FragColor = color;

}

